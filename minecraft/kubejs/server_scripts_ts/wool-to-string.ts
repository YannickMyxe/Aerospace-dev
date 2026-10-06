import type {Item, ItemTag, ItemIngredient} from './utils'
import {multiple, itemTag} from './utils'

ServerEvents.recipes(event => {
    const string: Item = "minecraft:string";
    const woolTag = itemTag("c:wools");
    const carpetTag = itemTag("minecraft:wool_carpets");
    const createRecipes = event.recipes.create as unknown as {
        cutting(
            results: string | unknown[],
            ingredient: ItemIngredient
        ): { processingTime(ticks: number): unknown };
    };

    createRecipes.cutting(multiple(string, 4), Ingredient.of(woolTag))
        .processingTime(25);

    createRecipes.cutting(
        [
            multiple(string, 2),
            CreateItem.of(string, 0.5)
        ],
        Ingredient.of(carpetTag)
    ).processingTime(15);

    const mekanismRecipes = event.recipes.mekanism as unknown as {
        sawing(output: string, input: ItemTag): unknown;
    };

    mekanismRecipes.sawing(multiple(string, 4), woolTag);
    mekanismRecipes.sawing(multiple(string, 2), carpetTag);
});