const multiple = (item, amount) => `${amount}x ${item}`;
const itemTag = (id) => `#${id}`;
ServerEvents.recipes(event => {
    const string = "minecraft:string";
    const woolTag = itemTag("c:wools");
    const carpetTag = itemTag("minecraft:wool_carpets");
    const createRecipes = event.recipes.create;
    createRecipes.cutting(multiple(string, 4), Ingredient.of(woolTag))
        .processingTime(25);
    createRecipes.cutting([
        multiple(string, 2),
        CreateItem.of(string, 0.5)
    ], Ingredient.of(carpetTag)).processingTime(15);
    const mekanismRecipes = event.recipes.mekanism;
    mekanismRecipes.sawing(multiple(string, 4), woolTag);
    mekanismRecipes.sawing(multiple(string, 2), carpetTag);
});
