import { createMemo, createSignal, type Component } from "solid-js";
import { Dialog } from "@kobalte/core/dialog";
import {
  getDeaths,
  getEfficiency,
  getHeadshots,
  getKdr,
  getKills,
  getRevives,
  type Stats,
} from "../util/stats";
import { ColoredName } from "./ColoredName";
import { ColoredNameSelect } from "./ColoredNameSelect";
import { ComparisonField } from "./ComparisonField";

export type PerformanceComparisonModalProps = {
  stats: Stats[];
};

export const PerformanceComparisonModal: Component<
  PerformanceComparisonModalProps
> = (props) => {
  const [selectedPlayer, setSelectedPlayer] = createSignal<Stats>(
    props.stats[0],
  );
  const [comparison, setComparison] = createSignal<Stats>(props.stats[1]);

  if (!selectedPlayer() || !comparison()) {
    throw new Error(
      `Were missing one of the players in the comparison: ${selectedPlayer()} ${comparison()}`,
    );
  }

  const names = createMemo(() => {
    return props.stats.map((s) => s.name);
  });

  const onSelectedPlayerChanged = (name: string | null) => {
    const newSelectedPlayer = props.stats.find((s) => s.name === name);

    if (!newSelectedPlayer) {
      return;
    }

    return setSelectedPlayer(newSelectedPlayer);
  };

  const onComparisonChanged = (name: string | null) => {
    const newComparison = props.stats.find((s) => s.name === name);

    if (!newComparison) {
      return;
    }

    return setComparison(newComparison);
  };

  return (
    <Dialog>
      <Dialog.Trigger class="text-sm p-2 rounded-md hover:bg-mud-700">
        Compare players
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-40 bg-black/70" />
        <div class="fixed z-50 inset-0 flex items-center justify-center">
          <Dialog.Content class="z-50 w-full max-w-xl border border-mud-100 rounded-md p-4 bg-mud-800 shadow-2xl">
            <div class="flex flex-col gap-4">
              <h1 class="text-2xl font-semibold">Compare players</h1>
              <div class="text-mud-200 flex items-center gap-2">
                How did{" "}
                <ColoredNameSelect
                  onChange={onSelectedPlayerChanged}
                  selectedName={selectedPlayer().name}
                  names={names()}
                />{" "}
                do against{" "}
                <ColoredNameSelect
                  onChange={onComparisonChanged}
                  names={names()}
                  selectedName={comparison().name}
                />{" "}
                ?
              </div>
              <div class="flex flex-col">
                <ComparisonField
                  selectedValue={getEfficiency(selectedPlayer())}
                  comparisonValue={getEfficiency(comparison())}
                  name="Efficiency"
                />

                <ComparisonField
                  selectedValue={getKdr(selectedPlayer())}
                  comparisonValue={getKdr(comparison())}
                  name="KDR"
                  decimals={2}
                />

                <ComparisonField
                  selectedValue={getKills(selectedPlayer())}
                  comparisonValue={getKills(comparison())}
                  name="Kills"
                  lowerIsBetter
                />

                <ComparisonField
                  selectedValue={getDeaths(selectedPlayer())}
                  comparisonValue={getDeaths(comparison())}
                  name="Deaths"
                  lowerIsBetter
                />

                <ComparisonField
                  selectedValue={selectedPlayer().playerStats.damageGiven}
                  comparisonValue={comparison().playerStats.damageGiven}
                  name="Damage given"
                />

                <ComparisonField
                  selectedValue={selectedPlayer().playerStats.damageReceived}
                  comparisonValue={comparison().playerStats.damageReceived}
                  name="Damage received"
                  isNeutral
                />

                <ComparisonField
                  selectedValue={getHeadshots(selectedPlayer())}
                  comparisonValue={getHeadshots(comparison())}
                  name="Headshots"
                />

                <ComparisonField
                  selectedValue={selectedPlayer().playerStats.gibs}
                  comparisonValue={comparison().playerStats.gibs}
                  name="Gibs"
                />

                <ComparisonField
                  selectedValue={selectedPlayer().playerStats.selfKills}
                  comparisonValue={comparison().playerStats.selfKills}
                  name="Selfkills"
                  isNeutral
                />

                <ComparisonField
                  selectedValue={getRevives(selectedPlayer())}
                  comparisonValue={getRevives(comparison())}
                  name="Revives"
                />

                <ComparisonField
                  selectedValue={selectedPlayer().playerStats.playtime}
                  comparisonValue={comparison().playerStats.playtime}
                  name="Time played"
                />
              </div>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
};
