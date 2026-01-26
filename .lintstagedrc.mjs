/**
 * @type {import("lint-staged").Configuration}
 */
export default {
  "*.{json,jsonc,ts}": "bun biome check --write",
  "*.{md,yml}": "bun prettier --cache --write",
  "*.ts": "bun biome lint --write --only correctness/noUnusedImports",
};
