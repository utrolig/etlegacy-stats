import { Show, type Component } from "solid-js";
import type { Group } from "../util/stats-api";
import { getMatchSize } from "../util/match";

export type MatchListItemProps = {
  match: Group;
};

export const MatchListItem: Component<MatchListItemProps> = (props) => {
  return (
    <li class="odd:bg-mud-900/20">
      <a
        class="flex items-center border-b border-b-mud-700 p-2 px-4 gap-6"
        href={`/matches/${props.match.match_id}`}
      >
        <p>{getMatchSize(props.match)}</p>
        <div class="flex flex-col text-sm">
          <div class="flex items-center">
            {props.match.alpha_team.join(" ")}
          </div>
          <p>vs</p>
          <div class="flex items-center">{props.match.beta_team.join(" ")}</div>
        </div>
        <div class="flex flex-col w-12">
          <Show when={props.match.ranks_average}>
            <div class="flex items-center gap-1">
              <span class="text-xs font-bold text-mud-600">ELO</span>
              <span class="text-xs font-bold">
                {props.match.ranks_average.toFixed(0)}
              </span>
            </div>
          </Show>
        </div>
      </a>
    </li>
  );
};
