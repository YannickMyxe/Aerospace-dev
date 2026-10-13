import {shapeless, toItem, type Item} from "../utils";


ServerEvents.recipes(event => {
    const p1: Item = toItem('pantographsandwires:pantograph');
    const p2: Item = toItem('moderntrainparts:pantograph');

    shapeless(event, p1, p2);
    shapeless(event, p2, p1);
});
