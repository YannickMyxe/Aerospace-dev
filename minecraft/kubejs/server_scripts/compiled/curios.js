(() => {
  // utils/types.ts
  function toKubeJSString(value) {
    return value.toString();
  }
  var kubeJSFluidFactory = Fluid.of;
  var itemToStack = (item, amount) => {
    if (!Number.isInteger(amount) || amount < 1) {
      throw new RangeError(`Item stack amount must be a positive integer; received ${amount}`);
    }
    return {
      item,
      amount,
      toString: () => `${amount}x ${toKubeJSString(item)}`
    };
  };
  var toItem = (id) => {
    const item = id;
    const itemValue = {
      item,
      toString: () => item,
      stack: (amount) => itemToStack(itemValue, amount)
    };
    return itemValue;
  };
  var itemTag = (id) => {
    const tag = id.startsWith("#") ? id : `#${id}`;
    const tagValue = {
      tag,
      toString: () => tag,
      stack: (amount) => itemToStack(tagValue, amount)
    };
    return tagValue;
  };

  // utils/Curios.ts
  function addItemsToSlot(event, slot, itemOrItems) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    for (const item of items) {
      event.add(slot, toKubeJSString(item));
    }
  }

  // scripts/curios.ts
  ServerEvents.tags("item", (event) => {
    const backSlot = "curios:back";
    const faceSlot = "curios:face";
    const headSlot = "curios:head";
    const feetSlot = "curios:feet";
    const estrogenElytra = toItem("estrogen:moth_elytra");
    const mekanismScubaTank = toItem("mekanism:scuba_tank");
    const mekanismJetpack = toItem("mekanism:jetpack");
    const jetpacks = itemTag("#create_sa:jetpack");
    const pressureSources = itemTag("#create:pressurized_air_sources");
    addItemsToSlot(event, backSlot, [estrogenElytra, mekanismScubaTank, jetpacks, mekanismJetpack, pressureSources]);
    addItemsToSlot(event, "elytraslot:elytra", estrogenElytra);
    const createGoggles = toItem("create:goggles");
    const thrustersGoggles = toItem("createthrusters:physics_goggles");
    const advanced_per_goggles = itemTag("#advancedperipherals:smart_glasses");
    addItemsToSlot(event, faceSlot, [createGoggles, thrustersGoggles, advanced_per_goggles]);
    const conductorCaps = itemTag("#railways:conductor_caps");
    const aviatorGoggles = toItem("aeronautics:aviators_goggles");
    const mekanismScubaMask = toItem("mekanism:scuba_mask");
    addItemsToSlot(event, headSlot, [
      conductorCaps,
      aviatorGoggles,
      mekanismScubaMask
    ]);
    const mekanismFreeRunners = toItem("mekanism:free_runners");
    addItemsToSlot(event, feetSlot, [mekanismFreeRunners]);
  });
})();
