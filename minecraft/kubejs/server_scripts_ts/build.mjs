import { readdirSync, watch as watchDirectory } from "node:fs";
import { join, relative, resolve } from "node:path";
import * as esbuild from "esbuild";

const sourceDirectory = import.meta.dirname;
const scriptsDirectory = resolve(sourceDirectory, "scripts");
const outputDirectory = resolve(sourceDirectory, "../server_scripts/compiled");
const getEntryPoints = (directory = scriptsDirectory) =>
    readdirSync(directory, { withFileTypes: true })
        .flatMap(entry => {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) return getEntryPoints(path);
            return entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")
                ? [path]
                : [];
        })
        .sort();

const getBuildOptions = () => {
    const entryPoints = getEntryPoints();
    if (entryPoints.length === 0) {
        throw new Error(`No TypeScript script entry points found in ${scriptsDirectory}`);
    }

    return {
        entryPoints,
        bundle: true,
        format: "iife",
        platform: "neutral",
        target: "es2022",
        outdir: outputDirectory,
        outbase: scriptsDirectory
    };
};

if (process.argv.includes("--watch")) {
    let context = await esbuild.context(getBuildOptions());
    await context.watch();
    console.log(`Watching TypeScript scripts in ${scriptsDirectory}`);

    let updateTimer;
    watchDirectory(sourceDirectory, { recursive: true }, (eventType, filename) => {
        if (eventType !== "rename" || filename === null) return;
        const relativePath = relative(sourceDirectory, resolve(sourceDirectory, filename.toString()));
        if (!relativePath.startsWith("scripts\\") && !relativePath.startsWith("scripts/")) return;
        if (!relativePath.endsWith(".ts") || relativePath.endsWith(".d.ts")) return;

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
