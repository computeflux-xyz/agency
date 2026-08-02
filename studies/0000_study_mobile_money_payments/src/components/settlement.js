// Pure functions behind the two models on this page. They are deliberately
// small and closed-form: every number the reader sees is a direct consequence
// of a slider, never of a hidden dataset.

export const fmtInt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
export const fmtPct = (x, digits = 1) => `${(x * 100).toFixed(digits)}%`;

/**
 * Duplicate-submission model.
 *
 * A buyer whose phone shows no confirmation taps "pay" again. Without an
 * idempotency key every one of those taps is a fresh instruction to the rail,
 * and some fraction of them debits the buyer twice. With the key, the second
 * instruction resolves to the first payment row and never reaches the rail.
 *
 * @param {object} p
 * @param {number} p.attempts       payment attempts started per day
 * @param {number} p.retryRate      probability a buyer re-submits at least once
 * @param {number} p.extraTaps      mean additional submissions from a re-submitter
 * @param {number} p.doubleDebitOdds probability an unguarded duplicate actually debits
 */
export function duplicates({attempts, retryRate, extraTaps, doubleDebitOdds}) {
  const resubmissions = attempts * retryRate * extraTaps;
  return {
    resubmissions,
    // Without the key: every resubmission is a new instruction on the rail.
    unguardedRailCalls: attempts + resubmissions,
    unguardedDoubleDebits: resubmissions * doubleDebitOdds,
    // With the key: resubmissions are absorbed by a lookup on idempotency_id.
    guardedRailCalls: attempts,
    guardedDoubleDebits: 0,
    absorbed: resubmissions,
  };
}

/**
 * Settlement model.
 *
 * The rail confirms asynchronously. Some callbacks never arrive — the endpoint
 * was rolling, the network dropped it, the rail gave up. Whatever the webhook
 * misses is only ever discovered by asking: a status query on a fixed cadence.
 *
 * Returns the fraction of a cohort of payments that is settled at each minute,
 * for the webhook alone and for webhook plus polling.
 *
 * @param {object} p
 * @param {number} p.webhookLoss   fraction of callbacks that never arrive
 * @param {number} p.medianDelay   median minutes to buyer confirmation
 * @param {number} p.pollMinutes   status-query cadence, minutes
 * @param {number} p.horizon       minutes to simulate
 */
export function settlementCurve({webhookLoss, medianDelay, pollMinutes, horizon}) {
  // Buyer confirmation is modelled as an exponential with the given median:
  // most people approve on their handset quickly, a tail does not.
  const lambda = Math.LN2 / Math.max(0.1, medianDelay);
  const out = [];
  for (let t = 0; t <= horizon; t++) {
    const confirmed = 1 - Math.exp(-lambda * t);
    const viaWebhook = confirmed * (1 - webhookLoss);
    // A poll run at t catches everything confirmed by the *previous* poll tick.
    const lastPoll = Math.floor(t / pollMinutes) * pollMinutes;
    const caughtByPoll = (1 - Math.exp(-lambda * lastPoll)) * webhookLoss;
    out.push({
      t,
      webhook: viaWebhook,
      both: viaWebhook + caughtByPoll,
    });
  }

  return out;
}

/** Minutes until `target` of the cohort is settled, or null inside the horizon. */
export function timeToSettle(curve, key, target) {
  const hit = curve.find((d) => d[key] >= target);
  return hit ? hit.t : null;
}
