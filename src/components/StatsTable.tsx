import { createSignal, type Component } from "solid-js";
import { SortDirection, SortKey } from "../util/sorting";
import { TeamTable } from "./TeamTable";
import { type Stats } from "../util/stats";
import type { PlayerInfoDict } from "../util/stats-api";

export type StatsTableProps = {
  stats: Stats[];
  playerInfoDict: PlayerInfoDict;
};

export const StatsTable: Component<StatsTableProps> = (props) => {
  const [sortDir, setSortDir] = createSignal<SortDirection>("desc");
  const [sortKey, setSortKey] = createSignal<SortKey>("kdr");
  const [preferDiscordNames, setPreferDiscordNames] = createSignal(false);

  const onSortClicked = (key: SortKey) => {
    const currKey = sortKey();
    if (currKey === key) {
      return setSortDir((prev) =>
        prev === SortDirection.Asc ? SortDirection.Desc : SortDirection.Asc,
      );
    }

    setSortDir("desc");
    setSortKey(key);
  };

  return (
    <div class="flex flex-col gap-8 bg-black/10">
      <TeamTable
        stats={props.stats}
        team="alpha"
        sortKey={sortKey()}
        sortDir={sortDir()}
        onSortClicked={onSortClicked}
        playerInfoDict={props.playerInfoDict}
        showExtraMenu
        onPreferDiscordNamesChanged={setPreferDiscordNames}
        preferDiscordNames={preferDiscordNames()}
      />
      <TeamTable
        stats={props.stats}
        team="beta"
        sortKey={sortKey()}
        sortDir={sortDir()}
        onSortClicked={onSortClicked}
        playerInfoDict={props.playerInfoDict}
        onPreferDiscordNamesChanged={setPreferDiscordNames}
        preferDiscordNames={preferDiscordNames()}
      />
    </div>
  );
};
