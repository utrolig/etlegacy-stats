export function getRandomBetween(
  min: number,
  max: number,
  random: () => number,
) {
  return Math.floor(random() * (max - min + 1) + min);
}

export function createSeededRandom(seed: number) {
  return function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}
