import {createRecipeApi, Item, toItem} from "../utils";

ServerEvents.recipes(event => {
    const redZultanite = toItem('garnished:red_zultanite');
    const redstone = toItem('minecraft:redstone');

    event.remove({ type: 'create:crushing', input: redZultanite.toString() });

    const createRecipes = createRecipeApi(event.recipes.create);

    createRecipes.crushing(redstone.chance(0.5), redZultanite);

});