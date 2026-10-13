export type Item = KubeJSItemId;
export type ItemTag = `#${import("@special/types").RegistryTypes.ItemTag}`;
export type ItemStack = `${number}x ${string}`;
export type ItemIngredient = ReturnType<typeof Ingredient.of>;
type SizedItemIngredient = ReturnType<ItemIngredient["withCount"]>;
type FluidStack = ReturnType<typeof Fluid.of>;
type FluidIngredient = ReturnType<typeof Fluid.ingredientOf>;
type CreateMixingInput = ItemIngredient | SizedItemIngredient | FluidStack | FluidIngredient;

type ItemOrTag = Item | ItemTag;

type CreateProcessingRecipe = {
    processingTime(ticks: number): unknown;
};

type CreateMixingRecipe = CreateProcessingRecipe & {
    heated(): CreateMixingRecipe;
    superheated(): CreateMixingRecipe;
};

export type CreateRecipeApi = {
    cutting(
        results: string | unknown[],
        ingredient: ItemIngredient
    ): CreateProcessingRecipe;
    mixing(
        results: string | unknown[],
        ingredient: CreateMixingInput | CreateMixingInput[]
    ): CreateMixingRecipe;
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

type ShapelessRecipeApi = {
    shapeless(output: string,
              input: string[]
    ): unknown;
}

export const multiple = (item: Item, amount: number): ItemStack => `${amount}x ${item}`;

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

type ItemTagEventApi = {
    add(tag: string, item: ItemOrTag): unknown;
};

export const addItemsToSlot = (
    event: unknown,
    slot: string,
    items: ItemOrTag[]
): void => {
    const tagEvent = event as ItemTagEventApi;
    for (const item of items) {
        tagEvent.add(slot, item);
    }
};

export const toItem = (item: string): Item => {
    return item as Item;
};