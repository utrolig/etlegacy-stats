import { createMemo, type Component } from "solid-js";
import type { SortDirection, SortKey } from "../util/sorting";
import type { GroupDetails } from "../util/stats-api";
import { getTeams, getTeamStats, type Team } from "../util/match";
import { PlayerRow } from "./PlayerRow";

export type TeamTableProps = {
  sortDir: SortDirection;
  sortKey: SortKey;
  team: Team;
  match: GroupDetails;
};

export const TeamTable: Component<TeamTableProps> = (props) => {
  const totalStats = createMemo(() => {
    const { match } = props.match;
    const teams = getTeams(match.rounds);
    const stats = getTeamStats(match.rounds, teams[props.team]);
    return stats;
  });

  return (
    <div class="flex flex-col">
      {totalStats().map((player) => (
        <PlayerRow player={player} />
      ))}
    </div>
  );
};
