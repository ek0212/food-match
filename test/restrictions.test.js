"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  RESTRICTIONS,
  getIngredientTags,
  blockedTagsForRestrictions,
  isIngredientAllowed,
  isModeAllowed,
} = require("../restrictions");

test("RESTRICTIONS includes all expected ids", () => {
  const ids = RESTRICTIONS.map((r) => r.id);
  assert.deepEqual(ids, [
    "none",
    "vegetarian",
    "vegan",
    "no_pork",
    "no_beef",
    "no_seafood",
    "no_dairy",
    "no_gluten",
    "no_nuts",
  ]);
});

test("getIngredientTags tags dairy items", () => {
  for (const name of [
    "cheese",
    "cream",
    "butter",
    "yogurt",
    "ghee",
    "paneer",
    "mozzarella",
    "parmesan",
    "feta",
    "burrata",
    "ricotta",
    "creme_fraiche",
    "whole_milk",
  ]) {
    assert.ok(getIngredientTags(name).has("dairy"), `${name} should be dairy`);
  }
});

test("getIngredientTags does not tag dairy-adjacent non-dairy items", () => {
  for (const name of [
    "peanut_butter",
    "almond_butter",
    "sun_butter",
    "coconut_milk",
    "almond_milk",
    "soy_milk",
    "oat_milk",
    "rice_milk",
    "cream_of_tartar",
  ]) {
    assert.ok(!getIngredientTags(name).has("dairy"), `${name} should NOT be dairy`);
  }
});

test("getIngredientTags tags meat correctly", () => {
  assert.ok(getIngredientTags("beef").has("beef"));
  assert.ok(getIngredientTags("beef").has("meat"));
  assert.ok(getIngredientTags("pork_belly").has("pork"));
  assert.ok(getIngredientTags("pork_belly").has("meat"));
  assert.ok(getIngredientTags("chicken_thigh").has("poultry"));
  assert.ok(getIngredientTags("lamb_shank").has("meat"));
});

test("getIngredientTags tags fish and shellfish", () => {
  assert.ok(getIngredientTags("salmon").has("fish"));
  assert.ok(getIngredientTags("dashi").has("fish"));
  assert.ok(getIngredientTags("fish_sauce").has("fish"));
  assert.ok(getIngredientTags("shrimp").has("shellfish"));
  assert.ok(getIngredientTags("oyster_sauce").has("shellfish"));
});

test("getIngredientTags tags nuts but not nutmeg or coconut", () => {
  assert.ok(getIngredientTags("almond").has("nut"));
  assert.ok(getIngredientTags("walnut").has("nut"));
  assert.ok(getIngredientTags("peanut").has("nut"));
  assert.ok(!getIngredientTags("nutmeg").has("nut"));
  assert.ok(!getIngredientTags("coconut").has("nut"));
  assert.ok(!getIngredientTags("butternut_squash").has("nut"));
});

test("getIngredientTags tags gluten and soy_sauce", () => {
  assert.ok(getIngredientTags("wheat_flour").has("gluten"));
  assert.ok(getIngredientTags("sourdough").has("gluten"));
  assert.ok(getIngredientTags("soy_sauce").has("gluten"));
  assert.ok(!getIngredientTags("rice").has("gluten"));
});

test("getIngredientTags handles empty or unknown input", () => {
  assert.equal(getIngredientTags("").size, 0);
  assert.equal(getIngredientTags("unknown_item").size, 0);
  assert.equal(getIngredientTags(null).size, 0);
  assert.equal(getIngredientTags(undefined).size, 0);
});

test("blockedTagsForRestrictions accumulates tags across multiple restrictions", () => {
  const blocked = blockedTagsForRestrictions(["no_dairy", "no_gluten"]);
  assert.ok(blocked.has("dairy"));
  assert.ok(blocked.has("gluten"));
  assert.equal(blocked.size, 2);
});

test("blockedTagsForRestrictions returns empty set when no restrictions", () => {
  assert.equal(blockedTagsForRestrictions([]).size, 0);
  assert.equal(blockedTagsForRestrictions(null).size, 0);
  assert.equal(blockedTagsForRestrictions(undefined).size, 0);
});

test("isIngredientAllowed honors no_dairy: dairy items never pass", () => {
  for (const name of ["cheese", "butter", "yogurt", "mozzarella", "parmesan", "whole_milk", "ghee", "paneer"]) {
    assert.equal(
      isIngredientAllowed(name, ["no_dairy"]),
      false,
      `${name} must be blocked when no_dairy is set`
    );
  }
});

test("isIngredientAllowed honors no_dairy: non-dairy items pass", () => {
  for (const name of ["rice", "tomato", "peanut_butter", "almond_milk", "coconut_milk", "tofu"]) {
    assert.equal(
      isIngredientAllowed(name, ["no_dairy"]),
      true,
      `${name} must be allowed when no_dairy is set`
    );
  }
});

test("isIngredientAllowed honors vegan: blocks meat, fish, dairy, egg, honey", () => {
  const restrictions = ["vegan"];
  assert.equal(isIngredientAllowed("chicken", restrictions), false);
  assert.equal(isIngredientAllowed("salmon", restrictions), false);
  assert.equal(isIngredientAllowed("cheese", restrictions), false);
  assert.equal(isIngredientAllowed("egg", restrictions), false);
  assert.equal(isIngredientAllowed("honey", restrictions), false);
  assert.equal(isIngredientAllowed("tofu", restrictions), true);
  assert.equal(isIngredientAllowed("lentil", restrictions), true);
});

test("isIngredientAllowed honors vegetarian: blocks meat and fish, allows dairy and egg", () => {
  const restrictions = ["vegetarian"];
  assert.equal(isIngredientAllowed("beef", restrictions), false);
  assert.equal(isIngredientAllowed("salmon", restrictions), false);
  assert.equal(isIngredientAllowed("shrimp", restrictions), false);
  assert.equal(isIngredientAllowed("cheese", restrictions), true);
  assert.equal(isIngredientAllowed("egg", restrictions), true);
  assert.equal(isIngredientAllowed("honey", restrictions), true);
});

test("isIngredientAllowed honors no_pork only", () => {
  assert.equal(isIngredientAllowed("pork_belly", ["no_pork"]), false);
  assert.equal(isIngredientAllowed("bacon", ["no_pork"]), false);
  assert.equal(isIngredientAllowed("chorizo", ["no_pork"]), false);
  assert.equal(isIngredientAllowed("beef", ["no_pork"]), true);
  assert.equal(isIngredientAllowed("chicken_thigh", ["no_pork"]), true);
});

test("isIngredientAllowed honors no_seafood for fish and shellfish", () => {
  assert.equal(isIngredientAllowed("salmon", ["no_seafood"]), false);
  assert.equal(isIngredientAllowed("shrimp", ["no_seafood"]), false);
  assert.equal(isIngredientAllowed("dashi", ["no_seafood"]), false);
  assert.equal(isIngredientAllowed("beef", ["no_seafood"]), true);
});

test("isIngredientAllowed honors no_gluten and treats soy_sauce as gluten", () => {
  assert.equal(isIngredientAllowed("wheat_flour", ["no_gluten"]), false);
  assert.equal(isIngredientAllowed("soy_sauce", ["no_gluten"]), false);
  assert.equal(isIngredientAllowed("rice", ["no_gluten"]), true);
});

test("isIngredientAllowed honors no_nuts but allows nutmeg and coconut", () => {
  assert.equal(isIngredientAllowed("almond", ["no_nuts"]), false);
  assert.equal(isIngredientAllowed("peanut", ["no_nuts"]), false);
  assert.equal(isIngredientAllowed("nutmeg", ["no_nuts"]), true);
  assert.equal(isIngredientAllowed("coconut", ["no_nuts"]), true);
});

test("isIngredientAllowed combines multiple restrictions", () => {
  const restrictions = ["no_dairy", "no_gluten"];
  assert.equal(isIngredientAllowed("cheese", restrictions), false);
  assert.equal(isIngredientAllowed("wheat_flour", restrictions), false);
  assert.equal(isIngredientAllowed("rice", restrictions), true);
  assert.equal(isIngredientAllowed("chicken", restrictions), true);
});

test("isIngredientAllowed passes when restrictions array is empty or missing", () => {
  assert.equal(isIngredientAllowed("cheese", []), true);
  assert.equal(isIngredientAllowed("cheese", null), true);
  assert.equal(isIngredientAllowed("cheese", undefined), true);
});

test("isModeAllowed blocks dairy-labelled modes when no_dairy is set", () => {
  for (const label of [
    "Cheese boards",
    "Melting cheese boards",
    "Cream sauces and pasta",
    "Butter, roasts & comfort food",
    "Yogurt-based dips",
    "Dairy desserts",
  ]) {
    assert.equal(
      isModeAllowed({ label }, ["no_dairy"]),
      false,
      `mode "${label}" must be blocked when no_dairy is set`
    );
  }
});

test("isModeAllowed allows non-dairy modes when no_dairy is set", () => {
  for (const label of [
    "Soy, sesame & wok heat",
    "Cumin, turmeric & slow-cooked dal",
    "Olive oil, herbs & mezze",
    "Chiles, corn & salsa verde",
  ]) {
    assert.equal(
      isModeAllowed({ label }, ["no_dairy"]),
      true,
      `mode "${label}" must be allowed when no_dairy is set`
    );
  }
});

test("isModeAllowed blocks seafood and fish modes when no_seafood is set", () => {
  for (const label of [
    "Dashi broth & umami seafood",
    "Fish sauce, coconut & lime",
    "Dashi, raw fish & pickles",
  ]) {
    assert.equal(
      isModeAllowed({ label }, ["no_seafood"]),
      false,
      `mode "${label}" must be blocked when no_seafood is set`
    );
  }
});

test("isModeAllowed blocks pork-labelled modes when no_pork is set", () => {
  for (const label of [
    "Pork belly braises",
    "Bacon & breakfast",
    "Ham & charcuterie",
    "Chorizo, beans & rice",
  ]) {
    assert.equal(
      isModeAllowed({ label }, ["no_pork"]),
      false,
      `mode "${label}" must be blocked when no_pork is set`
    );
  }
});

test("isModeAllowed blocks beef modes when no_beef is set", () => {
  assert.equal(isModeAllowed({ label: "Beef stew & braises" }, ["no_beef"]), false);
  assert.equal(isModeAllowed({ label: "Steakhouse classics" }, ["no_beef"]), false);
  assert.equal(isModeAllowed({ label: "Chicken stir-fries" }, ["no_beef"]), true);
});

test("isModeAllowed blocks gluten-labelled modes when no_gluten is set", () => {
  for (const label of [
    "Bread & pizza",
    "Pasta with sauces",
    "Wheat noodles",
    "Flour-thickened gravies",
  ]) {
    assert.equal(
      isModeAllowed({ label }, ["no_gluten"]),
      false,
      `mode "${label}" must be blocked when no_gluten is set`
    );
  }
});

test("isModeAllowed blocks nut modes when no_nuts is set, but coconut passes", () => {
  assert.equal(isModeAllowed({ label: "Nut-based pestos" }, ["no_nuts"]), false);
  assert.equal(isModeAllowed({ label: "Coconut curries" }, ["no_nuts"]), true);
});

test("isModeAllowed blocks meat modes when vegetarian is set", () => {
  for (const label of [
    "Cured meats",
    "Charcuterie boards",
    "Slow-cooked meat stews",
  ]) {
    assert.equal(
      isModeAllowed({ label }, ["vegetarian"]),
      false,
      `mode "${label}" must be blocked when vegetarian is set`
    );
  }
});

test("isModeAllowed passes without restrictions", () => {
  assert.equal(isModeAllowed({ label: "Anything goes" }, []), true);
  assert.equal(isModeAllowed({ label: "Anything goes" }, null), true);
  assert.equal(isModeAllowed({ label: "Anything goes" }, undefined), true);
});

test("isModeAllowed is case insensitive", () => {
  assert.equal(isModeAllowed({ label: "CREAM SAUCES" }, ["no_dairy"]), false);
  assert.equal(isModeAllowed({ label: "Pasta With Cheese" }, ["no_dairy"]), false);
});

test("isModeAllowed tolerates missing label", () => {
  assert.equal(isModeAllowed({}, ["no_dairy"]), true);
  assert.equal(isModeAllowed(null, ["no_dairy"]), true);
});
