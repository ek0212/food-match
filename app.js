(async function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // FOOD MATCH — Adaptive Epicure Tasting Quiz
  // Uses 1,790 ingredients and 150 modes from Epicure-Cooc
  // ═══════════════════════════════════════════════════════════════

  // ─── CONSTANTS ─────────────────────────────────────────────────

  const STORAGE_KEY = "food-match-v3";
  const VERSION = 3;
  const MAX_PROFILES = 12;
  const app = document.getElementById("app");

  // ─── ICONS8 PIECES CDN ────────────────────────────────────────

  const ICON_BASE = "https://img.icons8.com/pieces";

  const ICON_MAP = {
    // Seafood
    salmon: "fish", tuna: "fish", sardine: "fish", anchovy: "fish", eel: "fish",
    fish_sauce: "fish-food", bonito_flake: "fish-food", dashi: "miso-soup",
    shrimp: "prawn", dried_shrimp: "prawn",
    crab: "crab", lobster: "crab",
    octopus: "octopus", squid: "octopus",
    oyster: "caviar", sea_urchin: "caviar", abalone: "caviar",
    sea_cucumber: "caviar", jellyfish: "caviar",
    // Meat
    duck: "duck", chicken_feet: "chicken",
    bacon: "pig", prosciutto: "pig", pig_ear: "pig",
    lamb: "kebab", venison: "kebab",
    rabbit: "meal", bone_marrow: "meal",
    liver: "meal", tripe: "meal", sweetbread: "meal",
    blood_sausage: "hot-dog", foie_gras: "duck",
    // Vegetables
    eggplant: "eggplant", beet: "carrot", brussels_sprout: "avocado",
    artichoke: "avocado", fennel: "avocado",
    okra: "corn", arugula: "avocado",
    garlic: "garlic", ginger: "garlic", black_garlic: "garlic",
    avocado: "avocado",
    // Mushrooms
    shiitake_mushroom: "mushroom", enoki_mushroom: "mushroom",
    wood_ear_mushroom: "mushroom", oyster_mushroom: "mushroom",
    black_truffle: "mushroom", white_truffle: "mushroom", truffle_oil: "mushroom",
    // Fruit
    mango: "mango", passion_fruit: "citrus", pomegranate: "cherry",
    fig: "grapes", lychee: "cherry", persimmon: "orange",
    durian: "pineapple", jackfruit: "pineapple", tamarind: "citrus",
    // Spice & Heat
    habanero_pepper: "chili-pepper", sichuan_peppercorn: "chili-pepper",
    chili_oil: "chili-pepper", wasabi: "chili-pepper",
    horseradish: "chili-pepper", birds_eye_chili: "chili-pepper",
    chipotle_pepper: "chili-pepper", sriracha: "chili-pepper",
    gochujang: "chili-pepper", harissa: "chili-pepper",
    // Spices & Herbs
    coriander: "avocado", lemongrass: "citrus", galangal: "garlic",
    turmeric: "garlic", saffron: "sunflower", cardamom: "star",
    star_anise: "star", cumin: "star", fenugreek_seed: "star",
    asafoetida: "star", sumac: "autumn", za_atar: "star",
    // Cheese
    blue_cheese: "pie", goat_cheese: "pie", brie: "pie",
    parmesan: "pie", cottage_cheese: "pie", feta: "pie",
    gruyere: "pie", camembert: "pie",
    // Fermented & Soy
    kimchi: "miso-soup", natto: "miso-soup", miso: "miso-soup",
    soy_sauce: "miso-soup", tofu: "miso-soup", tempeh: "miso-soup",
    stinky_tofu: "miso-soup", fermented_black_bean: "miso-soup",
    shrimp_paste: "prawn", kombucha: "tea",
    // Seaweed
    nori: "fish-food", wakame: "fish-food", seaweed: "fish-food",
    // Pantry
    tahini: "cookie", coconut_milk: "coconut-cocktail", ghee: "pie",
    sesame_oil: "cookie", mirin: "wine", rice_vinegar: "citrus",
    pomegranate_molasses: "cherry", labneh: "pie",
    // Other
    matcha: "tea", rose_water: "flower", taro: "eggplant",
    mochi: "cupcake", nutritional_yeast: "pie",
    pickled_cucumber: "avocado", black_sesame: "cookie",
    century_egg: "egg", balut: "egg", insects: "bug",
    surstroemming: "fish", casu_marzu: "pie",
    // Cuisine fallbacks
    _cuisine_east_asian: "noodles",
    _cuisine_southeast_asian: "noodles",
    _cuisine_south_asian: "kebab",
    _cuisine_mediterranean: "olive",
    _cuisine_latin_american: "taco",
    _cuisine_western_atlantic: "hamburger",
    _cuisine_japanese: "miso-soup",
    // Mode category fallbacks
    _mode_ferment: "miso-soup",
    _mode_seafood: "fish-food",
    _mode_cheese: "pie",
    _mode_spice: "chili-pepper",
    _mode_herb: "avocado",
    _mode_mushroom: "mushroom",
    _mode_fruit: "grapes",
    _mode_vegetable: "carrot",
    _mode_grain: "bread",
    _mode_smoky: "kebab",
    _mode_bitter: "tea",
    _mode_vinegar: "citrus",
    _mode_sweet: "cupcake",
    _mode_default: "meal",
  };

  function icon(key, size) {
    const name = ICON_MAP[key];
    if (name) {
      return `<img src="${ICON_BASE}/${size}/${name}.png" alt="" width="${size}" height="${size}" class="icon" loading="lazy">`;
    }
    return null;
  }

  const CUISINES = [
    { id: "East_Asian", emoji: "\u{1F962}", label: "Soy, sesame & wok heat",
      desc: "Stir-fried noodles, fried rice, dumplings, chili oil, soy-braised meats. The flavors of Chinese and Korean kitchens." },
    { id: "Southeast_Asian", emoji: "\u{1F35C}", label: "Fish sauce, coconut & lime",
      desc: "Pho, pad thai, laksa, fresh spring rolls, lemongrass curries, sambal. Bright, punchy, herbal." },
    { id: "South_Asian", emoji: "\u{1F35B}", label: "Cumin, turmeric & slow-cooked dal",
      desc: "Butter chicken, biryani, chana masala, dosa, raita. Warm spice layers built over time." },
    { id: "Mediterranean", emoji: "\u{1FAD2}", label: "Olive oil, herbs & mezze",
      desc: "Hummus, grilled halloumi, pasta al pomodoro, Greek salad, flatbreads, tahini. Sun-warmed simplicity." },
    { id: "Latin_American", emoji: "\u{1F32E}", label: "Chiles, corn & salsa verde",
      desc: "Tacos al pastor, ceviche, black beans, mole, arepas, chimichurri. Bright heat and fresh acid." },
    { id: "Western_Atlantic", emoji: "\u{1F969}", label: "Butter, roasts & comfort food",
      desc: "Steak frites, mac and cheese, roast chicken, charcuterie boards, sourdough. Rich, familiar, hearty." },
    { id: "Japanese", emoji: "\u{1F363}", label: "Dashi, raw fish & pickles",
      desc: "Sushi, ramen, miso soup, tempura, tsukemono, natto. Clean umami and precise textures." },
  ];

  const RESTRICTIONS = [
    { id: "none", label: "No restrictions", emoji: "\u2705", tags: [] },
    { id: "vegetarian", label: "Vegetarian", emoji: "\u{1F966}", tags: ["meat", "poultry", "fish", "shellfish"] },
    { id: "vegan", label: "Vegan", emoji: "\u{1F331}", tags: ["meat", "poultry", "fish", "shellfish", "dairy", "egg", "honey"] },
    { id: "no_pork", label: "No pork", emoji: "\u{1F416}", tags: ["pork"] },
    { id: "no_beef", label: "No beef", emoji: "\u{1F404}", tags: ["beef"] },
    { id: "no_seafood", label: "No seafood", emoji: "\u{1F41F}", tags: ["fish", "shellfish"] },
    { id: "no_dairy", label: "No dairy", emoji: "\u{1F95B}", tags: ["dairy"] },
    { id: "no_gluten", label: "No gluten", emoji: "\u{1F33E}", tags: ["gluten"] },
    { id: "no_nuts", label: "No nuts", emoji: "\u{1F95C}", tags: ["nut"] },
  ];

  const FEAT = {
    kimchi: ["\u{1F96C}", "Spicy fermented cabbage, tangy and crunchy", 4],
    natto: ["\u{1FAD8}", "Sticky fermented soybeans, pungent and slimy", 8],
    miso: ["\u{1F372}", "Fermented soybean paste, deeply savory", 2],
    fish_sauce: ["\u{1F9C2}", "Concentrated fermented fish, salty and funky", 6],
    soy_sauce: ["\u{1F9C8}", "Fermented soybean condiment, salty and rich", 1],
    gochujang: ["\u{1F336}\uFE0F", "Korean fermented chili paste, sweet and spicy", 3],
    oyster: ["\u{1F9AA}", "Raw shellfish, briny and mineral", 6],
    sea_urchin: ["\u{1F7E0}", "Creamy, intensely oceanic sea creature", 8],
    octopus: ["\u{1F419}", "Chewy seafood, often grilled or braised", 5],
    squid: ["\u{1F991}", "Tender or chewy seafood, sometimes with ink", 4],
    anchovy: ["\u{1F41F}", "Tiny cured fish, concentrated umami", 5],
    sardine: ["\u{1F41F}", "Small oily fish, rich and briny", 4],
    salmon: ["\u{1F41F}", "Fatty fish, raw or cooked, versatile", 1],
    tuna: ["\u{1F41F}", "Meaty fish, often raw in sushi", 2],
    shrimp: ["\u{1F990}", "Sweet shellfish, versatile and popular", 1],
    crab: ["\u{1F980}", "Sweet, delicate shellfish", 2],
    lobster: ["\u{1F99E}", "Rich, sweet, celebratory shellfish", 1],
    eel: ["\u{1F40D}", "Rich, slightly sweet grilled fish", 5],
    abalone: ["\u{1F41A}", "Chewy, prized sea snail", 6],
    blue_cheese: ["\u{1F9C0}", "Sharp, pungent, veined cheese", 6],
    goat_cheese: ["\u{1F9C0}", "Tangy, creamy, slightly barnyard", 4],
    brie: ["\u{1F9C0}", "Soft, creamy, mild French cheese", 2],
    parmesan: ["\u{1F9C0}", "Hard, nutty, umami-rich aged cheese", 1],
    cottage_cheese: ["\u{1F9C0}", "Lumpy, mild, creamy fresh cheese", 4],
    feta: ["\u{1F9C0}", "Salty, crumbly, tangy Greek cheese", 2],
    gruyere: ["\u{1F9C0}", "Nutty, melting Swiss cheese", 1],
    camembert: ["\u{1F9C0}", "Soft-ripened, earthy French cheese", 3],
    liver: ["\u{1FAC0}", "Iron-rich organ meat, mineral and dense", 7],
    bone_marrow: ["\u{1F9B4}", "Fatty, roasted, primal richness", 6],
    tripe: ["\u{1F356}", "Honeycomb stomach lining, chewy texture", 7],
    sweetbread: ["\u{1F356}", "Thymus gland, creamy when fried", 7],
    blood_sausage: ["\u{1F356}", "Rich, iron-heavy sausage with blood", 7],
    durian: ["\u{1F348}", "Creamy tropical fruit, famously pungent", 9],
    jackfruit: ["\u{1F34C}", "Large tropical fruit, meaty texture", 3],
    passion_fruit: ["\u{1F34A}", "Tart, aromatic tropical fruit", 2],
    pomegranate: ["\u{1F34E}", "Jewel-like seeds, sweet-tart juice", 1],
    fig: ["\u{1F95D}", "Honey-sweet, jammy, seedy fruit", 2],
    lychee: ["\u{1F352}", "Floral, juicy tropical fruit", 2],
    mango: ["\u{1F96D}", "Sweet, tropical, creamy flesh", 1],
    tamarind: ["\u{1F330}", "Sour-sweet tropical pod, tangy paste", 3],
    persimmon: ["\u{1F34A}", "Honey-sweet, custardy when ripe", 3],
    habanero_pepper: ["\u{1F336}\uFE0F", "Extremely hot pepper with fruity aroma", 6],
    sichuan_peppercorn: ["\u{1F336}\uFE0F", "Numbing, buzzing, electric mouth sensation", 5],
    chili_oil: ["\u{1F336}\uFE0F", "Spicy, fragrant, red-tinged oil", 3],
    wasabi: ["\u{1F96C}", "Sharp nasal heat, clears sinuses", 4],
    horseradish: ["\u{1F96C}", "Pungent root, sharp and sinus-clearing", 3],
    birds_eye_chili: ["\u{1F336}\uFE0F", "Small, fiery Southeast Asian pepper", 5],
    chipotle_pepper: ["\u{1F336}\uFE0F", "Smoked dried jalape\u00F1o, deep heat", 2],
    black_truffle: ["\u{1F344}", "Earthy, musky, luxurious fungus", 4],
    white_truffle: ["\u{1F344}", "Intensely aromatic, rare luxury fungus", 5],
    truffle_oil: ["\u{1F344}", "Earthy, musky flavored oil", 3],
    shiitake_mushroom: ["\u{1F344}", "Meaty, earthy, umami-rich mushroom", 2],
    enoki_mushroom: ["\u{1F344}", "Delicate, crunchy, mild mushroom", 2],
    wood_ear_mushroom: ["\u{1F344}", "Crunchy, gelatinous, texturally odd", 4],
    oyster_mushroom: ["\u{1F344}", "Mild, velvety, slightly seafood-like", 2],
    coriander: ["\u{1F33F}", "Love-it-or-hate-it herb, bright and soapy to some", 5],
    lemongrass: ["\u{1F33F}", "Citrusy, fragrant Southeast Asian herb", 2],
    galangal: ["\u{1FAD0}", "Ginger-like rhizome, sharp and piney", 3],
    turmeric: ["\u{1FAD0}", "Earthy, golden, mildly bitter spice", 2],
    saffron: ["\u{1F33B}", "Floral, honey-like, world's most expensive spice", 2],
    cardamom: ["\u{1F33F}", "Intensely aromatic, slightly mentholated", 2],
    star_anise: ["\u2B50", "Sweet licorice-like warming spice", 3],
    cumin: ["\u{1F33F}", "Earthy, warm, essential to many cuisines", 2],
    fenugreek_seed: ["\u{1F33F}", "Maple-like aroma, slightly bitter", 3],
    asafoetida: ["\u{1F33F}", "Pungent sulfurous spice, mellows when cooked", 5],
    tofu: ["\u{1F9C6}", "Mild soy curd, absorbs surrounding flavors", 2],
    tempeh: ["\u{1F9C6}", "Fermented soybean cake, nutty and firm", 3],
    stinky_tofu: ["\u{1F9EB}", "Fermented tofu with a famously intense smell", 9],
    fermented_black_bean: ["\u{1FAD8}", "Salty, pungent preserved soybeans", 4],
    shrimp_paste: ["\u{1F9C2}", "Concentrated fermented shrimp, powerfully funky", 7],
    okra: ["\u{1F33F}", "Pod vegetable, slimy when cooked, divisive texture", 5],
    eggplant: ["\u{1F346}", "Soft, absorbent, mildly bitter vegetable", 3],
    beet: ["\u{1F96C}", "Earthy, sweet, stains everything purple", 3],
    brussels_sprout: ["\u{1F966}", "Mini cabbage, bitter when undercooked", 4],
    artichoke: ["\u{1F33F}", "Thistle vegetable, nutty and complex", 3],
    fennel: ["\u{1F33F}", "Anise-flavored bulb, crunchy raw, sweet cooked", 4],
    olive: ["\u{1FAD2}", "Briny, oily, salty cured fruit", 3],
    caper: ["\u{1F33F}", "Tiny briny buds, salty and tangy", 3],
    arugula: ["\u{1F96C}", "Peppery, bitter salad green", 3],
    nori: ["\u{1F33F}", "Dried seaweed sheet, umami and oceanic", 2],
    wakame: ["\u{1F33F}", "Silky seaweed, slightly sweet", 3],
    tahini: ["\u{1FAD8}", "Ground sesame paste, nutty and creamy", 2],
    coconut_milk: ["\u{1F965}", "Rich, creamy tropical liquid", 1],
    ghee: ["\u{1F9C8}", "Clarified butter, nutty and rich", 2],
    duck: ["\u{1F986}", "Rich, fatty poultry with deep flavor", 3],
    lamb: ["\u{1F411}", "Gamey, rich red meat", 4],
    venison: ["\u{1F98C}", "Lean, gamey wild meat", 5],
    rabbit: ["\u{1F407}", "Lean, mild, delicate white meat", 5],
    foie_gras: ["\u{1F9C8}", "Fattened duck or goose liver, rich and silky", 7],
    bacon: ["\u{1F953}", "Smoky, salty, crispy cured pork", 1],
    prosciutto: ["\u{1F356}", "Dry-cured Italian ham, delicate and salty", 2],
    matcha: ["\u{1F375}", "Ground green tea, vegetal and slightly bitter", 2],
    rose_water: ["\u{1F339}", "Floral, perfumed, used in desserts", 3],
    black_sesame: ["\u26AB", "Nutty, slightly bitter, aromatic seeds", 2],
    taro: ["\u{1F360}", "Starchy root, mildly sweet, purple", 2],
    avocado: ["\u{1F951}", "Creamy, mild, buttery fruit", 1],
    mochi: ["\u{1F361}", "Chewy glutinous rice cake", 2],
    nutritional_yeast: ["\u{1F9C0}", "Savory, cheesy-tasting deactivated yeast", 4],
    kombucha: ["\u{1F375}", "Fizzy fermented tea, tangy and vinegary", 4],
    pickled_cucumber: ["\u{1F952}", "Crunchy, sour, salty preserved cucumber", 2],
    ginger: ["\u{1FAD0}", "Spicy, warming, zingy root", 1],
    garlic: ["\u{1F9C4}", "Pungent, savory, essential aromatic", 1],
    sesame_oil: ["\u{1F9C8}", "Nutty, toasty, aromatic oil", 1],
    sriracha: ["\u{1F336}\uFE0F", "Garlicky, tangy hot sauce", 1],
    mirin: ["\u{1F376}", "Sweet Japanese rice wine for cooking", 1],
    rice_vinegar: ["\u{1F9C8}", "Mild, slightly sweet vinegar", 1],
    dashi: ["\u{1F372}", "Japanese soup stock from kelp and bonito", 3],
    bonito_flake: ["\u{1F41F}", "Smoky, umami dried fish shavings", 3],
    seaweed: ["\u{1F33F}", "Ocean vegetables, mineral and umami", 3],
    dried_shrimp: ["\u{1F990}", "Concentrated shrimp flavor, sweet and salty", 4],
    century_egg: ["\u{1F95A}", "Preserved egg, creamy and sulfurous", 8],
    jellyfish: ["\u{1FABC}", "Crunchy, gelatinous, mildly flavored", 7],
    chicken_feet: ["\u{1F414}", "Gelatinous, collagen-rich, chewy", 7],
    pig_ear: ["\u{1F416}", "Crunchy cartilage, chewy and gelatinous", 7],
    sea_cucumber: ["\u{1F41A}", "Slippery, gelatinous ocean creature", 8],
    balut: ["\u{1F95A}", "Fertilized duck egg with embryo", 9],
    insects: ["\u{1F41B}", "Crickets, ants, larvae: crunchy protein", 8],
    surstroemming: ["\u{1F41F}", "Swedish fermented herring, extremely pungent", 10],
    casu_marzu: ["\u{1F9C0}", "Sardinian cheese with live insect larvae", 10],
    black_garlic: ["\u{1F9C4}", "Aged garlic, sweet and molasses-like", 2],
    sumac: ["\u{1F341}", "Tangy, lemony Middle Eastern spice", 2],
    za_atar: ["\u{1F33F}", "Herby, tangy Middle Eastern spice blend", 2],
    harissa: ["\u{1F336}\uFE0F", "Smoky, spicy North African chili paste", 2],
    pomegranate_molasses: ["\u{1F34E}", "Tart, sweet, dark fruit reduction", 2],
    labneh: ["\u{1F95B}", "Thick strained yogurt, tangy and creamy", 2],
  };

  const SKIP_SET = new Set([
    "salt", "sugar", "water", "ice", "oil", "flour", "baking_powder", "baking_soda",
    "cooking_spray", "vegetable_oil", "canola_oil", "corn_starch", "vanilla_extract",
    "food_coloring", "gelatin", "agar", "xanthan_gum", "citric_acid", "cream_of_tartar",
    "yeast", "active_dry_yeast", "cornmeal", "all_purpose_flour", "bread_flour",
    "powdered_sugar", "brown_sugar", "granulated_sugar", "light_corn_syrup",
    "shortening", "margarine", "egg_substitute", "egg_white", "egg_yolk",
    "heavy_cream", "half_and_half", "condensed_milk", "evaporated_milk",
    "unsalted_butter", "salted_butter", "cooking_wine", "white_wine", "red_wine",
    "rice", "white_rice", "jasmine_rice", "basmati_rice", "long_grain_rice",
    "pasta", "spaghetti", "penne", "linguine", "macaroni",
    "chicken_broth", "beef_broth", "vegetable_broth", "stock",
    "black_pepper", "white_pepper", "garlic_powder", "onion_powder",
    "dried_oregano", "dried_basil", "dried_thyme", "dried_parsley",
    "ketchup", "mustard", "mayonnaise", "relish",
    "lettuce", "tomato", "onion", "potato", "carrot", "celery",
    "apple", "banana", "orange", "lemon", "lime", "grape",
    "oregano", "parsley", "thyme", "olive_oil", "red_onion", "paprika",
    "red_pepper", "bay_leaf", "rosemary", "basil", "chive", "dill",
    "red_wine_vinegar", "white_wine_vinegar", "sour_cream", "cream_cheese",
    "cheddar_cheese", "mozzarella_cheese", "butter", "milk", "cheese",
    "chicken", "turkey", "beef", "pork", "ham",
  ]);

  const VIBE = {
    adventure: {
      low: ["gentle", "familiar", "comfort", "cozy"],
      mid: ["curious", "open", "roaming", "exploring"],
      high: ["bold", "daring", "fearless", "untamed"],
    },
    flavor: {
      umami: ["deep", "layered", "savory-dark"],
      fresh: ["bright", "crisp", "verdant"],
      rich: ["lush", "velvet", "indulgent"],
      spicy: ["electric", "fiery", "charged"],
      sweet: ["honeyed", "golden", "soft"],
      earthy: ["smoky", "grounded", "ember"],
      funky: ["wild", "alive", "feral"],
      herbal: ["botanical", "sun-lit", "aromatic"],
    },
    culture: {
      East_Asian: ["pacific", "eastern"],
      Southeast_Asian: ["equatorial", "monsoon"],
      South_Asian: ["aromatic", "spiced"],
      Mediterranean: ["coastal", "sun-warmed"],
      Latin_American: ["tropical", "new-world"],
      Western_Atlantic: ["atlantic", "hearth-side"],
      Japanese: ["zen", "island"],
    },
    time: {
      morning: ["dawn", "sunrise", "early light"],
      afternoon: ["golden hour", "midday sun"],
      evening: ["twilight", "dusk", "amber hour"],
      night: ["midnight", "late night", "moonlit"],
    },
  };

  // ─── STATE ─────────────────────────────────────────────────────

  const state = {
    route: "quiz",
    quiz: null,
    profile: null,
    compareProfiles: null,
    incomingProfile: null,
    toast: "",
  };

  let epicure = null;

  // ─── DATA LAYER ────────────────────────────────────────────────

  async function loadEpicure() {
    const resp = await fetch("data/epicure.json");
    const data = await resp.json();
    return buildIndex(data);
  }

  function buildIndex(data) {
    const modeById = {};
    data.modes.forEach((m) => { modeById[m.id] = m; });

    const ingredientModes = {};
    data.modes.forEach((m) => {
      m.members.forEach((ing) => {
        if (!ingredientModes[ing]) ingredientModes[ing] = [];
        ingredientModes[ing].push(m.id);
      });
    });

    const ingredientSpecificity = {};
    Object.entries(ingredientModes).forEach(([ing, modes]) => {
      ingredientSpecificity[ing] = modes.length;
    });

    const modeCuisines = {};
    Object.entries(data.cuisineProvenance).forEach(([cuisine, modeIds]) => {
      modeIds.forEach((id) => {
        if (!modeCuisines[id]) modeCuisines[id] = [];
        modeCuisines[id].push(cuisine);
      });
    });

    const quizModes = data.modes.filter((m) => {
      if (m.id.startsWith("F_")) return false;
      if (m.property === "nova_level") return false;
      if (m.property.startsWith("usda_")) return false;
      if (m.n < 15 || m.n > 250) return false;
      const l = m.label.toLowerCase();
      if (l.includes("spirit") || l.includes("liqueur") || l.includes("cocktail")) return false;
      if (l.includes("confection") && !l.includes("ingredient")) return false;
      if (l.includes("convenience") || l.includes("processed convenience")) return false;
      if (l.includes("sweet fruit") && l.includes("liqueur")) return false;
      if (l.includes("dessert") && l.includes("spirit")) return false;
      return true;
    });

    return {
      ingredients: new Set(data.ingredients),
      modes: data.modes,
      modeById,
      ingredientModes,
      ingredientSpecificity,
      cuisineProvenance: data.cuisineProvenance,
      modeCuisines,
      quizModes,
    };
  }

  // ─── INGREDIENT UTILS ─────────────────────────────────────────

  function getIngredientTags(name) {
    const tags = new Set();
    const n = name.toLowerCase();
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
    if (/cheese|cream(?!.*tartar)|(?<!\w)milk(?!.*coconut|.*almond|.*soy|.*oat|.*rice)|butter(?!.*peanut|.*almond|.*sun)|yogurt|ghee|whey|curd|paneer|kefir|labneh|clotted|cr.me_fra.che|mascarpone|ricotta|mozzarella|parmesan|cheddar|gouda|brie|camembert|gruyere|feta|halloumi|manchego|pecorino|asiago|fontina|provolone|burrata|quark|cottage/.test(n)) tags.add("dairy");
    if (/^egg$|^egg_/.test(n) || n === "mayonnaise" || n === "meringue" || n === "custard") tags.add("egg");
    if (n === "honey") tags.add("honey");
    if (/^(almond|walnut|pecan|cashew|pistachio|hazelnut|macadamia|pine_nut|brazil_nut|peanut|chestnut)/.test(n)) tags.add("nut");
    if (/nut(?!meg|ella|ritional)/.test(n) && !n.includes("coconut") && !n.includes("butternut") && !n.includes("donut") && !n.includes("chestnut")) tags.add("nut");
    if (/^(wheat|barley|rye|spelt|couscous|bread|flour|seitan|bagel|croissant|pita|naan|focaccia|ciabatta|sourdough|brioche)/.test(n)) tags.add("gluten");
    if (n === "soy_sauce" || n === "light_soy_sauce" || n === "dark_soy_sauce") tags.add("gluten");
    return tags;
  }

  function isIngredientAllowed(name, restrictions) {
    if (!restrictions || !restrictions.length) return true;
    const tags = getIngredientTags(name);
    if (!tags.size) return true;
    const blocked = new Set();
    restrictions.forEach((r) => {
      const rest = RESTRICTIONS.find((x) => x.id === r);
      if (rest) rest.tags.forEach((t) => blocked.add(t));
    });
    for (const tag of tags) {
      if (blocked.has(tag)) return false;
    }
    return true;
  }

  function isModeAllowed(mode, restrictions) {
    if (!restrictions || !restrictions.length) return true;
    const blocked = new Set();
    restrictions.forEach((r) => {
      const rest = RESTRICTIONS.find((x) => x.id === r);
      if (rest) rest.tags.forEach((t) => blocked.add(t));
    });
    const label = mode.label.toLowerCase();
    if (blocked.has("fish") && (label.includes("seafood") || label.includes("fish") || label.includes("dashi"))) return false;
    if (blocked.has("shellfish") && label.includes("seafood")) return false;
    if (blocked.has("meat") && (label.includes("meat") || label.includes("cured") || label.includes("charcuterie"))) return false;
    if (blocked.has("dairy") && (label.includes("cheese") || label.includes("dairy") || label.includes("cream"))) return false;
    return true;
  }

  function displayName(ingredient) {
    return ingredient
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function ingredientEmoji(ingredient) {
    const f = FEAT[ingredient];
    return f ? f[0] : "\u{1F37D}\uFE0F";
  }

  function ingredientIcon(ingredient, size) {
    return icon(ingredient, size) || `<span class="emoji-fallback">${ingredientEmoji(ingredient)}</span>`;
  }

  function ingredientDesc(ingredient) {
    const f = FEAT[ingredient];
    if (f) return f[1];
    const modes = epicure.ingredientModes[ingredient];
    if (modes && modes.length) {
      const mode = epicure.modeById[modes[0]];
      if (mode) return `From the world of ${mode.label.toLowerCase()}`;
    }
    return displayName(ingredient);
  }

  function ingredientControversy(ingredient) {
    const f = FEAT[ingredient];
    if (f) return f[2] || 0;
    const spec = epicure.ingredientSpecificity[ingredient] || 10;
    return Math.max(0, Math.min(8, Math.round(10 - spec)));
  }

  // ─── QUIZ ENGINE ───────────────────────────────────────────────

  function newQuiz(name, restrictions) {
    const cuisineCards = CUISINES.map((c) => ({
      id: "c:" + c.id,
      type: "cuisine",
      context: "Cuisine vibes",
      label: c.label,
      emoji: c.emoji,
      cuisineId: c.id,
      desc: c.desc,
    }));

    return {
      name: (name || "").trim().slice(0, 40),
      restrictions: restrictions || [],
      phase: "cuisines",
      queue: cuisineCards,
      pos: 0,
      responses: {},
      modeCardsAdded: false,
      ingredientCardsAdded: false,
      probesInjected: new Set(),
    };
  }

  function currentCard(quiz) {
    return quiz.queue[quiz.pos] || null;
  }

  const QUIZ_TARGET = 35;

  function quizProgress(quiz) {
    const answered = quiz.pos;
    const pct = Math.min(100, Math.round((answered / QUIZ_TARGET) * 100));
    return {
      current: answered + 1,
      total: QUIZ_TARGET,
      phase: quiz.phase,
      pct,
    };
  }

  function respondToCard(quiz, value) {
    const card = currentCard(quiz);
    if (!card) return;
    quiz.responses[card.id] = value;

    if (card.type === "mode" && !quiz.probesInjected.has(card.modeId)) {
      quiz.probesInjected.add(card.modeId);
      let probeCount;
      if (value >= 3) probeCount = 3;
      else if (value > 0) probeCount = 2;
      else if (value === "unknown") probeCount = 1;
      else probeCount = 1;
      const reason = value > 0 ? "You liked: " + card.label : value < 0 ? "Even though you passed on: " + card.label : "Related to: " + card.label;
      const probes = selectProbesFromMode(card.modeId, probeCount, quiz, reason);
      quiz.queue.splice(quiz.pos + 1, 0, ...probes);
    }

    quiz.pos++;

    const answered = Object.keys(quiz.responses).length;
    console.log(`[quiz] pos=${quiz.pos} answered=${answered}/${QUIZ_TARGET} phase=${quiz.phase} queue=${quiz.queue.length}`);

    if (answered >= QUIZ_TARGET) {
      console.log("[quiz] target reached, finishing");
      quiz.phase = "done";
      return;
    }

    // If we ran out of cards, add more
    if (quiz.pos >= quiz.queue.length) {
      if (quiz.phase === "cuisines" && !quiz.modeCardsAdded) {
        quiz.phase = "modes";
        quiz.modeCardsAdded = true;
        const modeCards = selectModeCards(quiz);
        quiz.queue.push(...modeCards);
        console.log(`[quiz] added ${modeCards.length} mode cards`);
      } else if (!quiz.ingredientCardsAdded) {
        quiz.phase = "ingredients";
        quiz.ingredientCardsAdded = true;
        const ingCards = selectBoundaryIngredients(quiz);
        quiz.queue.push(...ingCards);
        console.log(`[quiz] added ${ingCards.length} boundary ingredients`);
      }

      // Still not enough? Generate more ingredient cards to fill the gap
      if (quiz.pos >= quiz.queue.length && answered < QUIZ_TARGET) {
        const extra = selectExtraIngredients(quiz, QUIZ_TARGET - answered);
        quiz.queue.push(...extra);
        console.log(`[quiz] added ${extra.length} extra ingredients to reach target`);
      }

      // Truly nothing left to ask
      if (quiz.pos >= quiz.queue.length) {
        console.log("[quiz] no more cards available, finishing at", answered);
        quiz.phase = "done";
      }
    } else {
      const next = currentCard(quiz);
      if (next) {
        if (next.type === "mode" || next.type === "ingredient-probe") quiz.phase = "modes";
        if (next.type === "ingredient") quiz.phase = "ingredients";
      }
    }
  }

  function selectModeCards(quiz) {
    const likedCuisines = new Set();
    const cuisineScores = {};
    CUISINES.forEach((c) => {
      const resp = quiz.responses["c:" + c.id];
      if (resp !== undefined && resp > 0) {
        likedCuisines.add(c.id);
        cuisineScores[c.id] = resp;
      }
    });

    if (!likedCuisines.size) {
      CUISINES.forEach((c) => {
        likedCuisines.add(c.id);
        cuisineScores[c.id] = 0.5;
      });
    }

    const scored = epicure.quizModes
      .filter((m) => isModeAllowed(m, quiz.restrictions))
      .map((m) => {
        let score = 0;
        score += modeCuisineRelevance(m, likedCuisines, cuisineScores);
        score += modeInterestingness(m);
        return { mode: m, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    const picked = [];
    const seenProperties = {};
    for (const s of scored) {
      const prop = s.mode.property;
      if ((seenProperties[prop] || 0) >= 2) continue;
      seenProperties[prop] = (seenProperties[prop] || 0) + 1;
      picked.push(s.mode);
      if (picked.length >= 8) break;
    }

    return picked.map(makeModeCard);
  }

  function modeCuisineRelevance(mode, likedCuisines, cuisineScores) {
    let score = 0;
    const officialCuisines = epicure.modeCuisines[mode.id] || [];
    officialCuisines.forEach((c) => {
      if (likedCuisines.has(c)) score += (cuisineScores[c] || 1) * 1.5;
    });

    const label = mode.label.toLowerCase();
    const keywords = {
      East_Asian: ["east asian", "chinese", "japanese", "korean", "east-asian", "wok"],
      Southeast_Asian: ["southeast asian", "thai", "vietnamese", "indonesian"],
      South_Asian: ["south asian", "indian", "south-asian"],
      Mediterranean: ["mediterranean", "italian", "greek", "turkish"],
      Latin_American: ["latin american", "mexican", "tex-mex", "latin", "new world"],
      Western_Atlantic: ["western", "american", "european", "atlantic", "french", "british"],
      Japanese: ["japanese", "dashi", "miso"],
    };
    Object.entries(keywords).forEach(([cuisine, kws]) => {
      if (likedCuisines.has(cuisine) && kws.some((kw) => label.includes(kw))) {
        score += (cuisineScores[cuisine] || 1);
      }
    });

    if (score === 0) score += 0.3;
    return score;
  }

  function modeInterestingness(mode) {
    let score = 0;
    const label = mode.label.toLowerCase();
    if (label.includes("ferment")) score += 3;
    if (label.includes("umami")) score += 3;
    if (label.includes("spice") || label.includes("chile") || label.includes("pepper")) score += 2;
    if (label.includes("cheese")) score += 2;
    if (label.includes("seafood") || label.includes("dashi")) score += 2;
    if (label.includes("herb")) score += 1;
    if (label.includes("mushroom")) score += 2;
    if (label.includes("aromatic")) score += 1;
    if (label.includes("smoky") || label.includes("woody")) score += 1;
    if (label.includes("bitter")) score += 1;
    if (label.includes("vinegar") || label.includes("pickle")) score += 1;
    if (label.includes("tropical")) score += 1;
    if (label.includes("root")) score += 1;
    if (label.includes("fruit") && !label.includes("dried")) score += 1;
    if (label.includes("dessert") || label.includes("sweet") || label.includes("baking")) score -= 2;
    if (label.includes("deli") || label.includes("sandwich")) score -= 1;
    if (label.includes("supper") || label.includes("comfort")) score -= 1;
    if (mode.n >= 30 && mode.n <= 120) score += 2;
    else if (mode.n > 200) score -= 1;
    return score;
  }

  const DISH_PATTERNS = [
    { needs: ["bonito_flakes", "bonito_flake", "dashi"], title: "Dashi broth & umami seafood", dishes: "Miso soup, udon in broth, grilled scallops, chawanmushi" },
    { needs: ["sichuan_peppercorn"], boost: ["chili_oil", "black_bean_paste", "doubanjiang"], title: "Sichuan numbing-spicy dishes", dishes: "Mapo tofu, dan dan noodles, wontons in chili oil" },
    { needs: ["shiitake_mushroom", "enoki_mushroom", "crab_mushroom"], boost: ["oyster_sauce", "light_soy_sauce"], title: "Mushroom stir-fry & hot pot", dishes: "Mushroom hot pot, soy-braised tofu, lo mein, stir-fried greens" },
    { needs: ["light_soy_sauce", "soy_sauce"], boost: ["napa_cabbage", "soybean_sprout"], title: "Soy-braised vegetables & noodles", dishes: "Stir-fried greens, braised napa cabbage, soy noodle soup" },
    { needs: ["wood_ear_mushroom", "garland_chrysanthemum"], title: "Chinese herbal stir-fries", dishes: "Wood ear salad, tangerine peel chicken, chrysanthemum greens" },
    { needs: ["asafoetida", "curry_leaf"], title: "South Indian tempering & spice", dishes: "Tadka dal, sambar, dosa with chutney, rasam" },
    { needs: ["cardamom", "clove"], boost: ["cumin", "bay_leaf", "coriander"], title: "Whole-spice Indian cooking", dishes: "Biryani, chai, garam masala curries, korma" },
    { needs: ["cumin", "coriander"], boost: ["fennel_seed", "turmeric", "garlic"], title: "Aromatic curries & spiced dal", dishes: "Chana masala, dal fry, aloo gobi, spiced lentil soup" },
    { needs: ["kashmiri_chili", "nigella_seed"], title: "Kashmiri & Bengali spice", dishes: "Rogan josh, paneer tikka, Bengali fish curry" },
    { needs: ["oregano", "thyme", "parsley"], boost: ["olive_oil"], title: "Herb-roasted Mediterranean", dishes: "Roasted chicken with herbs, Greek salad, grilled lamb, herb-crusted fish" },
    { needs: ["balsamic_vinegar"], boost: ["olive_oil"], title: "Balsamic & olive oil dishes", dishes: "Caprese salad, balsamic roasted vegetables, bruschetta" },
    { needs: ["olive_oil", "cayenne_pepper"], boost: ["white_wine_vinegar", "red_wine_vinegar"], title: "Peppery vinaigrettes & marinades", dishes: "Olive oil dressings, roasted pepper antipasti, marinated vegetables" },
    { needs: ["fontina_cheese", "manchego_cheese", "asiago_cheese"], title: "Melting cheese boards", dishes: "Fondue, grilled cheese, cheese plates, queso fundido" },
    { needs: ["muenster_cheese", "monterey_jack_cheese"], title: "Melty comfort cheese", dishes: "Quesadillas, mac and cheese, grilled cheese sandwiches" },
    { needs: ["portobello_mushroom"], boost: ["asiago_cheese", "fontina_cheese"], title: "Mushroom & cheese melts", dishes: "Stuffed portobello, mushroom risotto, savory galettes" },
    { needs: ["marjoram", "oregano"], boost: ["thyme", "parsley"], title: "Mediterranean herb blends", dishes: "Herbes de Provence, tabbouleh, herb-grilled fish, za'atar bread" },
    { needs: ["tomatillo", "poblano_pepper"], title: "Mexican green salsas & chiles", dishes: "Salsa verde, chile rellenos, enchiladas verdes, chilaquiles" },
    { needs: ["ancho_chile", "guajillo_chile"], title: "Mexican dried chile sauces", dishes: "Mole, birria, enchilada sauce, chile colorado" },
    { needs: ["anaheim_chile", "new_mexico_chile"], title: "New World roasted chiles", dishes: "Green chile stew, chile colorado, red enchilada sauce" },
    { needs: ["chipotle_pepper"], boost: ["tomatillo"], title: "Smoky chipotle dishes", dishes: "Chipotle tacos, adobo marinade, smoky black bean soup" },
    { needs: ["tsao_ko", "sand_ginger"], title: "Southeast Asian aromatic broths", dishes: "Pho, tom yum, Sichuan hot pot, laksa" },
    { needs: ["birds_eye_chili", "ginger"], boost: ["razor_clam", "oyster_sauce"], title: "Spicy ginger seafood & stir-fry", dishes: "Ginger scallion fish, chili crab, salt and pepper shrimp" },
    { needs: ["red_date", "longan"], boost: ["chinese_yam", "angelica_root"], title: "Chinese herbal tonics & soups", dishes: "Red date tea, herbal chicken soup, sweet tong sui" },
    { needs: ["paprika"], boost: ["cayenne_pepper", "black_pepper"], title: "Paprika-spiced comfort food", dishes: "Goulash, paprikash, Cajun-spiced chicken, spice rubs" },
    { needs: ["bay_leaf", "thyme"], boost: ["cumin", "black_pepper"], title: "Warm spice stews & braises", dishes: "Beef stew, braised short ribs, pot roast, French onion soup" },
  ];

  function matchDishPattern(mode) {
    const members = new Set(mode.members.slice(0, 30));
    let best = null;
    let bestScore = 0;

    for (const pat of DISH_PATTERNS) {
      const mainHits = pat.needs.filter((i) => members.has(i)).length;
      if (mainHits === 0) continue;
      let score = mainHits * 3;
      if (pat.boost) score += pat.boost.filter((i) => members.has(i)).length;
      if (score > bestScore) {
        bestScore = score;
        best = pat;
      }
    }
    return best;
  }

  function makeModeCard(mode) {
    const cuisineTag = extractCuisineFromLabel(mode.label);
    const dishMatch = matchDishPattern(mode);

    let title;
    if (dishMatch) {
      title = dishMatch.title;
    } else {
      title = mode.label;
      if (cuisineTag) title = title.replace(new RegExp("^" + escapeRegex(cuisineTag) + "\\s*", "i"), "");
      title = title.replace(/\s+and\s+/g, " & ");
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    let desc;
    if (dishMatch && dishMatch.dishes) {
      desc = "Think: " + dishMatch.dishes;
    } else if (cuisineTag) {
      desc = cuisineTag + " flavors";
    } else {
      desc = mode.property.replace("cf_", "").replace("fg_", "").replace(/_/g, " ");
    }

    const topMembers = mode.members.slice(0, 20);
    const samples = topMembers
      .filter((i) => !SKIP_SET.has(i))
      .slice(0, 5)
      .map((i) => ({ name: displayName(i), emoji: ingredientEmoji(i), key: i }));

    return {
      id: "m:" + mode.id,
      type: "mode",
      modeId: mode.id,
      modeRef: mode,
      label: title,
      emoji: modeEmoji(mode),
      desc,
      context: cuisineTag,
      samples,
    };
  }

  function modeEmoji(mode) {
    const l = mode.label.toLowerCase();
    if (l.includes("ferment") || l.includes("umami")) return "\u{1F9EB}";
    if (l.includes("seafood") || l.includes("fish") || l.includes("dashi")) return "\u{1F41F}";
    if (l.includes("cheese") || l.includes("dairy")) return "\u{1F9C0}";
    if (l.includes("spice") || l.includes("chile") || l.includes("pepper")) return "\u{1F336}\uFE0F";
    if (l.includes("herb") || l.includes("aromatic")) return "\u{1F33F}";
    if (l.includes("mushroom")) return "\u{1F344}";
    if (l.includes("fruit") || l.includes("tropical")) return "\u{1F34A}";
    if (l.includes("vegetable") || l.includes("root")) return "\u{1F96C}";
    if (l.includes("grain") || l.includes("bread") || l.includes("noodle")) return "\u{1F35C}";
    if (l.includes("smoky") || l.includes("woody")) return "\u{1F525}";
    if (l.includes("bitter")) return "\u{1F375}";
    if (l.includes("vinegar") || l.includes("sour") || l.includes("tart")) return "\u{1F34B}";
    if (l.includes("sweet")) return "\u{1F36F}";
    return "\u{1F37D}\uFE0F";
  }

  function modeIconKey(mode) {
    const l = mode.label.toLowerCase();
    if (l.includes("ferment") || l.includes("umami")) return "_mode_ferment";
    if (l.includes("seafood") || l.includes("fish") || l.includes("dashi")) return "_mode_seafood";
    if (l.includes("cheese") || l.includes("dairy")) return "_mode_cheese";
    if (l.includes("spice") || l.includes("chile") || l.includes("pepper")) return "_mode_spice";
    if (l.includes("herb") || l.includes("aromatic")) return "_mode_herb";
    if (l.includes("mushroom")) return "_mode_mushroom";
    if (l.includes("fruit") || l.includes("tropical")) return "_mode_fruit";
    if (l.includes("vegetable") || l.includes("root")) return "_mode_vegetable";
    if (l.includes("grain") || l.includes("bread") || l.includes("noodle")) return "_mode_grain";
    if (l.includes("smoky") || l.includes("woody")) return "_mode_smoky";
    if (l.includes("bitter")) return "_mode_bitter";
    if (l.includes("vinegar") || l.includes("sour") || l.includes("tart")) return "_mode_vinegar";
    if (l.includes("sweet")) return "_mode_sweet";
    return "_mode_default";
  }

  function modeIcon(mode, size) {
    return icon(modeIconKey(mode), size) || `<span class="emoji-fallback">${modeEmoji(mode)}</span>`;
  }

  const CUISINE_ICON_KEYS = {
    East_Asian: "_cuisine_east_asian",
    Southeast_Asian: "_cuisine_southeast_asian",
    South_Asian: "_cuisine_south_asian",
    Mediterranean: "_cuisine_mediterranean",
    Latin_American: "_cuisine_latin_american",
    Western_Atlantic: "_cuisine_western_atlantic",
    Japanese: "_cuisine_japanese",
  };

  function cuisineIcon(cuisineId, size) {
    const key = CUISINE_ICON_KEYS[cuisineId];
    return icon(key, size) || "";
  }

  function responseIcon(item, size) {
    if (item.id && item.id.startsWith("i:")) {
      return ingredientIcon(item.id.slice(2), size);
    }
    if (item.id && item.id.startsWith("m:") && epicure) {
      const mode = epicure.modeById[item.id.slice(2)];
      if (mode) return modeIcon(mode, size);
    }
    if (item.id && item.id.startsWith("c:")) {
      const cId = item.id.slice(2);
      return cuisineIcon(cId, size);
    }
    return `<span class="emoji-fallback">${item.emoji || ""}</span>`;
  }

  const RESTAURANT_ICON_MAP = {
    "Sushi bar": "miso-soup", "Ramen shop": "noodles", "Izakaya": "miso-soup",
    "Korean BBQ": "kebab", "Dim sum parlor": "noodles", "Sichuan restaurant": "chili-pepper",
    "Chinese noodle house": "noodles", "Thai restaurant": "noodles",
    "Vietnamese pho spot": "noodles", "Indian curry house": "kebab",
    "South Indian dosa place": "kebab", "Italian trattoria": "pizza",
    "Greek taverna": "olive", "Tapas bar": "wine", "Middle Eastern grill": "kebab",
    "Mexican taqueria": "taco", "Oaxacan mole spot": "taco",
    "French bistro": "croissant", "Steakhouse": "hamburger",
    "Gastropub": "hamburger", "Seafood restaurant": "crab",
    "Wine & cheese bar": "wine", "Vegetarian cafe": "avocado",
    "Dumpling house": "noodles",
  };

  function restaurantIcon(r, size) {
    const name = RESTAURANT_ICON_MAP[r.name];
    if (name) return `<img src="${ICON_BASE}/${size}/${name}.png" alt="" width="${size}" height="${size}" class="icon" loading="lazy">`;
    return r.emoji;
  }

  function extractCuisineFromLabel(label) {
    const match = label.match(/^(East[- ]?Asian|South[- ]?Asian|Southeast[- ]?Asian|Mediterranean|Latin[- ]?American|Mexican|Chinese|Japanese|Korean|Pan-Asian|Western|European|Tex-Mex|Cajun|Indonesian|Indian)/i);
    return match ? match[1] : null;
  }

  function selectProbesFromMode(modeId, count, quiz, reason) {
    const mode = epicure.modeById[modeId];
    if (!mode) return [];

    const already = new Set(quiz.queue.map((c) => c.id));
    Object.keys(quiz.responses).forEach((k) => already.add(k));

    const candidates = mode.members
      .slice(0, 30)
      .map((ing, idx) => ({ ing, rank: idx }))
      .filter((c) => !already.has("i:" + c.ing))
      .filter((c) => isIngredientAllowed(c.ing, quiz.restrictions))
      .filter((c) => !SKIP_SET.has(c.ing));

    const scored = candidates.map((c) => {
      let score = 0;
      if (FEAT[c.ing]) score += 5;
      score += ingredientControversy(c.ing);
      score += Math.max(0, 10 - c.rank);
      return { ing: c.ing, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const contextLabel = reason || mode.label;
    return scored.slice(0, count).map((s) => makeIngredientCard(s.ing, contextLabel));
  }

  function selectBoundaryIngredients(quiz) {
    const already = new Set(quiz.queue.map((c) => c.id));
    Object.keys(quiz.responses).forEach((k) => already.add(k));

    const candidates = [];
    for (const ing of Object.keys(FEAT)) {
      if (already.has("i:" + ing)) continue;
      if (!epicure.ingredients.has(ing)) continue;
      if (!isIngredientAllowed(ing, quiz.restrictions)) continue;
      if (SKIP_SET.has(ing)) continue;

      const controversy = ingredientControversy(ing);
      if (controversy < 4) continue;

      candidates.push({ ing, score: controversy });
    }

    candidates.sort((a, b) => b.score - a.score);
    const answered = Object.keys(quiz.responses).length;
    const boundaryCount = Math.min(5, Math.max(0, QUIZ_TARGET - answered));
    return candidates.slice(0, boundaryCount).map((c) => makeIngredientCard(c.ing, "Wild card"));
  }

  function selectExtraIngredients(quiz, count) {
    const already = new Set(quiz.queue.map((c) => c.id));
    Object.keys(quiz.responses).forEach((k) => already.add(k));

    const candidates = Object.keys(FEAT)
      .filter((ing) => !already.has("i:" + ing))
      .filter((ing) => epicure.ingredients.has(ing))
      .filter((ing) => isIngredientAllowed(ing, quiz.restrictions))
      .filter((ing) => !SKIP_SET.has(ing))
      .map((ing) => ({ ing, score: ingredientControversy(ing) + (FEAT[ing] ? 2 : 0) }))
      .sort((a, b) => b.score - a.score);

    return candidates.slice(0, count).map((c) => makeIngredientCard(c.ing, "Deep dive"));
  }

  function makeIngredientCard(ingredient, context) {
    return {
      id: "i:" + ingredient,
      type: "ingredient",
      iconKey: ingredient,
      label: displayName(ingredient),
      emoji: ingredientEmoji(ingredient),
      desc: ingredientDesc(ingredient),
      context: context || null,
    };
  }

  // ─── PROFILE ───────────────────────────────────────────────────

  function buildProfile(quiz) {
    const id = "fm_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
    return {
      v: VERSION,
      id,
      name: quiz.name,
      t: new Date().toISOString(),
      restrictions: quiz.restrictions,
      responses: { ...quiz.responses },
    };
  }

  function cuisineAffinities(profile) {
    const affinities = {};
    CUISINES.forEach((c) => {
      const resp = profile.responses["c:" + c.id];
      affinities[c.id] = typeof resp === "number" ? resp : 0;
    });
    return affinities;
  }

  function adventureScore(profile) {
    let total = 0;
    let accepted = 0;
    Object.entries(profile.responses).forEach(([id, value]) => {
      if (id.startsWith("i:")) {
        const ing = id.slice(2);
        const c = ingredientControversy(ing);
        if (c >= 3) {
          total += c;
          if (typeof value === "number" && value > 0) accepted += c;
        }
      }
    });
    return total > 0 ? Math.round((accepted / total) * 100) : 50;
  }

  function tasteSignature(profile) {
    const sig = { umami: 0, fresh: 0, rich: 0, spicy: 0, sweet: 0, earthy: 0, funky: 0, herbal: 0 };
    const propertyMap = {
      umami_score: "umami", cf_meaty: "umami", cf_earthy: "earthy",
      cf_balsamic: "funky", cf_citrus: "fresh", cf_minty: "herbal",
      cf_woody: "earthy", cf_savory: "rich", cf_sweet: "sweet",
      pungent_score: "spicy", sweet_score: "sweet", sour_score: "fresh",
      bitter_score: "herbal", fatty_score: "rich",
      fg_Spice: "spicy", fg_Dairy: "rich", fg_Vegetable: "fresh", fg_Fruit: "sweet",
    };

    Object.entries(profile.responses).forEach(([id, value]) => {
      if (id.startsWith("m:") && typeof value === "number" && value > 0) {
        const modeId = id.slice(2);
        const mode = epicure ? epicure.modeById[modeId] : null;
        if (mode) {
          const dim = propertyMap[mode.property];
          if (dim) sig[dim] += value;
        }
      }
      if (id.startsWith("i:") && typeof value === "number" && value > 0) {
        const ing = id.slice(2);
        const modes = epicure ? epicure.ingredientModes[ing] || [] : [];
        modes.slice(0, 3).forEach((modeId) => {
          const mode = epicure ? epicure.modeById[modeId] : null;
          if (mode) {
            const dim = propertyMap[mode.property];
            if (dim) sig[dim] += value * 0.3;
          }
        });
      }
    });

    const max = Math.max(1, ...Object.values(sig));
    Object.keys(sig).forEach((k) => { sig[k] = Math.round((sig[k] / max) * 10); });
    return sig;
  }

  function topResponses(profile, filter) {
    return Object.entries(profile.responses)
      .filter(([id, value]) => filter(id, value))
      .map(([id]) => {
        if (id.startsWith("i:")) {
          const ing = id.slice(2);
          return { id, label: displayName(ing), emoji: ingredientEmoji(ing) };
        }
        if (id.startsWith("m:")) {
          const mode = epicure ? epicure.modeById[id.slice(2)] : null;
          return { id, label: mode ? mode.label : id.slice(2), emoji: mode ? modeEmoji(mode) : "\u{1F37D}\uFE0F" };
        }
        if (id.startsWith("c:")) {
          const c = CUISINES.find((x) => "c:" + x.id === id);
          return { id, label: c ? c.label : id, emoji: c ? c.emoji : "\u{1F37D}\uFE0F" };
        }
        return { id, label: id, emoji: "\u{1F37D}\uFE0F" };
      });
  }

  // ─── RESTAURANTS & DISHES ──────────────────────────────────────

  const RESTAURANTS = [
    { name: "Sushi bar", emoji: "\u{1F363}", cuisines: ["Japanese"], keys: ["salmon", "tuna", "nori", "wasabi", "sea_urchin", "eel", "octopus", "shrimp"] },
    { name: "Ramen shop", emoji: "\u{1F35C}", cuisines: ["Japanese"], keys: ["miso", "bonito_flake", "dashi", "sesame_oil", "chili_oil", "enoki_mushroom"] },
    { name: "Izakaya", emoji: "\u{1F3EE}", cuisines: ["Japanese"], keys: ["miso", "sesame_oil", "ginger", "tofu", "enoki_mushroom", "squid", "octopus", "dashi"] },
    { name: "Korean BBQ", emoji: "\u{1F969}", cuisines: ["East_Asian"], keys: ["gochujang", "kimchi", "sesame_oil", "garlic", "ginger"] },
    { name: "Dim sum parlor", emoji: "\u{1F95F}", cuisines: ["East_Asian"], keys: ["shrimp", "soy_sauce", "ginger", "sesame_oil", "chili_oil"] },
    { name: "Sichuan restaurant", emoji: "\u{1F336}\uFE0F", cuisines: ["East_Asian"], keys: ["sichuan_peppercorn", "chili_oil", "fermented_black_bean", "garlic", "tofu"] },
    { name: "Chinese noodle house", emoji: "\u{1F962}", cuisines: ["East_Asian"], keys: ["soy_sauce", "sesame_oil", "ginger", "garlic", "shiitake_mushroom", "chili_oil"] },
    { name: "Thai restaurant", emoji: "\u{1F35B}", cuisines: ["Southeast_Asian"], keys: ["fish_sauce", "lemongrass", "galangal", "coconut_milk", "birds_eye_chili", "tamarind"] },
    { name: "Vietnamese pho spot", emoji: "\u{1F35C}", cuisines: ["Southeast_Asian"], keys: ["fish_sauce", "ginger", "star_anise", "coriander", "sriracha"] },
    { name: "Indian curry house", emoji: "\u{1F35B}", cuisines: ["South_Asian"], keys: ["cumin", "turmeric", "cardamom", "coriander", "ghee", "ginger", "garlic"] },
    { name: "South Indian dosa place", emoji: "\u{1FAD3}", cuisines: ["South_Asian"], keys: ["asafoetida", "curry_leaf", "coconut_milk", "tamarind", "fenugreek_seed"] },
    { name: "Italian trattoria", emoji: "\u{1F35D}", cuisines: ["Mediterranean"], keys: ["olive", "parmesan", "prosciutto", "arugula", "artichoke", "caper", "brie"] },
    { name: "Greek taverna", emoji: "\u{1FAD2}", cuisines: ["Mediterranean"], keys: ["olive", "feta", "tahini", "sumac", "labneh", "eggplant"] },
    { name: "Tapas bar", emoji: "\u{1F377}", cuisines: ["Mediterranean"], keys: ["olive", "caper", "anchovy", "coriander", "fennel", "prosciutto"] },
    { name: "Middle Eastern grill", emoji: "\u{1F9C6}", cuisines: ["Mediterranean"], keys: ["tahini", "sumac", "za_atar", "pomegranate_molasses", "labneh", "harissa"] },
    { name: "Mexican taqueria", emoji: "\u{1F32E}", cuisines: ["Latin_American"], keys: ["chipotle_pepper", "avocado", "coriander", "habanero_pepper"] },
    { name: "Oaxacan mole spot", emoji: "\u{1FAD5}", cuisines: ["Latin_American"], keys: ["chipotle_pepper", "coriander", "avocado"] },
    { name: "French bistro", emoji: "\u{1F950}", cuisines: ["Western_Atlantic", "Mediterranean"], keys: ["brie", "camembert", "gruyere", "duck", "foie_gras", "prosciutto", "fennel"] },
    { name: "Steakhouse", emoji: "\u{1F969}", cuisines: ["Western_Atlantic"], keys: ["bacon", "blue_cheese", "horseradish", "bone_marrow"] },
    { name: "Gastropub", emoji: "\u{1F37A}", cuisines: ["Western_Atlantic"], keys: ["bacon", "blue_cheese", "brussels_sprout", "duck", "bone_marrow"] },
    { name: "Seafood restaurant", emoji: "\u{1F99E}", cuisines: ["Western_Atlantic", "Japanese"], keys: ["lobster", "crab", "shrimp", "oyster", "salmon", "tuna", "squid"] },
    { name: "Wine & cheese bar", emoji: "\u{1F377}", cuisines: ["Mediterranean", "Western_Atlantic"], keys: ["blue_cheese", "brie", "gruyere", "camembert", "prosciutto", "olive", "fig"] },
    { name: "Vegetarian cafe", emoji: "\u{1F96C}", cuisines: [], keys: ["tofu", "tempeh", "avocado", "nutritional_yeast", "eggplant", "artichoke", "fennel", "beet"] },
    { name: "Dumpling house", emoji: "\u{1F95F}", cuisines: ["East_Asian"], keys: ["ginger", "soy_sauce", "chili_oil", "sesame_oil", "shrimp"] },
  ];

  const DISH_BANK = [
    { dish: "Miso ramen", triggers: ["miso", "sesame_oil"], cuisine: "Japanese" },
    { dish: "Sashimi platter", triggers: ["salmon", "tuna"], cuisine: "Japanese" },
    { dish: "Tempura udon", triggers: ["dashi", "shrimp"], cuisine: "Japanese" },
    { dish: "Takoyaki", triggers: ["octopus", "bonito_flake"], cuisine: "Japanese" },
    { dish: "Unagi don", triggers: ["eel", "mirin"], cuisine: "Japanese" },
    { dish: "Natto rice bowl", triggers: ["natto"], cuisine: "Japanese" },
    { dish: "Miso soup", triggers: ["miso", "tofu"], cuisine: "Japanese" },
    { dish: "Mapo tofu", triggers: ["sichuan_peppercorn", "tofu"], cuisine: "East_Asian" },
    { dish: "Kung pao chicken", triggers: ["sichuan_peppercorn", "chili_oil"], cuisine: "East_Asian" },
    { dish: "Dan dan noodles", triggers: ["sichuan_peppercorn", "sesame_oil"], cuisine: "East_Asian" },
    { dish: "Wontons in chili oil", triggers: ["chili_oil", "soy_sauce"], cuisine: "East_Asian" },
    { dish: "Kimchi jjigae", triggers: ["kimchi", "gochujang"], cuisine: "East_Asian" },
    { dish: "Korean fried chicken", triggers: ["gochujang", "garlic"], cuisine: "East_Asian" },
    { dish: "Mushroom stir-fry", triggers: ["shiitake_mushroom", "soy_sauce"], cuisine: "East_Asian" },
    { dish: "Black bean noodles", triggers: ["fermented_black_bean", "soy_sauce"], cuisine: "East_Asian" },
    { dish: "Century egg congee", triggers: ["century_egg", "ginger"], cuisine: "East_Asian" },
    { dish: "Xiao long bao", triggers: ["ginger", "soy_sauce", "shrimp"], cuisine: "East_Asian" },
    { dish: "Pad thai", triggers: ["fish_sauce", "tamarind"], cuisine: "Southeast_Asian" },
    { dish: "Green curry", triggers: ["coconut_milk", "galangal"], cuisine: "Southeast_Asian" },
    { dish: "Tom yum soup", triggers: ["lemongrass", "galangal", "shrimp"], cuisine: "Southeast_Asian" },
    { dish: "Pho", triggers: ["fish_sauce", "star_anise", "ginger"], cuisine: "Southeast_Asian" },
    { dish: "Laksa", triggers: ["coconut_milk", "shrimp_paste", "lemongrass"], cuisine: "Southeast_Asian" },
    { dish: "Papaya salad", triggers: ["fish_sauce", "birds_eye_chili"], cuisine: "Southeast_Asian" },
    { dish: "Butter chicken", triggers: ["cardamom", "ghee"], cuisine: "South_Asian" },
    { dish: "Chana masala", triggers: ["cumin", "coriander", "turmeric"], cuisine: "South_Asian" },
    { dish: "Biryani", triggers: ["cardamom", "saffron", "cumin"], cuisine: "South_Asian" },
    { dish: "Dal tadka", triggers: ["cumin", "asafoetida"], cuisine: "South_Asian" },
    { dish: "Dosa with sambar", triggers: ["curry_leaf", "asafoetida", "tamarind"], cuisine: "South_Asian" },
    { dish: "Saag paneer", triggers: ["cumin", "ghee", "ginger"], cuisine: "South_Asian" },
    { dish: "Tandoori chicken", triggers: ["cumin", "turmeric", "ginger"], cuisine: "South_Asian" },
    { dish: "Greek salad", triggers: ["olive", "feta"], cuisine: "Mediterranean" },
    { dish: "Bruschetta", triggers: ["olive", "arugula"], cuisine: "Mediterranean" },
    { dish: "Shakshuka", triggers: ["harissa", "feta"], cuisine: "Mediterranean" },
    { dish: "Hummus with za'atar", triggers: ["tahini", "za_atar"], cuisine: "Mediterranean" },
    { dish: "Grilled halloumi", triggers: ["olive", "sumac"], cuisine: "Mediterranean" },
    { dish: "Labneh with olive oil", triggers: ["labneh", "olive"], cuisine: "Mediterranean" },
    { dish: "Caponata", triggers: ["eggplant", "caper", "olive"], cuisine: "Mediterranean" },
    { dish: "Beet & goat cheese salad", triggers: ["beet", "goat_cheese"], cuisine: "Mediterranean" },
    { dish: "Cacio e pepe", triggers: ["parmesan"], cuisine: "Mediterranean" },
    { dish: "Caprese salad", triggers: ["olive"], cuisine: "Mediterranean" },
    { dish: "Tacos al pastor", triggers: ["chipotle_pepper", "avocado"], cuisine: "Latin_American" },
    { dish: "Ceviche", triggers: ["shrimp", "avocado", "coriander"], cuisine: "Latin_American" },
    { dish: "Mole negro", triggers: ["chipotle_pepper", "coriander"], cuisine: "Latin_American" },
    { dish: "Elote", triggers: ["chipotle_pepper", "coriander"], cuisine: "Latin_American" },
    { dish: "Guacamole", triggers: ["avocado", "coriander"], cuisine: "Latin_American" },
    { dish: "Steak with bone marrow", triggers: ["bone_marrow", "bacon"], cuisine: "Western_Atlantic" },
    { dish: "Duck confit", triggers: ["duck"], cuisine: "Western_Atlantic" },
    { dish: "Foie gras torchon", triggers: ["foie_gras"], cuisine: "Western_Atlantic" },
    { dish: "Roasted brussels sprouts", triggers: ["brussels_sprout", "bacon"], cuisine: "Western_Atlantic" },
    { dish: "Cheese board", triggers: ["brie", "blue_cheese", "gruyere", "fig"], cuisine: "Western_Atlantic" },
    { dish: "French onion soup", triggers: ["gruyere"], cuisine: "Western_Atlantic" },
    { dish: "Lobster roll", triggers: ["lobster"], cuisine: "Western_Atlantic" },
    { dish: "Oysters on the half shell", triggers: ["oyster"], cuisine: "Western_Atlantic" },
  ];

  function profileLikedIngredients(profile) {
    const liked = new Set();
    Object.entries(profile.responses).forEach(([id, v]) => {
      if (id.startsWith("i:") && typeof v === "number" && v > 0) liked.add(id.slice(2));
    });
    return liked;
  }

  function profileDislikedIngredients(profile) {
    const disliked = new Set();
    Object.entries(profile.responses).forEach(([id, v]) => {
      if (id.startsWith("i:") && typeof v === "number" && v < 0) disliked.add(id.slice(2));
    });
    return disliked;
  }

  function suggestRestaurants(profile) {
    const liked = profileLikedIngredients(profile);
    const disliked = profileDislikedIngredients(profile);
    const affinities = cuisineAffinities(profile);

    return RESTAURANTS.map((r) => {
      let score = 0;
      r.cuisines.forEach((c) => { score += Math.max(0, affinities[c] || 0) * 2; });
      if (r.cuisines.length === 0) score += 1;
      const hits = r.keys.filter((k) => liked.has(k));
      const misses = r.keys.filter((k) => disliked.has(k));
      score += hits.length * 3;
      score -= misses.length * 4;
      return { ...r, score, hits: hits.length, misses: misses.length };
    })
    .filter((r) => r.score > 0 && r.hits >= 1)
    .sort((a, b) => b.score - a.score);
  }

  function suggestDishes(profile) {
    const liked = profileLikedIngredients(profile);
    const disliked = profileDislikedIngredients(profile);
    const affinities = cuisineAffinities(profile);

    return DISH_BANK.map((d) => {
      const hits = d.triggers.filter((t) => liked.has(t));
      const misses = d.triggers.filter((t) => disliked.has(t));
      if (misses.length > 0 || hits.length === 0) return null;
      let score = hits.length * 3;
      score += Math.max(0, affinities[d.cuisine] || 0);
      return { ...d, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  }

  function suggestSharedRestaurants(a, b) {
    const aRecs = suggestRestaurants(a);
    const bRecs = suggestRestaurants(b);
    const bMap = {};
    bRecs.forEach((r) => { bMap[r.name] = r; });

    return aRecs
      .filter((r) => bMap[r.name])
      .map((r) => ({ ...r, score: r.score + bMap[r.name].score }))
      .sort((x, y) => y.score - x.score);
  }

  function suggestSharedDishes(a, b) {
    const aLiked = profileLikedIngredients(a);
    const bLiked = profileLikedIngredients(b);
    const aDisliked = profileDislikedIngredients(a);
    const bDisliked = profileDislikedIngredients(b);

    return DISH_BANK.map((d) => {
      const aHits = d.triggers.filter((t) => aLiked.has(t));
      const bHits = d.triggers.filter((t) => bLiked.has(t));
      const anyMiss = d.triggers.some((t) => aDisliked.has(t) || bDisliked.has(t));
      if (anyMiss || aHits.length === 0 || bHits.length === 0) return null;
      return { ...d, score: aHits.length + bHits.length };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  }

  function suggestAvoidDishes(a, b) {
    const aLiked = profileLikedIngredients(a);
    const bLiked = profileLikedIngredients(b);
    const aDisliked = profileDislikedIngredients(a);
    const bDisliked = profileDislikedIngredients(b);

    return DISH_BANK.map((d) => {
      const aWants = d.triggers.filter((t) => aLiked.has(t)).length;
      const bWants = d.triggers.filter((t) => bLiked.has(t)).length;
      const aHates = d.triggers.filter((t) => aDisliked.has(t)).length;
      const bHates = d.triggers.filter((t) => bDisliked.has(t)).length;
      if ((aWants > 0 && bHates > 0) || (bWants > 0 && aHates > 0)) {
        const who = aHates > 0 ? "a" : "b";
        return { ...d, who };
      }
      return null;
    })
    .filter(Boolean);
  }

  // ─── COMPARISON ────────────────────────────────────────────────

  function compareProfiles(a, b) {
    const sharedLikes = [];
    const conflicts = [];
    const aLikes = new Set();
    const bLikes = new Set();

    Object.entries(a.responses).forEach(([id, v]) => { if (typeof v === "number" && v > 0) aLikes.add(id); });
    Object.entries(b.responses).forEach(([id, v]) => { if (typeof v === "number" && v > 0) bLikes.add(id); });

    for (const id of aLikes) {
      if (bLikes.has(id)) sharedLikes.push(id);
      const bv = b.responses[id];
      if (typeof bv === "number" && bv < 0) conflicts.push({ id, who: "a" });
    }
    for (const id of bLikes) {
      const av = a.responses[id];
      if (typeof av === "number" && av < 0) conflicts.push({ id, who: "b" });
    }

    const bridges = [];
    for (const id of aLikes) {
      if (b.responses[id] === undefined || b.responses[id] === "unknown") bridges.push({ id, from: "a" });
    }
    for (const id of bLikes) {
      if (a.responses[id] === undefined || a.responses[id] === "unknown") bridges.push({ id, from: "b" });
    }

    const totalAnswered = new Set([...Object.keys(a.responses), ...Object.keys(b.responses)]).size;
    const overlapBonus = sharedLikes.length * 4;
    const nicheBonus = sharedLikes.filter((id) => id.startsWith("i:") && ingredientControversy(id.slice(2)) >= 4).length * 3;
    const conflictPenalty = conflicts.length * 5;
    const baseScore = totalAnswered > 0 ? Math.round((sharedLikes.length / Math.max(1, Math.min(aLikes.size, bLikes.size))) * 50) : 50;
    const score = Math.max(0, Math.min(100, baseScore + overlapBonus + nicheBonus - conflictPenalty));

    return {
      score,
      sharedLikes: sharedLikes.map(responseInfo),
      conflicts: conflicts.map((c) => ({ ...responseInfo(c.id), who: c.who })),
      bridges: bridges.slice(0, 8).map((b) => ({ ...responseInfo(b.id), from: b.from })),
    };
  }

  function responseInfo(id) {
    if (id.startsWith("i:")) {
      const ing = id.slice(2);
      return { id, label: displayName(ing), emoji: ingredientEmoji(ing), type: "ingredient" };
    }
    if (id.startsWith("m:")) {
      const mode = epicure ? epicure.modeById[id.slice(2)] : null;
      return { id, label: mode ? mode.label : id, emoji: mode ? modeEmoji(mode) : "\u{1F37D}\uFE0F", type: "mode" };
    }
    if (id.startsWith("c:")) {
      const c = CUISINES.find((x) => "c:" + x.id === id);
      return { id, label: c ? c.label : id, emoji: c ? c.emoji : "\u{1F37D}\uFE0F", type: "cuisine" };
    }
    return { id, label: id, emoji: "\u{1F37D}\uFE0F", type: "unknown" };
  }

  // ─── QUIZ INSIGHT (live feedback) ────────────────────────────

  function quizInsight(quiz) {
    if (!quiz) return "";
    const answered = Object.keys(quiz.responses).length;
    if (answered < 3) return "";

    const likes = [];
    const dislikes = [];
    Object.entries(quiz.responses).forEach(([id, v]) => {
      if (typeof v === "number" && v > 0) {
        if (id.startsWith("c:")) {
          const c = CUISINES.find((x) => "c:" + x.id === id);
          if (c) likes.push(c.label.split(",")[0]);
        }
      }
      if (typeof v === "number" && v < 0) {
        if (id.startsWith("c:")) {
          const c = CUISINES.find((x) => "c:" + x.id === id);
          if (c) dislikes.push(c.label.split(",")[0]);
        }
      }
    });

    if (quiz.phase === "cuisines" && answered >= 3 && likes.length) {
      return `Picking up on your love for ${likes.slice(0, 2).join(" and ")}...`;
    }

    if (quiz.phase === "modes" || quiz.phase === "ingredients") {
      const ingLikes = [];
      const ingDislikes = [];
      Object.entries(quiz.responses).forEach(([id, v]) => {
        if (id.startsWith("i:") && typeof v === "number") {
          const name = displayName(id.slice(2));
          if (v > 0) ingLikes.push(name);
          else if (v < 0) ingDislikes.push(name);
        }
      });

      if (ingLikes.length >= 2) {
        return `You're into ${ingLikes.slice(-2).join(" and ")}. Let's see what else fits.`;
      }
      if (ingDislikes.length >= 1 && ingLikes.length >= 1) {
        return `${ingLikes[ingLikes.length - 1]} yes, ${ingDislikes[ingDislikes.length - 1]} no. Narrowing it down...`;
      }
      if (likes.length) {
        return `Exploring flavors from your ${likes[0]} preference...`;
      }
    }

    return "";
  }

  // ─── NARRATIVE (results insight) ──────────────────────────────

  function generateNarrative(profile) {
    const adventure = adventureScore(profile);
    const taste = tasteSignature(profile);
    const affinities = cuisineAffinities(profile);
    const liked = topResponses(profile, (id, v) => typeof v === "number" && v > 0);
    const disliked = topResponses(profile, (id, v) => typeof v === "number" && v < 0);

    const CUISINE_NAMES = {
      East_Asian: "East Asian", Southeast_Asian: "Southeast Asian",
      South_Asian: "South Asian", Mediterranean: "Mediterranean",
      Latin_American: "Latin American", Western_Atlantic: "Western comfort food",
      Japanese: "Japanese",
    };

    const sortedCuisines = CUISINES
      .map((c) => ({ ...c, name: CUISINE_NAMES[c.id] || c.id, score: affinities[c.id] || 0 }))
      .sort((a, b) => b.score - a.score);
    const topCuisine = sortedCuisines[0];
    const bottomCuisine = sortedCuisines.filter((c) => c.score < 0)[0];

    const sortedTaste = Object.entries(taste).sort((a, b) => b[1] - a[1]);
    const topTaste = sortedTaste[0] ? sortedTaste[0][0] : "umami";

    const likedIngs = liked.filter((f) => f.id.startsWith("i:")).map((f) => f.label);
    const dislikedIngs = disliked.filter((f) => f.id.startsWith("i:")).map((f) => f.label);
    const likedModes = liked.filter((f) => f.id.startsWith("m:")).map((f) => f.label);

    const parts = [];

    // Opening: adventure level
    if (adventure > 70) {
      parts.push("You're a fearless eater. Most people would flinch at half the things you love.");
    } else if (adventure > 45) {
      parts.push("You're open-minded but you know what you like. Adventurous with limits.");
    } else if (adventure > 0) {
      parts.push("You know your comfort zone and you like it there. Nothing wrong with that.");
    } else {
      parts.push("You have clear preferences.");
    }

    // Cuisine identity
    if (topCuisine && topCuisine.score > 0) {
      parts.push(`Your palate leans ${topCuisine.name}.`);
    }
    if (bottomCuisine) {
      parts.push(`${bottomCuisine.name} doesn't call to you.`);
    }

    // Taste dimensions
    const tasteDimLabels = {
      umami: "deep savory flavors", fresh: "bright and fresh ingredients",
      rich: "rich indulgent food", spicy: "heat and spice",
      sweet: "sweet notes", earthy: "earthy grounded flavors",
      funky: "funky fermented things", herbal: "herbal and botanical flavors",
    };
    if (taste[topTaste] > 3) {
      parts.push(`You're drawn to ${tasteDimLabels[topTaste] || topTaste}.`);
    }

    // Flavor categories liked
    if (likedModes.length >= 2) {
      parts.push(`You gravitate toward ${likedModes.slice(0, 2).join(" and ").toLowerCase()}.`);
    }

    // Specific ingredients
    if (likedIngs.length >= 2) {
      parts.push(`Favorites include ${likedIngs.slice(0, 3).join(", ")}.`);
    }
    if (dislikedIngs.length >= 2) {
      parts.push(`Hard pass on ${dislikedIngs.slice(0, 2).join(" and ")}.`);
    } else if (dislikedIngs.length === 1) {
      parts.push(`Not a fan of ${dislikedIngs[0]}.`);
    }

    return parts.join(" ");
  }

  // ─── DAYLIST ───────────────────────────────────────────────────

  function generateDaylist(profile) {
    const seed = profile.id || "default";
    const adv = adventureScore(profile);
    const advTier = adv > 65 ? "high" : adv > 35 ? "mid" : "low";
    const advWord = seededPick(VIBE.adventure[advTier], seed + "adv");

    const taste = tasteSignature(profile);
    const sortedDims = Object.entries(taste).sort((a, b) => b[1] - a[1]);
    const topDim = sortedDims[0] ? sortedDims[0][0] : "umami";
    const flavorWord = seededPick(VIBE.flavor[topDim] || VIBE.flavor.umami, seed + "flav");

    const affinities = cuisineAffinities(profile);
    const topCuisine = Object.entries(affinities).sort((a, b) => b[1] - a[1])[0];
    const cultureWord = topCuisine && topCuisine[1] > 0
      ? seededPick(VIBE.culture[topCuisine[0]] || ["wandering"], seed + "cult")
      : "wandering";

    const hour = new Date().getHours();
    const timePeriod = hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 22 ? "evening" : "night";
    const timeWord = seededPick(VIBE.time[timePeriod], seed + "time");

    return `${advWord} ${flavorWord} ${cultureWord} ${timeWord}`;
  }

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  function seededPick(arr, seed) {
    if (!arr || !arr.length) return "";
    return arr[Math.abs(hashCode(seed)) % arr.length];
  }

  // ─── STORAGE ───────────────────────────────────────────────────

  function loadProfiles() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }

  function saveProfile(profile) {
    const profiles = loadProfiles().filter((p) => p.id !== profile.id);
    profiles.unshift(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.slice(0, MAX_PROFILES)));
  }

  // ─── URL ENCODING ─────────────────────────────────────────────

  function encodePayload(payload) {
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = "";
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  }

  function decodePayload(str) {
    const padded = str.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(str.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function baseUrl() { return location.href.split("#")[0]; }
  function profileUrl(profile) { return baseUrl() + "#profile=" + encodePayload(profile); }
  function inviteUrl(profile) { return baseUrl() + "#take=" + encodePayload(profile); }
  function compareUrl(a, b) { return baseUrl() + "#compare=" + encodePayload(a) + "." + encodePayload(b); }

  // ─── RENDERING ─────────────────────────────────────────────────

  function render() {
    if (state.route === "profile") return renderResults();
    if (state.route === "compare") return renderCompare();
    if (state.route === "history") return renderHistory();
    if (!state.quiz) return renderSetup();
    if (state.quiz.phase === "done") return finishQuiz();
    if (state.quiz.phase === "setup") return renderSetup();
    renderQuizCard();
  }

  function shell(content) {
    app.innerHTML = `
      <div class="shell">
        <header class="header">
          <h1>Food Match</h1>
          <nav>
            <button data-action="new-quiz">Retake</button>
            <button data-action="history">Profiles</button>
          </nav>
        </header>
        ${content}
        <footer class="footer">
          Built on <a href="https://huggingface.co/Kaikaku/epicure-cooc" target="_blank" rel="noreferrer">Epicure-Cooc</a>.
          Icons by <a href="https://icons8.com" target="_blank" rel="noreferrer">Icons8</a>.
        </footer>
        ${state.toast ? `<div class="toast">${esc(state.toast)}</div>` : ""}
      </div>
    `;
    bindGlobalActions();
  }

  function renderSetup() {
    const quiz = state.quiz || newQuiz("", []);
    state.quiz = quiz;
    quiz.phase = "setup";

    const incoming = state.incomingProfile;
    shell(`
      <div class="card">
        ${incoming ? `<p style="margin-bottom:12px"><strong>Comparing with ${esc(incoming.name || "someone")}</strong></p>` : ""}
        <h2>Map your palate</h2>
        <p>~50 questions about food preferences. Takes about 2 minutes.</p>

        <label for="setup-name">Your name</label>
        <input id="setup-name" type="text" maxlength="40" autocomplete="name" placeholder="Optional" value="${esc(quiz.name)}">

        <div class="section-label mt-16">Dietary restrictions</div>
        <div class="restrictions">
          ${RESTRICTIONS.map((r) => `
            <button class="restriction-btn ${quiz.restrictions.includes(r.id) || (r.id === "none" && !quiz.restrictions.length) ? "active" : ""}"
                    data-restriction="${r.id}">
              ${r.emoji} ${r.label}
            </button>
          `).join("")}
        </div>

        <button class="btn btn-primary" data-action="start-quiz">Start</button>
      </div>
    `);
    bindSetupEvents();
  }

  function renderQuizCard() {
    const quiz = state.quiz;
    const card = currentCard(quiz);
    if (!card) return finishQuiz();

    const progress = quizProgress(quiz);

    shell(`
      <div class="progress">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width: ${progress.pct}%"></div>
        </div>
        <div class="progress-meta">
          <span>${progress.phase === "cuisines" ? "Exploring cuisines" : progress.phase === "modes" ? "Digging into flavors" : "Testing your boundaries"} &middot; ${progress.current}/${progress.total}</span>
          ${progress.pct >= 40 ? `<button data-action="finish-early">I'm done</button>` : ""}
        </div>
      </div>

      <div class="quiz-item">
        ${card.context ? `<div class="context">${card.context.startsWith("You liked") || card.context.startsWith("Even though") || card.context.startsWith("Related to") ? "&#8627; " : ""}${esc(card.context)}</div>` : ""}
        <div class="quiz-icon">${card.iconKey ? ingredientIcon(card.iconKey, 64) : (card.cuisineId ? cuisineIcon(card.cuisineId, 64) : (card.modeRef ? modeIcon(card.modeRef, 64) : `<span class="emoji-fallback emoji-lg">${card.emoji}</span>`))}</div>
        <h2>${esc(card.label)}</h2>
        <p class="desc">${esc(card.desc)}</p>
        ${card.samples ? `
          <div class="samples">
            ${card.samples.map((s) => `<span>${ingredientIcon(s.key, 20)} ${esc(s.name)}</span>`).join("")}
          </div>
        ` : ""}
        ${quizInsight(state.quiz) ? `<div class="quiz-insight">${quizInsight(state.quiz)}</div>` : ""}
      </div>

      <div class="quiz-actions">
        <button class="btn btn-r1" data-answer="-2"><kbd>1</kbd> Hate</button>
        <button class="btn btn-r2" data-answer="-1"><kbd>2</kbd> Not for me</button>
        <button class="btn btn-r3" data-answer="0"><kbd>3</kbd> Okay</button>
        <button class="btn btn-r4" data-answer="1"><kbd>4</kbd> Good</button>
        <button class="btn btn-r5" data-answer="3"><kbd>5</kbd> Love</button>
      </div>
      <div class="skip-row">
        <button class="btn btn-skip" data-answer="unknown"><kbd>0</kbd> Haven't tried</button>
      </div>
    `);
    bindCardEvents();
  }

  function finishQuiz() {
    const quiz = state.quiz;
    if (!quiz) return renderSetup();

    const profile = buildProfile(quiz);
    saveProfile(profile);
    state.profile = profile;

    const answered = Object.keys(quiz.responses).length;

    const likeCount = Object.values(quiz.responses).filter((v) => typeof v === "number" && v > 0).length;
    const dislikeCount = Object.values(quiz.responses).filter((v) => typeof v === "number" && v < 0).length;
    const skipCount = Object.values(quiz.responses).filter((v) => v === "unknown").length;

    shell(`
      <div class="card text-center">
        <h2>All done</h2>
        <p class="done-stats">
          ${likeCount} things you like, ${dislikeCount} you don't${skipCount ? `, ${skipCount} to explore` : ""}
        </p>
        <button class="btn btn-primary mt-16" data-action="show-results">See my results</button>
      </div>
    `);

    document.querySelector('[data-action="show-results"]')?.addEventListener("click", () => {
      if (state.incomingProfile) {
        state.route = "compare";
        state.compareProfiles = [state.incomingProfile, profile];
        history.replaceState(null, "", compareUrl(state.incomingProfile, profile));
      } else {
        state.route = "profile";
        history.replaceState(null, "", profileUrl(profile));
      }
      render();
    });
  }

  function renderResults() {
    const profile = state.profile;
    if (!profile) return renderSetup();

    const daylist = generateDaylist(profile);
    const adventure = adventureScore(profile);
    const narrative = generateNarrative(profile);
    const affinities = cuisineAffinities(profile);
    const restaurants = suggestRestaurants(profile);
    const dishes = suggestDishes(profile);
    const name = profile.name || "Your";
    const namePossessive = profile.name ? esc(profile.name) + "'s" : "Your";

    const CUISINE_DISPLAY = {
      East_Asian: "East Asian", Southeast_Asian: "Southeast Asian",
      South_Asian: "South Asian", Mediterranean: "Mediterranean",
      Latin_American: "Latin American", Western_Atlantic: "Western / Comfort",
      Japanese: "Japanese",
    };
    const topCuisines = CUISINES
      .map((c) => ({ ...c, display: CUISINE_DISPLAY[c.id] || c.id, val: affinities[c.id] || 0 }))
      .filter((c) => c.val > 0)
      .sort((a, b) => b.val - a.val)
      .slice(0, 3);

    shell(`
      <div class="card">
        <div class="daylist">${esc(daylist)}</div>
        <div class="profile-sub">${namePossessive} taste profile</div>

        <p class="narrative">${esc(narrative)}</p>

        <div class="score-row">
          <div class="score-big">
            <div class="number">${adventure}</div>
            <div class="label">Adventure</div>
          </div>
          <div class="score-cuisines">
            ${topCuisines.map((c) => `
              <div class="cuisine-line">${cuisineIcon(c.id, 20)} ${c.display}</div>
            `).join("")}
            ${!topCuisines.length ? `<div class="cuisine-line">No strong cuisine preference</div>` : ""}
          </div>
        </div>

        ${restaurants.length ? `
          <div class="section-label">Where to eat</div>
          <div class="rest-grid">
            ${restaurants.slice(0, 5).map((r) => `<span class="rest-card">${restaurantIcon(r, 24)} ${esc(r.name)}</span>`).join("")}
          </div>
        ` : ""}

        ${dishes.length ? `
          <div class="section-label">What to order</div>
          <div class="dish-list">
            ${dishes.slice(0, 5).map((d) => `<span class="dish-chip">${esc(d.dish)}</span>`).join("")}
          </div>
        ` : ""}

        <div class="section-label">Share</div>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="share-invite">Invite a friend to compare</button>
          <button class="btn" data-action="share-profile">Copy profile link</button>
        </div>
      </div>
    `);
    bindResultsEvents();
  }

  function renderCompare() {
    const profiles = state.compareProfiles;
    if (!profiles || profiles.length < 2) return renderSetup();

    const [a, b] = profiles;
    const result = compareProfiles(a, b);
    const aName = a.name || "Person 1";
    const bName = b.name || "Person 2";

    const sharedRests = suggestSharedRestaurants(a, b);
    const sharedDishes = suggestSharedDishes(a, b);
    const avoidDishes = suggestAvoidDishes(a, b);

    shell(`
      <div class="card">
        <div class="compare-header">
          ${esc(aName)} <span class="vs">vs</span> ${esc(bName)}
        </div>

        <div class="score-big">
          <div class="number">${result.score}</div>
          <div class="label">Match Score</div>
        </div>

        ${sharedRests.length ? `
          <div class="section-label">Eat here together</div>
          <div class="rest-grid">
            ${sharedRests.slice(0, 6).map((r) => `<span class="rest-card">${restaurantIcon(r, 24)} ${esc(r.name)}</span>`).join("")}
          </div>
        ` : ""}

        ${sharedDishes.length ? `
          <div class="section-label">Order these</div>
          <div class="dish-list">
            ${sharedDishes.slice(0, 8).map((d) => `<span class="dish-chip">${esc(d.dish)}</span>`).join("")}
          </div>
        ` : ""}

        ${result.sharedLikes.length ? `
          <div class="section-label">You both love</div>
          <div class="food-grid">
            ${result.sharedLikes.map((f) => `<span class="food-tag">${responseIcon(f, 20)} ${esc(f.label)}</span>`).join("")}
          </div>
        ` : ""}

        ${avoidDishes.length ? `
          <div class="section-label">Skip these</div>
          <div class="dish-list">
            ${avoidDishes.slice(0, 5).map((d) => `
              <span class="dish-chip conflict">${esc(d.dish)}
                <small>${d.who === "a" ? esc(aName) + " won't eat this" : esc(bName) + " won't eat this"}</small>
              </span>
            `).join("")}
          </div>
        ` : ""}

        ${result.conflicts.length ? `
          <div class="section-label">Watch out</div>
          <div class="food-grid">
            ${result.conflicts.map((f) => `
              <span class="food-tag conflict">${responseIcon(f, 20)} ${esc(f.label)}
                <small>${f.who === "a" ? esc(aName) + " loves, " + esc(bName) + " doesn't" : esc(bName) + " loves, " + esc(aName) + " doesn't"}</small>
              </span>
            `).join("")}
          </div>
        ` : ""}

        ${result.bridges.length ? `
          <div class="section-label">Introduce each other to</div>
          <div class="food-grid">
            ${result.bridges.map((f) => `
              <span class="food-tag bridge">${responseIcon(f, 20)} ${esc(f.label)}
                <small>${f.from === "a" ? esc(aName) + " recommends" : esc(bName) + " recommends"}</small>
              </span>
            `).join("")}
          </div>
        ` : ""}

        <div class="btn-row mt-16">
          <button class="btn btn-primary" data-action="share-compare">Share comparison</button>
          <button class="btn" data-action="new-quiz">Take quiz</button>
        </div>
      </div>
    `);
    bindCompareEvents();
  }

  function renderHistory() {
    const profiles = loadProfiles();
    shell(`
      <div class="card">
        <h2>Saved profiles</h2>
        ${profiles.length ? `
          <div class="profile-list" style="margin-top:16px">
            ${profiles.map((p) => `
              <button class="profile-row" data-profile-id="${esc(p.id)}">
                <strong>${esc(p.name || "Unnamed")}</strong>
                <small>${new Date(p.t).toLocaleDateString()}</small>
              </button>
            `).join("")}
          </div>
        ` : `<p>No profiles yet. Take the quiz!</p>`}
        <div class="btn-row mt-16">
          <button class="btn btn-primary" data-action="new-quiz">New quiz</button>
        </div>
      </div>
    `);
    document.querySelectorAll("[data-profile-id]").forEach((el) => {
      el.addEventListener("click", () => {
        const profiles = loadProfiles();
        const profile = profiles.find((p) => p.id === el.dataset.profileId);
        if (profile) {
          state.route = "profile";
          state.profile = profile;
          history.replaceState(null, "", profileUrl(profile));
          render();
        }
      });
    });
  }

  // ─── EVENT BINDING ─────────────────────────────────────────────

  function bindGlobalActions() {
    document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", () => {
        const action = el.dataset.action;
        if (action === "new-quiz") {
          state.quiz = null;
          state.route = "quiz";
          state.incomingProfile = null;
          state.compareProfiles = null;
          state.profile = null;
          history.replaceState(null, "", baseUrl());
          render();
        }
        if (action === "history") {
          state.route = "history";
          render();
        }
      });
    });
  }

  function bindSetupEvents() {
    const nameInput = document.getElementById("setup-name");
    if (nameInput) {
      nameInput.addEventListener("input", () => {
        state.quiz.name = nameInput.value.trim().slice(0, 40);
      });
    }

    document.querySelectorAll("[data-restriction]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.restriction;
        const quiz = state.quiz;

        if (id === "none") {
          quiz.restrictions = [];
        } else {
          quiz.restrictions = quiz.restrictions.includes(id)
            ? quiz.restrictions.filter((r) => r !== id)
            : [...quiz.restrictions.filter((r) => r !== "none"), id];
        }
        document.querySelectorAll("[data-restriction]").forEach((b) => {
          b.classList.toggle("active", quiz.restrictions.includes(b.dataset.restriction) ||
            (b.dataset.restriction === "none" && !quiz.restrictions.length));
        });
      });
    });

    const startBtn = document.querySelector('[data-action="start-quiz"]');
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        const quiz = state.quiz;
        quiz.phase = "cuisines";
        quiz.queue = CUISINES.map((c) => ({
          id: "c:" + c.id,
          type: "cuisine",
          context: "Cuisine vibes",
          label: c.label,
          emoji: c.emoji,
          cuisineId: c.id,
          desc: c.desc,
        }));
        quiz.pos = 0;
        quiz.responses = {};
        quiz.modeCardsAdded = false;
        quiz.ingredientCardsAdded = false;
        quiz.probesInjected = new Set();
        render();
      });
    }
  }

  function bindCardEvents() {
    const finishBtn = document.querySelector('[data-action="finish-early"]');
    if (finishBtn) {
      finishBtn.addEventListener("click", () => {
        state.quiz.phase = "done";
        finishQuiz();
      });
    }

    document.querySelectorAll("[data-answer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const raw = btn.dataset.answer;
        const value = raw === "unknown" ? "unknown" : parseInt(raw);
        handleAnswer(value);
      });
    });

    initKeyboard();
  }

  function bindResultsEvents() {
    document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", () => {
        const action = el.dataset.action;
        if (action === "share-invite" && state.profile) {
          copyToClipboard(inviteUrl(state.profile), "Invite link copied!");
        }
        if (action === "share-profile" && state.profile) {
          copyToClipboard(profileUrl(state.profile), "Profile link copied!");
        }
      });
    });
  }

  function bindCompareEvents() {
    document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", () => {
        const action = el.dataset.action;
        if (action === "share-compare" && state.compareProfiles) {
          copyToClipboard(compareUrl(state.compareProfiles[0], state.compareProfiles[1]), "Comparison link copied!");
        }
        if (action === "new-quiz") {
          state.quiz = null;
          state.route = "quiz";
          state.incomingProfile = null;
          state.compareProfiles = null;
          state.profile = null;
          history.replaceState(null, "", baseUrl());
          render();
        }
      });
    });
  }

  // ─── CARD INTERACTION ──────────────────────────────────────────

  function handleAnswer(value) {
    respondToCard(state.quiz, value);

    if (state.quiz.phase === "done") {
      finishQuiz();
    } else {
      renderQuizCard();
    }
  }

  function initKeyboard() {
    function onKey(e) {
      if (!document.querySelector(".quiz-item")) {
        document.removeEventListener("keydown", onKey);
        return;
      }

      if (e.key === "1") { e.preventDefault(); handleAnswer(-2); }
      else if (e.key === "2") { e.preventDefault(); handleAnswer(-1); }
      else if (e.key === "3") { e.preventDefault(); handleAnswer(0); }
      else if (e.key === "4") { e.preventDefault(); handleAnswer(1); }
      else if (e.key === "5") { e.preventDefault(); handleAnswer(3); }
      else if (e.key === "0" || e.key === "s") { e.preventDefault(); handleAnswer("unknown"); }
    }
    document.addEventListener("keydown", onKey);
  }

  // ─── ROUTING ───────────────────────────────────────────────────

  function parseRoute() {
    const hash = location.hash.slice(1);
    if (!hash) {
      state.route = "quiz";
      state.quiz = null;
      return render();
    }

    try {
      if (hash.startsWith("take=")) {
        state.incomingProfile = decodePayload(hash.slice(5));
        state.quiz = newQuiz("", []);
        state.route = "quiz";
        return render();
      }
      if (hash.startsWith("profile=")) {
        state.profile = decodePayload(hash.slice(8));
        state.route = "profile";
        return render();
      }
      if (hash.startsWith("compare=")) {
        const parts = hash.slice(8).split(".");
        state.compareProfiles = [decodePayload(parts[0]), decodePayload(parts[1])];
        state.route = "compare";
        return render();
      }
    } catch (e) {
      showToast("Could not open that link");
    }

    state.route = "quiz";
    state.quiz = null;
    render();
  }

  // ─── UTILITIES ─────────────────────────────────────────────────

  function esc(str) {
    const div = document.createElement("div");
    div.textContent = String(str || "");
    return div.innerHTML;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function showToast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => {
      state.toast = "";
      const toastEl = document.querySelector(".toast");
      if (toastEl) toastEl.remove();
    }, 2500);
  }

  function copyToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text).then(
      () => showToast(successMsg || "Copied!"),
      () => showToast("Could not copy")
    );
  }

  // ─── INIT ──────────────────────────────────────────────────────

  try {
    epicure = await loadEpicure();
    const loading = document.querySelector(".loading");
    if (loading) loading.classList.add("hidden");
    parseRoute();
  } catch (e) {
    app.innerHTML = `
      <div class="shell">
        <div class="card" style="text-align:center">
          <h2>Failed to load</h2>
          <p>${esc(e.message)}</p>
          <p>Try refreshing.</p>
        </div>
      </div>
    `;
  }

  window.addEventListener("hashchange", parseRoute);

})();
