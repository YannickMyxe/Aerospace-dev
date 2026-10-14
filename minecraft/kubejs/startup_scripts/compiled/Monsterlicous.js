(() => {
  // utils/types.ts
  var kubeJSFluidFactory = Fluid.of;

  // utils/Fluids.ts
  var simpleFluid = (event, name, tint, displayName) => {
    return event.create(name).stillTexture(`kubejs:block/${name}_still`).flowingTexture(`kubejs:block/${name}_flow`).tint(tint).displayName(displayName ?? funcNameToDisplayName(name));
  };
  var funcNameToDisplayName = (name) => {
    return name.replace(/_/g, " ");
  };

  // startup/Monsterlicous.ts
  StartupEvents.registry("fluid", (event) => {
    simpleFluid(event, "monster_fluid", 16777215).stillTexture("minecraft:block/water_still").flowingTexture("minecraft:block/water_flow").displayName("Monsterlicous Fluid");
  });
})();
