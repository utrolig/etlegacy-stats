import { createMemo, createSignal, type Component } from "solid-js";
import type { PlayerInfoDict } from "../util/stats-api";
import { MatchHeader } from "./MatchHeader";
import {
  getMapStats,
  getMessages,
  getPlayers,
  type MatchStats,
} from "../util/stats";
import { MapsMenu } from "./MapsMenu";
import { StatsTable } from "./StatsTable";
import { AwardsList } from "./AwardsList";
import { getAllSillyAwards, getAllWeaponAwards } from "../util/awards";
import { Messages } from "./Messages";

export type MatchPageWrapperProps = {
  matchStats: MatchStats;
  matchId: string;
  map?: string;
  round?: number;
  playerInfoDict: PlayerInfoDict;
};

export const MatchPageWrapper: Component<MatchPageWrapperProps> = (props) => {
  const [map, setMap] = createSignal<string>(props.map || "");
  const [round, setRound] = createSignal<number>(props.round || 0);
  const [preferDiscordNames, setPreferDiscordNames] = createSignal(false);

  const allStats = createMemo(() => {
    const rounds = round() ? [round()] : [];
    const stats = getMapStats(map(), rounds, props.matchStats);
    return stats;
  });

  const sillyAwards = createMemo(() => {
    return getAllSillyAwards(allStats(), props.matchId);
  });

  const weaponAwards = createMemo(() => {
    return getAllWeaponAwards(allStats());
  });

  const messages = createMemo(() => {
    const rounds = round() ? [round()] : [];
    return getMessages(map(), rounds, props.matchStats);
  });

  const players = createMemo(() => {
    const rounds = round() ? [round()] : [];
    const players = getPlayers(map(), rounds, props.matchStats);
    return players;
  });

  return (
    <>
      <MatchHeader activeMap={map()} match={props.matchStats} />
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
        matchId={props.matchId}
        match={props.matchStats}
      />
      <StatsTable
        onPreferDiscordNamesChange={setPreferDiscordNames}
        preferDiscordNames={preferDiscordNames()}
        playerInfoDict={props.playerInfoDict}
        stats={allStats()}
      />
      <AwardsList awards={sillyAwards()} title="Match awards" />
      <AwardsList awards={weaponAwards()} title="Weapon awards" />
      <Messages
        preferDiscordNames={preferDiscordNames()}
        playerInfoDict={props.playerInfoDict}
        players={players()}
        messages={messages()}
      />
    </>
  );
};
