import { WEAPON_NAMES } from "./stats";
import Colt from "../assets/weapons/iconw_colt.svg";
import Sten from "../assets/weapons/iconw_sten.svg";
import FG42 from "../assets/weapons/iconw_fg42.svg";
import Knife from "../assets/weapons/iconw_knife.svg";
import Luger from "../assets/weapons/iconw_luger.svg";
import MP34 from "../assets/weapons/iconw_mp34.svg";
import MP40 from "../assets/weapons/iconw_MP40.svg";
import Garand from "../assets/weapons/iconw_m1_garand.svg";
import KaBar from "../assets/weapons/iconw_knife_kbar.svg";
import Mortar from "../assets/weapons/iconw_mortar.svg";
import Panzer from "../assets/weapons/iconw_panzerfaust.svg";
import Bazooka from "../assets/weapons/iconw_bazooka.svg";
import Grenade from "../assets/weapons/iconw_grenade.svg";
import Satchel from "../assets/weapons/iconw_satchel.svg";

import ScpK43 from "../assets/weapons/iconw_mauser.svg";
import Syringe from "../assets/weapons/iconw_syringe.svg";
import Browning from "../assets/weapons/iconw_browning.svg";
import Dynamite from "../assets/weapons/iconw_dynamite.svg";
import Landmine from "../assets/weapons/iconw_landmine.svg";
import Thompson from "../assets/weapons/iconw_thompson.svg";
import Airstrike from "../assets/weapons/iconw_radio.svg";
import Artillery from "../assets/weapons/iconw_radio.svg";
import Flamethrower from "../assets/weapons/iconw_flamethrower.svg";
import GrenadeLauncher from "../assets/weapons/iconw_m1_garand_gren.svg";
import K43Rifle from "../assets/weapons/iconw_mauser.svg";
import MG42Gun from "../assets/weapons/iconw_mg42.svg";
import Granatwerf from "../assets/weapons/iconw_kar98_gren.svg";
import ScpGarand from "../assets/weapons/iconw_mauser.svg";

export function getWeaponIcons(weaponName: keyof typeof WEAPON_NAMES) {
  switch (weaponName) {
    case WEAPON_NAMES.Colt: {
      return Colt;
    }

    case WEAPON_NAMES.Sten: {
      return Sten;
    }

    case WEAPON_NAMES["FG 42"]: {
      return FG42;
    }

    case WEAPON_NAMES.Knife: {
      return Knife;
    }

    case WEAPON_NAMES.Luger: {
      return Luger;
    }

    case WEAPON_NAMES["MP 34"]: {
      return MP34;
    }

    case WEAPON_NAMES["MP 40"]: {
      return MP40;
    }
    case WEAPON_NAMES.Garand: {
      return Garand;
    }
    case WEAPON_NAMES["Ka-Bar"]: {
      return KaBar;
    }

    case WEAPON_NAMES.Mortar: {
      return Mortar;
    }

    case WEAPON_NAMES.Panzer: {
      return Panzer;
    }
    case WEAPON_NAMES.Bazooka: {
      return Bazooka;
    }
    case WEAPON_NAMES.Grenade: {
      return Grenade;
    }
    case WEAPON_NAMES.Satchel: {
      return Satchel;
    }
    case WEAPON_NAMES["Scp.K43"]: {
      return ScpK43;
    }
    case WEAPON_NAMES.Syringe: {
      return Syringe;
    }
    case WEAPON_NAMES.Browning: {
      return Browning;
    }
    case WEAPON_NAMES.Dynamite: {
      return Dynamite;
    }
    case WEAPON_NAMES.Landmine: {
      return Landmine;
    }
    case WEAPON_NAMES.Thompson: {
      return Thompson;
    }
    case WEAPON_NAMES.Airstrike: {
      return Airstrike;
    }
    case WEAPON_NAMES.Artillery: {
      return Artillery;
    }
    case WEAPON_NAMES["F.Thrower"]: {
      return Flamethrower;
    }
    case WEAPON_NAMES["G.Launchr"]: {
      return GrenadeLauncher;
    }
    case WEAPON_NAMES["K43 Rifle"]: {
      return K43Rifle;
    }
    case WEAPON_NAMES["MG 42 Gun"]: {
      return MG42Gun;
    }
    case WEAPON_NAMES.Granatwerf: {
      return Granatwerf;
    }
    case WEAPON_NAMES["Scp.Garand"]: {
      return ScpGarand;
    }
    default: {
      return Artillery;
    }
  }
}
