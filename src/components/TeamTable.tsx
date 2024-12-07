import { createMemo, For, type Component } from "solid-js";
import type { SortDirection, SortKey } from "../util/sorting";
import { type Team } from "../util/match";
import type { Stats } from "../util/stats";
import { PlayerRow } from "./PlayerRow";
import { TableHeader } from "./TableHeader";

export type TeamTableProps = {
  sortDir: SortDirection;
  sortKey: SortKey;
  team: Team;
  stats: Stats[];
};

export const TeamTable: Component<TeamTableProps> = (props) => {
  const teamStats = createMemo(() => {
    return props.stats.filter((stat) => stat.team === props.team);
  });

  return (
    <div class="flex flex-col">
      <h1 class="text-2xl mb-4 capitalize">{props.team}</h1>
      <TableHeader />
      <For each={teamStats()}>{(stats) => <PlayerRow stats={stats} />}</For>
    </div>
  );
};
