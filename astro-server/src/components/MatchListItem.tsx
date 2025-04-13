import { Show, type Component } from "solid-js";
import type { Group } from "../util/stats-api";
import { DateTime } from "luxon";
import { getMatchSize } from "../util/stats";

export type MatchListItemProps = {
  match: Group;
};

export const MatchListItem: Component<MatchListItemProps> = (props) => {
  return (
    <li class="odd:bg-mud-900/20">
      <a
        class="flex items-center border-b border-b-mud-700 p-4 gap-6"
        href={`/matches/${props.match.match_id}`}
      >
        <div class="flex flex-col gap-1">
          <div class="flex flex-col">
            <div class="flex items-center">
              {props.match.alpha_team.join(" - ")}
            </div>
            <div class="flex items-center">
              {props.match.beta_team.join(" - ")}
            </div>
          </div>
          <div class="flex flex-col text-sm">
            <p class="text-mud-200">{props.match.maps.join(", ")}</p>
            <div class="flex items-center gap-1">
              <p class="text-orange-100 font-semibold">
                {getMatchSize(props.match)}
              </p>
              <p class="text-mud-400">
                {getDisplayTime(props.match)} {getChannelState(props.match)}
              </p>
            </div>
          </div>
        </div>
      </a>
    </li>
  );
};

function getChannelState(match: Group) {
  if (!match.channel_name) {
    return;
  }

  return `in ${match.channel_name}`;
}

function getDisplayTime(match: Group) {
  if (!match.end_time) {
    return "Started " + DateTime.fromSeconds(match.start_time).toRelative();
  }

  return "Finished " + DateTime.fromSeconds(match.end_time).toRelative();
}
