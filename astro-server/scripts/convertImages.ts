import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

async function main() {
  const mapsFolder = path.join(process.cwd(), "/src/assets/maps");
  const mapImages = await fs.readdir(mapsFolder);

  const convertableExtensions = [".png", ".jpg", ".jpeg"];
  const convertableImages = mapImages.filter((file) =>
    convertableExtensions.includes(path.extname(file).toLowerCase()),
  );

  const format = "avif" satisfies keyof sharp.FormatEnum;

  for (const image of convertableImages) {
    const imagePath = path.join(mapsFolder, image);
    const outputPath = path.join(
      mapsFolder,
      path.basename(image, path.extname(image)) + "." + format,
    );

    await sharp(imagePath)
      .resize({ height: 300 })
      .toFormat(format, { quality: 80 })
      .toFile(outputPath);

    console.log(`Converted ${image} to ${format} format.`);
  }
}

main();
