(() => {
  // utils/index.ts
  var multiple = (item, amount) => `${amount}x ${item}`;
  var itemTag = (id) => {
    if (id.startsWith("#")) return `${id}`;
    return `#${id}`;
  };

  // ars-logs.ts
  ServerEvents.recipes((event) => {
    const logs = itemTag("c:logs/archwood");
    const planks = "ars_nouveau:archwood_planks";
    const mekanismRecipes = event.recipes.mekanism;
    mekanismRecipes.sawing(multiple(planks, 6), logs);
  });
})();
