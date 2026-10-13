(() => {
  // utils/types.ts
  function toKubeJSString(value) {
    return value.toString();
  }
  var itemToStack = (item, amount) => {
    if (!Number.isInteger(amount) || amount < 1) {
      throw new RangeError(`Item stack amount must be a positive integer; received ${amount}`);
    }
    return {
      item,
      amount,
      toString: () => `${amount}x ${toKubeJSString(item)}`
    };
  };
  var toItem = (id) => {
    const item = id;
    const itemValue = {
      item,
      toString: () => item,
      stack: (amount) => itemToStack(itemValue, amount)
    };
    return itemValue;
  };
  var multiple = (item, amount) => {
    return itemToStack(item, amount);
  };
  var itemTag = (id) => {
    const tag = id.startsWith("#") ? id : `#${id}`;
    const tagValue = {
      tag,
      toString: () => tag,
      stack: (amount) => itemToStack(tagValue, amount)
    };
    return tagValue;
  };

  // utils/Create.ts
  var isItemWrapper = (value) => {
    if (value === null || typeof value !== "object") return false;
    const item = value;
    return typeof item.toString === "function" && (typeof item.item === "string" || typeof item.tag === "string");
  };
  var serializeOutput = (value) => {
    if (isItemWrapper(value)) return toKubeJSString(value);
    if (value !== null && typeof value === "object" && "amount" in value && isItemWrapper(value.item)) {
      return toKubeJSString(value);
    }
    return value;
  };
  var serializeOutputs = (outputs) => Array.isArray(outputs) ? outputs.map(serializeOutput) : serializeOutput(outputs);
  var serializeInput = (input) => {
    if (input !== null && typeof input === "object" && "amount" in input && isItemWrapper(input.item)) {
      const stack = input;
      return Ingredient.of(toKubeJSString(stack.item)).withCount(stack.amount);
    }
    return isItemWrapper(input) ? Ingredient.of(toKubeJSString(input)) : input;
  };
  var createRecipeApi = (recipes) => {
    const api = recipes;
    return {
      cutting: (results, ingredient) => api.cutting(serializeOutputs(results), ingredient),
      mixing: (results, ingredients) => api.mixing(
        serializeOutputs(results),
        Array.isArray(ingredients) ? ingredients.map(serializeInput) : serializeInput(ingredients)
      )
    };
  };

  // utils/Mekanism.ts
  var mekanismRecipeApi = (recipes) => {
    const api = recipes;
    return {
      sawing: (output, input) => api.sawing(toKubeJSString(output), toKubeJSString(input))
    };
  };

  // scripts/wool-to-string.ts
  ServerEvents.recipes((event) => {
    const string = toItem("minecraft:string");
    const woolTag = itemTag("c:wools");
    const carpetTag = itemTag("minecraft:wool_carpets");
    const createRecipes = createRecipeApi(event.recipes.create);
    createRecipes.cutting(toKubeJSString(multiple(string, 4)), Ingredient.of(toKubeJSString(woolTag))).processingTime(25);
    createRecipes.cutting(
      [
        toKubeJSString(multiple(string, 2)),
        CreateItem.of(toKubeJSString(string), 0.5)
      ],
      Ingredient.of(toKubeJSString(carpetTag))
    ).processingTime(15);
    const mekanismRecipes = mekanismRecipeApi(event.recipes.mekanism);
    mekanismRecipes.sawing(multiple(string, 4), woolTag);
    mekanismRecipes.sawing(multiple(string, 2), carpetTag);
  });
})();
