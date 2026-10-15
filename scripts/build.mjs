import * as esbuild from "esbuild";
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const dist = join(root, "dist");
const watch = process.argv.includes("--watch");

function copyStatic() {
  mkdirSync(dist, { recursive: true });
  cpSync(join(src, "manifest.json"), join(dist, "manifest.json"));
  cpSync(join(src, "styles"), join(dist, "styles"), { recursive: true });
  mkdirSync(join(dist, "popup"), { recursive: true });
  cpSync(join(src, "popup", "popup.html"), join(dist, "popup", "popup.html"));
  cpSync(join(src, "popup", "popup.css"), join(dist, "popup", "popup.css"));
  cpSync(join(src, "assets"), join(dist, "assets"), { recursive: true });
}

const ctx = await esbuild.context({
  entryPoints: {
    content: join(src, "content", "content.ts"),
    "popup/popup": join(src, "popup", "popup.ts"),
  },
  bundle: true,
  outdir: dist,
  format: "iife",
  target: ["chrome114"],
  logLevel: "info",
  plugins: [
    {
      name: "copy-static",
      setup(build) {
        build.onEnd(() => {
          copyStatic();
        });
      },
    },
  ],
});

if (watch) {
  await ctx.watch();
  console.log("Watching for changes. Load unpacked from dist/");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
