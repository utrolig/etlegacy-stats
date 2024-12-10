import { For, type Component } from "solid-js";
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
      <a
        data-active={!props.activeMap}
        class="text-2xl group"
        href={`/matches/${props.matchId}`}
      >
        <p
          class={clsx(
            "group-data-[active=false]:group-hover:text-mud-200",
            !props.activeMap ? "text-orange-50" : "text-mud-500",
          )}
        >
          Total
        </p>
      </a>
      <For each={props.match.maps}>
        {(map) => (
          <a
            data-active={props.activeMap === map}
            class="text-2xl flex flex-col gap-1 group"
            href={`/matches/${props.matchId}/${map}`}
          >
            <p
              class={clsx(
                "group-data-[active=false]:group-hover:text-mud-200",
                props.activeMap === map ? "text-orange-50" : "text-mud-500",
              )}
            >
              {map}
            </p>
            <div class="flex items-center gap-2">
              {getMapTimes(props.match, map).map((time, idx, arr) => (
                <>
                  <p
                    class={clsx(
                      "text-xs ",
                      props.activeMap === map || !props.activeMap
                        ? "text-mud-300"
                        : "text-mud-600",
                    )}
                  >
                    {time}
                  </p>
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
