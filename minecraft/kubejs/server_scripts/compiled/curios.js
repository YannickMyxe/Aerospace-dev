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
      toString: () => `${amount}x ${toKubeJSString(item)}`,
      chance: (probability) => {
        if ("tag" in item) {
          throw new TypeError("Recipe outputs cannot be item tags");
        }
        return itemToChanced(item, amount, probability);
      }
    };
  };
  var toItem = (id) => {
    const item = id;
    const itemValue = {
      item,
      toString: () => item,
      stack: (amount) => itemToStack(itemValue, amount),
      chance: (probability) => itemToChanced(itemValue, 1, probability)
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
  var itemToChanced = (item, amount, chance) => {
    if (chance <= 0 || chance > 1) {
      throw new RangeError(`Chance must be between 0 (exclusive) and 1 (inclusive); received ${chance}`);
    }
    return {
      item,
      amount,
      chance,
      stack: (newAmount) => itemToChanced(item, newAmount, chance)
    };
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
    addItemsToSlot(event, backSlot, [
      estrogenElytra,
      toItem("mekanism:scuba_tank"),
      toItem("mekanism:jetpack"),
      itemTag("#create_sa:jetpack"),
      itemTag("#create:pressurized_air_sources")
    ]);
    addItemsToSlot(event, "elytraslot:elytra", estrogenElytra);
    addItemsToSlot(event, faceSlot, [
      toItem("create:goggles"),
      toItem("createthrusters:physics_goggles"),
      itemTag("#advancedperipherals:smart_glasses")
    ]);
    addItemsToSlot(event, headSlot, [
      itemTag("#railways:conductor_caps"),
      toItem("aeronautics:aviators_goggles"),
      toItem("mekanism:scuba_mask"),
      toItem("createthrusters:pilot_cap")
    ]);
    const mekanismFreeRunners = toItem("mekanism:free_runners");
    addItemsToSlot(event, feetSlot, [mekanismFreeRunners]);
  });
})();
