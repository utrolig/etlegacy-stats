import type { Group } from "./stats-api";

export function getMatchSize(match: Group) {
  const teamPlayerCount = match.size / 2;
  return teamPlayerCount + "vs" + teamPlayerCount;
}
