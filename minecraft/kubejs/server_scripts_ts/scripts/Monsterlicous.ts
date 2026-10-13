import {createRecipeApi, Item, removeRecipesByOutput, toFluid, toItem, toKubeJSString} from "../utils";

ServerEvents.recipes(event => {
    const createRecipes = createRecipeApi(event.recipes.create);

    const fluid = toFluid("kubejs:monster_fluid");
    const sugar: Item = toItem('minecraft:sugar')
    const balls: Item = toItem('estrogen:balls')
    const milk_bottle: Item = toItem('farmersdelight:milk_bottle')

    const monster: Item = toItem('create_aero_radar:white_monster')

    createRecipes.mixing(fluid.fluid, [
        sugar.stack(8),
        balls.stack(2),
    ]).heated();

    removeRecipesByOutput(event, monster);
    createRecipes.filling(monster, fluid.stack(1000), milk_bottle);
});