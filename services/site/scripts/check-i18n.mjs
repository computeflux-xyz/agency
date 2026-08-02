#!/usr/bin/env node
/**
 * check-i18n.mjs — key-parity guard for src/i18n/ui.ts.
 *
 * WHY THIS EXISTS
 * ui.ts closes with `satisfies Record<Locale, Record<string, string>>`. That only
 * asserts "each locale exists and maps strings to strings" — it never compares the
 * two key SETS. `UIKey` is derived from the `en` block alone, and `useTranslations`
 * takes `UIKey | (string & {})`, so a typo'd or template-built key type-checks
 * happily. At runtime the lookup is `ui[locale][key] ?? ui[DEFAULT_LOCALE][key] ??
 * String(key)` with DEFAULT_LOCALE = "fr", so the two failure modes are:
 *   - key missing from fr  -> the RAW KEY STRING is printed onto the page;
 *   - key missing from en  -> English readers are silently served French.
 * Neither is a type error. Nothing else in the toolchain catches them, and the
 * dictionary is edited by hand a few hundred keys at a time.
 *
 * WHAT IT REPORTS (non-zero exit on any of them)
 *   1. keys present in one locale but missing from another;
 *   2. duplicate keys inside a single locale block;
 *   3. empty / whitespace-only / non-string values.
 *
 * WHY TWO PASSES
 * The loaded module is authoritative for key sets and values: JS evaluates the
 * object literal exactly the way Astro will, so no regex can disagree with it.
 * But a duplicated quoted key is *legal JS* that silently keeps the LAST value —
 * by the time the object exists the duplicate is gone. Duplicates and line
 * numbers therefore come from a second, light tokenizer pass over the raw source.
 *
 * Node built-ins only, on purpose: this must run in CI before anything installs.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { relative } from "node:path";

const UI_URL = new URL("../src/i18n/ui.ts", import.meta.url);
const CONFIG_URL = new URL("../src/i18n/config.ts", import.meta.url);
const ROOT = fileURLToPath(new URL("..", import.meta.url));

// Node >= 22.6 imports .ts directly but shouts one ExperimentalWarning per run.
// Silence that single warning class so CI logs stay readable; re-dispatch the rest
// to whatever handler was already installed.
function muteTypeStrippingWarning() {
    const previous = process.listeners("warning");
    process.removeAllListeners("warning");
    process.on("warning", (warning) => {
        if (warning.name === "ExperimentalWarning" && /type strip/i.test(warning.message)) return;
        for (const listener of previous) listener(warning);
    });
}

/**
 * Erase the three type-only constructs ui.ts uses, so the file can be evaluated
 * as plain JS on a Node that cannot strip types itself. Deliberately narrow: it
 * handles `import type`, `export type` and a trailing `satisfies` clause and
 * nothing else. If ui.ts ever grows real type annotations this path stops
 * working — but it is only the fallback, and the failure is loud, not silent.
 */
function eraseTypeOnlySyntax(source) {
    return source
        .replace(/^[ \t]*import[ \t]+type[ \t][^;]*;[ \t]*\r?\n?/gm, "")
        .replace(/^[ \t]*export[ \t]+type[ \t][^;]*;[ \t]*\r?\n?/gm, "")
        .replace(/\bsatisfies\s+[^;]+(?=;)/g, "");
}

async function loadUi(source) {
    // Preferred path: let Node evaluate the real file.
    try {
        const mod = await import(pathToFileURL(fileURLToPath(UI_URL)).href);
        if (mod?.ui) return mod.ui;
    } catch {
        // Older Node, or type stripping disabled. Fall through.
    }

    // Fallback: same evaluation, on a de-typed copy handed over as a data URL.
    // Still a real module load, so values stay authoritative.
    const js = eraseTypeOnlySyntax(source);
    const base64 = Buffer.from(js, "utf8").toString("base64");
    const mod = await import(`data:text/javascript;base64,${base64}`);
    if (!mod?.ui) throw new Error("src/i18n/ui.ts has no `ui` export");
    return mod.ui;
}

/**
 * Tokenize just enough JS to know brace depth and which quoted strings sit in a
 * key position. Skips comments and string bodies so an apostrophe, a colon or a
 * brace inside a French sentence cannot be mistaken for structure.
 *
 * Known limitation: a regex literal containing braces or quotes would confuse the
 * depth counter. ui.ts is a flat object literal, so there are none.
 */
function tokenize(source) {
    const tokens = [];
    let i = 0;
    let line = 1;
    const n = source.length;

    while (i < n) {
        const c = source[i];

        if (c === "\n") {
            line++;
            i++;
            continue;
        }
        if (c === " " || c === "\t" || c === "\r") {
            i++;
            continue;
        }
        if (c === "/" && source[i + 1] === "/") {
            while (i < n && source[i] !== "\n") i++;
            continue;
        }
        if (c === "/" && source[i + 1] === "*") {
            i += 2;
            while (i < n && !(source[i] === "*" && source[i + 1] === "/")) {
                if (source[i] === "\n") line++;
                i++;
            }
            i += 2;
            continue;
        }
        if (c === '"' || c === "'" || c === "`") {
            const quote = c;
            const startLine = line;
            let value = "";
            i++;
            while (i < n) {
                const ch = source[i];
                if (ch === "\\") {
                    // Keep the escaped char verbatim. Key names never contain
                    // escapes, and values are only used for line reporting here.
                    value += source[i + 1] ?? "";
                    i += 2;
                    continue;
                }
                if (ch === quote) {
                    i++;
                    break;
                }
                if (ch === "\n") line++;
                value += ch;
                i++;
            }
            tokens.push({ type: "string", value, line: startLine });
            continue;
        }
        if (/[A-Za-z_$]/.test(c)) {
            let j = i;
            while (j < n && /[A-Za-z0-9_$]/.test(source[j])) j++;
            tokens.push({ type: "ident", value: source.slice(i, j), line });
            i = j;
            continue;
        }

        tokens.push({ type: "punct", value: c, line });
        i++;
    }

    return tokens;
}

/**
 * Walk the token stream and record every key written inside a locale block,
 * with every line it appears on. Depth 1 is the `ui` object literal, depth 2 is
 * a locale object, so a key is any string token at depth 2 followed by ":".
 * Returns Map<locale, Map<key, number[]>> in source order.
 */
function scanSourceKeys(source) {
    const tokens = tokenize(source);
    const perLocale = new Map();

    let depth = 0;
    let pendingName = null; // last `name:` seen at depth 1 == the locale we are about to enter
    let locale = null;

    for (let k = 0; k < tokens.length; k++) {
        const tok = tokens[k];

        if (tok.type === "punct" && tok.value === "{") {
            depth++;
            if (depth === 2) locale = pendingName;
            continue;
        }
        if (tok.type === "punct" && tok.value === "}") {
            if (depth === 2) locale = null;
            depth--;
            continue;
        }

        const next = tokens[k + 1];
        const isKeyPosition =
            (tok.type === "string" || tok.type === "ident") &&
            next?.type === "punct" &&
            next.value === ":";
        if (!isKeyPosition) continue;

        if (depth === 1) {
            pendingName = tok.value;
        } else if (depth === 2 && locale) {
            if (!perLocale.has(locale)) perLocale.set(locale, new Map());
            const keys = perLocale.get(locale);
            if (!keys.has(tok.value)) keys.set(tok.value, []);
            keys.get(tok.value).push(tok.line);
        }
    }

    return perLocale;
}

/** DEFAULT_LOCALE decides which gap prints raw keys, so read it rather than assume "fr". */
function readDefaultLocale(configSource, fallback) {
    const match = /DEFAULT_LOCALE\s*(?::[^=]*)?=\s*["']([^"']+)["']/.exec(configSource ?? "");
    return match ? match[1] : fallback;
}

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : text);
const bold = (text) => paint("1", text);
const red = (text) => paint("31", text);
const green = (text) => paint("32", text);
const dim = (text) => paint("2", text);

function firstLine(lines) {
    return lines?.length ? `line ${lines[0]}` : "line ?";
}

function preview(value) {
    const flat = String(value).replace(/\s+/g, " ").trim();
    return flat.length > 56 ? `${flat.slice(0, 55)}…` : flat;
}

async function main() {
    muteTypeStrippingWarning();

    const uiSource = await readFile(UI_URL, "utf8");
    const configSource = await readFile(CONFIG_URL, "utf8").catch(() => null);

    const ui = await loadUi(uiSource);
    const locales = Object.keys(ui);
    const defaultLocale = readDefaultLocale(configSource, locales[0]);
    const sourceKeys = scanSourceKeys(uiSource);

    const problems = [];
    const uiPathLabel = relative(ROOT, fileURLToPath(UI_URL));

    // --- 1. duplicate keys within one locale -------------------------------
    // Invisible in the loaded object: the later value has already overwritten the
    // earlier one, which is exactly what makes this worth a dedicated pass.
    const duplicates = [];
    for (const locale of locales) {
        const keys = sourceKeys.get(locale);
        if (!keys) {
            problems.push({
                kind: "structure",
                text: `could not locate the \`${locale}\` block while scanning ${uiPathLabel} — duplicate detection skipped for that locale`,
            });
            continue;
        }
        for (const [key, lines] of keys) {
            if (lines.length > 1) duplicates.push({ locale, key, lines });
        }
    }

    // --- 2. key-set parity -------------------------------------------------
    const keySets = new Map(locales.map((locale) => [locale, new Set(Object.keys(ui[locale]))]));
    const union = new Set();
    for (const set of keySets.values()) for (const key of set) union.add(key);

    const missing = new Map(locales.map((locale) => [locale, []]));
    for (const key of union) {
        for (const locale of locales) {
            if (keySets.get(locale).has(key)) continue;
            const definedIn = locales.filter((other) => keySets.get(other).has(key));
            missing.get(locale).push({ key, definedIn });
        }
    }

    // --- 3. empty and non-string values ------------------------------------
    const badValues = [];
    for (const locale of locales) {
        for (const [key, value] of Object.entries(ui[locale])) {
            if (typeof value !== "string") {
                badValues.push({ locale, key, reason: `value is ${typeof value}, not a string` });
            } else if (value.trim() === "") {
                badValues.push({
                    locale,
                    key,
                    reason: value === "" ? "value is an empty string" : "value is whitespace only",
                });
            }
        }
    }

    // --- report ------------------------------------------------------------
    const counts = locales
        .map((locale) => `${bold(locale)} ${keySets.get(locale).size} keys`)
        .join(dim("  ·  "));
    console.log(`${bold("i18n check")} ${dim("·")} ${uiPathLabel}`);
    console.log(`  ${counts}   ${dim(`(default locale: ${defaultLocale})`)}`);

    let failures = 0;

    for (const locale of locales) {
        const gaps = missing.get(locale);
        if (!gaps.length) continue;
        failures += gaps.length;
        const consequence =
            locale === defaultLocale
                ? "the raw key string is rendered on the page"
                : `${defaultLocale} is silently served instead`;
        console.log("");
        console.log(
            `  ${red(bold(`MISSING FROM ${locale} (${gaps.length})`))} ${dim(`— ${consequence}`)}`,
        );
        for (const { key, definedIn } of gaps.sort((a, b) => a.key.localeCompare(b.key))) {
            const where = definedIn
                .map((other) => `${other} ${firstLine(sourceKeys.get(other)?.get(key))}`)
                .join(", ");
            console.log(`    ${key}  ${dim(`(defined in ${where})`)}`);
        }
    }

    if (duplicates.length) {
        failures += duplicates.length;
        console.log("");
        console.log(
            `  ${red(bold(`DUPLICATE KEYS (${duplicates.length})`))} ${dim("— legal JS, the LAST value silently wins")}`,
        );
        for (const { locale, key, lines } of duplicates) {
            console.log(
                `    ${locale}  ${key}  ${dim(`lines ${lines.join(", ")} → kept: "${preview(ui[locale][key])}"`)}`,
            );
        }
    }

    if (badValues.length) {
        failures += badValues.length;
        console.log("");
        console.log(`  ${red(bold(`BAD VALUES (${badValues.length})`))}`);
        for (const { locale, key, reason } of badValues) {
            const at = firstLine(sourceKeys.get(locale)?.get(key));
            console.log(`    ${locale}  ${key}  ${dim(`${at} — ${reason}`)}`);
        }
    }

    for (const problem of problems) {
        failures += 1;
        console.log("");
        console.log(`  ${red(bold("STRUCTURE"))} ${problem.text}`);
    }

    console.log("");
    if (failures) {
        console.log(
            red(bold(`FAIL — ${failures} problem${failures === 1 ? "" : "s"} in ${uiPathLabel}`)),
        );
        process.exitCode = 1;
        return;
    }
    console.log(green(bold("OK — locales in sync, no duplicates, no empty values.")));
}

main().catch((err) => {
    console.error(red(bold("i18n check crashed")));
    console.error(err?.stack ?? String(err));
    process.exitCode = 1;
});
