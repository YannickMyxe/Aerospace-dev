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

  // utils/Ae.ts
  var toRecipeInput = (input) => {
    const amount = "amount" in input ? input.amount : void 0;
    const ingredient = "amount" in input ? input.item : input;
    if (amount !== void 0 && (!Number.isInteger(amount) || amount < 1)) {
      throw new RangeError(`Crystal Assembler input amount must be a positive integer; received ${amount}`);
    }
    const recipeIngredient = "tag" in ingredient ? { tag: ingredient.tag.slice(1) } : { item: ingredient.item };
    const recipeInput = {
      ingredient: recipeIngredient
    };
    if (amount !== void 0 && amount !== 1) {
      recipeInput.amount = amount;
    }
    return recipeInput;
  };
  var crystalAssembler = (event, id, recipe) => event.custom({
    type: "extendedae:crystal_assembler",
    input_items: recipe.inputItems.map(toRecipeInput),
    output: { count: 1, id: recipe.output.item },
    energy: recipe.energy
  }).id(id);

  // scripts/Patterns.ts
  ServerEvents.recipes((event) => {
    const advanced = toItem("advanced_ae:small_adv_pattern_provider");
    const advanced_extended = toItem("advanced_ae:adv_pattern_provider");
    const cable = itemTag("#ae2:glass_cable");
    const capacityCards = toItem("ae2:capacity_card");
    const processor = toItem("extendedae:concurrent_processor");
    crystalAssembler(event, "aerospace:crystal_assembler/advanced_pattern_provider", {
      inputItems: [
        advanced,
        capacityCards.stack(3),
        cable.stack(2),
        processor
      ],
      output: advanced_extended,
      energy: 1e4
    });
  });
})();
