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

  // utils/Mekanism.ts
  var mekanismRecipeApi = (recipes) => {
    const api = recipes;
    return {
      sawing: (output, input) => api.sawing(toKubeJSString(output), toKubeJSString(input))
    };
  };

  // scripts/ars-logs.ts
  ServerEvents.recipes((event) => {
    const logs = itemTag("c:logs/archwood");
    const planks = toItem("ars_nouveau:archwood_planks");
    const mekanismRecipes = mekanismRecipeApi(event.recipes.mekanism);
    mekanismRecipes.sawing(multiple(planks, 6), logs);
  });
})();
