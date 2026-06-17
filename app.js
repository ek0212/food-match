(async function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // FOOD MATCH — Adaptive Epicure Tasting Quiz
  // Uses 1,790 ingredients and 150 modes from Epicure-Cooc
  // ═══════════════════════════════════════════════════════════════

  // ─── CONSTANTS ─────────────────────────────────────────────────

  const STORAGE_KEY = "food-match-v3";
  const INTRO_SEEN_KEY = "food-match-intro-seen";
  const VERSION = 3;
  const MAX_PROFILES = 12;
  // ─── DEBUG (developer-only) ────────────────────────────────────
  const DEBUG_STORAGE_KEY = "food-match-debug";
  const DEBUG_PARAM = "debug";
  const SEED_PARAM = "seed";
  const ROUTE_PARAM = "route";
  const ANSWERS_PARAM = "answers";
  const FIXTURE_PARAM = "fixture";
  const DEBUG_TAGS = ["data", "route", "quiz", "score", "share", "state"];
  // Fixture answer sequences for ?fixture=NAME. Values are applied in
  // order to whichever cards the deterministic quiz queue surfaces.
  // 1 = yes, -1 = no, "unknown" = unsure.
  const DEBUG_FIXTURES = {
    adventurous: {
      restrictions: [],
      answers: [1, 1, 1, -1, 1, "unknown", 1, 1, -1, 1, 1, 1, "unknown", 1, 1, -1, 1, 1, 1, 1],
    },
    picky: {
      restrictions: [],
      answers: [-1, -1, "unknown", -1, 1, -1, -1, -1, "unknown", 1, -1, -1, -1, "unknown", -1],
    },
    vegetarian: {
      restrictions: ["vegetarian"],
      answers: [1, 1, -1, 1, "unknown", 1, 1, -1, 1, 1, 1, 1, "unknown", 1, 1],
    },
    empty: {
      restrictions: [],
      answers: [],
    },
  };
  const DATASET_INGREDIENT_COUNT = 1790;
  const DATASET_MODE_COUNT = 150;
  const DATASET_EDGE_COUNT = "203,508";
  const DATASET_TOTAL_RESOURCE_ROWS = "4,696";
  const EPICURE_PAPER_URL = "https://arxiv.org/abs/2605.22391";
  const EPICURE_HELD_BACK_ASSETS = [
    { label: "The full recipe pages", detail: "The researchers counted patterns from 4.14M recipes, but the recipe text is not included." },
    { label: "The giant ingredient web", detail: "The public page tells us how big the web is, but not every connection is downloadable yet." },
    { label: "A region tag for every food", detail: "The dataset does not say that every ingredient belongs to one cuisine region." },
    { label: "Hidden training pieces", detail: "Some internal training details are kept out of the public file because this app does not need them." },
  ];
  const INTRO_STEP_COUNT = 4;
  const EPICURE_PAPER_DATE = "May 2026";
  const ANSWER_OPTIONS = [
    { value: 1, key: "1", label: "Yes", tone: "r4" },
    { value: -1, key: "0", label: "No", tone: "r1" },
  ];
  const ADVENTURE_MIN_CONTROVERSY = 3;
  const ADVENTURE_CREDITS = {
    "-2": 0,
    "-1": 0.18,
    0: 0.45,
    1: 0.78,
    3: 1,
  };
  const MODE_PROBE_SCAN_LIMIT = 60;
  const MODE_PROBE_COUNTS = {
    like: 3,
    pass: 1,
    unsure: 1,
  };
  const CUISINE_DIRECT_WEIGHT = 2;
  const CUISINE_MODE_WEIGHT = 0.8;
  const CUISINE_INGREDIENT_WEIGHT = 0.25;
  const ADVENTURE_BUCKETS = [
    { max: 25, label: "Cautious", caption: "You stick to the familiar." },
    { max: 55, label: "Curious", caption: "Open to trying, picky about what." },
    { max: 80, label: "Bold", caption: "Actively seeks new flavors." },
    { max: 100, label: "Wild", caption: "Loves the divisive stuff." },
  ];
  const CUISINE_BUCKETS = [
    { min: 3, label: "Strong lean", caption: "You consistently picked this region's foods." },
    { min: 1, label: "Mild lean", caption: "Some signal here, not your top region." },
    { min: -1, label: "Neutral", caption: "Few cues either way." },
    { min: -Infinity, label: "Avoid", caption: "You passed on most foods from this region." },
  ];
  const TASTE_QUIET_THRESHOLD = 3;
  const QUIZ_TARGET = 35;
  const MAPS_RESTRICTION_KEYWORDS = {
    vegetarian: "vegetarian",
    vegan: "vegan",
    no_gluten: "gluten free",
    no_dairy: "dairy free",
  };
  const INGREDIENT_ALIASES = {
    bonito_flake: "bonito_flakes",
    brie: "brie_cheese",
    camembert: "camembert_cheese",
    feta: "feta_cheese",
    gruyere: "gruyere_cheese",
    parmesan: "parmesan_cheese",
    tripe: "offal",
    za_atar: "zaatar",
  };
  const FEATURE_ALIASES = {
    black_sesame_seed: "black_sesame",
    bonito_flakes: "bonito_flake",
    brie_cheese: "brie",
    camembert_cheese: "camembert",
    feta_cheese: "feta",
    gruyere_cheese: "gruyere",
    matcha_powder: "matcha",
    parmesan_cheese: "parmesan",
    zaatar: "za_atar",
  };
  const app = document.getElementById("app");

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

  const CUISINE_DISPLAY = {
    East_Asian: "East Asian",
    Southeast_Asian: "Southeast Asian",
    South_Asian: "South Asian",
    Mediterranean: "Mediterranean",
    Latin_American: "Latin American",
    Western_Atlantic: "Western / Comfort",
    Japanese: "Japanese",
  };

  const CUISINE_EMOJI = {
    East_Asian: "\u{1F35C}",
    Southeast_Asian: "\u{1F35C}",
    South_Asian: "\u{1F35B}",
    Mediterranean: "\u{1FAD2}",
    Latin_American: "\u{1F32E}",
    Western_Atlantic: "\u{1F354}",
    Japanese: "\u{1F363}",
  };

  const CUISINE_KEYWORDS = {
    East_Asian: ["east asian", "east-asian", "chinese", "korean", "wok", "sichuan", "soy"],
    Southeast_Asian: ["southeast asian", "thai", "vietnamese", "indonesian", "laksa", "lemongrass", "coconut"],
    South_Asian: ["south asian", "south-asian", "indian", "masala", "curry", "dal", "tandoori"],
    Mediterranean: ["mediterranean", "italian", "greek", "turkish", "middle eastern", "zaatar", "olive"],
    Latin_American: ["latin american", "mexican", "tex-mex", "latin", "new world", "oaxacan", "chile"],
    Western_Atlantic: ["western", "american", "european", "atlantic", "french", "british", "comfort", "cheese"],
    Japanese: ["japanese", "dashi", "miso", "sushi", "ramen"],
  };

  const TASTE_DIMENSION_LABELS = {
    umami: "Umami",
    fresh: "Bright",
    rich: "Rich",
    spicy: "Spicy",
    sweet: "Sweet",
    earthy: "Earthy",
    funky: "Funky",
    herbal: "Herbal",
  };

  const {
    RESTRICTIONS,
    getIngredientTags,
    blockedTagsForRestrictions,
    isIngredientAllowed,
    isModeAllowed,
  } = window.FoodMatchRestrictions;

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
    galangal: ["\u{1FADA}", "Ginger-like rhizome, sharp and piney", 3],
    turmeric: ["\u{1FADA}", "Earthy, golden, mildly bitter spice", 2],
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
    ginger: ["\u{1FADA}", "Spicy, warming, zingy root", 1],
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
    onboardingStep: 0,
    onboardingComplete: (() => { try { return localStorage.getItem(INTRO_SEEN_KEY) === "1"; } catch { return false; } })(),
    toast: "",
    routeStack: [],
    lastRenderedRoute: null,
  };

  let epicure = null;
  let keyboardInitialized = false;

  // ─── SEEDED RNG (debug repro) ──────────────────────────────────
  // Mulberry32: deterministic when ?seed=N is set, otherwise seeded
  // from Date.now() so behavior matches Math.random() in production.

  function mulberry32(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let _rngFn = null;
  function dbgRng() {
    if (!_rngFn) {
      const seedParam = new URLSearchParams(location.search).get(SEED_PARAM);
      const seed = seedParam ? (Number(seedParam) >>> 0) : Date.now();
      _rngFn = mulberry32(seed);
    }
    return _rngFn();
  }

  // ─── DEBUG LOGGER (off unless ?debug=1 or localStorage flag) ───
  // Tagged console.groupCollapsed output for tracing without code
  // edits. Zero-cost when disabled (callers pass payload objects,
  // never template strings, so no string building happens).

  const DEBUG = (function () {
    try {
      const inUrl = new URLSearchParams(location.search).get(DEBUG_PARAM) === "1";
      const inStore = localStorage.getItem(DEBUG_STORAGE_KEY) === "1";
      return inUrl || inStore;
    } catch (e) {
      return false;
    }
  })();

  function noop() {}

  function makeDebugLogger() {
    const fns = {};
    DEBUG_TAGS.forEach((tag) => {
      fns[tag] = function (label, payload) {
        console.groupCollapsed("[" + tag + "] " + label);
        if (payload !== undefined) console.log(payload);
        console.groupEnd();
      };
    });
    return fns;
  }

  function makeNoopLogger() {
    const fns = {};
    DEBUG_TAGS.forEach((tag) => { fns[tag] = noop; });
    return fns;
  }

  const dbg = DEBUG ? makeDebugLogger() : makeNoopLogger();

  if (DEBUG) {
    // Live REPL handle for poking from devtools. Only exposed when
    // ?debug=1 or localStorage["food-match-debug"]=1 is set.
    window.__fm = {
      get state() { return state; },
      get epicure() { return epicure; },
      dbg,
      fixtures: DEBUG_FIXTURES,
      encodePayload: function (p) { return encodePayload(p); },
      decodePayload: function (s) { return decodePayload(s); },
    };
    console.log("[debug] Food Match debug mode on. window.__fm exposed. Tags:", DEBUG_TAGS);
  }

  // ─── DATA LAYER ────────────────────────────────────────────────

  async function loadEpicure() {
    dbg.data("fetch", { url: "data/epicure.json" });
    const resp = await fetch("data/epicure.json");
    const data = await resp.json();
    dbg.data("loaded", { ingredients: data.ingredients.length, modes: data.modes.length });
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
      if (m.property === "nova_level") return false;
      if (m.property.startsWith("usda_")) return false;
      if (m.kind === "binary" && !["fg_Pantry", "fg_Spice", "fg_Vegetable", "fg_Dairy"].includes(m.property)) return false;
      if (m.n < 15 || m.n > 250) return false;
      const l = m.label.toLowerCase();
      if (l.includes("spirit") || l.includes("liqueur") || l.includes("cocktail") || l.includes("beverage")) return false;
      if ((l.includes("confection") || l.includes("dessert") || l.includes("baking")) && !hasSavoryCue(m)) return false;
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
  // Restriction helpers live in restrictions.js so the Node test
  // runner can import them. See top of file for the destructured
  // import from window.FoodMatchRestrictions.

  function hasSavoryCue(mode) {
    const text = `${mode.label} ${mode.members.slice(0, 18).join(" ")}`.toLowerCase();
    const label = mode.label.toLowerCase();
    const hasSweetLabel = /sweet|dessert|confection|baking|pastry/.test(label);
    const hasFoodCue = /savory|umami|spice|spicy|chile|pepper|herb|cheese|seafood|fish|meat|vegetable|mushroom|pantry|stir|hot pot|broth|sauce|curry/.test(text);
    const hasSweetSafeCue = /savory|chile|pepper|cheese|sauce|curry/.test(label);
    const hasRegionCue = /mediterranean|asian|latin|mexican|chinese|japanese|korean|indian|thai|vietnamese/.test(text);
    if (hasSweetLabel) return hasSweetSafeCue;
    return hasFoodCue || hasRegionCue;
  }

  function modeFamily(mode) {
    if (mode.kind === "factor") return "Recipe cluster";
    if (mode.kind === "binary") return "Ingredient family";
    if (mode.property.startsWith("cf_")) return "Flavor pattern";
    if (mode.property.endsWith("_score")) return "Taste pattern";
    return "Recipe pattern";
  }

  function displayName(ingredient) {
    return ingredient
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function canonicalIngredientKey(ingredient) {
    return INGREDIENT_ALIASES[ingredient] || ingredient;
  }

  function featureForIngredient(ingredient) {
    return FEAT[ingredient] || FEAT[FEATURE_ALIASES[ingredient]];
  }

  function recommendationKeyMatches(set, key) {
    return set.has(key) || set.has(canonicalIngredientKey(key));
  }

  function isRecommendationKeyAllowed(key, restrictions) {
    return isIngredientAllowed(canonicalIngredientKey(key), restrictions);
  }

  function restaurantBlockedTags(restaurant, restrictions) {
    const blocked = blockedTagsForRestrictions(restrictions);
    if (!blocked.size) return [];

    const text = `${restaurant.name} ${restaurant.keys.join(" ")}`.toLowerCase();
    const tags = new Set();
    if (/steak|bbq|barbecue|korean bbq/.test(text)) tags.add("meat");
    if (/steak|beef|bone_marrow/.test(text)) tags.add("beef");
    if (/pork|bacon|ham|prosciutto|pancetta|chorizo/.test(text)) tags.add("pork");
    if (/sushi|sashimi|seafood|fish|salmon|tuna|dashi|bonito|eel/.test(text)) tags.add("fish");
    if (/seafood|shrimp|crab|lobster|oyster|clam|mussel|squid|octopus/.test(text)) tags.add("shellfish");
    if (/cheese|dairy|cream|butter|ghee/.test(text)) tags.add("dairy");
    if (/egg/.test(text)) tags.add("egg");

    return [...tags].filter((tag) => blocked.has(tag));
  }

  function ingredientEmoji(ingredient) {
    const f = featureForIngredient(ingredient);
    return f ? f[0] : fallbackIngredientEmoji(ingredient);
  }

  function fallbackIngredientEmoji(ingredient) {
    const n = ingredient.toLowerCase();
    if (/chile|chili|pepper|harissa|sambal|gochugaru|gochujang|sriracha|tabasco|mala/.test(n)) return "\u{1F336}\uFE0F";
    if (/cheese|dairy|milk|cream|yogurt|labneh|paneer|curd|whey|butter|ghee/.test(n)) return "\u{1F9C0}";
    if (/mushroom|truffle|fungus/.test(n)) return "\u{1F344}";
    if (/shrimp|prawn|crab|lobster|clam|mussel|oyster|scallop|squid|octopus|abalone|urchin|shellfish/.test(n)) return "\u{1F990}";
    if (/fish|salmon|tuna|cod|bass|trout|mackerel|sardine|anchovy|eel|bonito|dashi|seaweed|kelp|nori|wakame/.test(n)) return "\u{1F41F}";
    if (/beef|pork|bacon|ham|lamb|mutton|venison|duck|chicken|turkey|sausage|meat|bone|marrow|liver|tripe|offal/.test(n)) return "\u{1F969}";
    if (/leaf|herb|basil|mint|thyme|oregano|parsley|coriander|cilantro|rosemary|sage|tarragon|dill|chive|lemongrass/.test(n)) return "\u{1F33F}";
    if (/garlic|onion|shallot|scallion|ginger|galangal|turmeric|root/.test(n)) return "\u{1F9C4}";
    if (/tomato|tomatillo/.test(n)) return "\u{1F345}";
    if (/vegetable|greens|chard|artichoke|fennel|arugula|cabbage|lettuce|carrot|celery|okra|eggplant|radish|cucumber|beet|brussels|broccoli|spinach|kale/.test(n)) return "\u{1F96C}";
    if (/bean|lentil|pea|chickpea|soy|tofu|tempeh|miso|natto/.test(n)) return "\u{1FAD8}";
    if (/rice|noodle|pasta|wheat|bread|flour|grain|barley|rye|oat|millet|corn|tortilla/.test(n)) return "\u{1F35C}";
    if (/vinegar|citrus|lemon|lime|orange|yuzu|tamarind|sumac|sour|pickle|caper/.test(n)) return "\u{1F34B}";
    if (/berry|fruit|mango|lychee|durian|jackfruit|fig|date|apple|pear|peach|plum|melon|grape|pomegranate/.test(n)) return "\u{1F34A}";
    if (/nut|sesame|tahini|seed|almond|cashew|peanut|pistachio|hazelnut/.test(n)) return "\u{1F95C}";
    if (/oil|sauce|paste|condiment|stock|broth/.test(n)) return "\u{1F963}";
    if (/egg/.test(n)) return "\u{1F95A}";
    if (/flower|rose|lavender|saffron/.test(n)) return "\u{1F33A}";
    return "\u{1F37D}\uFE0F";
  }

  function emojiMark(emoji, size) {
    const px = Number.isFinite(size) ? Math.max(18, size) : 22;
    return `<span class="emoji-mark" style="--emoji-size:${px}px">${esc(emoji || "\u{1F37D}\uFE0F")}</span>`;
  }

  function ingredientIcon(ingredient, size) {
    return emojiMark(ingredientEmoji(ingredient), size);
  }

  function ingredientDesc(ingredient) {
    const f = featureForIngredient(ingredient);
    if (f) return f[1];
    const modes = epicure.ingredientModes[ingredient];
    if (modes && modes.length) {
      const mode = epicure.modeById[modes[0]];
      if (mode) return `From the world of ${mode.label.toLowerCase()}`;
    }
    return displayName(ingredient);
  }

  function ingredientControversy(ingredient) {
    const f = featureForIngredient(ingredient);
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
      topicKey: normalizeTopic(c.label),
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

  function backCard(quiz) {
    if (!quiz || quiz.pos <= 0) return false;
    quiz.pos--;
    if (quiz.phase === "done") {
      const card = quiz.queue[quiz.pos];
      if (card) {
        if (card.type === "cuisine") quiz.phase = "cuisines";
        else if (card.type === "ingredient") quiz.phase = "ingredients";
        else quiz.phase = "modes";
      }
    }
    return true;
  }

  function forwardCard(quiz) {
    if (!quiz) return false;
    const max = quiz.maxPos || 0;
    if (quiz.pos < max && quiz.pos + 1 <= quiz.queue.length) {
      quiz.pos++;
      return true;
    }
    return false;
  }

  function respondToCard(quiz, value) {
    const card = currentCard(quiz);
    if (!card) return;
    dbg.quiz("respond", { cardId: card.id, value, phase: quiz.phase, pos: quiz.pos });
    quiz.responses[card.id] = value;

    if (card.type === "mode" && !quiz.probesInjected.has(card.modeId)) {
      quiz.probesInjected.add(card.modeId);
      const answeredAfterThis = Object.keys(quiz.responses).length;
      const remainingSlots = Math.max(0, QUIZ_TARGET - answeredAfterThis);
      const probeCount = Math.min(modeProbeCount(value), remainingSlots);
      const branchAnswer = branchAnswerLabel(value);
      const reason = value > 0 ? "You liked: " + card.label : value < 0 ? "Even though you passed on: " + card.label : "Related to: " + card.label;
      const probes = selectProbesFromMode(card.modeId, probeCount, quiz, reason, branchAnswer);
      quiz.queue.splice(quiz.pos + 1, 0, ...probes);
    }

    quiz.pos++;
    quiz.maxPos = Math.max(quiz.maxPos || 0, quiz.pos);

    const answered = Object.keys(quiz.responses).length;

    if (answered >= QUIZ_TARGET) {
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
      } else if (!quiz.ingredientCardsAdded) {
        quiz.phase = "ingredients";
        quiz.ingredientCardsAdded = true;
        const ingCards = selectBoundaryIngredients(quiz);
        quiz.queue.push(...ingCards);
      }

      // Still not enough? Generate more ingredient cards to fill the gap
      if (quiz.pos >= quiz.queue.length && answered < QUIZ_TARGET) {
        const extra = selectExtraIngredients(quiz, QUIZ_TARGET - answered);
        quiz.queue.push(...extra);
      }

      // Truly nothing left to ask
      if (quiz.pos >= quiz.queue.length) {
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

  function modeProbeCount(value) {
    if (typeof value === "number" && value > 0) return MODE_PROBE_COUNTS.like;
    if (value === "unknown") return MODE_PROBE_COUNTS.unsure;
    return MODE_PROBE_COUNTS.pass;
  }

  function branchAnswerLabel(value) {
    if (typeof value === "number" && value > 0) return "yes branch";
    if (typeof value === "number" && value < 0) return "no guardrail";
    return "unsure branch";
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
    const seenThemes = {};
    const seenTopics = {};
    for (const s of scored) {
      const prop = s.mode.property;
      if ((seenProperties[prop] || 0) >= 2) continue;
      const theme = modeThemeKey(s.mode);
      if ((seenThemes[theme] || 0) >= 2) continue;
      const topic = modeTopicKey(s.mode);
      if (seenTopics[topic]) continue;
      seenProperties[prop] = (seenProperties[prop] || 0) + 1;
      seenThemes[theme] = (seenThemes[theme] || 0) + 1;
      seenTopics[topic] = true;
      picked.push(s.mode);
      if (picked.length >= 10) break;
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
    Object.entries(CUISINE_KEYWORDS).forEach(([cuisine, kws]) => {
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
    if (mode.kind === "factor") score += 2;
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
    if (label.includes("cocktail") || label.includes("liqueur") || label.includes("spirit")) score -= 4;
    if (label.includes("deli") || label.includes("sandwich")) score -= 1;
    if (label.includes("supper") || label.includes("comfort")) score -= 1;
    if (mode.n >= 30 && mode.n <= 120) score += 2;
    else if (mode.n > 200) score -= 1;
    return score;
  }

  function modeThemeKey(mode) {
    const label = mode.label.toLowerCase();
    if (/hot pot|dashi|seafood|fish|clam|shrimp|squid|oyster/.test(label)) return "seafood";
    if (/cheese|dairy|cream/.test(label)) return "dairy";
    if (/chile|pepper|spice|curry|masala|sichuan|mala/.test(label)) return "spice";
    if (/mushroom|earthy/.test(label)) return "mushroom";
    if (/herb|aromatic|botanical|minty|woody/.test(label)) return "aromatic";
    if (/ferment|soy|umami|pantry|sauce|condiment/.test(label)) return "pantry";
    if (/fruit|sweet|dessert|confection/.test(label)) return "sweet";
    return mode.property;
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

  function modePresentation(mode) {
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

    return { title, desc, cuisineTag };
  }

  function modeTopicKey(mode) {
    return normalizeTopic(modePresentation(mode).title);
  }

  function normalizeTopic(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function makeModeCard(mode) {
    const presentation = modePresentation(mode);

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
      label: presentation.title,
      emoji: modeEmoji(mode),
      desc: presentation.desc,
      context: presentation.cuisineTag,
      meta: `${modeFamily(mode)} · ${mode.n} ingredients`,
      topicKey: normalizeTopic(presentation.title),
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

  function modeIcon(mode, size) {
    return emojiMark(modeEmoji(mode), size);
  }

  function cuisineIcon(cuisineId, size) {
    return emojiMark(CUISINE_EMOJI[cuisineId] || "\u{1F37D}\uFE0F", size);
  }

  function extractCuisineFromLabel(label) {
    const match = label.match(/^(East[- ]?Asian|South[- ]?Asian|Southeast[- ]?Asian|Mediterranean|Latin[- ]?American|Mexican|Chinese|Japanese|Korean|Pan-Asian|Western|European|Tex-Mex|Cajun|Indonesian|Indian)/i);
    return match ? match[1] : null;
  }

  function selectProbesFromMode(modeId, count, quiz, reason, branchAnswer) {
    const mode = epicure.modeById[modeId];
    if (!mode || count <= 0) return [];

    const already = new Set(quiz.queue.map((c) => c.id));
    Object.keys(quiz.responses).forEach((k) => already.add(k));

    const candidates = mode.members
      .slice(0, MODE_PROBE_SCAN_LIMIT)
      .map((ing, idx) => ({ ing, rank: idx }))
      .filter((c) => !already.has("i:" + c.ing))
      .filter((c) => isIngredientAllowed(c.ing, quiz.restrictions))
      .filter((c) => !SKIP_SET.has(c.ing));

    const scored = candidates.map((c) => {
      let score = 0;
      const specificity = epicure.ingredientSpecificity[c.ing] || 10;
      if (featureForIngredient(c.ing)) score += 5;
      score += ingredientControversy(c.ing) * 1.2;
      score += Math.max(0, 8 - specificity) * 0.8;
      score += Math.max(0, 20 - c.rank) * 0.35;
      return { ing: c.ing, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const contextLabel = reason || mode.label;
    const branchLabel = modePresentation(mode).title;
    return scored.slice(0, count).map((s) => makeIngredientCard(s.ing, contextLabel, {
      type: "ingredient-probe",
      parentId: "m:" + modeId,
      parentLabel: branchLabel,
      parentAnswer: branchAnswer || null,
    }));
  }

  function selectBoundaryIngredients(quiz) {
    const already = new Set(quiz.queue.map((c) => c.id));
    Object.keys(quiz.responses).forEach((k) => already.add(k));

    const candidates = [];
    for (const featKey of Object.keys(FEAT)) {
      const ing = canonicalIngredientKey(featKey);
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
    return candidates.slice(0, boundaryCount).map((c) => makeIngredientCard(c.ing, "Wild card", {
      parentLabel: "Boundary check",
    }));
  }

  function selectExtraIngredients(quiz, count) {
    const already = new Set(quiz.queue.map((c) => c.id));
    Object.keys(quiz.responses).forEach((k) => already.add(k));

    const candidates = Object.keys(FEAT)
      .map((featKey) => canonicalIngredientKey(featKey))
      .filter((ing) => !already.has("i:" + ing))
      .filter((ing) => epicure.ingredients.has(ing))
      .filter((ing) => isIngredientAllowed(ing, quiz.restrictions))
      .filter((ing) => !SKIP_SET.has(ing))
      .map((ing) => ({ ing, score: ingredientControversy(ing) + (featureForIngredient(ing) ? 2 : 0) }))
      .sort((a, b) => b.score - a.score);

    return candidates.slice(0, count).map((c) => makeIngredientCard(c.ing, "Deep dive", {
      parentLabel: "Deep dive",
    }));
  }

  function makeIngredientCard(ingredient, context, options) {
    const opts = typeof options === "string" ? { type: options } : (options || {});
    return {
      id: "i:" + ingredient,
      type: opts.type || "ingredient",
      iconKey: ingredient,
      label: displayName(ingredient),
      emoji: ingredientEmoji(ingredient),
      desc: ingredientDesc(ingredient),
      context: context || null,
      parentId: opts.parentId || null,
      parentLabel: opts.parentLabel || null,
      parentAnswer: opts.parentAnswer || null,
      topicKey: normalizeTopic(ingredient),
    };
  }

  // ─── PROFILE ───────────────────────────────────────────────────

  function buildProfile(quiz) {
    dbg.score("build", { name: quiz.name, responses: quiz.responses });
    const id = "fm_" + Date.now().toString(36) + "_" + dbgRng().toString(36).slice(2, 7);
    const profile = {
      v: VERSION,
      id,
      name: quiz.name,
      t: new Date().toISOString(),
      restrictions: quiz.restrictions,
      responses: { ...quiz.responses },
    };
    dbg.score("built", { id: profile.id });
    return profile;
  }

  function cuisineAffinities(profile) {
    const affinities = {};
    buildCuisineEvidence(profile).forEach((row) => {
      affinities[row.id] = row.score;
    });
    return affinities;
  }

  function buildCuisineEvidence(profile) {
    const rows = {};
    CUISINES.forEach((c) => {
      rows[c.id] = {
        id: c.id,
        label: CUISINE_DISPLAY[c.id] || c.id,
        direct: null,
        cluster: 0,
        ingredient: 0,
        score: 0,
      };
    });

    Object.entries(profile.responses || {}).forEach(([id, value]) => {
      if (typeof value !== "number") return;

      if (id.startsWith("c:")) {
        const cuisineId = id.slice(2);
        if (rows[cuisineId]) rows[cuisineId].direct = value;
        return;
      }

      if (id.startsWith("m:")) {
        const mode = epicure ? epicure.modeById[id.slice(2)] : null;
        distributeCuisineEvidence(rows, modeCuisineIds(mode), value, CUISINE_MODE_WEIGHT, "cluster");
        return;
      }

      if (id.startsWith("i:")) {
        const ingredient = id.slice(2);
        const modes = epicure ? epicure.ingredientModes[ingredient] || [] : [];
        const evidenceModes = modes
          .map((modeId) => epicure ? epicure.modeById[modeId] : null)
          .map((mode) => ({ mode, cuisineIds: modeCuisineIds(mode) }))
          .filter((entry) => entry.cuisineIds.length)
          .slice(0, 4);
        const weight = evidenceModes.length ? CUISINE_INGREDIENT_WEIGHT / evidenceModes.length : 0;
        evidenceModes.forEach((entry) => {
          distributeCuisineEvidence(rows, entry.cuisineIds, value, weight, "ingredient");
        });
        distributeCuisineEvidence(rows, inferredCuisineIdsForIngredient(ingredient), value, CUISINE_INGREDIENT_WEIGHT, "ingredient");
      }
    });

    return Object.values(rows).map((row) => {
      const direct = row.direct == null ? 0 : row.direct * CUISINE_DIRECT_WEIGHT;
      return {
        ...row,
        cluster: roundSignal(row.cluster),
        ingredient: roundSignal(row.ingredient),
        score: roundSignal(direct + row.cluster + row.ingredient),
      };
    });
  }

  function distributeCuisineEvidence(rows, cuisineIds, value, weight, field) {
    if (!cuisineIds.length) return;
    const contribution = (value * weight) / cuisineIds.length;
    cuisineIds.forEach((cuisineId) => {
      if (rows[cuisineId]) rows[cuisineId][field] += contribution;
    });
  }

  function modeCuisineIds(mode) {
    if (!mode || !epicure) return [];
    const official = epicure.modeCuisines[mode.id] || [];
    const inferred = inferredCuisineIdsForMode(mode);
    return [...new Set([...official, ...inferred])];
  }

  function inferredCuisineIdsForMode(mode) {
    if (!mode) return [];
    const text = `${mode.label} ${mode.members.slice(0, 24).join(" ")}`.toLowerCase();
    return Object.entries(CUISINE_KEYWORDS)
      .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
      .map(([cuisineId]) => cuisineId);
  }

  function inferredCuisineIdsForIngredient(ingredient) {
    const text = ingredient.replace(/_/g, " ").toLowerCase();
    return Object.entries(CUISINE_KEYWORDS)
      .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
      .map(([cuisineId]) => cuisineId);
  }

  function roundSignal(value) {
    return Math.round(value * 10) / 10;
  }

  function adventureScore(profile) {
    return adventureBreakdown(profile).score;
  }

  function adventureBreakdown(profile) {
    let possible = 0;
    let earned = 0;
    let tested = 0;
    let accepted = 0;
    let neutral = 0;
    let passed = 0;
    let skipped = 0;

    Object.entries(profile.responses || {}).forEach(([id, value]) => {
      if (id.startsWith("i:")) {
        const ing = id.slice(2);
        const c = ingredientControversy(ing);
        if (c < ADVENTURE_MIN_CONTROVERSY) return;
        const credit = adventureCredit(value);
        if (credit == null) {
          skipped++;
          return;
        }
        possible += c;
        earned += c * credit;
        tested++;
        if (value > 0) accepted++;
        else if (value < 0) passed++;
        else neutral++;
      }
    });

    return {
      score: possible > 0 ? Math.round((earned / possible) * 100) : 50,
      earned,
      possible,
      tested,
      accepted,
      neutral,
      passed,
      skipped,
    };
  }

  function adventureCredit(value) {
    if (value === "unknown") return null;
    if (typeof value !== "number") return null;
    return ADVENTURE_CREDITS[value] ?? 0;
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
        modes
          .map((modeId) => epicure ? epicure.modeById[modeId] : null)
          .filter((mode) => mode && propertyMap[mode.property])
          .slice(0, 4)
          .forEach((mode) => {
            sig[propertyMap[mode.property]] += value * 0.25;
          });
      }
    });

    const max = Math.max(1, ...Object.values(sig));
    Object.keys(sig).forEach((k) => { sig[k] = Math.round((sig[k] / max) * 10); });
    return sig;
  }

  function adventureBucket(score) {
    return ADVENTURE_BUCKETS.find((b) => score <= b.max) || ADVENTURE_BUCKETS[ADVENTURE_BUCKETS.length - 1];
  }

  function cuisineBucket(score) {
    return CUISINE_BUCKETS.find((b) => score >= b.min) || CUISINE_BUCKETS[CUISINE_BUCKETS.length - 1];
  }

  function tasteSummary(taste) {
    const entries = Object.entries(taste)
      .map(([key, value]) => ({ key, value, label: TASTE_DIMENSION_LABELS[key] || key }))
      .filter((e) => e.value > 0)
      .sort((a, b) => b.value - a.value);
    if (!entries.length) return null;
    const dominant = entries[0];
    const secondary = entries.slice(1, 3).filter((e) => e.value > TASTE_QUIET_THRESHOLD);
    const quiet = entries.slice(1).filter((e) => e.value <= TASTE_QUIET_THRESHOLD);
    return {
      dominant: `Your strongest: ${dominant.label.toLowerCase()}`,
      secondary: secondary.length ? `Backed by: ${secondary.map((e) => e.label.toLowerCase()).join(", ")}` : null,
      quiet: quiet.length ? `Light on: ${quiet.map((e) => e.label.toLowerCase()).join(", ")}` : null,
    };
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

  const FRINGE_RECIPES = [
    {
      title: "Natto rice bowl",
      cuisine: "Japanese",
      keys: ["natto", "soy_sauce"],
      fringe: 8,
      note: "Sticky fermented soybeans over warm rice with soy, scallion, and mustard.",
    },
    {
      title: "Century egg congee",
      cuisine: "East_Asian",
      keys: ["century_egg", "ginger"],
      fringe: 8,
      note: "Silky rice porridge with preserved egg, ginger, and a little sesame oil.",
    },
    {
      title: "Sea urchin hand roll",
      cuisine: "Japanese",
      keys: ["sea_urchin", "nori"],
      fringe: 8,
      note: "Creamy uni wrapped with rice and seaweed, best as a small first bite.",
    },
    {
      title: "Stinky tofu with chili crisp",
      cuisine: "East_Asian",
      keys: ["stinky_tofu", "chili_oil"],
      fringe: 9,
      note: "A crunchy fermented tofu snack with heat, acid, and serious aroma.",
    },
    {
      title: "Laksa with shrimp paste",
      cuisine: "Southeast_Asian",
      keys: ["shrimp_paste", "coconut_milk", "lemongrass"],
      fringe: 7,
      note: "Coconut noodle soup with fermented seafood depth and bright herbs.",
    },
    {
      title: "Mapo tofu with fermented black beans",
      cuisine: "East_Asian",
      keys: ["sichuan_peppercorn", "fermented_black_bean", "tofu"],
      fringe: 6,
      note: "Numbing heat, soft tofu, and salty fermented bean sauce.",
    },
    {
      title: "Oysters with mignonette",
      cuisine: "Western_Atlantic",
      keys: ["oyster", "rice_vinegar"],
      fringe: 6,
      note: "Cold briny oysters with a sharp vinegar and shallot spoon sauce.",
    },
    {
      title: "Blue cheese fig toast",
      cuisine: "Western_Atlantic",
      keys: ["blue_cheese", "fig"],
      fringe: 6,
      note: "Sharp cheese, jammy fruit, and toast for a controlled funk test.",
    },
    {
      title: "Bone marrow toast",
      cuisine: "Western_Atlantic",
      keys: ["bone_marrow"],
      fringe: 7,
      note: "Roasted marrow spread on toast with herbs and something acidic.",
    },
    {
      title: "Tripe tacos in salsa roja",
      cuisine: "Latin_American",
      keys: ["tripe", "chipotle_pepper"],
      fringe: 7,
      note: "Chewy honeycomb tripe with smoky chile salsa and lime.",
    },
    {
      title: "Durian sticky rice",
      cuisine: "Southeast_Asian",
      keys: ["durian", "coconut_milk"],
      fringe: 9,
      note: "Creamy tropical fruit with coconut rice, sweet enough to soften the edge.",
    },
    {
      title: "Black garlic mushroom noodles",
      cuisine: "East_Asian",
      keys: ["black_garlic", "shiitake_mushroom"],
      fringe: 4,
      note: "Molasses-like aged garlic with earthy mushrooms and chewy noodles.",
    },
    {
      title: "Balut with chili vinegar",
      cuisine: "Southeast_Asian",
      keys: ["balut", "chili_oil", "rice_vinegar"],
      fringe: 10,
      note: "A tiny, high-commitment street-food taste with acid and heat.",
    },
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
    const restrictions = profile.restrictions || [];

    return RESTAURANTS.map((r) => {
      const allowedKeys = r.keys.filter((key) => isRecommendationKeyAllowed(key, restrictions));
      if (!allowedKeys.length) return null;

      const blockedKeys = r.keys.filter((key) => !isRecommendationKeyAllowed(key, restrictions));
      const blockedTags = restaurantBlockedTags(r, restrictions);
      const blockedCount = blockedKeys.length + blockedTags.length;
      if (blockedCount > allowedKeys.length) return null;

      let score = 0;
      r.cuisines.forEach((c) => { score += Math.max(0, affinities[c] || 0) * 2; });
      if (r.cuisines.length === 0) score += 1;
      const hits = allowedKeys.filter((k) => recommendationKeyMatches(liked, k));
      const misses = allowedKeys.filter((k) => recommendationKeyMatches(disliked, k));
      score += hits.length * 3;
      score -= misses.length * 4;
      score -= blockedCount * 3;
      return { ...r, score, hits: hits.length, hitKeys: hits, misses: misses.length, missKeys: misses, blockedCount };
    })
    .filter(Boolean)
    .filter((r) => r.score > 1 && (r.hits >= 1 || (r.cuisines.length > 0 && r.blockedCount === 0)))
    .sort((a, b) => b.score - a.score);
  }

  function suggestDishes(profile) {
    const liked = profileLikedIngredients(profile);
    const disliked = profileDislikedIngredients(profile);
    const affinities = cuisineAffinities(profile);
    const restrictions = profile.restrictions || [];

    return DISH_BANK.map((d) => {
      if (!d.triggers.every((key) => isRecommendationKeyAllowed(key, restrictions))) return null;
      const hits = d.triggers.filter((t) => recommendationKeyMatches(liked, t));
      const misses = d.triggers.filter((t) => recommendationKeyMatches(disliked, t));
      if (misses.length > 0 || hits.length === 0) return null;
      let score = hits.length * 3;
      score += Math.max(0, affinities[d.cuisine] || 0);
      return { ...d, score, hitKeys: hits };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  }

  function suggestFringeRecipes(profile) {
    const liked = profileLikedIngredients(profile);
    const disliked = profileDislikedIngredients(profile);
    const affinities = cuisineAffinities(profile);
    const adventure = adventureScore(profile);
    const restrictions = profile.restrictions || [];

    return FRINGE_RECIPES
      .map((recipe) => {
        const blocked = recipe.keys.some((key) => !isRecommendationKeyAllowed(key, restrictions));
        const misses = recipe.keys.filter((key) => recommendationKeyMatches(disliked, key));
        if (blocked || misses.length) return null;

        const hits = recipe.keys.filter((key) => recommendationKeyMatches(liked, key));
        const cuisineScore = Math.max(0, affinities[recipe.cuisine] || 0);
        const adventureFit = 100 - Math.abs(adventure - recipe.fringe * 10);
        let score = recipe.fringe + hits.length * 8 + cuisineScore * 2 + adventureFit / 20;
        if (!hits.length && cuisineScore <= 0) score -= 5;
        if (adventure < 35 && recipe.fringe >= 8) score -= 6;

        return {
          ...recipe,
          score,
          hitKeys: hits,
          reason: fringeRecipeReason(recipe, hits, cuisineScore),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  function fringeRecipeReason(recipe, hits, cuisineScore) {
    if (hits.length) return `Matches: ${formatIngredientList(hits, 3)}`;
    if (cuisineScore > 0) return `Fits your ${CUISINE_DISPLAY[recipe.cuisine] || recipe.cuisine} direction`;
    return "A controlled edge pick with no known hard pass";
  }

  function suggestSharedRestaurants(a, b) {
    const aRecs = suggestRestaurants(a);
    const bRecs = suggestRestaurants(b);
    const bMap = {};
    bRecs.forEach((r) => { bMap[r.name] = r; });

    return aRecs
      .filter((r) => bMap[r.name])
      .map((r) => ({ ...r, score: r.score + bMap[r.name].score, hitKeys: [...new Set([...(r.hitKeys || []), ...(bMap[r.name].hitKeys || [])])] }))
      .sort((x, y) => y.score - x.score);
  }

  function suggestSharedDishes(a, b) {
    const aLiked = profileLikedIngredients(a);
    const bLiked = profileLikedIngredients(b);
    const aDisliked = profileDislikedIngredients(a);
    const bDisliked = profileDislikedIngredients(b);
    const restrictions = [...(a.restrictions || []), ...(b.restrictions || [])];

    return DISH_BANK.map((d) => {
      if (!d.triggers.every((key) => isRecommendationKeyAllowed(key, restrictions))) return null;
      const aHits = d.triggers.filter((t) => recommendationKeyMatches(aLiked, t));
      const bHits = d.triggers.filter((t) => recommendationKeyMatches(bLiked, t));
      const anyMiss = d.triggers.some((t) => recommendationKeyMatches(aDisliked, t) || recommendationKeyMatches(bDisliked, t));
      if (anyMiss || aHits.length === 0 || bHits.length === 0) return null;
      return { ...d, score: aHits.length + bHits.length, hitKeys: [...new Set([...aHits, ...bHits])] };
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
      const aWants = d.triggers.filter((t) => recommendationKeyMatches(aLiked, t)).length;
      const bWants = d.triggers.filter((t) => recommendationKeyMatches(bLiked, t)).length;
      const aHates = d.triggers.filter((t) => recommendationKeyMatches(aDisliked, t)).length;
      const bHates = d.triggers.filter((t) => recommendationKeyMatches(bDisliked, t)).length;
      if ((aWants > 0 && bHates > 0) || (bWants > 0 && aHates > 0)) {
        const who = aHates > 0 ? "a" : "b";
        return { ...d, who };
      }
      return null;
    })
    .filter(Boolean);
  }

  // ─── RESTAURANT SEARCH PROMPTS ─────────────────────────────────

  function buildPersonalRestaurantPrompt(profile) {
    const name = profile.name || "me";
    const liked = promptResponseLabels(profile, (id, v) => typeof v === "number" && v > 0, 12);
    const disliked = promptResponseLabels(profile, (id, v) => typeof v === "number" && v < 0, 8);
    const cuisines = promptCuisineLabels(profile, 5);
    const taste = promptTasteLabels(profile, 4);
    const restaurants = suggestRestaurants(profile).slice(0, 6).map((r) => r.name);
    const dishes = suggestDishes(profile).slice(0, 8).map((d) => d.dish);
    const fringeRecipes = suggestFringeRecipes(profile).map((r) => r.title);
    const restrictions = promptRestrictionLabels(profile);
    const adventure = adventureBreakdown(profile);
    const mapsQuery = personalMapsQuery(profile, cuisines, dishes);

    const text = [
      `I am looking for restaurants near me for ${name}. Use my current location in Google Maps or Ask Maps, then suggest specific places and explain why each one fits.`,
      "",
      "My strongest food signals:",
      `- Cuisines or regions I seem pulled toward: ${formatPromptList(cuisines, "No clear region yet")}.`,
      `- Foods and flavors I like: ${formatPromptList(liked, "No strong likes yet")}.`,
      `- Flavor center: ${formatPromptList(taste, "No clear flavor center yet")}.`,
      `- Foods I want to avoid or treat carefully: ${formatPromptList(disliked, "No hard passes captured")}.`,
      `- Dietary boundaries: ${formatPromptList(restrictions, "No restrictions")}.`,
      `- Adventure level: ${adventureBucket(adventure.score).label} — ${adventureBucket(adventure.score).caption} ${adventureCopy(adventure)}`,
      "",
      "Things I am excited to try:",
      `- Dish directions: ${formatPromptList(dishes, "Use the cuisine and ingredient signals instead")}.`,
      `- Stretch picks if the restaurant is especially good: ${formatPromptList(fringeRecipes, "Keep recommendations familiar")}.`,
      "",
      "Restaurant search instructions:",
      "- Prioritize places with recent good reviews, enough menu evidence, and dishes matching the signals above.",
      "- Give me 5 nearby options, each with the specific dishes I should order.",
      "- Avoid places where the likely menu leans heavily into my pass list.",
      "- Include one safer familiar pick and one more adventurous pick.",
      "- Return the answer in a table with restaurant name, why it fits, dishes to order, what to avoid, and Google Maps action.",
    ].join("\n");

    return { text, mapsQuery };
  }

  function buildCompatibilityRestaurantPrompt(a, b) {
    const aName = a.name || "Person 1";
    const bName = b.name || "Person 2";
    const result = compareProfiles(a, b);
    const sharedRestaurants = suggestSharedRestaurants(a, b).slice(0, 6).map((r) => r.name);
    const sharedDishes = suggestSharedDishes(a, b).slice(0, 8).map((d) => d.dish);
    const avoidDishes = suggestAvoidDishes(a, b).slice(0, 6).map((d) => d.dish);
    const sharedLikes = result.sharedLikes.map((item) => item.label).slice(0, 12);
    const sharedDirections = result.sharedDirections.map((item) => item.label).slice(0, 6);
    const conflicts = result.conflicts.map((item) => item.label).slice(0, 10);
    const bridges = result.bridges.map((item) => item.label).slice(0, 10);
    const aCuisines = promptCuisineLabels(a, 3);
    const bCuisines = promptCuisineLabels(b, 3);
    const mapsQuery = sharedMapsQuery(a, b, aCuisines, bCuisines, sharedDishes);

    const text = [
      `Where should ${aName} and ${bName} go together? Use our current location in Google Maps or Ask Maps, then recommend restaurants that satisfy both profiles.`,
      "",
      "Shared fit:",
      `- Match score: ${result.score}/100.`,
      `- Things we both like or can safely build around: ${formatPromptList(sharedLikes, "No exact overlaps yet")}.`,
      `- Shared cuisine or regional directions: ${formatPromptList(sharedDirections, "No shared region signal yet")}.`,
      `- Shared dish directions: ${formatPromptList(sharedDishes, "Use cuisine and ingredient signals instead")}.`,
      `- Restaurant categories already suggested by the matcher: ${formatPromptList(sharedRestaurants, "No confident shared restaurant category yet")}.`,
      "",
      "Individual pulls:",
      `- ${aName}: ${formatPromptList(aCuisines, "No strong region yet")}.`,
      `- ${bName}: ${formatPromptList(bCuisines, "No strong region yet")}.`,
      "",
      "Watch-outs:",
      `- Direct conflicts: ${formatPromptList(conflicts, "No direct conflicts")}.`,
      `- Risky dishes to avoid: ${formatPromptList(avoidDishes, "No risky dishes flagged")}.`,
      `- Bridge foods one person can introduce to the other: ${formatPromptList(bridges, "No bridge foods yet")}.`,
      "",
      "Restaurant search instructions:",
      "- Give us 5 nearby restaurants where both people have credible menu options.",
      "- For each place, name what each person should order and one shared plate if possible.",
      "- Penalize restaurants where a signature dish conflicts with either profile.",
      "- Include one safe compromise and one interesting stretch option.",
      "- Return the answer in a table with restaurant name, why it works for both, suggested orders, conflict risks, and Google Maps action.",
    ].join("\n");

    return { text, mapsQuery };
  }

  function promptResponseLabels(profile, filter, limit) {
    return topResponses(profile, filter)
      .map((item) => item.label)
      .slice(0, limit);
  }

  function promptCuisineLabels(profile, limit) {
    return buildCuisineEvidence(profile)
      .filter((row) => row.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((row) => row.label);
  }

  function promptTasteLabels(profile, limit) {
    const taste = tasteSignature(profile);
    return Object.entries(taste)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key]) => TASTE_DIMENSION_LABELS[key] || key);
  }

  function promptRestrictionLabels(profile) {
    const ids = profile.restrictions || [];
    if (!ids.length) return [];
    return ids
      .map((id) => RESTRICTIONS.find((restriction) => restriction.id === id))
      .filter(Boolean)
      .map((restriction) => restriction.label);
  }

  function formatPromptList(items, fallback) {
    return items.length ? items.join(", ") : fallback;
  }

  function mapsRestrictionPrefix(profile) {
    const ids = profile && profile.restrictions ? profile.restrictions : [];
    for (const id of ids) {
      if (MAPS_RESTRICTION_KEYWORDS[id]) return MAPS_RESTRICTION_KEYWORDS[id];
    }
    return "";
  }

  function personalMapsQuery(profile, cuisines, dishes) {
    const restriction = mapsRestrictionPrefix(profile);
    let lead = "";
    if (cuisines && cuisines.length) {
      lead = cuisines.slice(0, 2).join(" or ");
    } else if (dishes && dishes.length) {
      lead = dishes[0];
    } else {
      lead = "highly rated";
    }
    return joinMapsParts([restriction, lead, "restaurants near me"]);
  }

  function sharedMapsQuery(a, b, aCuisines, bCuisines, sharedDishes) {
    const restriction = mapsRestrictionPrefix(a) || mapsRestrictionPrefix(b);
    const combinedCuisines = [];
    (aCuisines || []).forEach((c) => { if (!combinedCuisines.includes(c)) combinedCuisines.push(c); });
    (bCuisines || []).forEach((c) => { if (!combinedCuisines.includes(c)) combinedCuisines.push(c); });

    let lead = "";
    if (combinedCuisines.length) {
      lead = combinedCuisines.slice(0, 2).join(" or ");
    } else if (sharedDishes && sharedDishes.length) {
      lead = sharedDishes[0];
    } else {
      lead = "highly rated";
    }
    return joinMapsParts([restriction, lead, "restaurants near me"]);
  }

  function joinMapsParts(parts) {
    return parts
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function googleMapsSearchUrl(query) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query || "restaurants near me");
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

    const sharedDirections = sharedCuisineDirections(a, b);
    const sharedRestaurantCount = suggestSharedRestaurants(a, b).length;
    const sharedDishCount = suggestSharedDishes(a, b).length;
    const totalAnswered = new Set([...Object.keys(a.responses), ...Object.keys(b.responses)]).size;
    const overlapBonus = sharedLikes.length * 4;
    const nicheBonus = sharedLikes.filter((id) => id.startsWith("i:") && ingredientControversy(id.slice(2)) >= 4).length * 3;
    const directionBonus = Math.min(20, sharedDirections.reduce((sum, item) => sum + Math.min(6, item.score * 3), 0));
    const restaurantBonus = Math.min(18, sharedRestaurantCount * 3);
    const dishBonus = Math.min(12, sharedDishCount * 4);
    const conflictPenalty = conflicts.length * 7;
    const baseScore = totalAnswered > 0 ? Math.round((sharedLikes.length / Math.max(1, Math.min(aLikes.size, bLikes.size))) * 42) : 50;
    const score = Math.max(0, Math.min(100, Math.round(baseScore + overlapBonus + nicheBonus + directionBonus + restaurantBonus + dishBonus - conflictPenalty)));

    return {
      score,
      sharedLikes: sharedLikes.map(responseInfo),
      sharedDirections,
      conflicts: conflicts.map((c) => ({ ...responseInfo(c.id), who: c.who })),
      bridges: bridges.slice(0, 8).map((b) => ({ ...responseInfo(b.id), from: b.from })),
    };
  }

  function sharedCuisineDirections(a, b) {
    const bRows = {};
    buildCuisineEvidence(b).forEach((row) => { bRows[row.id] = row; });

    return buildCuisineEvidence(a)
      .map((row) => {
        const other = bRows[row.id];
        const score = other ? Math.min(row.score, other.score) : 0;
        return {
          id: "direction:" + row.id,
          label: row.label,
          emoji: CUISINE_EMOJI[row.id] || "\u{1F37D}\uFE0F",
          type: "direction",
          score,
        };
      })
      .filter((row) => row.score > 0.1)
      .sort((x, y) => y.score - x.score)
      .slice(0, 5);
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
    const modeLikes = [];
    const modeDislikes = [];
    Object.entries(quiz.responses).forEach(([id, v]) => {
      if (typeof v === "number" && v > 0) {
        if (id.startsWith("c:")) {
          const c = CUISINES.find((x) => "c:" + x.id === id);
          if (c) likes.push(c.label.split(",")[0]);
        }
        if (id.startsWith("m:")) {
          const mode = epicure ? epicure.modeById[id.slice(2)] : null;
          if (mode) modeLikes.push(modePresentation(mode).title);
        }
      }
      if (typeof v === "number" && v < 0) {
        if (id.startsWith("c:")) {
          const c = CUISINES.find((x) => "c:" + x.id === id);
          if (c) dislikes.push(c.label.split(",")[0]);
        }
        if (id.startsWith("m:")) {
          const mode = epicure ? epicure.modeById[id.slice(2)] : null;
          if (mode) modeDislikes.push(modePresentation(mode).title);
        }
      }
    });

    if (quiz.phase === "cuisines" && answered >= 3 && likes.length) {
      return `Picking up on your love for ${likes.slice(0, 2).join(" and ")}...`;
    }

    if (quiz.phase === "modes" || quiz.phase === "ingredients") {
      const current = currentCard(quiz);
      if (current && current.type === "ingredient-probe" && current.parentLabel) {
        return `Testing ${current.label} inside ${current.parentLabel} so one broad answer does not overgeneralize.`;
      }

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
      if (modeLikes.length) {
        return `Deepening your ${modeLikes[modeLikes.length - 1].toLowerCase()} yes with sharper ingredient checks.`;
      }
      if (modeDislikes.length) {
        return `Using your ${modeDislikes[modeDislikes.length - 1].toLowerCase()} pass as a guardrail.`;
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

  function generateHeroSummary(profile) {
    const adventure = adventureScore(profile);
    const advLabel = adventure > 65 ? "Adventurous" : adventure > 35 ? "Open-minded" : "Comfort-leaning";

    const affinities = cuisineAffinities(profile);
    const CUISINE_NAMES = {
      East_Asian: "East Asian", Southeast_Asian: "Southeast Asian",
      South_Asian: "South Asian", Mediterranean: "Mediterranean",
      Latin_American: "Latin American", Western_Atlantic: "Western comfort food",
      Japanese: "Japanese",
    };
    const sorted = Object.entries(affinities).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    if (top && top[1] > 0) {
      return `${advLabel}, leans ${CUISINE_NAMES[top[0]] || top[0]}.`;
    }
    return `${advLabel} eater.`;
  }

  function adventureCopy(details) {
    if (details.tested <= 0) {
      return "Not enough divisive ingredient answers yet, so the score starts at 50.";
    }
    return `You said yes to ${details.accepted} of the ${details.tested} most-polarizing foods you answered.`;
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

  function hasSeenIntro() {
    try { return localStorage.getItem(INTRO_SEEN_KEY) === "1"; }
    catch { return false; }
  }

  function markIntroSeen() {
    try { localStorage.setItem(INTRO_SEEN_KEY, "1"); }
    catch { /* storage unavailable */ }
  }

  // ─── URL ENCODING ─────────────────────────────────────────────

  function encodePayload(payload) {
    dbg.share("encode", payload);
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    let binary = "";
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  }

  function decodePayload(str) {
    const padded = str.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(str.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    dbg.share("decode", payload);
    return payload;
  }

  function baseUrl() { return location.href.split("#")[0]; }
  function profileUrl(profile) { return baseUrl() + "#profile=" + encodePayload(profile); }
  function inviteUrl(profile) { return baseUrl() + "#take=" + encodePayload(profile); }
  function compareUrl(a, b) { return baseUrl() + "#compare=" + encodePayload(a) + "." + encodePayload(b); }

  // ─── RENDERING ─────────────────────────────────────────────────

  function render() {
    dbg.state("render", { route: state.route, phase: state.quiz && state.quiz.phase, onboardingStep: state.onboardingStep });
    const routeChanged = state.lastRenderedRoute && state.route !== state.lastRenderedRoute;
    if (routeChanged) {
      state.routeStack.push(state.lastRenderedRoute);
      if (state.routeStack.length > 20) state.routeStack.shift();
    }
    state.lastRenderedRoute = state.route;
    if (routeChanged) {
      try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }
      catch { window.scrollTo(0, 0); }
    }
    if (state.route === "profile") return renderResults();
    if (state.route === "compare") return renderCompare();
    if (state.route === "history") return renderHistory();
    if (shouldShowOnboarding()) return renderOnboarding();
    if (!state.quiz) return renderSetup();
    if (state.quiz.phase === "done") return finishQuiz();
    if (state.quiz.phase === "setup") return renderSetup();
    renderQuizCard();
  }

  function shell(content) {
    const onLanding = shouldShowOnboarding() || !state.quiz || state.quiz.phase === "setup";
    const onHistory = state.route === "history";
    const navButtons = [];
    if (state.routeStack.length) navButtons.push(`<button data-action="nav-back" aria-label="Back to previous screen">&larr; Back</button>`);
    if (!onLanding) navButtons.push(`<button data-action="new-quiz">Retake</button>`);
    if (!onHistory) navButtons.push(`<button data-action="history">Profiles</button>`);

    app.innerHTML = `
      <div class="shell">
        <header class="header">
          <button class="brand-lockup" data-action="home" aria-label="Go to home page">
            <div class="brand-mark" aria-hidden="true">\u{1F37D}\uFE0F</div>
            <div>
              <h1>Food Match</h1>
              <span>Recipe-map taste matcher</span>
            </div>
          </button>
          ${navButtons.length ? `<nav>${navButtons.join("")}</nav>` : ""}
        </header>
        ${content}
        <footer class="footer">
          Built on an <a href="${EPICURE_PAPER_URL}" target="_blank" rel="noopener">open research dataset</a> of ingredient pairings in real recipes.
        </footer>
        ${state.toast ? `<div class="toast">${esc(state.toast)}</div>` : ""}
      </div>
    `;
    bindGlobalActions();
  }

  function shouldShowOnboarding() {
    return state.route === "quiz" && !state.onboardingComplete && !state.incomingProfile;
  }

  function renderOnboarding() {
    const step = Math.max(0, Math.min(state.onboardingStep, INTRO_STEP_COUNT - 1));
    shell(`
      <section class="intro-layout" aria-label="App introduction">
        <div class="intro-main">
          <div class="intro-progress" aria-label="Intro step ${step + 1} of ${INTRO_STEP_COUNT}">
            ${Array.from({ length: INTRO_STEP_COUNT }, (_, i) => `
              <span class="intro-dot ${i === step ? "active" : ""}"></span>
            `).join("")}
          </div>
          ${introMain(step)}
          <div class="intro-actions">
            <button class="btn btn-cta" data-action="intro-next">${step === INTRO_STEP_COUNT - 1 ? "Start quiz" : "Next"}</button>
            <button class="btn btn-quiet" data-action="intro-skip">Skip intro</button>
          </div>
        </div>
        <aside class="intro-side">
          ${introSide(step)}
        </aside>
      </section>
    `);
  }

  function introMain(step) {
    if (step === 1) {
      return `
        <div class="intro-copy">
          <div class="eyebrow">How to play</div>
          <h2>Yes, No, or Unsure.</h2>
          <p>Tap, or press <kbd>1</kbd> / <kbd>0</kbd> / <kbd>Space</kbd>.</p>
        </div>
      `;
    }

    if (step === 2) {
      return `
        <div class="intro-copy">
          <div class="eyebrow">How it works</div>
          <h2>Built on a recipe map.</h2>
          <p>From <a href="${EPICURE_PAPER_URL}" target="_blank" rel="noopener"><span class="intro-red">Epicure</span></a> (${EPICURE_PAPER_DATE}): 4.14M recipes &rarr; 1,790 ingredients in 150 neighborhoods.</p>
        </div>
      `;
    }

    if (step === 3) {
      return `
        <div class="intro-copy">
          <div class="eyebrow">What you get</div>
          <h2>Your taste, mapped.</h2>
          <p>Loves, passes, things to try, restaurants to share, friend compatibility.</p>
        </div>
      `;
    }

    return `
      <div class="intro-copy">
        <div class="eyebrow">Why</div>
        <h2>Find foods you both want to eat.</h2>
        <p>Quick yes/no quiz. Share with a friend, compare tastes.</p>
      </div>
    `;
  }

  function introSide(step) {
    if (step === 1) {
      return `
        <div class="flow-stack">
          ${flowStep("1", "Yes")}
          ${flowStep("0", "No")}
          ${flowStep("_", "Unsure")}
        </div>
      `;
    }

    if (step === 2) {
      return `
        <div class="flow-stack">
          <div class="flow-step"><b>1</b><span>Cuisines first: pick <span class="intro-red">recipe families</span>.</span></div>
          <div class="flow-step"><b>2</b><span>Yes pulls in a neighborhood; no fences it off.</span></div>
          <div class="flow-step"><b>3</b><span><span class="intro-red">Edge ingredients</span> separate dislikes from generalizations.</span></div>
        </div>
      `;
    }

    if (step === 3) {
      return `
        <div class="flow-stack">
          ${flowStep("\u{2764}", "Loves")}
          ${flowStep("\u{2715}", "Hard passes")}
          ${flowStep("?", "Worth trying")}
          ${flowStep("\u{1F37D}", "Restaurant ideas")}
          ${flowStep("\u{1F465}", "Friend compatibility")}
        </div>
      `;
    }

    return `
      <div class="flow-stack">
        ${flowStep("1", "Answer ~20 foods.")}
        ${flowStep("2", "See your taste map.")}
        ${flowStep("3", "Send to a friend.")}
      </div>
    `;
  }

  function factRow(value, label) {
    return `
      <div class="intro-fact">
        <strong>${esc(value)}</strong>
        <span>${esc(label)}</span>
      </div>
    `;
  }

  function flowStep(value, label) {
    return `
      <div class="flow-step">
        <b>${esc(value)}</b>
        <span>${esc(label)}</span>
      </div>
    `;
  }

  function renderEpicureAnalysisBoard() {
    return `
      <div class="analysis-board" aria-label="Recipe dataset visual analysis">
        ${renderDatasetFunnel()}
        ${renderModeKindMix()}
        ${renderModeSizeHistogram()}
      </div>
    `;
  }

  function renderDatasetFunnel() {
    const rows = [
      { value: "4.14M", label: "recipes analyzed", width: 100 },
      { value: DATASET_EDGE_COUNT, label: "ingredient pairs found", width: 78 },
      { value: DATASET_INGREDIENT_COUNT.toLocaleString(), label: "ingredient names after cleanup", width: 50 },
      { value: DATASET_MODE_COUNT, label: "food groups learned", width: 32 },
      { value: epicure.quizModes.length, label: "quiz-friendly groups", width: 22 },
    ];

    return `
      <div class="analysis-card analysis-funnel">
        <div class="analysis-card-top">
          <span>From raw recipes</span>
          <b>To quiz questions</b>
        </div>
        <p class="analysis-caption">The research starts with recipes. The app keeps the useful groups that can be asked as taste questions.</p>
        ${rows.map((row) => `
          <div class="funnel-row" style="--w:${row.width}%">
            <i></i>
            <strong>${esc(row.value)}</strong>
            <span>${esc(row.label)}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderModeKindMix() {
    const counts = epicure.modes.reduce((acc, mode) => {
      acc[mode.kind] = (acc[mode.kind] || 0) + 1;
      return acc;
    }, {});
    const total = epicure.modes.length || 1;
    const rows = [
      { id: "continuous", label: "flavor patterns", count: counts.continuous || 0 },
      { id: "factor", label: "recipe patterns", count: counts.factor || 0 },
      { id: "binary", label: "ingredient groups", count: counts.binary || 0 },
    ];

    return `
      <div class="analysis-card">
        <div class="analysis-card-top">
          <span>Kinds of quiz clues</span>
          <b>${total} groups</b>
        </div>
        <p class="analysis-caption">These are the kinds of food patterns Epicure found. Food Match mixes them so the quiz can ask about flavor, dishes, and ingredients.</p>
        <div class="kind-stack">
          ${rows.map((row) => `<i class="${row.id}" style="--w:${Math.round((row.count / total) * 100)}%"></i>`).join("")}
        </div>
        <div class="kind-legend">
          ${rows.map((row) => `
            <span><i class="${row.id}"></i>${esc(row.count)} ${esc(row.label)}</span>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderModeSizeHistogram() {
    const bins = [
      { label: "18-49", min: 18, max: 49, count: 0 },
      { label: "50-99", min: 50, max: 99, count: 0 },
      { label: "100-149", min: 100, max: 149, count: 0 },
      { label: "150-199", min: 150, max: 199, count: 0 },
      { label: "200+", min: 200, max: Infinity, count: 0 },
    ];
    epicure.modes.forEach((mode) => {
      const bin = bins.find((row) => mode.n >= row.min && mode.n <= row.max);
      if (bin) bin.count++;
    });
    const max = Math.max(1, ...bins.map((row) => row.count));

    return `
      <div class="analysis-card">
        <div class="analysis-card-top">
          <span>How big the food groups are</span>
          <b>number of groups</b>
        </div>
        <p class="analysis-caption">Most groups contain dozens of related ingredients. Smaller groups feel specific, bigger groups feel broader.</p>
        <div class="histogram">
          ${bins.map((bin) => `
            <div class="histogram-bar">
              <i style="--h:${Math.round((bin.count / max) * 100)}%"></i>
              <strong>${bin.count}</strong>
              <span>${esc(bin.label)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderProvenanceBars() {
    const entries = Object.entries(epicure.cuisineProvenance || {})
      .map(([id, modes]) => ({
        id,
        label: CUISINE_DISPLAY[id] || id.replace(/_/g, " "),
        count: modes.length,
      }))
      .sort((a, b) => b.count - a.count);
    const max = Math.max(1, ...entries.map((row) => row.count));

    return `
      <div class="provenance-bars">
        ${entries.map((row) => `
          <div class="provenance-row">
            <span>${esc(row.label)}</span>
            <i style="--bar:${Math.round((row.count / max) * 100)}%"></i>
            <b>${row.count}</b>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderSetup() {
    const quiz = state.quiz || newQuiz("", []);
    state.quiz = quiz;
    quiz.phase = "setup";

    const incoming = state.incomingProfile;
    const profileCount = loadProfiles().length;
    shell(`
      <section class="setup-layout setup-layout-solo">
        <div class="setup-panel">
          ${incoming ? `<div class="notice">Comparing with ${esc(incoming.name || "someone")}</div>` : ""}
          <div class="section-label">About you</div>
          <h3>Start a taste scan</h3>
          <label for="setup-name">Name</label>
          <input id="setup-name" type="text" maxlength="40" autocomplete="name" placeholder="Optional" value="${esc(quiz.name)}">

          <div class="section-label mt-20">Anything to skip?</div>
          <div class="restrictions">
            ${RESTRICTIONS.map((r) => `
              <button class="restriction-btn ${quiz.restrictions.includes(r.id) || (r.id === "none" && !quiz.restrictions.length) ? "active" : ""}"
                      data-restriction="${r.id}">
                <span>${r.emoji}</span>${esc(r.label)}
              </button>
            `).join("")}
          </div>

          <div class="setup-actions">
            <button class="btn btn-cta" data-action="start-quiz">Start the quiz</button>
            <button type="button" class="intro-help" data-action="view-intro" aria-label="View intro again">?</button>
            <span>${profileCount ? `<button type="button" class="link-toggle" data-action="history">View ${profileCount} past result${profileCount === 1 ? "" : "s"}</button>` : "No saved profiles yet"}</span>
          </div>
        </div>
      </section>
    `);
    bindSetupEvents();
  }

  function renderQuizCard() {
    const quiz = state.quiz;
    const card = currentCard(quiz);
    if (!card) return finishQuiz();

    const progress = quizProgress(quiz);
    const counts = quizCounts(quiz);
    const insight = quizInsight(state.quiz);
    const recentLikes = quizResponseChips(quiz, (id, v) => typeof v === "number" && v > 0, 5);
    const recentDislikes = quizResponseChips(quiz, (id, v) => typeof v === "number" && v < 0, 3);

    shell(`
      <section class="quiz-layout">
        <aside class="quiz-rail">
          <div class="progress-card">
            <div class="progress-ring" style="--pct:${progress.pct}">
              <span>${progress.pct}%</span>
            </div>
            <div>
              <div class="section-label">Taste scan</div>
              <h3>${phaseLabel(progress.phase)}</h3>
              <p>${progress.current} of ${progress.total}</p>
            </div>
          </div>
          <div class="mini-stats">
            ${statBlock(counts.likes, "yes")}
            ${statBlock(counts.dislikes, "no")}
            ${statBlock(counts.unknown, "unsure")}
          </div>
          ${progress.pct >= 40 ? `<button class="btn btn-quiet full" data-action="finish-early">Finish now</button>` : ""}
        </aside>

        <section class="question-panel">
          ${cardVisual(card, 64)}
          <h2>${esc(card.label)}</h2>
          <p class="desc">${esc(card.desc)}</p>

          <details class="why-this">
            <summary>Why this question?</summary>
            <p>${esc(whyThisCard(card, quiz))}</p>
          </details>

          <div class="cta-frame" aria-label="Answer this question">
            <div class="quiz-actions">
              ${ANSWER_OPTIONS.map((option) => `
                <button class="btn btn-${option.tone}" data-answer="${option.value}">
                  <kbd>${option.key}</kbd>
                  <span>${esc(option.label)}</span>
                </button>
              `).join("")}
            </div>
            <div class="skip-row">
              <button class="btn btn-skip" data-answer="unknown"><kbd>Space</kbd><span>Unsure</span></button>
            </div>
          </div>
          <div class="quiz-nav-row" aria-label="Question navigation">
            <button class="btn btn-quiet" data-action="quiz-back" ${quiz.pos === 0 ? "disabled" : ""}>&larr; Back</button>
            <button class="btn btn-quiet" data-action="quiz-forward" ${quiz.pos >= (quiz.maxPos || 0) ? "disabled" : ""}>Forward &rarr;</button>
          </div>
        </section>

        <aside class="signal-panel">
          <div>
            <div class="section-label">Live signal</div>
            <p>${insight ? esc(insight) : "Waiting for enough signal to name the next useful cluster."}</p>
          </div>
          <div>
            <div class="section-label">Path tree</div>
            ${renderQuizTree(quiz)}
          </div>
          ${recentLikes.length ? `
            <div>
              <div class="section-label">Leaning toward</div>
              <div class="food-grid">${recentLikes.join("")}</div>
            </div>
          ` : ""}
          ${recentDislikes.length ? `
            <div>
              <div class="section-label">Avoiding</div>
              <div class="food-grid">${recentDislikes.join("")}</div>
            </div>
          ` : ""}
          <div class="source-note">
            Epicure maps ingredients by recipe co-occurrence. Follow-ups check whether the research branch fits your palate.
          </div>
        </aside>
      </section>
    `);
    bindCardEvents();
  }

  function finishQuiz() {
    const quiz = state.quiz;
    if (!quiz) return renderSetup();

    const profile = buildProfile(quiz);
    saveProfile(profile);
    state.profile = profile;

    const answeredCards = answeredQuizCards(quiz);
    const tallies = answerTallies(answeredCards, quiz.responses);
    const answerCount = answeredCards.length;

    shell(`
      <section class="done-panel">
        <div class="eyebrow">Done</div>
        <h2>${answerCount} of ${answerCount} answers mapped</h2>
        <p>${tallies.yes} yes, ${tallies.no} no${tallies.unsure ? `, ${tallies.unsure} follow-up checks` : ""}.</p>
        <div class="complete-tracker" aria-label="Completed taste path">
          ${renderCompleteTracker(quiz, answeredCards)}
        </div>
        <button class="btn btn-cta mt-16" data-action="show-results">See analysis</button>
      </section>
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
    const adventure = adventureBreakdown(profile);
    const narrative = generateNarrative(profile);
    const cuisineEvidence = buildCuisineEvidence(profile);
    const restaurants = suggestRestaurants(profile);
    const dishes = suggestDishes(profile);
    const fringeRecipes = suggestFringeRecipes(profile);
    const restaurantPrompt = buildPersonalRestaurantPrompt(profile);
    const taste = tasteSignature(profile);
    const liked = topResponses(profile, (id, v) => typeof v === "number" && v > 0).slice(0, 10);
    const disliked = topResponses(profile, (id, v) => typeof v === "number" && v < 0).slice(0, 6);
    const namePossessive = profile.name ? esc(profile.name) + "'s" : "Your";

    const heroSummary = generateHeroSummary(profile);
    const answersCount = Object.keys(profile.responses || {}).length;
    const topCuisine = cuisineEvidence[0];
    const topRestaurant = restaurants[0];
    const topDish = dishes[0];
    shell(`
      <section class="hero-v2">
        <div class="hero-copy">
          <div class="eyebrow">${namePossessive} palate</div>
          <h2>${esc(heroSummary)}</h2>
          <p>${esc(narrative)}</p>
          <p class="hero-daylist"><em>${esc(daylist)}</em></p>
          <div class="hero-cta-row">
            <button class="btn btn-cta" data-action="share-invite">Invite a friend to compare</button>
            <button class="btn" data-action="share-profile">Copy profile link</button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat big">
            <strong class="hero-stat-label">${esc(adventureBucket(adventure.score).label)}</strong>
            <small>adventure level</small>
            <em>${esc(adventureBucket(adventure.score).caption)} ${esc(adventureCopy(adventure))}</em>
          </div>
          <div class="hero-stat-row">
            <div class="hero-stat">
              <strong>${answersCount}</strong>
              <small>answers mapped</small>
            </div>
            <div class="hero-stat">
              <strong>${liked.length}</strong>
              <small>strong likes</small>
            </div>
            <div class="hero-stat">
              <strong>${disliked.length}</strong>
              <small>hard passes</small>
            </div>
          </div>
        </div>
      </section>

      <section class="top-picks" aria-label="Your top picks at a glance">
        <div class="section-label">Top picks at a glance</div>
        <div class="top-picks-grid">
          ${topPickTile("\u{1F30D}", "Top region", topCuisine ? topCuisine.label : "No clear region yet", topCuisine ? cuisineBucket(topCuisine.score).label : "")}
          ${topPickTile("\u{1F37D}️", "Restaurant fit", topRestaurant ? topRestaurant.name : "No confident match yet", topRestaurant && topRestaurant.hitKeys && topRestaurant.hitKeys.length ? `${formatIngredientList(topRestaurant.hitKeys, 2)}` : "")}
          ${topPickTile("\u{1F374}", "Dish idea", topDish ? topDish.dish : "No confident match yet", topDish && topDish.hitKeys && topDish.hitKeys.length ? `${formatIngredientList(topDish.hitKeys, 2)}` : "")}
        </div>
      </section>

      <nav class="results-toc" aria-label="Jump to section">
        <a href="#section-taste">Your taste</a>
        <a href="#section-eat">Where to eat &amp; what to order</a>
        <a href="#section-share">Restaurant search prompts</a>
      </nav>

      <h3 class="results-section-heading" id="section-taste">Your taste</h3>
      <section class="dashboard-grid">
        <div class="panel panel-wide panel-soft">
          <div class="panel-heading">
            <div>
              <div class="section-label">Cuisine compass</div>
              <h3>Regional evidence ${hintBlock("This combines direct region answers with later recipe-cluster and ingredient-neighborhood evidence.")}</h3>
            </div>
          </div>
          ${renderCuisineEvidence(cuisineEvidence)}
        </div>

        <div class="panel panel-soft">
          <div class="section-label">Taste spectrum</div>
          <h3>Top flavors ${hintBlock("This compresses many answers into the flavors most likely to matter.")}</h3>
          ${renderTasteBars(taste)}
        </div>

        <div class="panel panel-wide panel-full panel-soft">
          <div class="section-label">Evidence</div>
          <h3>What shaped your result ${hintBlock("These answers did the most work in shaping the suggestions.")}</h3>
          <div class="split-evidence">
            <div>
              <div class="subhead">Likes</div>
              <div class="food-grid">${liked.length ? liked.slice(0, 5).map((f) => renderFoodTag(f)).join("") : `<span class="food-tag dim">No strong likes</span>`}</div>
              ${liked.length > 5 ? `<div class="food-grid extra" hidden>${liked.slice(5).map((f) => renderFoodTag(f)).join("")}</div><button type="button" class="link-toggle" data-toggle-target="extra">Show ${liked.length - 5} more</button>` : ""}
            </div>
            <div>
              <div class="subhead">Passes</div>
              <div class="food-grid">${disliked.length ? disliked.slice(0, 5).map((f) => renderFoodTag(f, "conflict")).join("") : `<span class="food-tag dim">No hard passes</span>`}</div>
              ${disliked.length > 5 ? `<div class="food-grid extra" hidden>${disliked.slice(5).map((f) => renderFoodTag(f, "conflict")).join("")}</div><button type="button" class="link-toggle" data-toggle-target="extra">Show ${disliked.length - 5} more</button>` : ""}
            </div>
          </div>
        </div>
      </section>

      <h3 class="results-section-heading" id="section-eat">Where to eat &amp; what to order</h3>
      <section class="dashboard-grid">
        <div class="panel panel-wide panel-soft">
          <div class="section-label">Where to eat</div>
          <h3>Restaurant fit ${hintBlock("These places match the ingredients and regions you kept saying yes to.")}</h3>
          <p class="panel-hint">(category, not a specific spot)</p>
          <div class="recommendation-list">
            ${restaurants.length ? restaurants.slice(0, 5).map((r) => renderRestaurantCard(r, { stylePrefix: true })).join("") : `<div class="empty-state">No confident restaurant match yet.</div>`}
          </div>
        </div>

        <div class="panel panel-soft">
          <div class="section-label">What to order</div>
          <h3>Dish ideas ${hintBlock("Dishes appear when your yes answers cover their key ingredients.")}</h3>
          <div class="dish-stack">
            ${dishes.length ? dishes.slice(0, 6).map(renderDishCard).join("") : `<div class="empty-state">No confident dish match yet.</div>`}
          </div>
        </div>

        <div class="panel panel-wide panel-full panel-soft">
          <div class="section-label">Fringe recipes</div>
          <h3>Try something new ${hintBlock("These push the boundary without using ingredients you already rejected.")}</h3>
          <div class="fringe-list">
            ${fringeRecipes.length ? fringeRecipes.map(renderFringeRecipeCard).join("") : `<div class="empty-state">No safe fringe recipe match yet.</div>`}
          </div>
        </div>
      </section>

      <h3 class="results-section-heading" id="section-share">Restaurant search prompts</h3>
      <section class="dashboard-grid">
        <div class="panel panel-wide panel-full panel-soft prompt-split">
          <div class="section-label">Find places near me</div>
          <h3>Send these to Maps or ChatGPT</h3>
          <div class="prompt-split-grid">
            <div class="prompt-split-card">
              <div class="section-label">For Google Maps</div>
              ${renderMapsPromptCard("personal-restaurant-maps", restaurantPrompt.mapsQuery)}
            </div>
            <div class="prompt-split-card">
              <div class="section-label">For ChatGPT / AI</div>
              ${renderLLMPromptCard("personal-restaurant-llm", restaurantPrompt.text)}
            </div>
          </div>
        </div>
      </section>
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
    const sharedPrompt = buildCompatibilityRestaurantPrompt(a, b);
    const sharedSignalCount = result.sharedLikes.length + result.sharedDirections.length;

    shell(`
      <section class="compare-hero">
        <div>
          <div class="eyebrow">Shared table</div>
          <h2>${esc(aName)} <span>and</span> ${esc(bName)}</h2>
          <p>${sharedSignalCount} shared signals, ${result.conflicts.length} watch-outs, ${result.bridges.length} possible introductions.</p>
        </div>
        <div class="score-dial">
          <span>${result.score}</span>
          <small>compatibility score</small>
          <em>0-100 from shared likes, directions, dishes, and conflicts</em>
        </div>
      </section>

      <section class="dashboard-grid">
        <div class="panel panel-wide">
          <div class="section-label">Eat here together</div>
          <h3>Shared restaurant fit</h3>
          <p class="panel-hint">Good shared options have evidence from both profiles.</p>
          <div class="recommendation-list">
            ${sharedRests.length ? sharedRests.slice(0, 6).map(renderRestaurantCard).join("") : `<div class="empty-state">No shared restaurant fit yet.</div>`}
          </div>
        </div>

        <div class="panel">
          <div class="section-label">Order these</div>
          <h3>Shared dishes</h3>
          <p class="panel-hint">These dishes avoid known hard passes and hit both palates.</p>
          <div class="dish-stack">
            ${sharedDishes.length ? sharedDishes.slice(0, 8).map(renderDishCard).join("") : `<div class="empty-state">No shared dish match yet.</div>`}
          </div>
        </div>

        <div class="panel panel-wide panel-full prompt-panel">
          <div class="section-label">Shared search prompt</div>
          <h3>Where should we go together?</h3>
          <p class="panel-hint">Copy this into Google Maps, Ask Maps, ChatGPT, or another local search tool.</p>
          ${renderPromptCard("compatibility-restaurant-prompt", sharedPrompt.text, sharedPrompt.mapsQuery)}
        </div>

        <div class="panel panel-wide">
          <div class="section-label">You both like</div>
          <h3>Common ground</h3>
          <p class="panel-hint">Exact overlaps are safest; shared regional pulls catch compatible nearby tastes.</p>
          <div class="food-grid">
            ${result.sharedLikes.length || result.sharedDirections.length
              ? [...result.sharedLikes, ...result.sharedDirections].map((f) => renderFoodTag(f, f.type === "direction" ? "bridge" : "")).join("")
              : `<span class="food-tag dim">Nothing exact yet</span>`}
          </div>
        </div>

        <div class="panel">
          <div class="section-label">Skip</div>
          <h3>Risky orders</h3>
          <p class="panel-hint">Avoid dishes where one person’s yes crosses another person’s no.</p>
          <div class="dish-stack">
            ${avoidDishes.length ? avoidDishes.slice(0, 5).map((d) => `
              <div class="dish-card conflict">
                <strong>${esc(d.dish)}</strong>
                <span>${d.who === "a" ? esc(aName) + " is out" : esc(bName) + " is out"}</span>
              </div>
            `).join("") : `<div class="empty-state">No clear dish conflicts.</div>`}
          </div>
        </div>

        <div class="panel panel-wide">
          <div class="section-label">Watch out</div>
          <h3>Preference conflicts</h3>
          <p class="panel-hint">These are direct yes/no collisions.</p>
          <div class="food-grid">
            ${result.conflicts.length ? result.conflicts.map((f) => `
              <span class="food-tag conflict">${esc(f.label)}
                <small>${f.who === "a" ? esc(aName) + " yes, " + esc(bName) + " no" : esc(bName) + " yes, " + esc(aName) + " no"}</small>
              </span>
            `).join("") : `<span class="food-tag dim">No direct conflicts</span>`}
          </div>
        </div>

        <div class="panel">
          <div class="section-label">Try together</div>
          <h3>Bridge foods</h3>
          <p class="panel-hint">One person likes it, the other has not ruled it out.</p>
          <div class="food-grid">
            ${result.bridges.length ? result.bridges.map((f) => `
              <span class="food-tag bridge">${esc(f.label)}
                <small>${f.from === "a" ? esc(aName) + " recommends" : esc(bName) + " recommends"}</small>
              </span>
            `).join("") : `<span class="food-tag dim">No bridge foods yet</span>`}
          </div>
        </div>

        <div class="panel panel-actions">
          <button class="btn btn-cta" data-action="share-compare">Share comparison</button>
          <button class="btn" data-action="new-quiz">Take quiz</button>
        </div>
      </section>
    `);
    bindCompareEvents();
  }

  function renderHistory() {
    const profiles = loadProfiles();
    shell(`
      <section class="history-panel">
        <div>
          <div class="eyebrow">Saved profiles</div>
          <h2>Pick a palate to reopen</h2>
        </div>
        ${profiles.length ? `
          <div class="profile-list">
            ${profiles.map((p) => `
              <button class="profile-row" data-profile-id="${esc(p.id)}">
                <span class="profile-dot">${esc((p.name || "U").charAt(0).toUpperCase())}</span>
                <strong>${esc(p.name || "Unnamed")}</strong>
                <small>${new Date(p.t).toLocaleDateString()}</small>
              </button>
            `).join("")}
          </div>
        ` : `<div class="empty-state">No profiles yet.</div>`}
        <div class="btn-row mt-16">
          <button class="btn" data-action="new-quiz">New quiz</button>
        </div>
      </section>
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

  function statBlock(value, label) {
    return `<div class="stat-block"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`;
  }

  function phaseLabel(phase) {
    if (phase === "cuisines") return "Cuisine compass";
    if (phase === "modes") return "Recipe neighborhoods";
    if (phase === "ingredients") return "Boundary check";
    return "Taste scan";
  }

  function cardTypeLabel(card) {
    if (card.type === "cuisine") return "Cuisine region";
    if (card.type === "mode") return "Recipe pattern";
    if (card.type === "ingredient-probe") return "Branch check";
    return "Ingredient";
  }

  function whyThisCard(card, quiz) {
    if (!card) return "";
    if (card.type === "cuisine") {
      return "Cuisine regions come first. Your yes/no on each region steers which recipe neighborhoods we ask about next.";
    }
    if (card.type === "mode") {
      const likedCuisines = cuisinesWithResponse(quiz, (v) => typeof v === "number" && v > 0);
      const passedCuisines = cuisinesWithResponse(quiz, (v) => typeof v === "number" && v < 0);
      if (likedCuisines.length) {
        return `Top recipe neighborhood after your yes to ${joinNatural(likedCuisines)}. Recipes in this group share ingredients that often appear together in cooking data.`;
      }
      if (passedCuisines.length) {
        return `No clear yes on a region yet, so we pull from broad recipe neighborhoods while skipping ones tied to ${joinNatural(passedCuisines)}.`;
      }
      return "Highest-scoring recipe neighborhood from the default ranking. The first mode tends to be the one that splits the dataset best.";
    }
    if (card.type === "ingredient-probe") {
      const branch = card.parentAnswer ? card.parentAnswer.replace(/_/g, " ") : "your last answer";
      return `Branch probe from ${card.parentLabel || "the previous neighborhood"} (${branch}). We test specific ingredients so a broad answer does not overgeneralize.`;
    }
    if (card.type === "ingredient") {
      return card.parentLabel
        ? `Boundary check inside ${card.parentLabel}. Edge ingredients here help separate real dislikes from broad generalizations.`
        : "Boundary ingredient that splits adjacent recipe clusters; your answer sharpens the recommendation edge.";
    }
    return cardEvidence(card);
  }

  function cuisinesWithResponse(quiz, predicate) {
    if (!quiz || !quiz.responses) return [];
    return CUISINES
      .filter((c) => predicate(quiz.responses["c:" + c.id]))
      .map((c) => CUISINE_DISPLAY[c.id] || c.label)
      .slice(0, 3);
  }

  function joinNatural(items) {
    if (!items.length) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + " and " + items[1];
    return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
  }

  function cardEvidence(card) {
    if (card.type === "cuisine") {
      return "Broad region answers point the app toward recipe families before it asks about ingredients.";
    }
    if (card.type === "mode") {
      return "Ingredients in this pattern often show up together in recipes; your answer decides whether to follow that branch.";
    }
    if (card.type === "ingredient-probe") {
      return `You answered near ${card.parentLabel || "this branch"}; this checks which ingredient is doing the work.`;
    }
    if (card.parentLabel && card.parentLabel !== "Boundary check" && card.parentLabel !== "Deep dive") {
      return `This tests the edge of ${card.parentLabel} so the app does not overgeneralize.`;
    }
    return "This ingredient checks a sharper edge so the app can separate curiosity from a real hard pass.";
  }

  function contextPrefix(context) {
    return context.startsWith("You liked") || context.startsWith("Even though") || context.startsWith("Related to") ? "↳ " : "";
  }

  function cardVisual(card, size) {
    const visual = card.iconKey
      ? ingredientIcon(card.iconKey, size)
      : card.cuisineId
        ? cuisineIcon(card.cuisineId, size)
        : card.modeRef
          ? modeIcon(card.modeRef, size)
          : emojiMark(card.emoji, size);
    return `<div class="plate-visual">${visual}</div>`;
  }

  function renderSamples(samples) {
    return `
      <div class="samples">
        ${samples.map((s) => `<span>${esc(s.name)}</span>`).join("")}
      </div>
    `;
  }

  function quizCounts(quiz) {
    const values = Object.values(quiz.responses || {});
    return {
      likes: values.filter((v) => typeof v === "number" && v > 0).length,
      dislikes: values.filter((v) => typeof v === "number" && v < 0).length,
      unknown: values.filter((v) => v === "unknown").length,
    };
  }

  function renderQuizTree(quiz) {
    const { visible, hiddenCount, activeParentId } = treeVisibleCards(quiz, 9);
    const nodes = [];
    const answered = Object.keys(quiz.responses || {}).length;

    nodes.push(`
      <li class="tree-node root">
        <span class="tree-marker"></span>
        <div class="tree-copy">
          <strong>Decision tree</strong>
          <small>${answered} of ${QUIZ_TARGET} answers mapped</small>
        </div>
      </li>
    `);

    if (hiddenCount > 0) {
      nodes.push(`
        <li class="tree-node collapsed">
          <span class="tree-marker"></span>
          <div class="tree-copy">
            <strong>${hiddenCount} earlier decisions</strong>
            <small>Kept out of this compact view</small>
          </div>
        </li>
      `);
    }

    visible.forEach((card, offset) => {
      const isActive = card === currentCard(quiz);
      const value = quiz.responses[card.id];
      const nodeState = treeState(value, isActive);
      const classes = [
        "tree-node",
        nodeState.key,
        card.type === "ingredient-probe" ? "branch" : "",
        card.id === activeParentId ? "parent-context" : "",
      ].filter(Boolean).join(" ");
      nodes.push(`
        <li class="${classes}">
          <span class="tree-marker">${esc(nodeState.short)}</span>
          <div class="tree-copy">
            <strong>${esc(card.label)}</strong>
            <small>${esc(treeNodeDetail(card, value, isActive))}</small>
          </div>
        </li>
      `);
    });

    return `<ol class="path-tree" aria-label="Taste decision tree">${nodes.join("")}</ol>`;
  }

  function treeVisibleCards(quiz, limit) {
    const end = Math.min(quiz.queue.length, quiz.pos + 1);
    const cards = quiz.queue.slice(0, end);
    const visible = cards.slice(-limit);
    const active = currentCard(quiz);
    let activeParentId = null;

    if (active && active.parentId) {
      activeParentId = active.parentId;
      const hasParent = visible.some((card) => card.id === active.parentId);
      const parent = cards.find((card) => card.id === active.parentId);
      if (!hasParent && parent) {
        visible.unshift(parent);
        while (visible.length > limit) visible.splice(1, 1);
      }
    }

    const visibleIds = new Set(visible.map((card) => card.id));
    return {
      visible,
      hiddenCount: Math.max(0, cards.filter((card) => !visibleIds.has(card.id)).length),
      activeParentId,
    };
  }

  function treeNodeDetail(card, value, isActive) {
    if (isActive) {
      if (card.parentLabel) {
        return `next check from ${card.parentLabel}${card.parentAnswer ? " · " + card.parentAnswer : ""}`;
      }
      return `next ${cardTypeLabel(card).toLowerCase()}`;
    }

    if (card.type === "ingredient-probe") {
      const branch = card.parentAnswer ? card.parentAnswer + " from " : "from ";
      return `${branch}${card.parentLabel || "this branch"}`;
    }

    if (value !== undefined) {
      return `${cardTypeLabel(card)} · ${answerLabel(value)}`;
    }

    return cardTypeLabel(card);
  }

  function answeredQuizCards(quiz) {
    return quiz.queue
      .slice(0, quiz.pos)
      .filter((card) => quiz.responses[card.id] !== undefined);
  }

  function answerTallies(cards, responses) {
    const t = { yes: 0, no: 0, unsure: 0 };
    cards.forEach((card) => {
      const v = responses[card.id];
      if (typeof v === "number" && v > 0) t.yes++;
      else if (typeof v === "number" && v < 0) t.no++;
      else t.unsure++;
    });
    return t;
  }

  function renderCompleteTracker(quiz, answeredCards) {
    const cards = answeredCards || answeredQuizCards(quiz);
    const groups = groupAnsweredCards(cards);
    const groupHtml = groups.map((group) => {
      const parent = group.parent;
      const parentState = treeState(quiz.responses[parent.card.id], false);
      const branchSuffix = parent.card.type === "mode" ? branchAnswerLabel(quiz.responses[parent.card.id]) : null;
      const parentMeta = branchSuffix
        ? `${cardTypeLabel(parent.card)} · ${branchSuffix}`
        : cardTypeLabel(parent.card);

      const childrenHtml = group.children.length
        ? `<ol class="group-children">${group.children.map((child) => {
            const childState = treeState(quiz.responses[child.card.id], false);
            return `
              <li class="${childState.key}">
                <span>${child.index + 1}</span>
                <div>
                  <strong>${esc(child.card.label)}</strong>
                  <small>↳ probe from ${esc(parent.card.label)}</small>
                </div>
              </li>
            `;
          }).join("")}</ol>`
        : "";

      return `
        <li class="group ${parentState.key} group-${parent.card.type}">
          <div class="group-head">
            <span>${parent.index + 1}</span>
            <div>
              <strong>${esc(parent.card.label)}</strong>
              <small>${esc(parentMeta)}</small>
            </div>
          </div>
          ${childrenHtml}
        </li>
      `;
    }).join("");

    return `<ol class="path-tree-grouped">${groupHtml}</ol>`;
  }

  function groupAnsweredCards(cards) {
    const groups = [];
    const groupByParentId = new Map();
    cards.forEach((card, index) => {
      if (card.type === "ingredient-probe" && card.parentId && groupByParentId.has(card.parentId)) {
        groupByParentId.get(card.parentId).children.push({ card, index });
        return;
      }
      const group = { parent: { card, index }, children: [] };
      groups.push(group);
      if (card.type === "mode") {
        groupByParentId.set("m:" + card.modeId, group);
      }
    });
    return groups;
  }

  function treeState(value, isActive) {
    if (isActive) return { key: "active", short: "now" };
    if (value === "unknown") return { key: "unknown", short: "try" };
    if (typeof value === "number" && value > 0) return { key: "yes", short: "yes" };
    if (typeof value === "number" && value < 0) return { key: "no", short: "no" };
    if (value === 0) return { key: "neutral", short: "mid" };
    return { key: "pending", short: "" };
  }

  function quizResponseChips(quiz, filter, limit) {
    return Object.entries(quiz.responses || {})
      .filter(([id, value]) => filter(id, value))
      .slice(-limit)
      .reverse()
      .map(([id]) => renderFoodTag(responseInfo(id)));
  }

  function renderFoodTag(item, extraClass) {
    const className = extraClass ? `food-tag ${extraClass}` : "food-tag";
    return `<span class="${className}">${esc(item.label)}</span>`;
  }

  function adventureSummary(details) {
    if (details.possible <= 0) {
      return "Not enough divisive ingredient answers yet, so the score starts at 50.";
    }
    return `${formatEdgePoints(details.earned)} of ${formatEdgePoints(details.possible)} adventure points from ${details.tested} divisive ingredients.`;
  }

  function formatEdgePoints(value) {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  function renderCuisineEvidence(rows) {
    const ordered = [...rows].sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
    const renderCard = (row) => {
      const clusterLabel = contributionLabel(row.cluster);
      const ingredientLabel = contributionLabel(row.ingredient);
      const bucket = cuisineBucket(row.score);
      const parts = [];
      if (row.direct != null) parts.push(`<span>From cuisine answer: ${esc(answerLabel(row.direct))}</span>`);
      if (clusterLabel !== "No signal") parts.push(`<span>From related groups: ${esc(clusterLabel)}</span>`);
      if (ingredientLabel !== "No signal") parts.push(`<span>From specific foods: ${esc(ingredientLabel)}</span>`);
      return `
        <div class="cuisine-card ${cuisineTone(row)}">
          <div class="cuisine-card-top">
            <strong>${esc(row.label)}</strong>
            <span>${esc(bucket.label)}</span>
          </div>
          <div class="cuisine-bucket-caption">${esc(bucket.caption)}</div>
          ${parts.length ? `<div class="signal-parts">${parts.join("")}</div>` : ""}
        </div>
      `;
    };
    const strong = ordered.filter((row) => cuisineSignalLabel(row.score) !== "No clear pull");
    const weak = ordered.filter((row) => cuisineSignalLabel(row.score) === "No clear pull");
    const visible = strong.length ? strong : weak.slice(0, 3);
    const hidden = strong.length ? weak : weak.slice(3);
    return `
      <div class="cuisine-evidence">
        ${visible.map(renderCard).join("")}
        ${hidden.length ? `<div class="cuisine-weak" hidden>${hidden.map(renderCard).join("")}</div><button type="button" class="link-toggle" data-toggle-target="cuisine-weak">Show ${hidden.length} more</button>` : ""}
      </div>
    `;
  }

  function cuisineTone(row) {
    if (row.score > 0.4) return "positive";
    if (row.score < -0.4) return "negative";
    return "neutral";
  }

  function cuisineSignalLabel(score) {
    if (score >= 6) return "Strong pull";
    if (score >= 2) return "Pull";
    if (score > 0.4) return "Soft pull";
    if (score <= -6) return "Strong pass";
    if (score <= -2) return "Pass";
    if (score < -0.4) return "Soft pass";
    return "No clear pull";
  }

  function answerLabel(value) {
    if (value == null) return "No answer";
    if (value === "unknown") return "Unsure";
    const option = ANSWER_OPTIONS.find((item) => item.value === value);
    const legacyLabels = {
      "-2": "Hard no",
      0: "Neutral",
      3: "Crave it",
    };
    if (legacyLabels[value] != null) return legacyLabels[value];
    return option ? option.label : String(value);
  }

  function contributionLabel(value) {
    if (value >= 1) return "Support";
    if (value > 0.1) return "Light support";
    if (value <= -1) return "Push away";
    if (value < -0.1) return "Light push away";
    return "No signal";
  }

  function renderTasteBars(taste) {
    const rows = Object.entries(taste)
      .filter(([, value]) => value !== 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, value]) => `
        <div class="taste-row">
          <span>${esc(TASTE_DIMENSION_LABELS[key] || key)}</span>
          <div class="taste-track"><i style="width:${Math.max(6, value * 10)}%"></i></div>
          <b>${value}</b>
        </div>
      `);
    if (!rows.length) {
      return `<div class="empty-state">No clear flavor center yet. Answer a few recipe-pattern or ingredient questions to build this out.</div>`;
    }
    const summary = tasteSummary(taste);
    const summaryBlock = summary ? `
      <div class="taste-summary">
        <div class="taste-summary-line dominant">${esc(summary.dominant)}</div>
        ${summary.secondary ? `<div class="taste-summary-line">${esc(summary.secondary)}</div>` : ""}
        ${summary.quiet ? `<div class="taste-summary-line dim">${esc(summary.quiet)}</div>` : ""}
      </div>
    ` : "";
    return `${summaryBlock}<div class="taste-bars">${rows.join("")}</div>`;
  }

  function topPickTile(emoji, label, value, sub) {
    return `
      <div class="top-pick">
        <div class="top-pick-emoji" aria-hidden="true">${emoji}</div>
        <div class="top-pick-body">
          <small>${esc(label)}</small>
          <strong>${esc(value)}</strong>
          ${sub ? `<span>${esc(sub)}</span>` : ""}
        </div>
      </div>
    `;
  }

  function renderRestaurantCard(r, opts) {
    const hasHits = r.hitKeys && r.hitKeys.length;
    const prefix = opts && opts.stylePrefix ? "Style: " : "";
    return `
      <div class="rest-card">
        <div class="rest-title"><strong>${esc(prefix + r.name)}</strong></div>
        ${hasHits ? `<div class="match-reason">${esc(`Key matches: ${formatIngredientList(r.hitKeys, 4)}`)}</div>` : ""}
      </div>
    `;
  }

  function renderDishCard(d) {
    const reason = d.hitKeys && d.hitKeys.length
      ? `Based on: ${formatIngredientList(d.hitKeys, 3)}`
      : `Based on: ${CUISINE_DISPLAY[d.cuisine] || d.cuisine}`;
    return `
      <div class="dish-card">
        <strong>${esc(d.dish)}</strong>
        <span class="dish-based">${esc(reason)}</span>
      </div>
    `;
  }

  function renderFringeRecipeCard(recipe) {
    return `
      <div class="fringe-card">
        <div class="fringe-card-top">
          <strong>${esc(recipe.title)}</strong>
          <span>Stretch ${recipe.fringe}/10</span>
        </div>
        <p>${esc(recipe.note)}</p>
        <small>${esc(recipe.reason)}</small>
      </div>
    `;
  }

  function renderPromptCard(id, promptText, mapsQuery) {
    return `
      <div class="prompt-card">
        <pre id="${esc(id)}" class="prompt-text">${esc(promptText)}</pre>
        <div class="prompt-actions">
          <button class="btn" data-action="copy-prompt" data-prompt-target="${esc(id)}">Copy prompt</button>
          <a class="btn" href="${esc(googleMapsSearchUrl(mapsQuery))}" target="_blank" rel="noopener">Open Google Maps search</a>
        </div>
      </div>
    `;
  }

  function renderMapsPromptCard(id, mapsQuery) {
    const query = mapsQuery || "restaurants near me";
    return `
      <div class="maps-card">
        <p class="maps-hint">Search Google Maps for:</p>
        <p class="maps-query"><span id="${esc(id)}">${esc(query)}</span></p>
        <a class="btn btn-cta" href="${esc(googleMapsSearchUrl(query))}" target="_blank" rel="noopener">Open in Google Maps &rarr;</a>
      </div>
    `;
  }

  function renderLLMPromptCard(id, promptText) {
    return `
      <div class="prompt-card">
        <pre id="${esc(id)}" class="prompt-text">${esc(promptText)}</pre>
        <div class="prompt-actions">
          <button class="btn" data-action="copy-prompt" data-prompt-target="${esc(id)}">Copy</button>
        </div>
      </div>
    `;
  }

  function hintBlock(text) {
    return `<details class="hint-block"><summary aria-label="More info">?</summary><div>${esc(text)}</div></details>`;
  }

  function formatIngredientList(keys, limit) {
    return keys.slice(0, limit).map(displayName).join(", ");
  }

  // ─── EVENT BINDING ─────────────────────────────────────────────

  function bindGlobalActions() {
    app.onclick = (event) => {
      if (!(event.target instanceof Element)) return;
      const el = event.target.closest("[data-action]");
      if (!el || !app.contains(el)) return;

      const action = el.dataset.action;
      if (action === "home") {
        state.quiz = null;
        state.route = "quiz";
        state.incomingProfile = null;
        state.compareProfiles = null;
        state.profile = null;
        history.replaceState(null, "", baseUrl());
        render();
      }
      if (action === "intro-next") {
        if (state.onboardingStep < INTRO_STEP_COUNT - 1) {
          state.onboardingStep++;
        } else {
          state.onboardingComplete = true;
          state.onboardingStep = INTRO_STEP_COUNT;
          markIntroSeen();
        }
        render();
      }
      if (action === "intro-skip") {
        state.onboardingComplete = true;
        state.onboardingStep = INTRO_STEP_COUNT;
        markIntroSeen();
        render();
      }
      if (action === "view-intro") {
        state.onboardingComplete = false;
        state.onboardingStep = 0;
        state.route = "quiz";
        render();
      }
      if (action === "new-quiz") {
        state.quiz = null;
        state.route = "quiz";
        state.incomingProfile = null;
        state.compareProfiles = null;
        state.profile = null;
        state.onboardingComplete = true;
        state.onboardingStep = INTRO_STEP_COUNT;
        history.replaceState(null, "", baseUrl());
        render();
      }
      if (action === "history") {
        state.route = "history";
        render();
      }
      if (action === "nav-back") {
        if (state.routeStack.length) {
          const prev = state.routeStack.pop();
          state.route = prev;
          state.lastRenderedRoute = prev;
          render();
        }
      }
      if (action === "copy-prompt") {
        copyPromptFromButton(el);
      }
    };
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
          topicKey: normalizeTopic(c.label),
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

    const backBtn = document.querySelector('[data-action="quiz-back"]');
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (backCard(state.quiz)) renderQuizCard();
      });
    }
    const forwardBtn = document.querySelector('[data-action="quiz-forward"]');
    if (forwardBtn) {
      forwardBtn.addEventListener("click", () => {
        if (forwardCard(state.quiz)) renderQuizCard();
      });
    }

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
    document.querySelectorAll("[data-toggle-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetClass = btn.dataset.toggleTarget;
        let sibling = btn.previousElementSibling;
        while (sibling && !sibling.classList.contains(targetClass)) {
          sibling = sibling.previousElementSibling;
        }
        if (!sibling) return;
        const nowHidden = !sibling.hasAttribute("hidden");
        if (nowHidden) {
          sibling.setAttribute("hidden", "");
          btn.textContent = btn.dataset.showLabel || btn.textContent;
        } else {
          if (!btn.dataset.showLabel) btn.dataset.showLabel = btn.textContent;
          sibling.removeAttribute("hidden");
          btn.textContent = "Hide";
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
          state.onboardingComplete = true;
          state.onboardingStep = INTRO_STEP_COUNT;
          history.replaceState(null, "", baseUrl());
          render();
        }
      });
    });
  }

  function copyPromptFromButton(btn) {
    const target = document.getElementById(btn.dataset.promptTarget);
    if (!target) return;
    copyToClipboard(target.textContent || "", "Prompt copied!");
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
    if (keyboardInitialized) return;
    keyboardInitialized = true;

    function onKey(e) {
      if (!document.querySelector("[data-answer]")) return;

      if (e.key === "1") { e.preventDefault(); handleAnswer(1); }
      else if (e.key === "0") { e.preventDefault(); handleAnswer(-1); }
      else if (e.key === " " || e.key === "Spacebar") { e.preventDefault(); handleAnswer("unknown"); }
    }
    document.addEventListener("keydown", onKey);
  }

  // ─── ROUTING ───────────────────────────────────────────────────

  function parseRoute() {
    const hash = location.hash.slice(1);
    dbg.route("parse", { hash, current: state.route });
    if (!hash) {
      state.route = "quiz";
      state.quiz = null;
      return render();
    }

    const ROUTE_PREFIXES = ["take=", "profile=", "compare="];
    const isAppRoute = ROUTE_PREFIXES.some((p) => hash.startsWith(p));
    if (!isAppRoute) {
      // In-page anchor (e.g. section-taste). Let the browser scroll
      // to the target instead of rerouting the app.
      return;
    }

    try {
      if (hash.startsWith("take=")) {
        state.incomingProfile = decodePayload(hash.slice(5));
        state.quiz = newQuiz("", []);
        state.route = "quiz";
        state.onboardingComplete = true;
        state.onboardingStep = INTRO_STEP_COUNT;
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
  }

  // ─── UTILITIES ─────────────────────────────────────────────────

  function esc(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
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
    if (navigator.clipboard && window.isSecureContext) {
      let settled = false;
      const fallbackTimer = setTimeout(() => {
        if (!settled) {
          settled = true;
          copyToClipboardFallback(text, successMsg);
        }
      }, 700);
      navigator.clipboard.writeText(text).then(
        () => {
          if (settled) return;
          settled = true;
          clearTimeout(fallbackTimer);
          showToast(successMsg || "Copied!");
        },
        () => {
          if (settled) return;
          settled = true;
          clearTimeout(fallbackTimer);
          copyToClipboardFallback(text, successMsg);
        }
      );
      return;
    }
    copyToClipboardFallback(text, successMsg);
  }

  function copyToClipboardFallback(text, successMsg) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.left = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    document.body.removeChild(textarea);
    showToast(copied ? successMsg || "Copied!" : "Could not copy");
  }

  // ─── DEBUG: URL state seeding ──────────────────────────────────
  // Honors query params: ?route=, ?answers=, ?fixture=, ?seed=.
  // Returns true if init should skip the normal hash-based parseRoute.

  function parseQueryParams() {
    const params = new URLSearchParams(location.search);
    const route = params.get(ROUTE_PARAM);
    const answersParam = params.get(ANSWERS_PARAM);
    const fixture = params.get(FIXTURE_PARAM);
    if (!route && !answersParam && !fixture) return false;

    let answerSeq = [];
    let restrictions = [];
    if (answersParam) {
      try { answerSeq = decodePayload(answersParam); }
      catch (e) { console.warn("[debug] bad answers param:", e); return false; }
    } else if (fixture) {
      const fix = DEBUG_FIXTURES[fixture];
      if (!fix) { console.warn("[debug] unknown fixture:", fixture); return false; }
      answerSeq = fix.answers;
      restrictions = fix.restrictions;
    }

    state.quiz = newQuiz("debug", restrictions);
    state.onboardingComplete = true;

    for (let i = 0; i < answerSeq.length; i++) {
      if (!currentCard(state.quiz)) break;
      if (state.quiz.phase === "done") break;
      const entry = answerSeq[i];
      const value = (entry && typeof entry === "object") ? entry.value : entry;
      respondToCard(state.quiz, value);
    }

    const targetRoute = route === "results" ? "profile"
      : (route || (answerSeq.length ? "profile" : "quiz"));

    if ((targetRoute === "profile" || targetRoute === "compare")
        && Object.keys(state.quiz.responses).length > 0) {
      state.profile = buildProfile(state.quiz);
    }

    state.route = targetRoute;
    history.replaceState(null, "", location.pathname + location.hash);
    return true;
  }

  // ─── INIT ──────────────────────────────────────────────────────

  try {
    epicure = await loadEpicure();
    const loading = document.querySelector(".loading");
    if (loading) loading.classList.add("hidden");
    if (parseQueryParams()) {
      render();
    } else {
      parseRoute();
    }
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
