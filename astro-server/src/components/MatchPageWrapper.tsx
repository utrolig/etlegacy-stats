import { createMemo, createSignal, type Component } from "solid-js";
import type { GroupDetails, PlayerInfoDict } from "../util/stats-api";
import { MatchHeader } from "./MatchHeader";
import { getMapStats, getMatchStats } from "../util/stats";
import { MapsMenu } from "./MapsMenu";
import { StatsTable } from "./StatsTable";
import { AwardsList } from "./AwardsList";
import { getAllSillyAwards, getAllWeaponAwards } from "../util/awards";

export type MatchPageWrapperProps = {
  matchDetails: GroupDetails;
  map?: string;
  round?: number;
  playerInfoDict: PlayerInfoDict;
};

export const MatchPageWrapper: Component<MatchPageWrapperProps> = (props) => {
  const [map, setMap] = createSignal<string>(props.map || "");
  const [round, setRound] = createSignal<number>(props.round || 0);

  const match = createMemo(() => {
    return getMatchStats(props.matchDetails);
  });

  const allStats = createMemo(() => {
    const rounds = round() ? [round()] : [];
    const stats = getMapStats(map(), rounds, match());
    return stats;
  });

  const sillyAwards = createMemo(() => {
    return getAllSillyAwards(allStats(), props.matchDetails.match.match_id);
  });

  const weaponAwards = createMemo(() => {
    return getAllWeaponAwards(allStats());
  });

  return (
    <>
      <MatchHeader activeMap={map()} match={match()} />
      <MapsMenu
        onMapClicked={(map) => {
          setMap(map);
          setRound(0);
        }}
        onRoundClicked={(map, round) => {
          setRound(round);
          setMap(map);
        }}
        onTotalClicked={() => {
          setRound(0);
          setMap("");
        }}
        activeRound={round()}
        activeMap={map()}
        matchId={props.matchDetails.match.match_id}
        match={match()}
      />
      <StatsTable playerInfoDict={props.playerInfoDict} stats={allStats()} />
      <AwardsList awards={sillyAwards()} title="Match awards" />
      <AwardsList awards={weaponAwards()} title="Weapon awards" />
    </>
  );
};
