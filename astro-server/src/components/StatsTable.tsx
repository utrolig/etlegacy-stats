import { createSignal, onCleanup, type Component } from "solid-js";
import { SortDirection, SortKey } from "../util/sorting";
import { TeamTable } from "./TeamTable";
import { type Stats } from "../util/stats";
import type { PlayerInfoDict } from "../util/stats-api";

export type StatsTableProps = {
  stats: Stats[];
  playerInfoDict: PlayerInfoDict;
  preferDiscordNames: boolean;
  onPreferDiscordNamesChange: (value: boolean) => void;
};

export const StatsTable: Component<StatsTableProps> = (props) => {
  const [sortDir, setSortDir] = createSignal<SortDirection>("desc");
  const [sortKey, setSortKey] = createSignal<SortKey>("kdr");

  let alphaRef: HTMLDivElement | undefined;
  let betaRef: HTMLDivElement | undefined;

  const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
    if (source.scrollWidth === target.scrollWidth) {
      target.scrollLeft = source.scrollLeft;
    }
  };

  const onAlphaScroll = () => alphaRef && betaRef && syncScroll(alphaRef, betaRef);
  const onBetaScroll = () => alphaRef && betaRef && syncScroll(betaRef, alphaRef);

  const setAlphaRef = (el: HTMLDivElement) => {
    alphaRef = el;
    el.addEventListener("scroll", onAlphaScroll);
    onCleanup(() => el.removeEventListener("scroll", onAlphaScroll));
  };

  const setBetaRef = (el: HTMLDivElement) => {
    betaRef = el;
    el.addEventListener("scroll", onBetaScroll);
    onCleanup(() => el.removeEventListener("scroll", onBetaScroll));
  };

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
        onPreferDiscordNamesChanged={props.onPreferDiscordNamesChange}
        preferDiscordNames={props.preferDiscordNames}
        scrollContainerRef={setAlphaRef}
      />
      <TeamTable
        stats={props.stats}
        team="beta"
        sortKey={sortKey()}
        sortDir={sortDir()}
        onSortClicked={onSortClicked}
        playerInfoDict={props.playerInfoDict}
        onPreferDiscordNamesChanged={props.onPreferDiscordNamesChange}
        preferDiscordNames={props.preferDiscordNames}
        scrollContainerRef={setBetaRef}
      />
    </div>
  );
};
