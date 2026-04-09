export type Guid = string;
export type LevelTime = number;
export type UnixTime = number;
export type Position = string;

export type GameClass =
  | "medic"
  | "fieldop"
  | "engineer"
  | "soldier"
  | "covertops";

export type PlayerClass = GameClass | "unknown";
export type TeamNumber = 0 | 1 | 2 | 3;
export type HitRegion =
  | "HR_HEAD"
  | "HR_ARMS"
  | "HR_BODY"
  | "HR_LEGS"
  | "HR_NONE";
export type MessageCommand =
  | "say"
  | "say_team"
  | "say_teamNL"
  | "say_buddy"
  | "say_buddyNL"
  | "vsay"
  | "vsay_team"
  | "vsay_buddy";
export type SpawnWeapon =
  | "panzerfaust"
  | "flamethrower"
  | "mobile_mg42"
  | "mobile_browning"
  | "bazooka"
  | "carbine"
  | "kar98"
  | "sten"
  | "mp34"
  | "fg42"
  | "garand_sniper"
  | "k43_sniper";

export type Group = {
  match_id: number;
  channel_name: string;
  state: "waiting_report" | "finished" | "cancelled" | "unknown match";
  size: number;
  start_time: number;
  end_time: number;
  maps: string[];
  alpha_team: string[];
  beta_team: string[];
  ranks_average: number;
  server: {
    ip: string;
    port: number;
    pw: string;
    instance: string;
  };
  winner: "alpha" | "beta" | null;
  match_score?: string;
};

export type Message = {
  message: string;
  timestamp: number;
  guid: string;
  command: MessageCommand;
};

export type Obituary = {
  timestamp: number;
  target: string;
  victimRespawnTime: number;
  attacker: string;
  meansOfDeath: number;
  attackerRespawnTime: number;
};

export type OldDamageStat = {
  attacker: string;
  target: string;
  damageFlags: number;
  damage: number;
  timestamp: number;
  hitRegion: string;
  meansOfDeath: number;
};

export type LegacyClassSwitch = {
  timestamp: number;
  toClass: GameClass;
  fromClass?: GameClass;
};

export type LegacyStanceStatsSeconds = {
  in_prone: number;
  in_crouch: number;
  in_lean: number;
  in_mg: number;
  in_binoculars: number;
};

export type NewStanceStatsSeconds = {
  in_prone: number;
  in_crouch: number;
  in_mg: number;
  in_lean: number;
  in_objcarrier: number;
  in_vehiclescort: number;
  in_disguise: number;
  in_sprint: number;
  in_turtle: number;
  is_downed: number;
};

export type ObjStatEntry = {
  objective: string;
  timestamp_unix: UnixTime;
};

export type ObjCarrierKilledEntry = {
  victim: Guid;
  weapon: number;
  objective: string;
  timestamp_unix: UnixTime;
};

export type LegacyObjStatMap = Record<string, string>;
export type ObjStatMap = Record<string, ObjStatEntry>;
export type ObjCarrierKilledMap = Record<string, ObjCarrierKilledEntry>;

export type BasePlayerStat = {
  guid: string;
  name: string;
  rounds: string;
  team: string;
  weaponStats: string[];
  distance_travelled_meters?: number;
  distance_travelled_spawn?: number;
  distance_travelled_spawn_avg?: number;
  spawn_count?: number;
  player_speed?: {
    ups_avg: number;
    ups_peak: number;
    kph_avg: number;
    kph_peak: number;
    mph_avg: number;
    mph_peak: number;
  };
};

export type OldPlayerStat = BasePlayerStat & {
  obj_destroyed?: LegacyObjStatMap;
  obj_planted?: LegacyObjStatMap;
  shoves_given?: LegacyObjStatMap;
  class_switches?: LegacyClassSwitch[];
  stance_stats_seconds?: LegacyStanceStatsSeconds;
};

export type NewPlayerStat = BasePlayerStat & {
  stance_stats_seconds?: NewStanceStatsSeconds;
  obj_planted?: ObjStatMap;
  obj_defused?: ObjStatMap;
  obj_destroyed?: ObjStatMap;
  obj_repaired?: ObjStatMap;
  obj_taken?: ObjStatMap;
  obj_secured?: ObjStatMap;
  obj_returned?: ObjStatMap;
  obj_carrierkilled?: ObjCarrierKilledMap;
  obj_flagcaptured?: ObjStatMap;
  obj_misc?: ObjStatMap;
  obj_escort?: ObjStatMap;
  shoves_given?: ObjStatMap;
  shoves_received?: ObjStatMap;
};

export type RawPlayerStats = OldPlayerStat | NewPlayerStat;

export type BaseRoundInfo = {
  servername: string;
  config: string;
  mapname: string;
  round: number;
  matchID: string;
  defenderteam: number;
  winnerteam: number;
  timelimit: string;
  nextTimeLimit: string;
};

export type OldRoundInfo = BaseRoundInfo & {
  obituaries?: Obituary[];
  messages: Message[];
  damageStats: OldDamageStat[];
};

export type NewRoundInfo = BaseRoundInfo & {
  stats_version: string;
  mod_version: string;
  et_version: string;
  server_ip: string;
  server_port: string;
  round_start: LevelTime;
  round_end: LevelTime;
  round_start_unix: UnixTime;
  round_end_unix: UnixTime;
  original_match_id: string;
};

export interface GamelogEventBase {
  match_id: string;
  round_id: number;
  unixtime: number;
  leveltime: LevelTime;
  group: "player" | "server";
  label: string;
}

export type StanceSnapshot = {
  is_prone: boolean;
  is_crouch: boolean;
  is_mounted: boolean;
  is_leaning: boolean;
  is_carrying_obj: boolean;
  is_disguised: boolean;
  is_downed: boolean;
  is_sprint: boolean;
};

export type SpawnEvent = GamelogEventBase & {
  group: "player";
  label: "spawn";
  player: Guid;
  team: TeamNumber;
  class: PlayerClass;
  weapons?: SpawnWeapon[];
};

export type KillEvent = GamelogEventBase & {
  group: "player";
  label: "kill";
  killer: Guid;
  victim: Guid;
  weapon: number;
  killer_health: number;
  killer_class: PlayerClass;
  killer_pos: Position;
  killer_stance: StanceSnapshot;
  victim_class: PlayerClass;
  victim_pos: Position;
  victim_stance: StanceSnapshot;
  allies_alive: number;
  axis_alive: number;
  killer_reinf: number;
  victim_reinf: number;
};

export type SuicideEvent = GamelogEventBase & {
  group: "player";
  label: "suicide";
  player: Guid;
  weapon: number;
  victim_class: PlayerClass;
  victim_pos: Position;
  victim_stance: StanceSnapshot;
};

export type TeamkillEvent = GamelogEventBase & {
  group: "player";
  label: "teamkill";
  killer: Guid;
  victim: Guid;
  weapon: number;
  killer_class: PlayerClass;
  killer_stance: StanceSnapshot;
  victim_class: PlayerClass;
  victim_health: number;
  victim_stance: StanceSnapshot;
};

export type DamageEvent = GamelogEventBase & {
  group: "player";
  label: "damage";
  killer?: Guid | "WORLD";
  victim?: Guid;
  damage: number;
  damage_flags: number;
  weapon: number;
  hit_region: HitRegion;
  killer_health?: number | null;
  killer_class?: PlayerClass | null;
  killer_pos?: Position | null;
  killer_stance?: StanceSnapshot | null;
  victim_health?: number;
  victim_class?: PlayerClass;
  victim_pos?: Position;
  victim_stance?: StanceSnapshot;
};

export type ReviveEvent = GamelogEventBase & {
  group: "player";
  label: "revive";
  player: Guid;
  victim: Guid;
};

export type ClassChangeEvent = GamelogEventBase & {
  group: "player";
  label: "class_change";
  player: Guid;
  class: PlayerClass;
};

export type MessageEvent = GamelogEventBase & {
  group: "player";
  label: "message";
  player: Guid;
  command: MessageCommand;
  message: string;
  vsay_text?: string;
};

export type ObjectiveLabel =
  | "obj_planted"
  | "obj_defused"
  | "obj_destroyed"
  | "obj_repaired"
  | "obj_taken"
  | "obj_secured"
  | "obj_returned"
  | "obj_carrierkilled";

export type ObjectiveEvent = GamelogEventBase & {
  group: "player";
  label: ObjectiveLabel;
  player: Guid;
  objective: string;
};

export type FlagCapturedEvent = GamelogEventBase & {
  group: "player";
  label: "obj_flag_captured";
  player: Guid;
  flag: string;
};

export type ShoveEvent = GamelogEventBase & {
  group: "player";
  label: "shove";
  player: Guid;
  victim: Guid;
};

export type WeaponFireEvent = GamelogEventBase & {
  group: "player";
  label: "weapon_fire";
  player: Guid;
  weapon: number;
  pos: Position;
  pitch: number;
  yaw: number;
  stance: StanceSnapshot;
};

export type RoundStartEvent = GamelogEventBase & {
  group: "server";
  label: "round_start";
};

export type RoundEndEvent = GamelogEventBase & {
  group: "server";
  label: "round_end";
};

export type GamelogEvent =
  | SpawnEvent
  | KillEvent
  | SuicideEvent
  | TeamkillEvent
  | DamageEvent
  | ReviveEvent
  | ClassChangeEvent
  | MessageEvent
  | ObjectiveEvent
  | FlagCapturedEvent
  | ShoveEvent
  | WeaponFireEvent
  | RoundStartEvent
  | RoundEndEvent;

export type OldRoundData = {
  round_info: OldRoundInfo;
  player_stats: Record<string, OldPlayerStat>;
};

export type NewRoundData = {
  round_info: NewRoundInfo;
  player_stats: Record<string, NewPlayerStat>;
  gamelog?: GamelogEvent[];
};

export type OldGroupRound = {
  round_filename: string;
  round_data: OldRoundData;
};

export type NewGroupRound = {
  round_filename: string;
  round_data: NewRoundData;
};

export type GroupRound = OldGroupRound | NewGroupRound;

export type MatchPlayer = {
  id: string;
  nick: string;
  country?: string;
};

export type BaseMatchDetails = {
  match_id: string;
  channel_id: string | null;
  channel_name: string | null;
  state: "waiting_report" | "finished" | "cancelled";
  size: number;
  alpha_team: MatchPlayer[];
  beta_team: MatchPlayer[];
  ranks_start: Record<string, number> | null;
  ranks_end: Record<string, number> | null;
  start_time: number;
  end_time: number;
  maps: string[];
  server: {
    ip: string;
    port: number;
    pw: string | null;
    instance: string;
  };
  winner: "alpha" | "beta" | null;
  rounds: GroupRound[];
  demos?: string[];
};

export type OldMatchDetails = BaseMatchDetails;

export type NewMatchDetails = BaseMatchDetails & {
  original_match_id?: string;
  alpha_score?: number;
  beta_score?: number;
  match_score?: string;
};

export type GroupDetails = {
  match: OldMatchDetails | NewMatchDetails;
};

