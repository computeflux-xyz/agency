// Pure functions behind the two models on this page. Both are closed-form and
// driven only by the sliders — nothing here reads a dataset, and nothing here
// reports on the operator's real traffic.

export const fmtInt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
export const fmtPct = (x, digits = 0) => `${(x * 100).toFixed(digits)}%`;

/** Human duration from a count of seconds. */
export function fmtDuration(seconds) {
  if (!Number.isFinite(seconds)) return "∞";
  if (seconds < 90) return `${seconds.toFixed(1)} s`;
  if (seconds < 5400) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3600).toFixed(1)} h`;
}

/**
 * Edge write-amplification model.
 *
 * v1 wrote one key per changed row, plus every index the row belongs to, at the
 * moment of the change. v2 writes nothing on change and instead publishes the
 * entities whose content hash moved since the last publish, batched, plus a
 * fixed set of whole-collection keys and a version marker.
 *
 * The dedup is the whole point: an entity edited several times between two
 * publishes costs one write, not one per edit.
 *
 * @param {object} p
 * @param {number} p.entities     catalogue entities (products, brands, …)
 * @param {number} p.editsPerDay  mean edits per entity per day
 * @param {number} p.fanout       index keys an entity appears in
 * @param {number} p.publishes    publishes per day
 * @param {number} p.wholeSetKeys whole-collection keys rewritten by a publish
 */
export function writeAmplification({entities, editsPerDay, fanout, publishes, wholeSetKeys}) {
  const edits = entities * editsPerDay;
  const triggerWrites = edits * (1 + fanout);

  // Expected share of entities touched at least once between two publishes,
  // treating edits as Poisson over the interval.
  const perInterval = editsPerDay / Math.max(1e-9, publishes);
  const touchedShare = 1 - Math.exp(-perInterval);
  const changedPerPublish = entities * touchedShare;
  const publishWrites = publishes * (changedPerPublish * (1 + fanout) + wholeSetKeys + 1);

  return {
    edits,
    triggerWrites,
    publishWrites,
    changedPerPublish,
    ratio: publishWrites > 0 ? triggerWrites / publishWrites : Infinity,
    // Worst-case staleness for a reader: the gap between two publishes.
    stalenessMinutes: 1440 / Math.max(1e-9, publishes),
  };
}

/**
 * Media pipeline queue model (M/M/c).
 *
 * Uploads arrive, each fans out into a fixed number of resized variants, and a
 * bounded worker pool claims them one at a time. What a buyer of this system
 * wants to know is not throughput but backlog: how long an editor waits between
 * pressing upload and seeing the product live.
 *
 * @param {object} p
 * @param {number} p.uploadsPerDay  original images uploaded per day
 * @param {number} p.variants       resized variants produced per original
 * @param {number} p.secondsEach    seconds of CPU per variant
 * @param {number} p.workers        concurrent worker slots
 */
export function mediaQueue({uploadsPerDay, variants, secondsEach, workers}) {
  const jobsPerSecond = (uploadsPerDay * variants) / 86400;
  const serviceRate = 1 / secondsEach;            // jobs per second per worker
  const offered = jobsPerSecond / serviceRate;    // erlangs
  const utilisation = offered / workers;

  if (utilisation >= 1) {
    return {jobsPerDay: uploadsPerDay * variants, utilisation, waitSeconds: Infinity, latencySeconds: Infinity, saturated: true};
  }

  // Erlang C: probability an arriving job finds every worker busy.
  let sum = 0;
  let term = 1;
  for (let k = 0; k < workers; k++) {
    if (k > 0) term *= offered / k;
    sum += term;
  }

  const last = term * (offered / workers);
  const erlangC = last / (last + (1 - utilisation) * sum);
  const waitSeconds = erlangC / (workers * serviceRate - jobsPerSecond);

  return {
    jobsPerDay: uploadsPerDay * variants,
    utilisation,
    waitSeconds,
    // What the editor actually experiences: the whole original is live once its
    // last variant lands, so queue wait plus the full serial fan-out.
    latencySeconds: waitSeconds + variants * secondsEach,
    saturated: false,
  };
}
