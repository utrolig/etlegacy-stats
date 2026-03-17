// Axis Voice Lines
const axisVoiceLines: Record<string, string> = {
  // Quick Statements
  PathCleared: "Path cleared.",
  EnemyWeak: "The enemy is weakened.",
  AllClear: "All clear.",
  Incoming: "Incoming!",
  FireInTheHole: "Fire in the hole!",
  OnDefense: "I'm on defense.",
  OnOffense: "I'm on offense.",
  TakingFire: "Taking fire!",
  MinesCleared: "Mines cleared.",
  EnemyDisguised: "Enemy in disguise.",

  // Quick Requests
  Medic: "Need a Medic!",
  NeedAmmo: "I need ammo!",
  NeedBackup: "I need backup!",
  NeedEngineer: "We need an engineer!",
  CoverMe: "Cover me!",
  HoldFire: "Hold your fire!",
  WhereTo: "Where to?",
  NeedOps: "We need Covert Ops!",

  // Quick Commands
  FollowMe: "Follow me!",
  LetsGo: "Let's go!",
  Move: "Move!",
  ClearPath: "Clear the path!",
  DefendObjective: "Defend our objective!",
  DisarmDynamite: "Disarm the dynamite!",
  ClearMines: "Clear the mines!",
  ReinforceDefense: "Reinforce the defense!",
  ReinforceOffense: "Reinforce the offense!",

  // Quick Misc
  Affirmative: "Ja!",
  Negative: "Nein!",
  Thanks: "Danke!",
  Welcome: "You're welcome.",
  Sorry: "Sorry!",
  Oops: "Oops!",

  // Quick Global
  Hi: "Hallo!",
  Bye: "Auf wiedersehen.",
  GreatShot: "Great shot!",
  Cheer: "Wunderbar!",
  GoodGame: "Good game!",

  // Say Player Class
  IamSoldier: "I'm a soldat.",
  IamMedic: "I'm a medic.",
  Iammedic: "I'm a medic.",
  IamEngineer: "I'm an engineer.",
  IamFieldOps: "I'm a field op.",
  IamCovertOps: "I'm a covert op.",

  // Quick Attack
  DestroyPrimary: "Destroy primary objective!",
  DestroySecondary: "Destroy secondary objective!",
  DestroyConstruction: "Destroy construction!",
  RepairVehicle: "Repair the vehicle!",
  DestroyVehicle: "Disable the vehicle!",
  EscortVehicle: "Escort the vehicle!",

  // Quick Objectives
  CommandAcknowledged: "Command acknowledged!",
  CommandDeclined: "Command declined!",
  CommandCompleted: "Command completed!",
  ConstructionCommencing: "I'm constructing!",

  // Quick Fire Teams
  FTAttack: "Attack!",
  FTFallBack: "Fall back!",

  // Fire Teams Soldier
  FTCoverMe: "Cover me!",
  FTCoveringFire: "Covering fire!",
  FTMortar: "Deploy mortar!",

  // Fire Teams Medic
  FTHealSquad: "Heal the squad!",
  FTHealMe: "Heal me!",
  FTReviveTeamMate: "Revive team mate!",
  FTReviveMe: "Revive me!",

  // Fire Teams Engineer
  FTDestroyObjective: "Destroy the objective!",
  FTRepairObjective: "Repair objective!",
  FTConstructObjective: "Construct objective!",
  FTDisarmDynamite: "Disarm the dynamite!",
  FTDeployLandmines: "Deploy landmines!",
  FTDisarmLandmines: "Disarm landmines!",

  // Fire Teams Field Ops
  FTCallAirStrike: "Call an airstrike!",
  FTCallArtillery: "Call in artillery!",
  FTResupplySquad: "Resupply the squad!",
  FTResupplyMe: "Resupply me!",

  // Fire Teams Covert Ops
  FTExploreArea: "Explore the area!",
  FTCheckLandmines: "Check for landmines!",
  FTSatchelObjective: "Destroy the objective!",
  FTInfiltrate: "Infiltrate!",
  FTGoUndercover: "Go undercover!",
  FTProvideSniperCover: "Provide sniper cover!",
};

// Allied Voice Lines
const alliedVoiceLines: Record<string, string> = {
  // Quick Statements
  PathCleared: "Path cleared.",
  EnemyWeak: "The enemy is weakened.",
  AllClear: "All clear.",
  Incoming: "Incoming!",
  FireInTheHole: "Fire in the hole!",
  OnDefense: "I'm on defense.",
  OnOffense: "I'm on offense.",
  TakingFire: "Taking fire!",
  MinesCleared: "Mines cleared.",
  EnemyDisguised: "Enemy in disguise.",

  // Quick Requests
  Medic: "Need a Medic!",
  NeedAmmo: "I need ammo!",
  NeedBackup: "I need backup!",
  NeedEngineer: "We need an engineer!",
  CoverMe: "Cover me!",
  HoldFire: "Hold your fire!",
  WhereTo: "Where to?",
  NeedOps: "We need Covert Ops!",

  // Quick Commands
  FollowMe: "Follow me!",
  LetsGo: "Let's go!",
  Move: "Move!",
  ClearPath: "Clear the path!",
  DefendObjective: "Defend our objective!",
  DisarmDynamite: "Disarm the dynamite!",
  ClearMines: "Clear the mines!",
  ReinforceDefense: "Reinforce the defense!",
  ReinforceOffense: "Reinforce the offense!",

  // Quick Misc
  Affirmative: "Affirmative!",
  Negative: "Negative!",
  Thanks: "Thanks!",
  Welcome: "You're welcome.",
  Sorry: "Sorry!",
  Oops: "Oops!",

  // Quick Global
  Hi: "Hi!",
  Bye: "Bye.",
  bye: "Bye.",
  GreatShot: "Great shot!",
  Cheer: "Yeah!",
  GoodGame: "Good game!",

  // Say Player Class
  IamSoldier: "I'm a soldier.",
  IamMedic: "I'm a medic.",
  IamEngineer: "I'm an engineer.",
  IamFieldOps: "I'm a field ops.",
  IamCovertOps: "I'm a covert ops.",

  // Quick Attack
  DestroyPrimary: "Destroy primary objective!",
  DestroySecondary: "Destroy secondary objective!",
  DestroyConstruction: "Destroy construction!",
  RepairVehicle: "Repair the vehicle!",
  DestroyVehicle: "Disable the vehicle!",
  EscortVehicle: "Escort the vehicle!",

  // Quick Objectives
  CommandAcknowledged: "Command acknowledged!",
  CommandDeclined: "Command declined!",
  CommandCompleted: "Command completed!",
  ConstructionCommencing: "I'm constructing!",

  // Quick Fire Teams
  FTAttack: "Attack!",
  FTFallBack: "Fall back!",

  // Fire Teams Soldier
  FTCoverMe: "Cover me!",
  FTCoveringFire: "Covering fire!",
  FTMortar: "Deploy mortar!",

  // Fire Teams Medic
  FTHealSquad: "Heal the squad!",
  FTHealMe: "Heal me!",
  FTReviveTeamMate: "Revive team mate!",
  FTReviveMe: "Revive me!",

  // Fire Teams Engineer
  FTDestroyObjective: "Destroy the objective!",
  FTRepairObjective: "Repair objective!",
  FTConstructObjective: "Construct objective!",
  FTDisarmDynamite: "Disarm the dynamite!",
  FTDeployLandmines: "Deploy landmines!",
  FTDisarmLandmines: "Disarm landmines!",

  // Fire Teams Field Ops
  FTCallAirStrike: "Call an airstrike!",
  FTCallArtillery: "Call in artillery!",
  FTResupplySquad: "Resupply the squad!",
  FTResupplyMe: "Resupply me!",

  // Fire Teams Covert Ops
  FTExploreArea: "Explore the area!",
  FTCheckLandmines: "Check for landmines!",
  FTSatchelObjective: "Destroy the objective!",
  FTInfiltrate: "Infiltrate!",
  FTGoUndercover: "Go undercover!",
  FTProvideSniperCover: "Provide sniper cover!",
};

const voicelines = {
  ...alliedVoiceLines,
  ...axisVoiceLines,
  ...Object.entries(alliedVoiceLines).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {} as Record<string, string>,
  ),
};

export { axisVoiceLines, alliedVoiceLines, voicelines };
