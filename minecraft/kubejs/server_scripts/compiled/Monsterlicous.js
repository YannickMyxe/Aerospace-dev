(() => {
  // utils/types.ts
  function toKubeJSString(value) {
    return value.toString();
  }
  var fluidToStack = (fluid, amount) => {
    if (!Number.isInteger(amount) || amount < 1) {
      throw new RangeError(`Fluid amount must be a positive integer; received ${amount}`);
    }
    return {
      fluid,
      amount,
      toString: () => `${amount}mB ${fluid.fluid}`
    };
  };
  var toFluid = (id) => {
    const fluid = {
      fluid: id,
      toString: () => id,
      stack: (amount) => fluidToStack(fluid, amount)
    };
    return fluid;
  };
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
  var removeRecipesByOutput = (event, outputs) => {
    const recipeEvent = event;
    const outputList = Array.isArray(outputs) ? outputs : [outputs];
    const outputIds = new Set(outputList.map((output) => {
      const item = "amount" in output ? output.item : output;
      if ("tag" in item) {
        throw new TypeError("Recipes can only be removed by item output, not an item tag");
      }
      return toKubeJSString(item);
    }));
    for (const output of outputIds) {
      recipeEvent.remove({ output });
    }
  };

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
      )
    };
  };

  // scripts/Monsterlicous.ts
  ServerEvents.recipes((event) => {
    const createRecipes = createRecipeApi(event.recipes.create);
    const fluid = toFluid("kubejs:monster_fluid");
    const sugar = toItem("minecraft:sugar");
    const balls = toItem("estrogen:balls");
    const milk_bottle = toItem("farmersdelight:milk_bottle");
    const monster = toItem("create_aero_radar:white_monster");
    createRecipes.mixing(fluid.fluid, [
      sugar.stack(8),
      balls.stack(2)
    ]).heated();
    removeRecipesByOutput(event, monster);
    createRecipes.filling(monster, fluid.stack(1e3), milk_bottle);
  });
})();
