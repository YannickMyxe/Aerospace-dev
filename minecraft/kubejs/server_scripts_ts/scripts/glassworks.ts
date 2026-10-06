import {type Item, itemTag, multiple, shapedSurround} from "../utils";

ServerEvents.recipes(event => {
    const ether_glass: Item = 'glassential:glass_ethereal';
    const glass_tag = itemTag('#c:glass_blocks/cheap');
    const eye_of_ender: Item = 'minecraft:ender_eye';

    shapedSurround(event, multiple(ether_glass, 9), eye_of_ender, glass_tag);
});
