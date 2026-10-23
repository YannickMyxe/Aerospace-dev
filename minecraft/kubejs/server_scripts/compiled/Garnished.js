(() => {
  // utils/types.ts
  function toKubeJSString(value) {
    return value.toString();
  }
  var kubeJSFluidFactory = Fluid.of;
  var toKubeJSFluidStack = (stack) => kubeJSFluidFactory(stack.fluid.fluid, stack.amount);
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
  var isItemWrapper = (value) => {
    if (value === null || typeof value !== "object") return false;
    const item = value;
    return typeof item.toString === "function" && (typeof item.item === "string" || typeof item.tag === "string");
  };
  var isFluidWrapper = (value) => {
    if (value === null || typeof value !== "object") return false;
    const fluid = value;
    return typeof fluid.fluid === "string" && typeof fluid.stack === "function";
  };
  var isFluidStack = (value) => value !== null && typeof value === "object" && "amount" in value && typeof value.amount === "number" && "fluid" in value && isFluidWrapper(value.fluid);

  // utils/Create.ts
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
      ),
      filling: (results, fluid, ingredient) => api.filling(
        serializeOutputs(results),
        [
          isFluidStack(fluid) ? toKubeJSFluidStack(fluid) : fluid,
          serializeInput(ingredient)
        ]
      ),
      crushing: (results, ingredients) => api.crushing(serializeOutputs(results), ingredients),
      milling: (results, ingredients) => api.milling(serializeOutputs(results), ingredients)
    };
  };

  // scripts/Garnished.ts
  ServerEvents.recipes((event) => {
    const salt = toItem("mekanism:salt");
    const saltBlock = toItem("mekanism:block_salt");
    const crushedSalt = toItem("garnished:crushed_salt");
    const createRecipes = createRecipeApi(event.recipes.create);
    createRecipes.crushing(crushedSalt, salt);
    createRecipes.milling(crushedSalt, salt);
    createRecipes.crushing(crushedSalt.stack(4), saltBlock);
    createRecipes.milling(crushedSalt.stack(4), saltBlock);
  });
})();
