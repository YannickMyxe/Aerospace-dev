import type {Item} from '../utils'
import {itemTag, mekanismRecipeApi, multiple} from '../utils'

ServerEvents.recipes(event => {
    const logs = itemTag('c:logs/archwood');
    const planks: Item = 'ars_nouveau:archwood_planks';

    const mekanismRecipes = mekanismRecipeApi(event.recipes.mekanism);

    mekanismRecipes.sawing(multiple(planks, 6), logs);
});