import etl_ice from "../assets/maps/etl_ice.jpg";
import bremen_b3 from "../assets/maps/bremen_b3.jpg";
import supply from "../assets/maps/supply.jpg";
import radar from "../assets/maps/radar.jpg";
import decay_sw from "../assets/maps/decay_sw.jpg";
import adlernest from "../assets/maps/adlernest.jpg";
import frostbite from "../assets/maps/frostbite.jpg";
import missile_b3 from "../assets/maps/missile_b3.jpg";
import te_escape2 from "../assets/maps/te_escape2.jpg";
import karsiah_te2 from "../assets/maps/karsiah_te2.jpg";
import braundorf_b4 from "../assets/maps/braundorf_b4.jpg";
import erdenberg_t2 from "../assets/maps/erdenberg_t2.jpg";
import operation_b7 from "../assets/maps/operation_b7.jpg";
import et_brewdog_b6 from "../assets/maps/et_brewdog_b6.jpg";
import etl_adlernest from "../assets/maps/etl_adlernest.jpg";
import etl_frostbite from "../assets/maps/etl_frostbite.jpg";
import sw_goldrush_te from "../assets/maps/sw_goldrush_te.jpg";
import etl_sp_delivery from "../assets/maps/etl_sp_delivery.jpg";
import placeholder from "../assets/maps/placeholder.png";

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
