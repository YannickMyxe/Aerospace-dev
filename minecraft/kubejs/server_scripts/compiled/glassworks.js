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
  var shapedSurround = (event, output, center, surround) => {
    const recipeEvent = event;
    return recipeEvent.shaped(
      toKubeJSString(output),
      [
        "AAA",
        "ABA",
        "AAA"
      ],
      {
        A: toKubeJSString(surround),
        B: toKubeJSString(center)
      }
    );
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

  // scripts/glassworks.ts
  ServerEvents.recipes((event) => {
    const ether_glass = toItem("glassential:glass_ethereal");
    const glass_tag = itemTag("#c:glass_blocks/cheap");
    const eye_of_ender = toItem("minecraft:ender_eye");
    shapedSurround(event, multiple(ether_glass, 9), eye_of_ender, glass_tag);
  });
})();
