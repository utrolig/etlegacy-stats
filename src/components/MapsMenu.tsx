import { For, Show, type Component } from "solid-js";
import { getMapTimes, type MatchStats } from "../util/stats";
import clsx from "clsx";

export type MapsMenuProps = {
  activeMap?: string;
  match: MatchStats;
  matchId: string;
};

export const MapsMenu: Component<MapsMenuProps> = (props) => {
  return (
    <div class="flex p-8 gap-8">
      <a class="text-2xl" href={`/matches/${props.matchId}`}>
        <p
          class={clsx(
            "border-b-2 border-b-transparent py-1",
            !props.activeMap
              ? "border-b-orange-400 text-orange-50"
              : "text-mud-500",
          )}
        >
          Total
        </p>
      </a>
      <For each={props.match.maps}>
        {(map) => (
          <a
            class="text-2xl flex flex-col gap-2"
            href={`/matches/${props.matchId}/${map}`}
          >
            <p
              class={clsx(
                "border-b-2 border-b-transparent py-1",
                props.activeMap === map
                  ? "border-b-orange-400 text-orange-50"
                  : "text-mud-500",
              )}
            >
              {map}
            </p>
            <div class="flex items-center gap-2">
              {getMapTimes(props.match, map).map((time, idx, arr) => (
                <>
                  <p class="text-xs text-mud-300">{time}</p>
                  {idx !== arr.length - 1 && (
                    <p class="text-xs text-mud-500">/</p>
                  )}
                </>
              ))}
            </div>
          </a>
        )}
      </For>
    </div>
  );
};
