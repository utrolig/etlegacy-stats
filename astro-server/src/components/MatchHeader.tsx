import type { Component } from "solid-js";
import type { MatchStats } from "../util/stats";
import { MapsBackground } from "./MapsBackground";
import { TeamList } from "./TeamList";
import { MatchScore } from "./MatchScore";
import { BsArrowLeft } from "solid-icons/bs";

export type MatchHeaderProps = {
  activeMap?: string;
  match: MatchStats;
};

export const MatchHeader: Component<MatchHeaderProps> = (props) => {
  return (
    <header class="relative grid grid-cols-[1fr,auto,1fr] pt-14 pb-6">
      <MapsBackground activeMap={props.activeMap} maps={props.match.maps} />
      <div class="absolute left-6 top-4 z-10 text-mud-100">
        <a
          class="flex items-center gap-2 hover:text-white hover:underline"
          href="/"
        >
          <BsArrowLeft />
          <span>Back to matches</span>
        </a>
      </div>
      <div class="absolute inset-x-0 bottom-0 z-20 h-[2px] bg-mud-400"></div>
      <TeamList teamList={props.match.teams} team="alpha" />
      <MatchScore match={props.match} />
      <TeamList teamList={props.match.teams} team="beta" />
    </header>
  );
};
