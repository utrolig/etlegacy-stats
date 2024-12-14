import { createMemo, For, Show, type Component } from "solid-js";
import {
  playersByKeyAndDir,
  type SortDirection,
  type SortKey,
} from "../util/sorting";
import type { Stats, Team } from "../util/stats";
import { PlayerRow } from "./PlayerRow";
import { TableHeader } from "./TableHeader";
import { TotalRow } from "./TotalRow";
import type { PlayerInfoDict } from "../util/stats-api";
import { PreferDiscordNamesToggle } from "./PreferDiscordNamesToggle";
import { PerformanceComparisonModal } from "./PerformanceComparisonModal";

export type TeamTableProps = {
  sortDir: SortDirection;
  sortKey: SortKey;
  onSortClicked: (key: SortKey) => void;
  team: Team;
  stats: Stats[];
  playerInfoDict: PlayerInfoDict;
  showExtraMenu?: boolean;
  preferDiscordNames: boolean;
  onPreferDiscordNamesChanged: (value: boolean) => void;
};

export const TeamTable: Component<TeamTableProps> = (props) => {
  const teamStats = createMemo(() => {
    return props.stats
      .filter((stat) => stat.team === props.team)
      .sort(playersByKeyAndDir(props.sortKey, props.sortDir));
  });

  return (
    <div class="flex flex-col">
      <div class="flex items-center justify-between pl-5 pb-4">
        <h1 class="text-xl capitalize font-semibold text-orange-50">
          {props.team}
        </h1>
        <Show when={props.showExtraMenu}>
          <div class="flex items-center gap-4">
            <PerformanceComparisonModal stats={props.stats} />
            <PreferDiscordNamesToggle
              value={props.preferDiscordNames}
              onChange={props.onPreferDiscordNamesChanged}
            />
          </div>
        </Show>
      </div>
      <TableHeader
        sortKey={props.sortKey}
        sortDirection={props.sortDir}
        onSortClicked={props.onSortClicked}
      />
      <For each={teamStats()}>
        {(stats) => (
          <PlayerRow
            preferDiscordNames={props.preferDiscordNames}
            playerInfo={props.playerInfoDict[stats.longId]}
            stats={stats}
          />
        )}
      </For>
      <TotalRow stats={teamStats()} />
    </div>
  );
};
