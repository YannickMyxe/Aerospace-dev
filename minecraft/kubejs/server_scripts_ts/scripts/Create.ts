import {createRecipeApi, itemTag, toItem, toKubeJSString, type Item} from "../utils";

ServerEvents.recipes(event => {
    const createRecipes = createRecipeApi(event.recipes.create);
    const veridium: Item = toItem('create:veridium');
    const asurine: Item = toItem('create:asurine');
    const clay = itemTag("c:clay");
    const flint: Item = toItem('minecraft:flint');
    const water = Fluid.sizedIngredientOf("#minecraft:water", 500);
    const lava = Fluid.of("minecraft:lava");

    createRecipes.mixing(veridium.stack(4), [
        clay.stack(8),
        flint.stack(8),
        lava.copyWithAmount(250)
    ]);
    createRecipes.mixing(asurine.stack(4), [
        clay.stack(8),
        flint.stack(8),
        water
    ]);
});