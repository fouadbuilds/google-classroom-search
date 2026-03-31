import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const filesToCopy = [
  { src: "public/manifest.json", dest: "dist/manifest.json" },
  { src: "icons/icon16.png", dest: "dist/icons/icon16.png" },
  { src: "icons/icon48.png", dest: "dist/icons/icon48.png" },
  { src: "icons/icon128.png", dest: "dist/icons/icon128.png" },
];

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = join(rootDir, src);
  const destPath = join(rootDir, dest);
  
  if (!existsSync(srcPath)) {
    console.warn(`Source file not found: ${src}`);
    return;
  }
  
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(srcPath, destPath);
  console.log(`Copied: ${src} -> ${dest}`);
});

console.log("Assets copied successfully!");
