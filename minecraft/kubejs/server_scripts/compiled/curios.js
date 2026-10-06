(() => {
  // utils/index.ts
  var itemTag = (id) => {
    return id.startsWith("#") ? `${id}` : `#${id}`;
  };
  var addItemsToSlot = (event, slot, items) => {
    const tagEvent = event;
    for (const item of items) {
      tagEvent.add(slot, item);
    }
  };

  // scripts/curios.ts
  ServerEvents.tags("item", (event) => {
    const backSlot = "curios:back";
    const faceSlot = "curios:face";
    const headSlot = "curios:head";
    const feetSlot = "curios:feet";
    const estrogenElytra = "estrogen:moth_elytra";
    const mekanismScubaTank = "mekanism:scuba_tank";
    const mekanismJetpack = "mekanism:jetpack";
    const jetpacks = itemTag("#create_sa:jetpack");
    const pressureSources = itemTag("#create:pressurized_air_sources");
    addItemsToSlot(event, backSlot, [estrogenElytra, mekanismScubaTank, jetpacks, mekanismJetpack, pressureSources]);
    event.add("elytraslot:elytra", estrogenElytra);
    const createGoggles = "create:goggles";
    const thrustersGoggles = "createthrusters:physics_goggles";
    addItemsToSlot(event, faceSlot, [createGoggles, thrustersGoggles]);
    const conductorCaps = itemTag("#railways:conductor_caps");
    const aviatorGoggles = "aeronautics:aviators_goggles";
    const mekanismScubaMask = "mekanism:scuba_mask";
    addItemsToSlot(event, headSlot, [
      conductorCaps,
      aviatorGoggles,
      mekanismScubaMask
    ]);
    const mekanismFreeRunners = "mekanism:free_runners";
    addItemsToSlot(event, feetSlot, [mekanismFreeRunners]);
  });
})();
