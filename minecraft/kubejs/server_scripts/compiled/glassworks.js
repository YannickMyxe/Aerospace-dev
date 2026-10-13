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

  // scripts/glassworks.ts
  ServerEvents.recipes((event) => {
    const ether_glass = toItem("glassential:glass_ethereal");
    const glass_tag = itemTag("#c:glass_blocks/cheap");
    const eye_of_ender = toItem("minecraft:ender_eye");
    shapedSurround(event, multiple(ether_glass, 9), eye_of_ender, glass_tag);
  });
})();
