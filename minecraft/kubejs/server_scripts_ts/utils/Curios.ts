import {ItemOrTag, ItemTagEventApi, toKubeJSString} from "./types";

export function addItemsToSlot(event: ItemTagEventApi, slot: string, item: ItemOrTag): void;
export function addItemsToSlot(event: ItemTagEventApi, slot: string, items: ItemOrTag[]): void;
export function addItemsToSlot(
    event: ItemTagEventApi,
    slot: string,
    itemOrItems: ItemOrTag | ItemOrTag[]
): void {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];

    for (const item of items) {
        event.add(slot, toKubeJSString(item));
    }
}