import etl_ice from "../assets/maps/etl_ice.avif";
import bremen_b3 from "../assets/maps/bremen_b3.avif";
import supply from "../assets/maps/supply.avif";
import radar from "../assets/maps/radar.avif";
import decay_sw from "../assets/maps/decay_sw.avif";
import adlernest from "../assets/maps/adlernest.avif";
import frostbite from "../assets/maps/frostbite.avif";
import missile_b3 from "../assets/maps/missile_b3.avif";
import te_escape2 from "../assets/maps/te_escape2.avif";
import karsiah_te2 from "../assets/maps/karsiah_te2.avif";
import braundorf_b4 from "../assets/maps/braundorf_b4.avif";
import erdenberg_t2 from "../assets/maps/erdenberg_t2.avif";
import operation_b7 from "../assets/maps/operation_b7.avif";
import et_brewdog from "../assets/maps/et_brewdog.avif";
import et_brewdog_b6 from "../assets/maps/et_brewdog_b6.avif";
import etl_adlernest from "../assets/maps/etl_adlernest.avif";
import etl_frostbite from "../assets/maps/etl_frostbite.avif";
import sw_goldrush_te from "../assets/maps/sw_goldrush_te.avif";
import etl_sp_delivery from "../assets/maps/etl_sp_delivery.avif";
import placeholder from "../assets/maps/placeholder.avif";

import type { ImageMetadata } from "astro";

const mapUrls: Record<string, ImageMetadata> = {
  etl_ice,
  decay_sw,
  adlernest,
  frostbite,
  missile_b3,
  te_escape2,
  karsiah_te2,
  braundorf_b4,
  erdenberg_t2,
  operation_b7,
  et_brewdog,
  et_brewdog_b6,
  etl_adlernest,
  etl_frostbite,
  sw_goldrush_te,
  etl_sp_delivery,
  radar,
  bremen_b3,
  supply,
};

export function getMapImageUrl(map: string) {
  const mapUrl = mapUrls[map];

  if (!mapUrl) {
    return placeholder;
  }

  return mapUrl;
}
