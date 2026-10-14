import {type Item, itemTag, multiple, shapedSurround, toItem} from "../utils";

ServerEvents.recipes(event => {
    const ether_glass = toItem('glassential:glass_ethereal');
    const glass_tag = itemTag('#c:glass_blocks/cheap');
    const eye_of_ender = toItem('minecraft:ender_eye');

    shapedSurround(event, multiple(ether_glass, 9), eye_of_ender, glass_tag);
});
