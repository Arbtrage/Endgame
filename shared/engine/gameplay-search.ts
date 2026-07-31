import type { SearchOptions } from "./types";

/** Fast defaults for live gameplay (not analysis). */
export const GAMEPLAY_SEARCH: Required<Pick<SearchOptions, "moveTime" | "depth">> =
  {
    moveTime: 1800,
    depth: 12,
  };

export const GAMEPLAY_SEARCH_FAST: Required<
  Pick<SearchOptions, "moveTime" | "depth">
> = {
  moveTime: 1000,
  depth: 10,
};

export function gameplaySearchOptions(
  skillLevel: number,
  fast = false,
): SearchOptions {
  const base = fast ? GAMEPLAY_SEARCH_FAST : GAMEPLAY_SEARCH;
  return {
    ...base,
    skillLevel,
  };
}
