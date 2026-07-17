// Small helpers shared across the article (demonstrates local ES-module imports,
// which Observable Framework bundles into dist/_import/).

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const usd4 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 4,
});

export const fmtUSD = (n) => (Math.abs(n) < 1 ? usd4.format(n) : usd.format(n));

export const fmtInt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));

// Cost to produce one million tokens at a given $/hour and tokens/second.
export const perMillion = (hourlyUsd, tokensPerSec) =>
  (hourlyUsd / (tokensPerSec * 3600)) * 1e6;
