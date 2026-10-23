import {createRecipeApi, Item, removeRecipesByOutput, toItem} from "../utils";




ServerEvents.recipes(event => {
    const salt: Item = toItem('mekanism:salt');
    const saltBlock: Item = toItem('mekanism:block_salt');

    const crushedSalt: Item = toItem('garnished:crushed_salt');

    const createRecipes = createRecipeApi(event.recipes.create);

    createRecipes.crushing(crushedSalt, salt);
    createRecipes.milling(crushedSalt, salt);
    createRecipes.crushing(crushedSalt.stack(4), saltBlock);
    createRecipes.milling(crushedSalt.stack(4), saltBlock);
});