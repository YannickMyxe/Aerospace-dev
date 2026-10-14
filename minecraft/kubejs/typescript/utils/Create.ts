import {
    toKubeJSString,
    toKubeJSFluidStack,
    type ItemIngredient,
    type ItemOrTag,
    type ItemStack,
    type FluidStack as CustomFluidStack,
    isItemWrapper,
    isFluidStack,
} from "./types";

type SizedItemIngredient = ReturnType<ItemIngredient["withCount"]>;
type NativeFluidStack = ReturnType<typeof Fluid.of>;
type FillingFluid = NativeFluidStack | CustomFluidStack;
type FluidIngredient = ReturnType<typeof Fluid.ingredientOf>;
type SizedFluidIngredient = ReturnType<typeof Fluid.sizedIngredientOf>;
type CreateMixingInput = ItemIngredient | SizedItemIngredient | NativeFluidStack | FluidIngredient | SizedFluidIngredient | ItemStack | ItemOrTag;
type CreateOutput = string | ItemOrTag | ItemStack | unknown[];

export type CreateProcessingRecipe = {
    processingTime(ticks: number): unknown;
};

export type CreateMixingRecipe = CreateProcessingRecipe & {
    heated(): CreateMixingRecipe;
    superheated(): CreateMixingRecipe;
};

export type CreateFillingRecipe = CreateProcessingRecipe;

export type CreateRecipeApi = {
    cutting(
        results: CreateOutput,
        ingredient: ItemIngredient
    ): CreateProcessingRecipe;
    mixing(
        results: CreateOutput,
        ingredient: CreateMixingInput | CreateMixingInput[]
    ): CreateMixingRecipe;
    filling(
        results: CreateOutput,
        fluid: FillingFluid,
        ingredient: ItemIngredient | ItemOrTag | ItemStack,
    ): CreateFillingRecipe;
};

type RawCreateRecipeApi = {
    cutting(results: unknown, ingredient: unknown): CreateProcessingRecipe;
    mixing(results: unknown, ingredient: unknown): CreateMixingRecipe;
    filling(results: unknown, ingredients: unknown): CreateFillingRecipe;
};

const serializeOutput = (value: unknown): unknown => {
    if (isItemWrapper(value)) return toKubeJSString(value);

    if (
        value !== null &&
        typeof value === "object" &&
        "amount" in value &&
        isItemWrapper((value as ItemStack).item)
    ) {
        return toKubeJSString(value as ItemStack);
    }

    return value;
};

const serializeOutputs = (outputs: CreateOutput): unknown =>
    Array.isArray(outputs) ? outputs.map(serializeOutput) : serializeOutput(outputs);

const serializeInput = (input: CreateMixingInput): unknown => {
    if (
        input !== null &&
        typeof input === "object" &&
        "amount" in input &&
        isItemWrapper((input as ItemStack).item)
    ) {
        const stack = input as ItemStack;
        return Ingredient.of(toKubeJSString(stack.item)).withCount(stack.amount);
    }

    return isItemWrapper(input) ? Ingredient.of(toKubeJSString(input)) : input;
};

export const createRecipeApi = (recipes: unknown): CreateRecipeApi => {
    const api = recipes as RawCreateRecipeApi;
    return {
        cutting: (results, ingredient) =>
            api.cutting(serializeOutputs(results), ingredient),
        mixing: (results, ingredients) =>
            api.mixing(
                serializeOutputs(results),
                Array.isArray(ingredients)
                    ? ingredients.map(serializeInput)
                    : serializeInput(ingredients)
            ),
        filling: (results, fluid, ingredient) =>
            api.filling(
                serializeOutputs(results),
                [
                    isFluidStack(fluid) ? toKubeJSFluidStack(fluid) : fluid,
                    serializeInput(ingredient)
                ]
            ),
    };
};