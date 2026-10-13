import {createRecipeApi, itemTag, type Item} from "../utils";

ServerEvents.recipes(event => {
    const createRecipes = createRecipeApi(event.recipes.create);
    const veridium: Item = 'create:veridium';
    const asurine: Item = 'create:asurine';
    const clay = itemTag("c:clay");
    const flint: Item = 'minecraft:flint';
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