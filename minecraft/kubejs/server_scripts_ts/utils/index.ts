export type Item = KubeJSItemId;
export type ItemTag = `#${import("@special/types").RegistryTypes.ItemTag}`;
export type ItemIngredient = ReturnType<typeof Ingredient.of>;

export type CreateRecipeApi = {
    cutting(
        results: string | unknown[],
        ingredient: ItemIngredient
    ): { processingTime(ticks: number): unknown };
};

export type MekanismRecipeApi = {
    sawing(output: string, input: Item | ItemTag): unknown;
};

export const multiple = (item: Item, amount: number): string => `${amount}x ${item}`;

export const itemTag = (id: string): ItemTag => {
    return id.startsWith('#') ? `${id}` as ItemTag : `#${id}` as ItemTag;
};

export const createRecipeApi = (recipes: unknown): CreateRecipeApi =>
    recipes as CreateRecipeApi;

export const mekanismRecipeApi = (recipes: unknown): MekanismRecipeApi =>
    recipes as MekanismRecipeApi;
