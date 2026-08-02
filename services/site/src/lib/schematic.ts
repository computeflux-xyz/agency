/**
 * Layout maths for the schematic diagram family
 * (`molecules/FlowDiagram.astro`, `BeforeAfterSchema.astro`,
 * `StateMachineSchema.astro`, `LayerStack.astro`).
 *
 * WHAT THIS IS FOR: turning a declared node/edge list into coordinates, so a
 * caller describes a *topology* and never hand-places a pixel. Everything here
 * is structural — ranks, lanes, curve control points, label wrapping.
 *
 * THERE IS NO SCALE, NO AXIS AND NO DATA MAPPING IN THIS FILE, and none may be
 * added. These drawings must never be able to imply a measurement: no value is
 * ever converted into a length, a height or an angle. A "before/after" schema
 * says *the shape changed*, never *by how much*.
 *
 * Units are viewBox units throughout, sized so the smallest mono label stays
 * legible once the SVG is scaled to a phone (see `MIN_SCALE`).
 */

export type SchemaTone = "default" | "problem" | "fix" | "muted";

export type EdgeStyle = "solid" | "dashed";

export interface FlowNodeInput {
    id: string;
    /** Short mono label. Wraps to at most two lines; keep it to a few words. */
    label: string;
    tone?: SchemaTone;
    /** Pin the node to a column (`lr`) or row (`tb`) instead of ranking it. */
    rank?: number;
}

export interface FlowEdgeInput {
    from: string;
    to: string;
    style?: EdgeStyle;
    /** Optional mono annotation printed on the edge. */
    label?: string;
    /** Defaults to the target node's tone when that tone is `problem`/`fix`. */
    tone?: SchemaTone;
}

/* ----------------------------- Geometry ---------------------------------- */

/** Node label font size, in viewBox units. */
export const FS = 11;
/** Node label line height. */
const LH = 12.5;
/** Annotation / edge-label font size. */
export const FS_SMALL = 9;
const NODE_W = 104;
/** Vertical padding inside a node box. */
const NODE_PAD_Y = 11;
/** Horizontal padding inside a node box, both sides. */
const NODE_PAD_X = 8;
/** Room reserved along the flow axis for an arrow plus its label. */
const GAP_MAIN = 48;
/** Room between lanes, across the flow axis. */
const GAP_CROSS = 16;
/** Stroke bleed, so a 1.4-wide outline is not clipped by the viewBox edge. */
const BLEED = 2;
/** Extra room below the drawing when a feedback (backward) edge exists. */
const FEEDBACK_PAD = 30;
/** Depth of the feedback curve's bulge. */
const FEEDBACK_BULGE = 26;

/**
 * Smallest and largest CSS pixels per viewBox unit we will allow.
 * `MIN_SCALE` is what makes a wide graph scroll on a phone instead of shrinking
 * its labels into illegibility; `MAX_SCALE` stops a two-node diagram from
 * inflating to 40px type inside a wide column.
 */
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.5;

export const minWidthPx = (viewBoxWidth: number) => Math.round(viewBoxWidth * MIN_SCALE);
export const maxWidthPx = (viewBoxWidth: number) => Math.round(viewBoxWidth * MAX_SCALE);

/* --------------------------- Label wrapping ------------------------------ */

/**
 * Greedy word wrap in monospace-character units. SVG `<text>` does not wrap, so
 * every multi-line label has to be split here and emitted as `<tspan>` rows.
 * JetBrains Mono advances ~0.6em, which is where `charsPerLine` comes from.
 */
export function wrapLabel(text: string, charsPerLine: number, maxLines = 2): string[] {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [""];

    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= charsPerLine) {
            current = candidate;
            continue;
        }
        if (current) lines.push(current);
        /* A single word longer than the line budget is hard-split rather than
           allowed to overflow the node box. */
        if (word.length > charsPerLine) {
            let rest = word;
            while (rest.length > charsPerLine && lines.length < maxLines) {
                lines.push(rest.slice(0, charsPerLine));
                rest = rest.slice(charsPerLine);
            }
            current = rest;
        } else {
            current = word;
        }
        if (lines.length >= maxLines) break;
    }
    if (current && lines.length < maxLines) lines.push(current);

    /* Truncation is visible rather than silent: a clipped label is a caller
       error and should look like one in review. */
    if (lines.length > maxLines) lines.length = maxLines;
    const overflow = words.join(" ").length > lines.join(" ").length;
    if (overflow && lines.length === maxLines) {
        const last = lines[maxLines - 1] ?? "";
        lines[maxLines - 1] = `${last.slice(0, Math.max(0, charsPerLine - 1))}…`;
    }
    return lines;
}

export const nodeCharsPerLine = Math.floor((NODE_W - NODE_PAD_X * 2) / (FS * 0.6));

/* ------------------------------ Flow layout ------------------------------ */

export interface PlacedNode {
    id: string;
    lines: string[];
    tone: SchemaTone;
    rank: number;
    x: number;
    y: number;
    w: number;
    h: number;
    cx: number;
    cy: number;
}

export interface RoutedEdge {
    d: string;
    style: EdgeStyle;
    tone: SchemaTone;
    label?: string;
    labelX: number;
    labelY: number;
}

export interface FlowLayout {
    width: number;
    height: number;
    nodes: PlacedNode[];
    edges: RoutedEdge[];
    /** Machine-derivable description of the topology, for `<desc>`. */
    outline: string;
}

/**
 * Rank every node by longest path from a source, then lay ranks out as columns
 * (`lr`) or rows (`tb`).
 *
 * Longest path — not shortest — because a node must always be drawn to the
 * right of *every* one of its predecessors, otherwise an arrow would point
 * backwards and read as a feedback loop that does not exist.
 */
function rankNodes(nodes: FlowNodeInput[], edges: FlowEdgeInput[]): Map<string, number> {
    const preds = new Map<string, string[]>();
    for (const node of nodes) preds.set(node.id, []);
    for (const edge of edges) {
        if (!preds.has(edge.from) || !preds.has(edge.to)) continue;
        preds.get(edge.to)!.push(edge.from);
    }

    const pinned = new Map<string, number>();
    for (const node of nodes) {
        if (typeof node.rank === "number") pinned.set(node.id, Math.max(0, Math.trunc(node.rank)));
    }

    const memo = new Map<string, number>();
    /* `visiting` breaks cycles: a retry/feedback edge must not make the ranker
       recurse forever, so the second visit contributes rank 0 and the edge is
       later routed as a backward edge instead of a column step. */
    const visiting = new Set<string>();

    const rankOf = (id: string): number => {
        const pin = pinned.get(id);
        if (pin !== undefined) return pin;
        const cached = memo.get(id);
        if (cached !== undefined) return cached;
        if (visiting.has(id)) return 0;

        visiting.add(id);
        const parents = preds.get(id) ?? [];
        const rank = parents.length === 0 ? 0 : Math.max(...parents.map(rankOf)) + 1;
        visiting.delete(id);
        memo.set(id, rank);
        return rank;
    };

    const ranks = new Map<string, number>();
    for (const node of nodes) ranks.set(node.id, rankOf(node.id));
    return ranks;
}

export function flowLayout(
    nodes: FlowNodeInput[],
    edges: FlowEdgeInput[],
    direction: "lr" | "tb" = "lr",
): FlowLayout {
    const known = new Set(nodes.map((n) => n.id));
    /* Silently dropping a dangling edge beats emitting a path to NaN. */
    const live = edges.filter((e) => known.has(e.from) && known.has(e.to));
    const ranks = rankNodes(nodes, live);

    const wrapped = nodes.map((node) => ({
        node,
        lines: wrapLabel(node.label, nodeCharsPerLine),
        rank: ranks.get(node.id) ?? 0,
    }));

    /* One height for every node, from the longest label: a ragged grid of
       different-height boxes reads as a hierarchy that is not there. */
    const maxLines = Math.max(1, ...wrapped.map((w) => w.lines.length));
    const nodeH = NODE_PAD_Y * 2 + (maxLines - 1) * LH + FS;

    const rankCount = Math.max(...wrapped.map((w) => w.rank)) + 1;
    const lanes: (typeof wrapped)[] = Array.from({ length: rankCount }, () => []);
    for (const item of wrapped) lanes[item.rank]!.push(item);
    const widestLane = Math.max(...lanes.map((lane) => lane.length));

    const horizontal = direction === "lr";
    /* Along the flow axis, ranks step by node extent + arrow room. Across it,
       lanes are centred so a 1-node rank sits opposite the middle of a 3-node
       rank rather than hugging an edge. */
    const mainStep = (horizontal ? NODE_W : nodeH) + GAP_MAIN;
    const crossExtent = horizontal ? nodeH : NODE_W;
    const crossStep = crossExtent + GAP_CROSS;
    const crossSpan = widestLane * crossExtent + (widestLane - 1) * GAP_CROSS;
    const mainSpan = rankCount * (horizontal ? NODE_W : nodeH) + (rankCount - 1) * GAP_MAIN;

    const placed: PlacedNode[] = [];
    const byId = new Map<string, PlacedNode>();

    lanes.forEach((lane, rank) => {
        const laneSpan = lane.length * crossExtent + (lane.length - 1) * GAP_CROSS;
        const crossStart = BLEED + (crossSpan - laneSpan) / 2;
        lane.forEach((item, i) => {
            const main = BLEED + rank * mainStep;
            const cross = crossStart + i * crossStep;
            const box: PlacedNode = {
                id: item.node.id,
                lines: item.lines,
                tone: item.node.tone ?? "default",
                rank,
                x: horizontal ? main : cross,
                y: horizontal ? cross : main,
                w: NODE_W,
                h: nodeH,
                cx: 0,
                cy: 0,
            };
            box.cx = box.x + box.w / 2;
            box.cy = box.y + box.h / 2;
            placed.push(box);
            byId.set(box.id, box);
        });
    });

    let hasFeedback = false;
    const routed: RoutedEdge[] = [];

    for (const edge of live) {
        const s = byId.get(edge.from)!;
        const t = byId.get(edge.to)!;
        const inferred: SchemaTone =
            edge.tone ?? (t.tone === "problem" || t.tone === "fix" ? t.tone : "default");

        let d: string;
        let labelX: number;
        let labelY: number;

        if (t.rank > s.rank) {
            /* Forward: leave the trailing face, enter the leading face. */
            const x1 = horizontal ? s.x + s.w : s.cx;
            const y1 = horizontal ? s.cy : s.y + s.h;
            const x2 = horizontal ? t.x : t.cx;
            const y2 = horizontal ? t.cy : t.y;
            const aligned = horizontal ? Math.abs(y1 - y2) < 0.5 : Math.abs(x1 - x2) < 0.5;

            if (aligned) {
                d = horizontal ? `M${x1} ${y1}H${x2}` : `M${x1} ${y1}V${y2}`;
            } else if (horizontal) {
                const dx = (x2 - x1) / 2;
                d = `M${x1} ${y1}C${x1 + dx} ${y1},${x2 - dx} ${y2},${x2} ${y2}`;
            } else {
                const dy = (y2 - y1) / 2;
                d = `M${x1} ${y1}C${x1} ${y1 + dy},${x2} ${y2 - dy},${x2} ${y2}`;
            }
            labelX = (x1 + x2) / 2;
            labelY = (y1 + y2) / 2 - (horizontal ? 5 : 0);
            if (!horizontal) labelX += 6;
        } else if (t.rank === s.rank) {
            /* Same rank: a sibling link, drawn across the lane gap. */
            const [a, b] = horizontal
                ? s.y < t.y
                    ? [s, t]
                    : [t, s]
                : s.x < t.x
                  ? [s, t]
                  : [t, s];
            const forward = a === s;
            if (horizontal) {
                const y1 = forward ? a.y + a.h : b.y;
                const y2 = forward ? b.y : a.y + a.h;
                d = `M${s.cx} ${y1}V${y2}`;
                labelX = s.cx + 6;
                labelY = (y1 + y2) / 2;
            } else {
                const x1 = forward ? a.x + a.w : b.x;
                const x2 = forward ? b.x : a.x + a.w;
                d = `M${x1} ${s.cy}H${x2}`;
                labelX = (x1 + x2) / 2;
                labelY = s.cy - 5;
            }
        } else {
            /* Backward: a retry / feedback path, bulged clear of the boxes so it
               cannot be mistaken for a forward step. */
            hasFeedback = true;
            if (horizontal) {
                const y1 = s.y + s.h;
                const y2 = t.y + t.h;
                const bulge = Math.max(y1, y2) + FEEDBACK_BULGE;
                d = `M${s.cx} ${y1}C${s.cx} ${bulge},${t.cx} ${bulge},${t.cx} ${y2}`;
                labelX = (s.cx + t.cx) / 2;
                labelY = bulge - 3;
            } else {
                const x1 = s.x + s.w;
                const x2 = t.x + t.w;
                const bulge = Math.max(x1, x2) + FEEDBACK_BULGE;
                d = `M${x1} ${s.cy}C${bulge} ${s.cy},${bulge} ${t.cy},${x2} ${t.cy}`;
                labelX = bulge - 3;
                labelY = (s.cy + t.cy) / 2;
            }
        }

        routed.push({
            d,
            style: edge.style ?? "solid",
            tone: inferred,
            label: edge.label,
            labelX,
            labelY,
        });
    }

    const pad = BLEED * 2 + (hasFeedback ? FEEDBACK_PAD : 0);
    const width = horizontal ? mainSpan + BLEED * 2 : crossSpan + pad;
    const height = horizontal ? crossSpan + pad : mainSpan + BLEED * 2;

    return {
        width: Math.round(width),
        height: Math.round(height),
        nodes: placed,
        edges: routed,
        outline: describeFlow(nodes, live),
    };
}

/* --------------------------- Accessible text ----------------------------- */

/**
 * Flatten a graph into a sentence, used as the `<desc>` when the caller has not
 * written one. A screen reader gets nothing from `<path>` data, so *some* real
 * prose has to exist; a derived edge list is strictly better than silence.
 */
export function describeFlow(nodes: FlowNodeInput[], edges: FlowEdgeInput[]): string {
    const label = new Map(nodes.map((n) => [n.id, n.label]));
    if (edges.length === 0) return nodes.map((n) => n.label).join(", ");
    return edges
        .map((e) => {
            const from = label.get(e.from) ?? e.from;
            const to = label.get(e.to) ?? e.to;
            return e.label ? `${from} → ${to} (${e.label})` : `${from} → ${to}`;
        })
        .join("; ");
}

/* ------------------------------- Instance ids ---------------------------- */

let seq = 0;
/**
 * Per-instance id prefix. SVG `<marker>` and `<title>`/`<desc>` ids are
 * document-global, so two diagrams on one page would otherwise share
 * arrowheads and cross-wire their `aria-labelledby`. Astro renders
 * synchronously, so a module counter is enough and stays deterministic within a
 * render — no randomness, no hydration to mismatch.
 */
export const nextSchemaId = (prefix = "dg") => `${prefix}${(seq += 1).toString(36)}`;
