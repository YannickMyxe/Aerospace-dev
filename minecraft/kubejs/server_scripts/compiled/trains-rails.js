(() => {
  // utils/types.ts
  function toKubeJSString(value) {
    return value.toString();
  }
  var kubeJSFluidFactory = Fluid.of;
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
  var isItemStack = (value) => value !== null && typeof value === "object" && "amount" in value && typeof value.amount === "number" && "item" in value && isItemWrapper(value.item);
  var shapeless = (event, output, inputs) => {
    if (isItemStack(output) && "tag" in output.item) {
      throw new TypeError("A shapeless recipe output must be an item, not an item tag");
    }
    const recipeEvent = event;
    const inputList = Array.isArray(inputs) ? inputs : [inputs];
    if (inputList.length > 9) {
      throw new RangeError(`A shapeless crafting recipe can use at most 9 ingredient slots; received ${inputList.length}`);
    }
    const serializedInputs = inputList.map((input) => {
      if (isItemStack(input)) {
        return Ingredient.of(toKubeJSString(input.item)).withCount(input.amount);
      }
      return isItemWrapper(input) ? Ingredient.of(toKubeJSString(input)) : input;
    });
    return recipeEvent.shapeless(toKubeJSString(output), serializedInputs);
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

  // scripts/trains-rails.ts
  ServerEvents.recipes((event) => {
    const p1 = toItem("pantographsandwires:pantograph");
    const p2 = toItem("moderntrainparts:pantograph");
    shapeless(event, p1, p2);
    shapeless(event, p2, p1);
  });
})();
