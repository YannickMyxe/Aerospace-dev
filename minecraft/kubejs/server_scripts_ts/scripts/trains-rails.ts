import {Item, itemTag, multiple, shapedSurround} from "../utils";


ServerEvents.recipes(event => {
    const p1: Item = 'pantographsandwires:pantograph';
    const p2: Item = 'moderntrainparts:pantograph';

    event.shapeless(p1, [p2,]);
    event.shapeless(p2, [p1,]);

});


