import { For, type JSX, type Component } from "solid-js";
import { getMapTimes, type MatchStats } from "../util/stats";
import clsx from "clsx";

export type MapsMenuProps = {
  activeMap: string;
  activeRound?: number;
  match: MatchStats;
  matchId: string;
  onMapClicked: (map: string) => void;
  onTotalClicked: () => void;
  onRoundClicked: (map: string, round: number) => void;
};

export const MapsMenu: Component<MapsMenuProps> = (props) => {
  const getRoundQueryParams = (map: string, round?: number) => {
    if (!round) {
      return `?map=${map}`;
    }

    return `?map=${map}&round=${round}`;
  };

  const onTotalClicked: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent> = (
    e,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    history.pushState({}, "", location.pathname);
    props.onTotalClicked();
  };

  const onMapClicked = (e: MouseEvent, map: string) => {
    e.preventDefault();
    e.stopPropagation();

    const qp = new URLSearchParams();

    qp.set("map", map);

    history.pushState({}, "", `${location.pathname}?${qp.toString()}`);
    props.onMapClicked(map);
  };

  const onRoundClicked = (e: MouseEvent, map: string, round: number) => {
    e.preventDefault();
    e.stopPropagation();

    const qp = new URLSearchParams(location.search);

    qp.set("map", map);
    qp.set("round", round.toString());

    history.pushState({}, "", `${location.pathname}?${qp.toString()}`);
    props.onRoundClicked(map, round);
  };

  return (
    <div class="flex px-6 big:px-10 py-8 gap-8 bg-black/10">
      <a
        onClick={onTotalClicked}
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
              onClick={(e) => onMapClicked(e, map)}
              data-active={!props.activeMap}
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
                    onClick={(e) => onRoundClicked(e, map, idx + 1)}
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
