(() => {
  // scripts/trains-rails.ts
  ServerEvents.recipes((event) => {
    const p1 = "pantographsandwires:pantograph";
    const p2 = "moderntrainparts:pantograph";
    event.shapeless(p1, [p2]);
    event.shapeless(p2, [p1]);
  });
})();
