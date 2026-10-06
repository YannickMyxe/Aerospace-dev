import type {Item} from '../utils'
import {createRecipeApi, itemTag, mekanismRecipeApi, multiple} from '../utils'

ServerEvents.recipes(event => {
    const string: Item = "minecraft:string";
    const woolTag = itemTag("c:wools");
    const carpetTag = itemTag("minecraft:wool_carpets");
    const createRecipes = createRecipeApi(event.recipes.create);

    createRecipes.cutting(multiple(string, 4), Ingredient.of(woolTag))
        .processingTime(25);

    createRecipes.cutting(
        [
            multiple(string, 2),
            CreateItem.of(string, 0.5)
        ],
        Ingredient.of(carpetTag)
    ).processingTime(15);

    const mekanismRecipes = mekanismRecipeApi(event.recipes.mekanism);

    mekanismRecipes.sawing(multiple(string, 4), woolTag);
    mekanismRecipes.sawing(multiple(string, 2), carpetTag);
});