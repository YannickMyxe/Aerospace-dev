import {type Item, addItemsToSlot, itemTag} from "../utils";

ServerEvents.tags("item", event => {
    const backSlot = "curios:back";
    const faceSlot = "curios:face";
    const headSlot = "curios:head";
    const feetSlot = "curios:feet";

    const estrogenElytra: Item = "estrogen:moth_elytra";
    const mekanismScubaTank: Item = "mekanism:scuba_tank";
    const mekanismJetpack: Item = "mekanism:jetpack";
    const jetpacks = itemTag('#create_sa:jetpack');
    const pressureSources = itemTag("#create:pressurized_air_sources");

    addItemsToSlot(event, backSlot, [estrogenElytra, mekanismScubaTank, jetpacks, mekanismJetpack, pressureSources]);
    event.add("elytraslot:elytra", estrogenElytra);

    const createGoggles: Item = "create:goggles";
    const thrustersGoggles: Item = "createthrusters:physics_goggles";
    addItemsToSlot(event, faceSlot, [createGoggles, thrustersGoggles]);

    const conductorCaps = itemTag("#railways:conductor_caps");
    const aviatorGoggles: Item = "aeronautics:aviators_goggles";
    const mekanismScubaMask: Item = "mekanism:scuba_mask";

    addItemsToSlot(event, headSlot, [
        conductorCaps,
        aviatorGoggles,
        mekanismScubaMask
    ]);

    const mekanismFreeRunners: Item = "mekanism:free_runners";
    addItemsToSlot(event, feetSlot, [mekanismFreeRunners]);
});