import {ItemOrTag, ItemStack, toKubeJSString} from "./types";

export type MekanismRecipeApi = {
    sawing(output: ItemStack, input: ItemOrTag): unknown;
};

type MekanismRecipeApiRaw = {
    sawing(output: string, input: string): unknown;
};

export const mekanismRecipeApi = (recipes: unknown): MekanismRecipeApi => {
    const api = recipes as MekanismRecipeApiRaw;
    return {
        sawing: (output, input) =>
            api.sawing(toKubeJSString(output), toKubeJSString(input))
    };
};