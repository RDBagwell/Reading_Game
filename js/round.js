// Picking the next word to ask. Pure functions: pass `rng` for testability.

export function randomItem(list, rng = Math.random) {
  return list[Math.floor(rng() * list.length)];
}

/** Pick a target from `pool` that is not the previous target. */
export function pickTarget(pool, { last = null, rng = Math.random } = {}) {
  if (!pool.length) throw new Error('Cannot pick from an empty word pool');
  const choices = pool.length > 1 ? pool.filter((w) => w !== last) : pool;
  return randomItem(choices, rng);
}
