export const fmtInt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
export const fmtPct = (x, digits = 1) => `${(x * 100).toFixed(digits)}%`;

export const MIB = 1048576;
export const fmtMiB = (bytes) => {
  const mib = bytes / MIB;
  return mib >= 100 ? `${Math.round(mib)} MiB` : `${mib.toFixed(2)} MiB`;
};

export function fmtDuration(seconds) {
  if (!Number.isFinite(seconds)) return "∞";
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 90) return `${seconds.toFixed(1)} s`;
  if (seconds < 5400) return `${(seconds / 60).toFixed(1)} min`;
  return `${(seconds / 3600).toFixed(1)} h`;
}

/**
 * Recompute accuracy after treating some classes as one.
 *
 * @param {{truth: string, predicted: string, n: number}[]} cells long-form matrix
 * @param {string[]} labels class order
 * @param {string[][]} groups partition of `labels`. Each inner array is one bucket
 */
export function collapse(cells, labels, groups) {
  const bucketOf = new Map();
  groups.forEach((group, i) => group.forEach((label) => bucketOf.set(label, i)));
  let next = groups.length;
  for (const label of labels) {
    if (!bucketOf.has(label)) bucketOf.set(label, next++);
  }

  const size = next;
  const matrix = Array.from({length: size}, () => new Array(size).fill(0));
  let total = 0;
  let correct = 0;

  for (const cell of cells) {
    const i = bucketOf.get(cell.truth);
    const j = bucketOf.get(cell.predicted);
    matrix[i][j] += cell.n;
    total += cell.n;
    if (i === j) correct += cell.n;
  }

  const perBucket = matrix.map((row, i) => {
    const support = row.reduce((a, b) => a + b, 0);
    const column = matrix.reduce((a, r) => a + r[i], 0);
    return {
      bucket: i,
      support,
      recall: support ? row[i] / support : 0,
      precision: column ? matrix[i][i] / column : 0,
    };
  });

  return {size, matrix, total, correct, accuracy: total ? correct / total : 0, perBucket};
}

export function worstConfusions(cells, limit = 4) {
  return cells
    .filter((c) => c.truth !== c.predicted && c.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, limit);
}


/**
 * Exported ONNX size as a function of how many tree ensembles end up in the
 * graph.
 *
 * @param {object} p
 * @param {number} p.folds ensembles in the graph (1 = prefit + Platt)
 * @param {{folds: number, bytes: number}} p.anchorLow  measured point
 * @param {{folds: number, bytes: number}} p.anchorHigh measured point
 * @param {number} p.companionBytes artifacts shipped alongside, independent of k
 * @param {number} p.mbps download bandwidth, megabits per second
 */
export function exportSize({folds, anchorLow, anchorHigh, companionBytes, mbps}) {
  const slope = (anchorHigh.bytes - anchorLow.bytes) / (anchorHigh.folds - anchorLow.folds);
  const intercept = anchorLow.bytes - slope * anchorLow.folds;
  const modelBytes = Math.max(0, intercept + slope * folds);
  const totalBytes = modelBytes + companionBytes;
  return {
    folds,
    slope,
    intercept,
    modelBytes,
    totalBytes,
    measured: folds === anchorLow.folds || folds === anchorHigh.folds,
    seconds: totalBytes / ((mbps * 1e6) / 8),
  };
}

/**
 * Cold-start and warm-start payload for one device.
 *
 * @param {object} p
 * @param {{bytes: number, fetched: string}[]} p.artifacts artifact table
 * @param {boolean} p.withImport include the screenshot-import assets
 * @param {boolean} p.includeDeadWeight include artifacts the code never loads
 * @param {number} p.mbps download bandwidth, megabits per second
 * @param {number} p.visits sessions on the same device
 */
export function payload({artifacts, withImport, includeDeadWeight, mbps, visits}) {
  const keep = (a) =>
    a.fetched === "every analysis" ||
    (withImport && a.fetched === "screenshot import") ||
    (includeDeadWeight && a.fetched === "never");

  const rows = artifacts.filter(keep);
  const coldBytes = rows.reduce((sum, a) => sum + a.bytes, 0);
  const bytesPerSecond = (mbps * 1e6) / 8;

  const cachedTotal = coldBytes;
  const naiveTotal = coldBytes * Math.max(1, visits);

  return {
    rows,
    coldBytes,
    warmBytes: 0,
    cachedTotal,
    naiveTotal,
    savedBytes: naiveTotal - cachedTotal,
    coldSeconds: coldBytes / bytesPerSecond,
    naiveSeconds: naiveTotal / bytesPerSecond,
  };
}

/**
 * On-device inference pays a large fixed cost once per device and nothing
 * after. Server inference pays a small cost every single time. Which is
 * cheaper is entirely a question of how often a user comes back, and the
 * crossover is the only number worth arguing about.
 *
 * @param {object} p
 * @param {number} p.users distinct devices
 * @param {number} p.analysesPerUser analyses run per device over its lifetime
 * @param {number} p.modelMiB payload fetched once per device, then cached
 * @param {number} p.requestKiB request + response bytes of a server round trip
 * @param {number} p.serverMs server compute per analysis
 * @param {number} p.egressPerGiB currency per GiB served
 * @param {number} p.perCpuHour currency per compute hour
 */
export function delivery({
  users,
  analysesPerUser,
  modelMiB,
  requestKiB,
  serverMs,
  egressPerGiB,
  perCpuHour,
}) {
  const analyses = users * analysesPerUser;

  const onDeviceGiB = (users * modelMiB) / 1024;
  const onDeviceCost = onDeviceGiB * egressPerGiB;

  const serverGiB = (analyses * requestKiB) / 1024 / 1024;
  const serverHours = (analyses * serverMs) / 1000 / 3600;
  const serverCost = serverGiB * egressPerGiB + serverHours * perCpuHour;

  const perAnalysisServer =
    (requestKiB / 1024 / 1024) * egressPerGiB + (serverMs / 1000 / 3600) * perCpuHour;
  const breakEven =
    perAnalysisServer > 0 ? ((modelMiB / 1024) * egressPerGiB) / perAnalysisServer : Infinity;

  return {
    analyses,
    onDeviceGiB,
    onDeviceCost,
    serverGiB,
    serverHours,
    serverCost,
    breakEven,
    cheaper: onDeviceCost <= serverCost ? "device" : "server",
  };
}
