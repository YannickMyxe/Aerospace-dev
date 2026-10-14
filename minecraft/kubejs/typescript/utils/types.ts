export interface Item {
    readonly item: KubeJSItemId,
    toString(): KubeJSItemId;
    stack(amount: number): ItemStack;
}

export interface ItemTag {
    tag: `#${import("@special/types").RegistryTypes.ItemTag}`;
    toString(): `#${import("@special/types").RegistryTypes.ItemTag}`;
    stack(amount: number): ItemStack;
}

export type ItemOrTag = Item | ItemTag;

export interface ItemStack {
    item: ItemOrTag,
    amount: number;
    toString(): ItemStackString;
}

export interface Fluid {
    readonly fluid: string;
    toString(): string;
    stack(amount: number): FluidStack;
}

export interface FluidStack {
    fluid: Fluid;
    amount: number;
    toString(): string;
}

export type ItemStackString = `${number}x ${string}`;
export type ItemIngredient = ReturnType<typeof Ingredient.of>;
export type CountedIngredient<TIngredient> = {
    ingredient: TIngredient;
    amount?: number;
};

export function toKubeJSString(item: Item): Item["item"];
export function toKubeJSString(tag: ItemTag): ItemTag["tag"];
export function toKubeJSString(stack: ItemStack): ItemStackString;
export function toKubeJSString(value: ItemOrTag): Item["item"] | ItemTag["tag"];
export function toKubeJSString(value: ItemOrTag | ItemStack): string;
export function toKubeJSString(value: ItemOrTag | ItemStack): string {
    return value.toString();
}

export const fluidToStack = (fluid: Fluid, amount: number): FluidStack => {
    if (!Number.isInteger(amount) || amount < 1) {
        throw new RangeError(`Fluid amount must be a positive integer; received ${amount}`);
    }

    return {
        fluid,
        amount,
        toString: () => `${amount}mB ${fluid.fluid}`
    };
};

export const toFluid = (id: string): Fluid => {
    const fluid: Fluid = {
        fluid: id,
        toString: () => id,
        stack: amount => fluidToStack(fluid, amount),
    };
    return fluid;
};

type KubeJSFluidFactory = (id: string, amount: number) => ReturnType<typeof Fluid.water>;
const kubeJSFluidFactory = Fluid.of as unknown as KubeJSFluidFactory;

export const toKubeJSFluidStack = (stack: FluidStack): ReturnType<typeof Fluid.water> =>
    kubeJSFluidFactory(stack.fluid.fluid, stack.amount);

export const itemToStack = (item: ItemOrTag, amount: number): ItemStack => {
    if (!Number.isInteger(amount) || amount < 1) {
        throw new RangeError(`Item stack amount must be a positive integer; received ${amount}`);
    }

    return {
        item,
        amount,
        toString: () => `${amount}x ${toKubeJSString(item)}`
    };
}

export const toItem = (id: string): Item => {
    const item = id as KubeJSItemId;
    const itemValue: Item = {
        item,
        toString: () => item,
        stack: amount => itemToStack(itemValue, amount),
    };
    return itemValue;
};

type ShapedRecipeEventApi = {
    shaped(
        output: string,
        pattern: string[],
        key: Record<string, string>
    ): unknown;
};

type ShapelessRecipeEventApi = {
    shapeless(output: string, ingredients: unknown[]): unknown;
};

export const isItemWrapper = (value: unknown): value is ItemOrTag => {
    if (value === null || typeof value !== "object") return false;
    const item = value as Partial<ItemOrTag>;
    return typeof item.toString === "function" &&
        (typeof (item as { item?: unknown }).item === "string" ||
            typeof (item as { tag?: unknown }).tag === "string");
};

export const isFluidWrapper = (value: unknown): value is Fluid => {
    if (value === null || typeof value !== "object") return false;
    const fluid = value as { fluid?: unknown; stack?: unknown };
    return typeof fluid.fluid === "string" && typeof fluid.stack === "function";
};

export const isFluidStack = (value: unknown): value is FluidStack =>
    value !== null &&
    typeof value === "object" &&
    "amount" in value &&
    typeof value.amount === "number" &&
    "fluid" in value &&
    isFluidWrapper(value.fluid);

const isItemStack = (value: unknown): value is ItemStack =>
    value !== null &&
    typeof value === "object" &&
    "amount" in value &&
    typeof value.amount === "number" &&
    "item" in value &&
    isItemWrapper(value.item);

export const multiple = (item: ItemOrTag, amount: number): ItemStack => {
    return itemToStack(item, amount);
};

export const itemTag = (id: string): ItemTag => {
    const tag = (id.startsWith("#") ? id : `#${id}`) as ItemTag["tag"];
    const tagValue: ItemTag = {
        tag,
        toString: () => tag,
        stack: amount => itemToStack(tagValue, amount),
    };
    return tagValue;
};

export const shapedSurround = (
    event: unknown,
    output: ItemStack,
    center: ItemOrTag,
    surround: ItemOrTag
): unknown => {
    const recipeEvent = event as ShapedRecipeEventApi;
    return recipeEvent.shaped(
        toKubeJSString(output),
        [
            "AAA",
            "ABA",
            "AAA"
        ],
        {
            A: toKubeJSString(surround),
            B: toKubeJSString(center),
        }
    );
};

export const shapeless = (
    event: unknown,
    output: Item | ItemStack,
    inputs: ItemOrTag | ItemStack | ItemIngredient | (ItemOrTag | ItemStack | ItemIngredient)[] | ItemTag
): unknown => {
    if (isItemStack(output) && "tag" in output.item) {
        throw new TypeError("A shapeless recipe output must be an item, not an item tag");
    }

    const recipeEvent = event as ShapelessRecipeEventApi;
    const inputList = Array.isArray(inputs) ? inputs : [inputs];
    if (inputList.length > 9) {
        throw new RangeError(`A shapeless crafting recipe can use at most 9 ingredient slots; received ${inputList.length}`);
    }

    const serializedInputs = inputList.map(input => {
        if (isItemStack(input)) {
            return Ingredient.of(toKubeJSString(input.item)).withCount(input.amount);
        }

        return isItemWrapper(input) ? Ingredient.of(toKubeJSString(input)) : input;
    });

    return recipeEvent.shapeless(toKubeJSString(output), serializedInputs);
};

export type ItemTagEventApi = {
    add(tag: string, item: Item["item"] | ItemTag["tag"]): unknown;
};

type RecipeRemovalEvent = {
    remove(filter: { output: string }): void;
};

export const removeRecipesByOutput = (
    event: unknown,
    outputs: Item | ItemStack | (Item | ItemStack)[]
): void => {
    const recipeEvent = event as RecipeRemovalEvent;
    const outputList = Array.isArray(outputs) ? outputs : [outputs];
    const outputIds = new Set(outputList.map(output => {
        const item = "amount" in output ? output.item : output;
        if ("tag" in item) {
            throw new TypeError("Recipes can only be removed by item output, not an item tag");
        }
        return toKubeJSString(item);
    }));

    for (const output of outputIds) {
        recipeEvent.remove({output});
    }
};