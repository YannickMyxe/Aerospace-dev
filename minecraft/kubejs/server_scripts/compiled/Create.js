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
      toString: () => `${amount}x ${toKubeJSString(item)}`,
      chance: (probability) => {
        if ("tag" in item) {
          throw new TypeError("Recipe outputs cannot be item tags");
        }
        return itemToChanced(item, amount, probability);
      }
    };
  };
  var toItem = (id) => {
    const item = id;
    const itemValue = {
      item,
      toString: () => item,
      stack: (amount) => itemToStack(itemValue, amount),
      chance: (probability) => itemToChanced(itemValue, 1, probability)
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
  var itemTag = (id) => {
    const tag = id.startsWith("#") ? id : `#${id}`;
    const tagValue = {
      tag,
      toString: () => tag,
      stack: (amount) => itemToStack(tagValue, amount)
    };
    return tagValue;
  };
  var itemToChanced = (item, amount, chance) => {
    if (chance <= 0 || chance > 1) {
      throw new RangeError(`Chance must be between 0 (exclusive) and 1 (inclusive); received ${chance}`);
    }
    return {
      item,
      amount,
      chance,
      stack: (newAmount) => itemToChanced(item, newAmount, chance)
    };
  };
  var isChancedItem = (value) => value !== null && typeof value === "object" && "chance" in value && typeof value.chance === "number" && "item" in value && isItemWrapper(value.item) && !("tag" in value.item);

  // utils/Create.ts
  var serializeOutput = (value) => {
    if (isChancedItem(value)) {
      const item = value;
      return CreateItem.of(item.item.toString(), item.chance);
    }
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

  // scripts/Create.ts
  ServerEvents.recipes((event) => {
    const createRecipes = createRecipeApi(event.recipes.create);
    const veridium = toItem("create:veridium");
    const asurine = toItem("create:asurine");
    const clay = itemTag("c:clay");
    const flint = toItem("minecraft:flint");
    const water = Fluid.sizedIngredientOf("#minecraft:water", 500);
    const lava = Fluid.of("minecraft:lava");
    createRecipes.mixing(veridium.stack(4), [
      clay.stack(8),
      flint.stack(8),
      lava.copyWithAmount(250)
    ]);
    createRecipes.mixing(asurine.stack(4), [
      clay.stack(8),
      flint.stack(8),
      water
    ]);
  });
})();
