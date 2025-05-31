import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

async function main() {
  const mapsFolder = path.join(process.cwd(), "/src/assets/maps");
  const mapImages = await fs.readdir(mapsFolder);

  const classIconsFolder = path.join(process.cwd(), "src/assets/classes");
  const classIconImages = await fs.readdir(classIconsFolder);

  const convertableExtensions = [".png", ".jpg", ".jpeg"];
  const convertableMapImages = mapImages.filter((file) =>
    convertableExtensions.includes(path.extname(file).toLowerCase()),
  );

  const convertableClassIconImages = classIconImages.filter((file) =>
    convertableExtensions.includes(path.extname(file).toLowerCase()),
  );

  const format = "avif" satisfies keyof sharp.FormatEnum;

  for (const image of convertableMapImages) {
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

  for (const image of convertableClassIconImages) {
    const imagePath = path.join(classIconsFolder, image);
    const outputPath = path.join(
      classIconsFolder,
      path.basename(image, path.extname(image)) + "." + format,
    );

    await sharp(imagePath)
      .resize({ height: 64 })
      .toFormat(format, { quality: 80 })
      .toFile(outputPath);

    console.log(`Converted ${image} to ${format} format.`);
  }
}

main();
