import {simpleFluid} from "../utils";

StartupEvents.registry("fluid", event => {
    simpleFluid(event, "monster_fluid", 0xFFFFFF)
        .stillTexture("minecraft:block/water_still")
        .flowingTexture("minecraft:block/water_flow");
});
