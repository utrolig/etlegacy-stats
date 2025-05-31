import type { Component } from "solid-js";
import type { GameClass } from "../util/stats-api";
import covertops from "../assets/classes/ic_covertops.avif";
import engineer from "../assets/classes/ic_engineer.avif";
import medic from "../assets/classes/ic_medic.avif";
import fieldop from "../assets/classes/ic_fieldops.avif";
import soldier from "../assets/classes/ic_soldier.avif";
import type { ImageMetadata } from "astro";
import { Tooltip } from "./Tooltip";

export type ClassIconProps = {
  gameClass: GameClass;
};

const CLASS_ICONS: Record<GameClass, ImageMetadata> = {
  covertops,
  engineer,
  medic,
  fieldop,
  soldier,
};

const CLASS_NAMES: Record<GameClass, string> = {
  covertops: "Covert Ops",
  engineer: "Engineer",
  fieldop: "Field Ops",
  medic: "Medic",
  soldier: "Soldier",
};

export const ClassIcon: Component<ClassIconProps> = (props) => {
  const icon = CLASS_ICONS[props.gameClass];

  return (
    <Tooltip content={CLASS_NAMES[props.gameClass]}>
      <img
        src={icon.src}
        alt={props.gameClass}
        class="w-5 h-5"
        loading="lazy"
        decoding="async"
      />
    </Tooltip>
  );
};
