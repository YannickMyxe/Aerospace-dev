import type {Item, ItemTag} from './utils'
import {multiple, itemTag} from './utils'

ServerEvents.recipes(event => {
    const logs = itemTag('c:logs/archwood');
    const planks: Item = 'ars_nouveau:archwood_planks';

    const mekanismRecipes = event.recipes.mekanism as unknown as {
        sawing(output: string, input: Item | ItemTag): unknown;
    };

    mekanismRecipes.sawing(multiple(planks, 6), logs);
});