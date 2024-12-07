import { createMemo, For, type Component } from "solid-js";
import { getMapImageUrl } from "../util/mapImages";

export type MapsBackgroundProps = {
  maps: string[];
};

export const MapsBackground: Component<MapsBackgroundProps> = (props) => {
  const mapImages = createMemo(() => {
    return props.maps.map(getMapImageUrl);
  });

  const width = createMemo(() => {
    return 100 / mapImages().length + 15;
  });

  const getClipPath = (idx: number) => {
    if (idx === 0) {
      return `polygon(0 0, 100% 0, 85% 100%, 0 100%)`;
    } else if (idx === mapImages().length - 1) {
      return `polygon(15% 0, 100% 0, 100% 100%, 0 100%)`;
    }
    return `polygon(15% 0, 100% 0, 85% 100%, 0 100%)`;
  };

  const getImageStyle = (idx: number) => {
    return {
      "clip-path": getClipPath(idx),
      left: `${(91 / mapImages().length) * idx}%`,
      width: `${width()}%`,
    };
  };
  return (
    <div class="absolute inset-0 z-[2] overflow-hidden">
      <For each={mapImages()}>
        {(image, idx) => (
          <img
            alt="Map image"
            class="absolute h-full object-cover object-center"
            src={image.src}
            style={getImageStyle(idx())}
          />
        )}
      </For>
      <div class="absolute inset-0 z-[3] bg-black/20"></div>
    </div>
  );
};
