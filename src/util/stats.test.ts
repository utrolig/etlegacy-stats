import { assert, describe, it } from "vitest";
import matchData from "./1733415574.json";
import { getKills, getMapStats, getMatchStats } from "./stats";
import type { GroupDetails } from "./stats-api";

describe("stats parsing", () => {
  it("should be correct", () => {
    const stats = getMatchStats(matchData as unknown as GroupDetails);
    const uyopId = "F0CD7E9D";

    const mapStats = getMapStats("all", [], stats);
    const uYopStats = mapStats.find((s) => s.id === uyopId)!;

    assert.equal(getKills(uYopStats), 294);
  });
});
