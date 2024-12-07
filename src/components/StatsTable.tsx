import { createMemo, createSignal, type Component } from "solid-js";
import type { SortDirection, SortKey } from "../util/sorting";
import { TeamTable } from "./TeamTable";
import { getMapStats, getMatchStats, type MatchStats } from "../util/stats";
import type { GroupDetails } from "../util/stats-api";

export type StatsTableProps = {
  matchDetails: GroupDetails;
  stats: MatchStats;
};

export const StatsTable: Component<StatsTableProps> = (props) => {
  const [sortDir, setSortDir] = createSignal<SortDirection>("asc");
  const [sortKey, setSortKey] = createSignal<SortKey>("name");

  const matchStats = createMemo(() => {
    return getMatchStats(props.matchDetails);
  });

  const data = createMemo(() => {
    return getMapStats("all", [], props.stats);
    // return getMapStats("all", [], matchStats());
  });

  return (
    <div class="flex flex-col gap-8 py-8">
      <TeamTable
        stats={data()}
        team="alpha"
        sortKey={sortKey()}
        sortDir={sortDir()}
      />
      <TeamTable
        stats={data()}
        team="beta"
        sortKey={sortKey()}
        sortDir={sortDir()}
      />
    </div>
  );
};
