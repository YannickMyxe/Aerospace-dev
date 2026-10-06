import { readdirSync, watch as watchDirectory } from "node:fs";
import { resolve } from "node:path";
import * as esbuild from "esbuild";

const sourceDirectory = import.meta.dirname;
const outputDirectory = resolve(sourceDirectory, "../server_scripts/compiled");
const getEntryPoints = () =>
    readdirSync(sourceDirectory)
        .filter(file => file.endsWith(".ts") && !file.endsWith(".d.ts"))
        .sort()
        .map(file => resolve(sourceDirectory, file));

const getBuildOptions = () => {
    const entryPoints = getEntryPoints();
    if (entryPoints.length === 0) {
        throw new Error(`No TypeScript script entry points found in ${sourceDirectory}`);
    }

    return {
        entryPoints,
        bundle: true,
        format: "iife",
        platform: "neutral",
        target: "es2022",
        outdir: outputDirectory
    };
};

if (process.argv.includes("--watch")) {
    let context = await esbuild.context(getBuildOptions());
    await context.watch();
    console.log(`Watching TypeScript scripts in ${sourceDirectory}`);

    let updateTimer;
    watchDirectory(sourceDirectory, (_eventType, filename) => {
        if (filename !== null && !filename.toString().endsWith(".ts")) return;

        clearTimeout(updateTimer);
        updateTimer = setTimeout(async () => {
            await context.dispose();
            context = await esbuild.context(getBuildOptions());
            await context.watch();
        }, 100);
    });
} else {
    await esbuild.build(getBuildOptions());
}
