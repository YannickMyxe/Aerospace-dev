import {type Item, addItemsToSlot, itemTag, toItem,} from "../utils";

ServerEvents.tags("item", event => {
    const backSlot = "curios:back";
    const faceSlot = "curios:face";
    const headSlot = "curios:head";
    const feetSlot = "curios:feet";

    const estrogenElytra: Item = toItem("estrogen:moth_elytra");
    const mekanismScubaTank: Item = toItem("mekanism:scuba_tank");
    const mekanismJetpack: Item = toItem("mekanism:jetpack");
    const jetpacks = itemTag('#create_sa:jetpack');
    const pressureSources = itemTag("#create:pressurized_air_sources");

    addItemsToSlot(event, backSlot, [estrogenElytra, mekanismScubaTank, jetpacks, mekanismJetpack, pressureSources]);
    addItemsToSlot(event, "elytraslot:elytra", estrogenElytra);

    const createGoggles: Item = toItem("create:goggles");
    const thrustersGoggles: Item = toItem("createthrusters:physics_goggles");
    const advanced_per_goggles = itemTag('#advancedperipherals:smart_glasses')
    addItemsToSlot(event, faceSlot, [createGoggles, thrustersGoggles, advanced_per_goggles]);

    const conductorCaps = itemTag("#railways:conductor_caps");
    const aviatorGoggles: Item = toItem("aeronautics:aviators_goggles");
    const mekanismScubaMask: Item = toItem("mekanism:scuba_mask");

    addItemsToSlot(event, headSlot, [
        conductorCaps,
        aviatorGoggles,
        mekanismScubaMask
    ]);

    const mekanismFreeRunners: Item = toItem("mekanism:free_runners");
    addItemsToSlot(event, feetSlot, [mekanismFreeRunners]);
});