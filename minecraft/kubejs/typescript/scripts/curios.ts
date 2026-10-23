import {type Item, addItemsToSlot, itemTag, toItem,} from "../utils";

ServerEvents.tags("item", event => {
    const backSlot = "curios:back";
    const faceSlot = "curios:face";
    const headSlot = "curios:head";
    const feetSlot = "curios:feet";

    // # Back-slot
    const estrogenElytra: Item = toItem("estrogen:moth_elytra");
    addItemsToSlot(event, backSlot, [
        estrogenElytra,
        toItem("mekanism:scuba_tank"),
        toItem("mekanism:jetpack"),
        itemTag('#create_sa:jetpack'),
        itemTag("#create:pressurized_air_sources"),
    ]);
    addItemsToSlot(event, "elytraslot:elytra", estrogenElytra);

    // # Face-slot
    addItemsToSlot(event, faceSlot, [
        toItem("create:goggles"),
        toItem("createthrusters:physics_goggles"),
        itemTag('#advancedperipherals:smart_glasses'),
    ]);

    // # Head-slot
    addItemsToSlot(event, headSlot, [
        itemTag("#railways:conductor_caps"),
        toItem("aeronautics:aviators_goggles"),
        toItem("mekanism:scuba_mask"),
        toItem('createthrusters:pilot_cap'),
    ]);

    // # Boots/Feet - slots
    const mekanismFreeRunners: Item = toItem("mekanism:free_runners");
    addItemsToSlot(event, feetSlot, [mekanismFreeRunners]);
});