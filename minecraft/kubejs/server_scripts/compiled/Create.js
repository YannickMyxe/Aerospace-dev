(() => {
  // utils/index.ts
  var itemTag = (id) => {
    return id.startsWith("#") ? `${id}` : `#${id}`;
  };
  var createRecipeApi = (recipes) => recipes;

  // scripts/Create.ts
  ServerEvents.recipes((event) => {
    const createRecipes = createRecipeApi(event.recipes.create);
    const veridium = "create:veridium";
    const asurine = "create:asurine";
    const clay = itemTag("c:clay");
    const flint = "minecraft:flint";
    const water = Fluid.ingredientOf("#minecraft:water");
    const lava = Fluid.of("minecraft:lava");
    createRecipes.mixing(veridium, [
      Ingredient.of(clay).withCount(8),
      Ingredient.of(flint).withCount(8),
      lava.copyWithAmount(500)
    ]);
    createRecipes.mixing(asurine, [
      Ingredient.of(clay).withCount(8),
      Ingredient.of(flint).withCount(8),
      water
    ]);
  });
})();
