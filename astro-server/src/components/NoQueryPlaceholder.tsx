import { Show, type Component } from "solid-js";

export type NoQueryPlaceholderProps = {
  query?: string;
};
export const NoQueryPlaceholder: Component<NoQueryPlaceholderProps> = (
  props,
) => {
  return (
    <Show
      fallback={<div class="py-8 px-2">Enter search term</div>}
      when={props.query}
    >
      <div class="py-8 px-2">No results for term {props.query}</div>
    </Show>
  );
};
