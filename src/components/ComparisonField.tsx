import { createMemo, Show, type Component } from "solid-js";
import clsx from "clsx";

export type ComparisonFieldProps = {
  decimals?: number;
  selectedValue: number;
  comparisonValue: number;
  name: string;
  lowerIsBetter?: boolean;
  isNeutral?: boolean;
};

export const ComparisonField: Component<ComparisonFieldProps> = (props) => {
  const diff = createMemo(() => {
    const d = getDiff(props.selectedValue, props.comparisonValue);
    console.log({ d, s: props.selectedValue, c: props.comparisonValue });
    return d;
  });

  const isBetterDiff = createMemo(() => {
    if (diff().isPositive && !props.lowerIsBetter) {
      return true;
    }

    if (!diff().isPositive && props.lowerIsBetter) {
      return true;
    }

    return false;
  });

  return (
    <div class="grid grid-cols-performanceComparison items-center gap-2">
      <span class="text-mud-100">{props.name}</span>
      <div class="text-right">
        {props.selectedValue.toFixed(props.decimals ?? 0)}
      </div>

      <span
        class={clsx("text-right", {
          "text-green-700": isBetterDiff() && !props.isNeutral,
          "text-red-700": !isBetterDiff() && !props.isNeutral,
        })}
      >
        <Show
          when={diff().isPositive}
          fallback={diff().diff.toFixed(props.decimals ?? 0)}
        >
          +{diff().diff.toFixed(props.decimals ?? 0)}
        </Show>
      </span>
      <div
        class={clsx("text-right", {
          "text-green-700": !isBetterDiff() && !props.isNeutral,
          "text-red-700": isBetterDiff() && !props.isNeutral,
        })}
      >
        <span>{props.comparisonValue.toFixed(props.decimals ?? 0)}</span>
      </div>
    </div>
  );
};

function getDiff(value: number, comparison: number) {
  const diff = value - comparison;

  return {
    isPositive: Math.abs(diff) === diff,
    diff,
  };
}
