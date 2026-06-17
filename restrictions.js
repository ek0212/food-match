// Pure restriction helpers shared between the browser app and the
// Node test runner. Browser exposes window.FoodMatchRestrictions;
// Node exposes module.exports.

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (typeof window !== "undefined") {
    window.FoodMatchRestrictions = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  const RESTRICTIONS = [
    { id: "none", label: "No restrictions", emoji: "✅", tags: [] },
    { id: "vegetarian", label: "Vegetarian", emoji: "\u{1F966}", tags: ["meat", "poultry", "fish", "shellfish"] },
    { id: "vegan", label: "Vegan", emoji: "\u{1F331}", tags: ["meat", "poultry", "fish", "shellfish", "dairy", "egg", "honey"] },
    { id: "no_pork", label: "No pork", emoji: "\u{1F416}", tags: ["pork"] },
    { id: "no_beef", label: "No beef", emoji: "\u{1F404}", tags: ["beef"] },
    { id: "no_seafood", label: "No seafood", emoji: "\u{1F41F}", tags: ["fish", "shellfish"] },
    { id: "no_dairy", label: "No dairy", emoji: "\u{1F95B}", tags: ["dairy"] },
    { id: "no_gluten", label: "No gluten", emoji: "\u{1F33E}", tags: ["gluten"] },
    { id: "no_nuts", label: "No nuts", emoji: "\u{1F95C}", tags: ["nut"] },
  ];

  const NON_DAIRY_MILK_PREFIXES = [
    "almond", "coconut", "soy", "oat", "rice", "cashew",
    "hemp", "hazelnut", "pea", "macadamia", "flax", "pistachio",
  ];

  const NUT_OR_SEED_BUTTER_PREFIXES = [
    "peanut", "almond", "sun", "cashew", "macadamia", "hazelnut",
    "pistachio", "seed", "sesame", "sunflower", "tahini", "walnut",
  ];

  function getIngredientTags(name) {
    const tags = new Set();
    const n = String(name || "").toLowerCase();
    if (/^(beef|steak|veal|brisket|oxtail)/.test(n) || /beef/.test(n)) { tags.add("meat"); tags.add("beef"); }
    if (/^(pork|bacon|ham|prosciutto|pancetta|lard|chorizo|guanciale|lardo|sopressata)/.test(n) || /pork|ham/.test(n)) { tags.add("meat"); tags.add("pork"); }
    if (/^(chicken|turkey|duck|goose|quail|pheasant|cornish|poultry)/.test(n)) { tags.add("meat"); tags.add("poultry"); }
    if (/^(lamb|mutton|goat_meat)/.test(n)) tags.add("meat");
    if (/^(venison|rabbit|bison|elk|boar|alligator|frog)/.test(n)) tags.add("meat");
    if (/^(liver|offal|tripe|sweetbread|bone_marrow|blood|tongue|heart|kidney|gizzard|pig_ear|chicken_feet)/.test(n)) tags.add("meat");
    if (/sausage|salami|pepperoni|bresaola|jerky|hot_dog|meatball|meat_stock|andouille/.test(n)) tags.add("meat");
    if (/balut/.test(n)) tags.add("meat");
    if (/^(salmon|tuna|cod|bass|trout|mackerel|sardine|anchovy|eel|swordfish|halibut|snapper|grouper|mahi|tilapia|catfish|herring|pike|perch|flounder|sole|skate|monkfish|barramundi|branzino|arctic_char|amberjack|carp|bonito|dace|pomfret|yellowtail)/.test(n)) tags.add("fish");
    if (/^fish|fish_sauce|fish_cake|dried_fish|fermented_fish|bonito_flake|dashi/.test(n)) tags.add("fish");
    if (/surstr/.test(n)) tags.add("fish");
    if (/^(shrimp|crab|lobster|clam|mussel|oyster|squid|octopus|scallop|crawfish|prawn|langoustine|abalone|sea_urchin|sea_cucumber|conch|whelk|snail|calamari|cockle|geoduck|jellyfish)/.test(n)) tags.add("shellfish");
    if (/shrimp_paste|dried_shrimp|oyster_sauce/.test(n)) tags.add("shellfish");
    if (/cheese|yogurt|ghee|whey|curd|paneer|kefir|labneh|clotted|cr.me_fra.che|mascarpone|ricotta|mozzarella|parmesan|cheddar|gouda|brie|camembert|gruyere|feta|halloumi|manchego|pecorino|asiago|fontina|provolone|burrata|quark|cottage/.test(n)) tags.add("dairy");
    if (/(^|_)cream(_|$)/.test(n) && !/cream_of_tartar/.test(n)) tags.add("dairy");
    if (/(^|_)milk(_|$)/.test(n) && !NON_DAIRY_MILK_PREFIXES.some((p) => n.includes(p + "_milk") || n === p + "_milk")) tags.add("dairy");
    if (/(^|_)butter(_|$)/.test(n) && !NUT_OR_SEED_BUTTER_PREFIXES.some((p) => n.includes(p + "_butter"))) tags.add("dairy");
    if (/^egg$|^egg_/.test(n) || n === "mayonnaise" || n === "meringue" || n === "custard") tags.add("egg");
    if (n === "honey") tags.add("honey");
    if (/^(almond|walnut|pecan|cashew|pistachio|hazelnut|macadamia|pine_nut|brazil_nut|peanut|chestnut)/.test(n)) tags.add("nut");
    if (/nut(?!meg|ella|ritional)/.test(n) && !n.includes("coconut") && !n.includes("butternut") && !n.includes("donut") && !n.includes("chestnut")) tags.add("nut");
    if (/^(wheat|barley|rye|spelt|couscous|bread|flour|seitan|bagel|croissant|pita|naan|focaccia|ciabatta|sourdough|brioche)/.test(n)) tags.add("gluten");
    if (n === "soy_sauce" || n === "light_soy_sauce" || n === "dark_soy_sauce") tags.add("gluten");
    return tags;
  }

  function blockedTagsForRestrictions(restrictions) {
    const blocked = new Set();
    (restrictions || []).forEach((r) => {
      const rest = RESTRICTIONS.find((x) => x.id === r);
      if (rest) rest.tags.forEach((tag) => blocked.add(tag));
    });
    return blocked;
  }

  function isIngredientAllowed(name, restrictions) {
    if (!restrictions || !restrictions.length) return true;
    const tags = getIngredientTags(name);
    if (!tags.size) return true;
    const blocked = blockedTagsForRestrictions(restrictions);
    for (const tag of tags) {
      if (blocked.has(tag)) return false;
    }
    return true;
  }

  function isModeAllowed(mode, restrictions) {
    if (!restrictions || !restrictions.length) return true;
    const blocked = blockedTagsForRestrictions(restrictions);
    const label = String((mode && mode.label) || "").toLowerCase();
    if (blocked.has("fish") && (label.includes("seafood") || label.includes("fish") || label.includes("dashi"))) return false;
    if (blocked.has("shellfish") && label.includes("seafood")) return false;
    if (blocked.has("meat") && (label.includes("meat") || label.includes("cured") || label.includes("charcuterie"))) return false;
    if (blocked.has("dairy") && (label.includes("cheese") || label.includes("dairy") || label.includes("cream") || label.includes("butter") || label.includes("yogurt"))) return false;
    if (blocked.has("pork") && (label.includes("pork") || label.includes("bacon") || label.includes("ham") || label.includes("chorizo"))) return false;
    if (blocked.has("beef") && (label.includes("beef") || label.includes("steak"))) return false;
    if (blocked.has("gluten") && (label.includes("bread") || label.includes("pasta") || label.includes("noodle") || label.includes("wheat") || label.includes("flour"))) return false;
    if (blocked.has("nut") && label.includes("nut") && !label.includes("coconut")) return false;
    return true;
  }

  return {
    RESTRICTIONS,
    getIngredientTags,
    blockedTagsForRestrictions,
    isIngredientAllowed,
    isModeAllowed,
  };
});
