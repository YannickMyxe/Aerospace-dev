(() => {
  // utils/index.ts
  var multiple = (item, amount) => `${amount}x ${item}`;
  var itemTag = (id) => {
    return id.startsWith("#") ? `${id}` : `#${id}`;
  };
  var shapedSurround = (event, output, center, surround) => {
    const recipeEvent = event;
    return recipeEvent.shaped(
      output,
      [
        "AAA",
        "ABA",
        "AAA"
      ],
      {
        A: surround,
        B: center
      }
    );
  };

  // scripts/glassworks.ts
  ServerEvents.recipes((event) => {
    const ether_glass = "glassential:glass_ethereal";
    const glass_tag = itemTag("#c:glass_blocks/cheap");
    const eye_of_ender = "minecraft:ender_eye";
    shapedSurround(event, multiple(ether_glass, 9), eye_of_ender, glass_tag);
  });
})();
