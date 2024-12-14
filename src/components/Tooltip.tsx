import { Show, type Component, type JSXElement } from "solid-js";
import { Tooltip as KobalteTooltip } from "@kobalte/core/tooltip";
import type { AnchorRect } from "@kobalte/core/src/popper/utils.js";
import clsx from "clsx";

export type TooltipProps = {
  triggerClass?: string;
  content: JSXElement;
  children: JSXElement;
  getAnchorRect?: () => AnchorRect;
  placement?: "top" | "right";
};

export const Tooltip: Component<TooltipProps> = (props) => {
  return (
    <Show when={props.content} fallback={props.children}>
      <KobalteTooltip
        getAnchorRect={props.getAnchorRect}
        closeDelay={0}
        openDelay={0}
        placement={props.placement ?? "top"}
      >
        <KobalteTooltip.Trigger
          class={clsx("flex items-center", props.triggerClass)}
          as="div"
        >
          {props.children}
        </KobalteTooltip.Trigger>
        <KobalteTooltip.Content class="z-50 bgmud-900 p-2 px-4 bg-mud-900 rounded">
          <KobalteTooltip.Arrow />
          {props.content}
        </KobalteTooltip.Content>
      </KobalteTooltip>
    </Show>
  );
};
