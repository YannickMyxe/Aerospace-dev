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
  var itemTag = (id) => {
    const tag = id.startsWith("#") ? id : `#${id}`;
    const tagValue = {
      tag,
      toString: () => tag,
      stack: (amount) => itemToStack(tagValue, amount)
    };
    return tagValue;
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
