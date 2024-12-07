import { createMemo, createSignal, type Component } from "solid-js";
import type { SortDirection, SortKey } from "../util/sorting";
import { TeamTable } from "./TeamTable";
import { type Stats } from "../util/stats";

export type StatsTableProps = {
  stats: Stats[];
};

export const StatsTable: Component<StatsTableProps> = (props) => {
  const [sortDir, setSortDir] = createSignal<SortDirection>("asc");
  const [sortKey, setSortKey] = createSignal<SortKey>("name");

  return (
    <div class="flex flex-col gap-8 py-8">
      <TeamTable
        stats={props.stats}
        team="alpha"
        sortKey={sortKey()}
        sortDir={sortDir()}
      />
      <TeamTable
        stats={props.stats}
        team="beta"
        sortKey={sortKey()}
        sortDir={sortDir()}
      />
    </div>
  );
};
