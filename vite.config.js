import { resolve } from "node:path";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

function listHtmlEntries(dir, entries = []) {
  const directoryItems = readdirSync(dir, { withFileTypes: true });

  for (const item of directoryItems) {
    if (item.name === "node_modules" || item.name === "dist") continue;

    const itemPath = resolve(dir, item.name);

    if (item.isDirectory()) {
      listHtmlEntries(itemPath, entries);
      continue;
    }

    if (item.isFile() && item.name.endsWith(".html")) {
      entries.push(itemPath);
    }
  }

  return entries;
}

const htmlEntries = listHtmlEntries(rootDir);
const imageAssetPattern = /\.(?:jpe?g|png|gif|svg|webp)$/i;

/** @type {import('vite').UserConfig} */
const config = {
  base: "./",
  publicDir: "public",
  server: {
    host: true,
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: htmlEntries,
      output: {
        assetFileNames: (assetInfo) => {
          const normalizedName = (assetInfo.name ?? "").replace(/\\/g, "/");

          if (imageAssetPattern.test(normalizedName)) {
            const withoutAssetsPrefix = normalizedName.replace(/^assets\//, "").replace(/^public\//, "");
            return withoutAssetsPrefix || "[name][extname]";
          }

          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
};

export default config;
