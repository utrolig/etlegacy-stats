import type { Component } from "solid-js";

export type EtlIconProps = {
  class?: string;
};

export const EtlIcon: Component<EtlIconProps> = (props) => {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      id="layer1"
      x="0px"
      y="0px"
      width="512"
      height="512"
      viewBox="0 0 512 512"
      enable-background="new 0 0 2000 2000"
    >
      <defs id="defs3770" />
      <g id="layer2" transform="translate(0,-1488)">
        <rect
          id="rect3803"
          width="512"
          height="512"
          x="0"
          y="1488"
          ry="53.714291"
          style="fill:#302429;fill-opacity:1;stroke-width:0.39307174"
        />
      </g>
      <g id="layer3" transform="translate(0,-1488)">
        <path
          style="fill:#ff1e00;stroke-width:0.19128741"
          d="m 352.11483,1810.604 h 0.01 v 9.5152 c 0,21.0203 -17.04329,38.0606 -38.06099,38.061 h -114.1859 v -38.061 h 76.122 l 38.0611,-38.0611 h -114.1831 v -19.0304 h 133.21369 l 38.06101,-38.061 h -171.2747 v -19.0306 h 190.3051 l 38.0611,-38.0611 h -228.3662 v -38.061 c 5e-4,-21.0177 17.0406,-38.058 38.061,-38.0609 h 9.5152 v 0.01 c 0,-15.7654 -12.78041,-28.5459 -28.54581,-28.5459 l -95.15246,-9.5225 v 380.6105 h 266.42717 c 0,0 -9.5226,-95.1525 -9.5226,-95.1525 1.9e-4,-15.7655 -12.78031,-28.546 -28.54561,-28.546"
          id="path3765"
        />
      </g>
    </svg>
  );
};
