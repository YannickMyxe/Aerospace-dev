import { readdirSync, watch as watchDirectory } from "node:fs";
import { join, relative, resolve } from "node:path";
import * as esbuild from "esbuild";

const sourceDirectory = import.meta.dirname;
const scriptsDirectory = resolve(sourceDirectory, "scripts");
const startupScriptsDirectory = resolve(sourceDirectory, "startup");
const getEntryPoints = directory =>
    readdirSync(directory, { withFileTypes: true })
        .flatMap(entry => {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) return getEntryPoints(path);
            return entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts")
                ? [path]
                : [];
        })
        .sort();

const targets = [
    {
        name: "server",
        sourceFolder: "scripts",
        sourceDirectory: scriptsDirectory,
        outputDirectory: resolve(sourceDirectory, "../server_scripts/compiled")
    },
    {
        name: "startup",
        sourceFolder: "startup",
        sourceDirectory: startupScriptsDirectory,
        outputDirectory: resolve(sourceDirectory, "../startup_scripts/compiled")
    }
];

const getBuildOptions = target => {
    const entryPoints = getEntryPoints(target.sourceDirectory);
    if (entryPoints.length === 0) {
        throw new Error(`No TypeScript script entry points found in ${target.sourceDirectory}`);
    }

    return {
        entryPoints,
        bundle: true,
        format: "iife",
        platform: "neutral",
        target: "es2022",
        outdir: target.outputDirectory,
        outbase: target.sourceDirectory
    };
};

if (process.argv.includes("--watch")) {
    const createContexts = async () => Promise.all(
        targets.map(target => esbuild.context(getBuildOptions(target)))
    );
    let contexts = await createContexts();
    await Promise.all(contexts.map(context => context.watch()));
    console.log(`Watching TypeScript scripts in ${scriptsDirectory} and ${startupScriptsDirectory}`);

    let updateTimer;
    watchDirectory(sourceDirectory, { recursive: true }, (eventType, filename) => {
        if (eventType !== "rename" || filename === null) return;
        const relativePath = relative(sourceDirectory, resolve(sourceDirectory, filename.toString()))
            .replace(/\\/g, "/");
        if (!targets.some(target => relativePath.startsWith(`${target.sourceFolder}/`))) return;
        if (!relativePath.endsWith(".ts") || relativePath.endsWith(".d.ts")) return;

        clearTimeout(updateTimer);
        updateTimer = setTimeout(async () => {
            await Promise.all(contexts.map(context => context.dispose()));
            contexts = await createContexts();
            await Promise.all(contexts.map(context => context.watch()));
        }, 100);
    });
} else {
    await Promise.all(targets.map(target => esbuild.build(getBuildOptions(target))));
}
