import { createSignal, type Component } from "solid-js";
import type { GroupDetails } from "../util/stats-api";
import type { SortDirection, SortKey } from "../util/sorting";
import { TeamTable } from "./TeamTable";

export type StatsTableProps = {
  match: GroupDetails;
};

export const StatsTable: Component<StatsTableProps> = (props) => {
  const [sortDir, setSortDir] = createSignal<SortDirection>("asc");
  const [sortKey, setSortKey] = createSignal<SortKey>("name");

  return (
    <div class="flex flex-col">
      <TeamTable
        match={props.match}
        team="alpha"
        sortKey={sortKey()}
        sortDir={sortDir()}
      />
      <TeamTable
        match={props.match}
        team="beta"
        sortKey={sortKey()}
        sortDir={sortDir()}
      />
    </div>
  );
};
