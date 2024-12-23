import { For, Show, type Component } from "solid-js";
import { type Award } from "../util/awards";
import { getColoredNameParts } from "../util/colors";
import { Collapsible } from "@kobalte/core/collapsible";

export type AwardsListProps = {
  awards: Award[];
  title: string;
};

export const AwardsList: Component<AwardsListProps> = (props) => {
  return (
    <div class="big:p-8 p-4 flex flex-col gap-4 bg-black/10">
      <h1 class="big:text-xl font-semibold text-orange-50">{props.title}</h1>
      <div class="flex flex-col gap-1">
        <For each={props.awards}>
          {(award) => (
            <Show when={award}>
              {(award) => (
                <Show when={getAwardDescription(award())}>
                  {(texts) => (
                    <Collapsible class="text-xs big:text-base">
                      <Collapsible.Trigger>
                        <div class="text-left">
                          <span class="text-mud-300">{texts()[0]}</span>
                          {texts()[1]}
                          <span class="text-mud-300">{texts()[2]}</span>
                          <For each={getColoredNameParts(texts()[3])}>
                            {(part) => (
                              <span style={{ color: part.color }}>
                                {part.text}
                              </span>
                            )}
                          </For>
                          <span class="text-mud-300">{texts()[4]}</span>
                          {texts()[5]}
                        </div>
                      </Collapsible.Trigger>
                      <Collapsible.Content class="p-4">
                        <div class="grid grid-cols-[200px,auto] text-mud-300">
                          <p>Name</p>
                          <p>{award().valueName}</p>
                        </div>
                        <For each={award().values}>
                          {(line) => (
                            <div class="grid grid-cols-[200px,auto] overflow-hidden">
                              <div class="text-ellipsis overflow-hidden whitespace-nowrap">
                                <For each={getColoredNameParts(line[1])}>
                                  {(part) => (
                                    <span style={{ color: part.color }}>
                                      {part.text}
                                    </span>
                                  )}
                                </For>
                              </div>
                              <span>
                                {line[0].toFixed(award().valueDecimals)}
                                <Show when={award().isPercentage}>
                                  <span class="text-mud-300 text-ellipsis overflow-hidden whitespace-nowrap">
                                    %
                                  </span>
                                </Show>
                              </span>
                            </div>
                          )}
                        </For>
                      </Collapsible.Content>
                    </Collapsible>
                  )}
                </Show>
              )}
            </Show>
          )}
        </For>
      </div>
    </div>
  );
};

function getAwardDescription(
  award: Award,
): [string, string, string, string, string, number | null] {
  const [winnerValue, winnerName] = award.winner;

  return [
    "The ",
    award.name,
    " award goes to ",
    winnerName,
    ` ${award.reason} `,
    award.type === "weapon" ? winnerValue : null,
  ];
}
