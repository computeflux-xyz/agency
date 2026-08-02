// Simulations behind the three models on this page.
//
// Every one of them is seeded and deterministic: the same sliders always give
// the same picture, so a reader can reason about a change rather than about
// noise. Nothing here reads a dataset, and nothing here describes any real
// audience — these are the mechanics of the proposed design, run on inputs the
// reader chooses.

export const fmtInt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
export const fmtPct = (x, digits = 2) => `${(x * 100).toFixed(digits)}%`;

/** Small, fast, seedable PRNG. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal via Box-Muller, from a uniform generator. */
function normal(rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Gamma(shape, 1) via Marsaglia-Tsang. Used only to build Beta samples. */
function gamma(rng, shape) {
  if (shape < 1) return gamma(rng, shape + 1) * Math.pow(rng(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    const x = normal(rng);
    const v = Math.pow(1 + c * x, 3);
    if (v <= 0) continue;
    const u = rng();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

/** Beta(a, b) sample. */
export function betaSample(rng, a, b) {
  const x = gamma(rng, a);
  const y = gamma(rng, b);
  return x / (x + y);
}

// ---------------------------------------------------------------------------
// 1. The k-anonymity ladder
// ---------------------------------------------------------------------------

/**
 * A cohort is only emitted if its bucket holds at least k members. Adding
 * signals makes a bucket more descriptive and smaller; the ladder is the
 * ordered set of fallbacks the resolver walks until a bucket is large enough.
 *
 * Expected bucket population is `audience / 2^bits`, treating the signals in a
 * rung as independent. That independence is optimistic — carrier and country
 * are correlated in the real world — which is exactly why the guard is a
 * measured count in production and only an estimate here.
 *
 * @param {object[]} signals  [{id, bits, …}]
 * @param {string[]} enabled  ids the operator chose to collect
 * @param {object[]} rungs    [{id, label, uses: string[]}] most specific first
 * @param {number} audience   distinct visitors in the trailing window
 * @param {number} k          minimum bucket population
 */
export function ladder({signals, enabled, rungs, audience, k}) {
  const bitsOf = new Map(signals.map((s) => [s.id, s.bits]));
  const rows = rungs.map((r) => {
    const used = r.uses.filter((id) => enabled.includes(id));
    const bits = used.reduce((sum, id) => sum + (bitsOf.get(id) ?? 0), 0);
    const buckets = Math.pow(2, bits);
    return {
      ...r,
      used,
      bits,
      buckets,
      population: audience / buckets,
      passes: audience / buckets >= k,
    };
  });

  return {rows, selected: rows.find((r) => r.passes) ?? rows[rows.length - 1]};
}

// ---------------------------------------------------------------------------
// 2. Bandit allocation vs. an even split
// ---------------------------------------------------------------------------

/**
 * One slot of the newsletter, several creative candidates, one campaign after
 * another. The comparison is deliberately unflattering to the bandit at small
 * volumes: with few sends there is nothing to learn from, and the even split
 * loses nothing.
 *
 * Regret is measured against always sending the best candidate, which is the
 * thing nobody can do because nobody knows which one it is.
 *
 * @param {object} p
 * @param {number} p.arms       creative candidates in the slot
 * @param {number} p.baseRate   click rate of a median candidate
 * @param {number} p.spread     relative spread between best and worst candidate
 * @param {number} p.sends      recipients per campaign
 * @param {number} p.campaigns  campaigns to run
 * @param {number} p.seed
 */
export function banditRace({arms, baseRate, spread, sends, campaigns, seed}) {
  const rng = mulberry32(seed);

  // True rates: evenly spaced across the spread, then shuffled so arm 0 is not
  // systematically the winner.
  const rates = Array.from({length: arms}, (_, i) =>
    baseRate * (1 - spread / 2 + (spread * i) / Math.max(1, arms - 1)));
  for (let i = rates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [rates[i], rates[j]] = [rates[j], rates[i]];
  }

  const best = Math.max(...rates);
  const even = rates.reduce((a, b) => a + b, 0) / arms;

  const posterior = rates.map(() => ({s: 1, f: 1}));
  const series = [];
  let banditClicks = 0;
  let evenClicks = 0;
  let oracleClicks = 0;

  for (let c = 1; c <= campaigns; c++) {
    // Thompson sampling allocates the campaign in proportion to how often each
    // arm wins a draw from its posterior. Sampling once per recipient is the
    // textbook form; batching the draws keeps the simulation cheap and gives
    // the same allocation in expectation.
    const draws = 200;
    const wins = new Array(arms).fill(0);
    for (let d = 0; d < draws; d++) {
      let bestArm = 0;
      let bestVal = -1;
      for (let a = 0; a < arms; a++) {
        const v = betaSample(rng, posterior[a].s, posterior[a].f);
        if (v > bestVal) {
          bestVal = v;
          bestArm = a;
        }
      }
      wins[bestArm]++;
    }

    for (let a = 0; a < arms; a++) {
      const share = wins[a] / draws;
      const n = sends * share;
      // Expected clicks plus a little binomial noise, so the posteriors move
      // the way they would on real traffic.
      const mean = n * rates[a];
      const noisy = Math.max(0, mean + normal(rng) * Math.sqrt(Math.max(1e-9, mean * (1 - rates[a]))));
      banditClicks += noisy;
      posterior[a].s += noisy;
      posterior[a].f += Math.max(0, n - noisy);
    }

    evenClicks += sends * even;
    oracleClicks += sends * best;

    series.push({
      campaign: c,
      bandit: oracleClicks - banditClicks,
      even: oracleClicks - evenClicks,
    });
  }

  return {
    rates,
    best,
    even,
    series,
    banditClicks,
    evenClicks,
    oracleClicks,
    lift: evenClicks > 0 ? banditClicks / evenClicks - 1 : 0,
  };
}

// ---------------------------------------------------------------------------
// 3. Hierarchical shrinkage for cold-start products
// ---------------------------------------------------------------------------

/**
 * A product added this morning has no history. Its posterior is borrowed from
 * its producer, whose posterior is borrowed from its category, and it earns its
 * independence as observations accumulate.
 *
 * `priorStrength` is the number of pseudo-observations the borrowed rate is
 * worth. Small values trust a handful of clicks; large values refuse to believe
 * a new product is exceptional until it has proved it.
 */
export function shrinkage({brandRate, skuTrueRate, maxSends, strengths, seed}) {
  const rng = mulberry32(seed);
  const out = [];
  let clicks = 0;
  let sent = 0;
  const step = Math.max(1, Math.round(maxSends / 120));

  for (let n = step; n <= maxSends; n += step) {
    const batch = n - sent;
    const mean = batch * skuTrueRate;
    clicks += Math.max(0, mean + normal(rng) * Math.sqrt(Math.max(1e-9, mean * (1 - skuTrueRate))));
    sent = n;

    // The unpooled estimate: what a naive ranker would use.
    out.push({n, rate: clicks / n, series: "Own clicks only"});

    for (const m of strengths) {
      out.push({
        n,
        rate: (m * brandRate + clicks) / (m + n),
        series: `Pooled, prior = ${m} sends`,
      });
    }
  }

  return out;
}
