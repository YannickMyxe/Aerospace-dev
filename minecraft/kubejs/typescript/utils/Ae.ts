import {itemToStack, type Item, type ItemOrTag, type ItemStack} from "./types";

type CrystalAssemblerIngredientJson =
    | { item: Item["item"] }
    | { tag: import("@special/types").RegistryTypes.ItemTag };

export type CrystalAssemblerInput = ItemOrTag | ItemStack;

type CrystalAssemblerItemInputJson = {
    ingredient: CrystalAssemblerIngredientJson;
    amount?: number;
};

export type CrystalAssemblerRecipe = {
    inputItems: CrystalAssemblerInput[];
    output: Item;
    energy: number;
};

type CrystalAssemblerRecipeJson = {
    type: "extendedae:crystal_assembler";
    input_items: CrystalAssemblerItemInputJson[];
    output: { count: 1; id: Item["item"] };
    energy: number;
};

type CrystalAssemblerRecipeEvent = {
    custom(recipe: CrystalAssemblerRecipeJson): {
        id(id: string): unknown;
    };
};

const toRecipeInput = (input: CrystalAssemblerInput): CrystalAssemblerItemInputJson => {
    const amount = "amount" in input ? input.amount : undefined;
    const ingredient = "amount" in input ? input.item : input;

    if (amount !== undefined && (!Number.isInteger(amount) || amount < 1)) {
        throw new RangeError(`Crystal Assembler input amount must be a positive integer; received ${amount}`);
    }

    const recipeIngredient: CrystalAssemblerIngredientJson = "tag" in ingredient
        ? { tag: ingredient.tag.slice(1) as import("@special/types").RegistryTypes.ItemTag }
        : { item: ingredient.item };

    const recipeInput: CrystalAssemblerItemInputJson = {
        ingredient: recipeIngredient
    };
    if (amount !== undefined && amount !== 1) {
        recipeInput.amount = amount;
    }
    return recipeInput;
};

export const crystalAssemblerInput = (
    ingredient: ItemOrTag,
    amount: number
): ItemStack => itemToStack(ingredient, amount);

export const crystalAssembler = (
    event: CrystalAssemblerRecipeEvent,
    id: string,
    recipe: CrystalAssemblerRecipe
): unknown => event.custom({
    type: "extendedae:crystal_assembler",
    input_items: recipe.inputItems.map(toRecipeInput),
    output: { count: 1, id: recipe.output.item },
    energy: recipe.energy
}).id(id);
