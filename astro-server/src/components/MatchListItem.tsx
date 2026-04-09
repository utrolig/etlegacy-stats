import { type Component } from "solid-js";
import type { Group } from "../util/stats-api";
import { DateTime } from "luxon";
import { getMatchSize } from "../util/stats";
import { FiClock } from "solid-icons/fi";

export type MatchListItemProps = {
  match: Group;
};

export const MatchListItem: Component<MatchListItemProps> = (props) => {
  return (
    <li class="odd:bg-mud-900/20 relative">
      <a
        class="flex items-center border-b border-b-mud-700 p-4 gap-6"
        data-astro-prefetch
        href={`/matches/${props.match.match_id}`}
      >
        <div
          class="absolute top-2 right-2 text-mud-400"
          title={getAbsoluteTime(props.match)}
        >
          <FiClock size={16} />
        </div>
        <div class="flex flex-col gap-1 min-w-0">
          <div class={`grid min-w-0 ${props.match.match_score ? "grid-cols-[auto_1fr] gap-x-2" : "grid-cols-1"}`}>
            {props.match.match_score && (
              <span class={`text-right ${getScoreColor(props.match.match_score, "alpha")}`}>
                {props.match.match_score.split("-")[0]}
              </span>
            )}
            <span class="truncate">{props.match.alpha_team.join(" - ")}</span>
            {props.match.match_score && (
              <span class={`text-right ${getScoreColor(props.match.match_score, "beta")}`}>
                {props.match.match_score.split("-")[1]}
              </span>
            )}
            <span class="truncate">{props.match.beta_team.join(" - ")}</span>
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

function getScoreColor(matchScore: string | undefined, team: "alpha" | "beta") {
  if (!matchScore) return "text-mud-400";
  const [alpha, beta] = matchScore.split("-").map(Number);
  if (alpha === beta) return "text-mud-400";
  const teamWon = team === "alpha" ? alpha > beta : beta > alpha;
  return teamWon ? "text-green-400" : "text-red-400";
}

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

function getAbsoluteTime(match: Group) {
  const time = match.end_time ?? match.start_time;
  return DateTime.fromSeconds(time).toFormat("dd-MM-yyyy HH:mm");
}
