import { createMemo, For, type Component } from "solid-js";
import {
  playersByKeyAndDir,
  type SortDirection,
  type SortKey,
} from "../util/sorting";
import type { Stats, Team } from "../util/stats";
import { PlayerRow } from "./PlayerRow";
import { TableHeader } from "./TableHeader";
import { TotalRow } from "./TotalRow";

export type TeamTableProps = {
  sortDir: SortDirection;
  sortKey: SortKey;
  onSortClicked: (key: SortKey) => void;
  team: Team;
  stats: Stats[];
};

export const TeamTable: Component<TeamTableProps> = (props) => {
  const teamStats = createMemo(() => {
    return props.stats
      .filter((stat) => stat.team === props.team)
      .sort(playersByKeyAndDir(props.sortKey, props.sortDir));
  });

  return (
    <div class="flex flex-col">
      <h1 class="text-xl mb-4 ml-8 capitalize font-semibold text-orange-50">
        {props.team}
      </h1>
      <TableHeader
        sortKey={props.sortKey}
        sortDirection={props.sortDir}
        onSortClicked={props.onSortClicked}
      />
      <For each={teamStats()}>{(stats) => <PlayerRow stats={stats} />}</For>
      <TotalRow stats={teamStats()} />
    </div>
  );
};
