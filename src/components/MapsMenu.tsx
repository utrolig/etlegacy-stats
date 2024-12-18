import { For, type Component } from "solid-js";
import { getMapTimes, type MatchStats } from "../util/stats";
import clsx from "clsx";

export type MapsMenuProps = {
  activeMap?: string;
  activeRound?: number;
  match: MatchStats;
  matchId: string;
};

export const MapsMenu: Component<MapsMenuProps> = (props) => {
  const getRoundQueryParams = (map: string, round?: number) => {
    if (!round) {
      return `?map=${map}`;
    }

    return `?map=${map}&round=${round}`;
  };

  return (
    <div class="flex px-6 big:px-10 py-8 gap-8 bg-black/10">
      <a
        data-active={!props.activeMap}
        class="big:text-xl group font-semibold"
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
          <div class="flex flex-col gap-1">
            <a
              data-active={props.activeMap === map}
              class="big:text-xl flex flex-col gap-1 group font-semibold"
              href={`/matches/${props.matchId}${getRoundQueryParams(map)}`}
            >
              <p
                class={clsx(
                  "group-data-[active=false]:group-hover:text-mud-200",
                  props.activeMap === map ? "text-orange-50" : "text-mud-500",
                )}
              >
                {map}
              </p>
            </a>
            <div class="flex items-center gap-2">
              {getMapTimes(props.match, map).map((time, idx, arr) => (
                <>
                  <a
                    href={`/matches/${props.matchId}${getRoundQueryParams(map, idx + 1)}`}
                    class={clsx("text-xs hover:text-white", {
                      "text-mud-500":
                        isCurrentMap(map, props.activeMap) &&
                        !isCurrentRound(idx + 1, props.activeRound) &&
                        props.activeRound,
                      "text-mud-300":
                        !isCurrentMap(map, props.activeMap) ||
                        !isCurrentRound(idx + 1, props.activeRound),
                      "text-white":
                        isCurrentMap(map, props.activeMap) &&
                        isCurrentRound(idx + 1, props.activeRound),
                    })}
                  >
                    {time}
                  </a>
                  {idx !== arr.length - 1 && (
                    <p class="text-xs text-mud-500">/</p>
                  )}
                </>
              ))}
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

function isCurrentMap(map: string, activeMap?: string) {
  return map === activeMap;
}

function isCurrentRound(round: number, currentRound?: number) {
  return round === currentRound;
}
