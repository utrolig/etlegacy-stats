import { createMemo, createSignal, For, type Component } from "solid-js";
import type { Group } from "../util/stats-api";
import { MatchListItem } from "./MatchListItem";
import { MatchTypeMenu } from "./MatchTypeMenu";

export type MatchListProps = {
  matches: Group[];
  type: string | null;
};

export const MatchList: Component<MatchListProps> = (props) => {
  const [activeType, setActiveType] = createSignal<string | null>(props.type);

  const activeMatches = createMemo(() => {
    const type = activeType();
    return props.matches.filter((match) => {
      if (!activeType()) {
        return true;
      }

      const matchType = getMatchType(match.size);

      return matchType === type;
    });
  });

  return (
    <>
      <MatchTypeMenu onTypeChanged={setActiveType} type={activeType()} />
      <ul class="list-none">
        <For each={activeMatches()}>
          {(match) => <MatchListItem match={match} />}
        </For>
      </ul>
    </>
  );
};

function getMatchType(matchSize: number) {
  switch (matchSize) {
    case 1:
      return "Test";
    case 2:
      return "1v1";
    case 4:
      return "2v2";
    case 6:
      return "3v3";
    case 8:
      return "4v4";
    case 10:
      return "5v5";
    case 12:
      return "6v6";
    default:
      return "Unknown";
  }
}
