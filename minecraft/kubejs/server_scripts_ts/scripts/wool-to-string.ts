import type {Item} from '../utils'
import {createRecipeApi, itemTag, mekanismRecipeApi, multiple, toItem, toKubeJSString} from '../utils'

ServerEvents.recipes(event => {
    const string: Item = toItem("minecraft:string");
    const woolTag = itemTag("c:wools");
    const carpetTag = itemTag("minecraft:wool_carpets");
    const createRecipes = createRecipeApi(event.recipes.create);

    createRecipes.cutting(toKubeJSString(multiple(string, 4)), Ingredient.of(toKubeJSString(woolTag)))
        .processingTime(25);

    createRecipes.cutting(
        [
            toKubeJSString(multiple(string, 2)),
            CreateItem.of(toKubeJSString(string), 0.5)
        ],
        Ingredient.of(toKubeJSString(carpetTag))
    ).processingTime(15);

    const mekanismRecipes = mekanismRecipeApi(event.recipes.mekanism);

    mekanismRecipes.sawing(multiple(string, 4), woolTag);
    mekanismRecipes.sawing(multiple(string, 2), carpetTag);
});