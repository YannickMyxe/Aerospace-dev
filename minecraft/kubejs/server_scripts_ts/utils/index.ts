export type Item = KubeJSItemId;
export type ItemTag = `#${import("@special/types").RegistryTypes.ItemTag}`;
export type ItemIngredient = ReturnType<typeof Ingredient.of>;

export const multiple = (item: Item, amount: number): string => `${amount}x ${item}`;
export const itemTag = (id: string): ItemTag => {
    if (id.startsWith('#')) return `${id}` as ItemTag;
    return `#${id}` as ItemTag;
};
