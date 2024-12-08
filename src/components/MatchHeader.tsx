import type { Component } from "solid-js";
import type { MatchStats } from "../util/stats";
import { MapsBackground } from "./MapsBackground";
import { TeamList } from "./TeamList";
import { MatchScore } from "./MatchScore";

export type MatchHeaderProps = {
  match: MatchStats;
};

export const MatchHeader: Component<MatchHeaderProps> = (props) => {
  return (
    <header class="relative grid grid-cols-[1fr,auto,1fr] py-6">
      <MapsBackground maps={props.match.maps} />
      <div class="absolute inset-x-0 bottom-0 z-20 h-[2px] bg-mud-400"></div>
      <TeamList teamList={props.match.teams} team="alpha" />
      <MatchScore match={props.match} />
      <TeamList teamList={props.match.teams} team="beta" />
    </header>
  );
};
