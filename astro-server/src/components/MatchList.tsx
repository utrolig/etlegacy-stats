import { For, type Component } from "solid-js";
import type { Group } from "../util/stats-api";
import { MatchListItem } from "./MatchListItem";
import { MatchTypeMenu } from "./MatchTypeMenu";

export type MatchListProps = {
  currentUrl: string;
  matches: Group[];
  size?: number;
};

export const MatchList: Component<MatchListProps> = (props) => {
  return (
    <ul class="list-none">
      <For each={props.matches}>
        {(match) => <MatchListItem match={match} />}
      </For>
    </ul>
  );
};
