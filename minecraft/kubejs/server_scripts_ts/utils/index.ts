export type Item = KubeJSItemId;
export type ItemTag = `#${import("@special/types").RegistryTypes.ItemTag}`;
export type ItemIngredient = ReturnType<typeof Ingredient.of>;

type ItemOrTag = Item | ItemTag;

export type CreateRecipeApi = {
    cutting(
        results: string | unknown[],
        ingredient: ItemIngredient
    ): { processingTime(ticks: number): unknown };
};

export type MekanismRecipeApi = {
    sawing(output: string, input: ItemOrTag): unknown;
};

type ShapedRecipeEventApi = {
    shaped(
        output: string,
        pattern: string[],
        key: Record<string, ItemOrTag>
    ): unknown;
};

export const multiple = (item: Item, amount: number): string => `${amount}x ${item}`;

export const itemTag = (id: string): ItemTag => {
    return id.startsWith('#') ? `${id}` as ItemTag : `#${id}` as ItemTag;
};

export const createRecipeApi = (recipes: unknown): CreateRecipeApi =>
    recipes as CreateRecipeApi;

export const mekanismRecipeApi = (recipes: unknown): MekanismRecipeApi =>
    recipes as MekanismRecipeApi;

export const shapedSurround = (
    event: unknown,
    output: string,
    center: ItemOrTag,
    surround: ItemOrTag
): unknown => {
    const recipeEvent = event as ShapedRecipeEventApi;
    return recipeEvent.shaped(
        output,
        [
            "AAA",
            "ABA",
            "AAA"
        ],
        {
            A: surround,
            B: center,
        }
    );
};