
const multiple = (item, amount) => {
    return `${amount}x ${item}`;
}

ServerEvents.recipes(event => {
    const string = 'minecraft:string';
    const woolTags = '#c:wools';
    const carpetTags = '#minecraft:wool_carpets';

    event.recipes.create.cutting(
        multiple(string, 4),
        Ingredient.of(woolTags),
    ).processingTime(25)

    event.recipes.create.cutting(
        [multiple(string, 2), CreateItem.of(string, 0.5)],
        Ingredient.of(carpetTags)
    ).processingTime(15)

    event.recipes.mekanism.sawing(multiple(string, 4), woolTags)
    event.recipes.mekanism.sawing(multiple(string, 2), carpetTags)
})