const STORAGE_KEY = "food-match-profiles-v2";
const METRICS_KEY = "food-match-metrics-v1";
const VERSION = 2;
const RECOMMENDABLE_KINDS = new Set(["food", "dynamic"]);

const RESTRICTIONS = [
  { id: "no_restrictions", label: "No restrictions", emoji: "✅", filters: [] },
  { id: "no_meat", label: "No meat", emoji: "🥩", filters: ["meat", "pork", "beef"] },
  { id: "no_pork", label: "No pork", emoji: "🐖", filters: ["pork"] },
  { id: "no_beef", label: "No beef", emoji: "🐄", filters: ["beef"] },
  { id: "no_fish", label: "No fish", emoji: "🐟", filters: ["fish"] },
  { id: "no_shellfish", label: "No shellfish", emoji: "🦐", filters: ["shellfish"] },
  { id: "no_dairy", label: "No dairy", emoji: "🥛", filters: ["dairy"] },
  { id: "no_gluten", label: "No gluten", emoji: "🌾", filters: ["gluten"] },
  { id: "no_nuts", label: "No nuts", emoji: "🥜", filters: ["nut"] },
  { id: "vegan", label: "Vegan", emoji: "🌱", filters: ["meat", "pork", "beef", "fish", "shellfish", "dairy", "egg", "honey"] },
];

const CARDS = [
  {
    id: "light_fresh_protein",
    label: "Light + fresh protein plate",
    emoji: "🥗",
    category: "Meal shape",
    kind: "meal",
    description: "Fresh vegetables, lean protein cues, and clean sauces.",
    epicure: {
      sourceModel: "core",
      basis: "protein and fresh-vegetable modes",
      ingredients: ["salad_greens", "cucumber", "arugula", "tofu", "chickpea", "quinoa"],
      modes: ["usda_protein_g", "fg_Vegetable/Fresh salad and garden vegetables"],
      poles: [],
      coocSeeds: ["tofu", "chickpea", "cucumber"],
    },
    controversyWeight: 0,
    restrictionTags: [],
  },
  {
    id: "raw_chilled_small_plates",
    label: "Raw + chilled small plates",
    emoji: "🍣",
    category: "Meal shape",
    kind: "meal",
    description: "Sushi bar, crudo, oysters, chilled seafood, sharp condiments.",
    epicure: {
      sourceModel: "cooc",
      basis: "seafood protein cluster and East Asian co-occurrence",
      ingredients: ["tuna", "salmon", "oyster", "sea_urchin", "wasabi", "sushi_vinegar", "cucumber"],
      modes: ["usda_protein_g/High-protein seafood seeds and soy", "cf_meaty/Japanese umami seafood and dashi ingredients"],
      poles: ["cuisine:East_Asian", "cuisine:Western_Atlantic"],
      coocSeeds: ["salmon", "tuna", "wasabi"],
    },
    controversyWeight: 2,
    restrictionTags: ["fish", "shellfish"],
  },
  {
    id: "mediterranean_share",
    label: "Mediterranean share plate",
    emoji: "🥙",
    category: "Meal shape",
    kind: "meal",
    description: "Hummus, tahini, eggplant, olives, cucumbers, herbs.",
    epicure: {
      sourceModel: "cooc",
      basis: "Mediterranean savory pantry co-occurrence",
      ingredients: ["chickpea", "tahini", "olive_oil", "cucumber", "eggplant", "olive"],
      modes: ["cf_savory/Mediterranean savory herbs and cheeses", "fg_Vegetable/Fresh whole vegetables and aromatics"],
      poles: ["cuisine:Mediterranean"],
      coocSeeds: ["chickpea", "tahini", "eggplant"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "spicy_east_asian_table",
    label: "Spicy East Asian table",
    emoji: "🌶️",
    category: "Meal shape",
    kind: "meal",
    description: "Chili oil, fermented sauces, tofu, cabbage, numbing spice.",
    epicure: {
      sourceModel: "cooc",
      basis: "East Asian savory pantry and fermented sauce modes",
      ingredients: ["sichuan_peppercorn", "chili_oil", "gochujang", "kimchi", "tofu", "napa_cabbage"],
      modes: ["cf_balsamic/East Asian fermented sauces and aromatics", "fg_Pantry/East Asian umami sauces and condiments"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["sichuan_peppercorn", "chili_oil", "tofu"],
    },
    controversyWeight: 2,
    restrictionTags: [],
  },
  {
    id: "latin_taco_spread",
    label: "Chile + corn taco spread",
    emoji: "🌮",
    category: "Meal shape",
    kind: "meal",
    description: "Corn tortillas, salsa, chiles, herbs, beans.",
    epicure: {
      sourceModel: "cooc",
      basis: "Latin American chile and corn co-occurrence",
      ingredients: ["corn_tortilla", "salsa", "chipotle_pepper", "poblano_pepper", "coriander", "black_bean"],
      modes: ["cf_minty/Mexican and Latin American chiles", "sweet_score/Latin American chiles and dried peppers"],
      poles: ["cuisine:Latin_American"],
      coocSeeds: ["corn_tortilla", "salsa", "chipotle_pepper"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "south_asian_spiced_plate",
    label: "South Asian spiced plate",
    emoji: "🍛",
    category: "Meal shape",
    kind: "meal",
    description: "Warm spices, legumes, herbs, aromatic seeds.",
    epicure: {
      sourceModel: "core",
      basis: "South Asian cuisine pole and aromatic spice mode",
      ingredients: ["turmeric", "cumin", "coriander", "mustard_seed", "fenugreek_seed", "chickpea"],
      modes: ["cf_minty/South Asian aromatic whole spices", "fg_Spice/Pan-Asian aromatic whole spices and masalas"],
      poles: ["cuisine:South_Asian"],
      coocSeeds: ["turmeric", "cumin", "coriander"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "brothy_noodle_table",
    label: "Brothy noodle table",
    emoji: "🍜",
    category: "Meal shape",
    kind: "meal",
    description: "Rice noodles, tofu, mushrooms, greens, warm broth.",
    epicure: {
      sourceModel: "cooc",
      basis: "East Asian savory broth and noodle co-occurrence",
      ingredients: ["vegetable_stock", "rice_noodle", "tofu", "napa_cabbage", "enoki_mushroom", "shiitake_mushroom"],
      modes: ["F_2/East Asian savory broth ingredients", "cf_savory/East Asian savory pantry staples"],
      poles: ["cuisine:East_Asian", "cuisine:Southeast_Asian"],
      coocSeeds: ["rice_noodle", "tofu", "napa_cabbage"],
    },
    controversyWeight: 0,
    restrictionTags: [],
  },
  {
    id: "cheese_cured_plate",
    label: "Rich cheese + cured plate",
    emoji: "🧀",
    category: "Meal shape",
    kind: "meal",
    description: "Aged cheeses, olives, salami, cured and fatty flavors.",
    epicure: {
      sourceModel: "cooc",
      basis: "dairy, cured-meat, and caloric-density modes",
      ingredients: ["goat_cheese", "fontina_cheese", "blue_cheese", "olive", "salami", "bacon"],
      modes: ["fg_Dairy/European melting and table cheeses", "cf_earthy/Aged and semi-firm savory cheeses"],
      poles: ["cuisine:Mediterranean", "cuisine:Western_Atlantic"],
      coocSeeds: ["fontina_cheese", "blue_cheese", "olive"],
    },
    controversyWeight: 2,
    restrictionTags: ["dairy", "meat", "pork"],
  },
  {
    id: "chili_heat",
    label: "Chili heat",
    emoji: "🔥",
    category: "Flavor lane",
    kind: "flavor",
    description: "Hot sauce, chili oil, fresh peppers, numbing spice.",
    epicure: {
      sourceModel: "core",
      basis: "spice, pungent, woody, and chile modes",
      ingredients: ["chili_oil", "sichuan_peppercorn", "habanero_pepper", "sriracha", "gochujang"],
      modes: ["fg_Spice/Pungent chiles and warm spices", "cf_woody/Dried and fresh New World chiles"],
      poles: [],
      coocSeeds: ["chili_oil", "sriracha", "habanero_pepper"],
    },
    controversyWeight: 2,
    restrictionTags: [],
  },
  {
    id: "bright_tangy",
    label: "Bright + tangy",
    emoji: "🍋",
    category: "Flavor lane",
    kind: "flavor",
    description: "Citrus, vinegar, pickled ginger, sharp acidity.",
    epicure: {
      sourceModel: "core",
      basis: "sour and citrus compound-feature modes",
      ingredients: ["yuzu", "orange", "rice_vinegar", "balsamic_vinegar", "pickled_ginger"],
      modes: ["sour_score", "cf_citrus/Citrus-floral fruits and aromatic liqueurs"],
      poles: [],
      coocSeeds: ["rice_vinegar", "pickled_ginger", "yuzu"],
    },
    controversyWeight: 0,
    restrictionTags: [],
  },
  {
    id: "umami_earthy",
    label: "Umami + earthy",
    emoji: "🍄",
    category: "Flavor lane",
    kind: "flavor",
    description: "Mushrooms, miso, soy, dark savory depth.",
    epicure: {
      sourceModel: "chem",
      basis: "umami and earthy chemistry-aware modes",
      ingredients: ["mushroom", "shiitake_mushroom", "miso", "soy_sauce", "portobello_mushroom"],
      modes: ["umami_score/East Asian mushrooms and umami staples", "cf_earthy"],
      poles: [],
      coocSeeds: ["miso", "shiitake_mushroom", "soy_sauce"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "fermented_funky",
    label: "Fermented + funky",
    emoji: "🧪",
    category: "Flavor lane",
    kind: "flavor",
    description: "Kimchi, natto, fermented tofu, black bean funk.",
    epicure: {
      sourceModel: "cooc",
      basis: "fermented sauce and processed-staple modes",
      ingredients: ["kimchi", "natto", "miso", "fermented_tofu", "fermented_black_bean"],
      modes: ["nova_level/East Asian umami pantry staples", "cf_balsamic/East Asian fermented sauces and aromatics"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["kimchi", "natto", "miso"],
    },
    controversyWeight: 3,
    restrictionTags: [],
  },
  {
    id: "garlic_onion",
    label: "Garlicky + oniony",
    emoji: "🧄",
    category: "Flavor lane",
    kind: "flavor",
    description: "Garlic, red onion, shallot, scallion, chives.",
    epicure: {
      sourceModel: "cooc",
      basis: "pungent aromatic vegetable modes",
      ingredients: ["garlic", "red_onion", "shallot", "scallion", "chive"],
      modes: ["pungent_score/Savory aromatic vegetables and seasonings"],
      poles: [],
      coocSeeds: ["garlic", "red_onion", "scallion"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "briny_pickled",
    label: "Briny + pickled",
    emoji: "🫒",
    category: "Flavor lane",
    kind: "flavor",
    description: "Olives, capers, pickled cucumber, pickled ginger, pickled radish.",
    epicure: {
      sourceModel: "core",
      basis: "balsamic, sour, and pantry-preserved modes",
      ingredients: ["olive", "caper", "pickled_cucumber", "pickled_ginger", "pickled_radish"],
      modes: ["cf_balsamic", "sour_score"],
      poles: ["cuisine:Mediterranean", "cuisine:East_Asian"],
      coocSeeds: ["olive", "caper", "pickled_ginger"],
    },
    controversyWeight: 2,
    restrictionTags: [],
  },
  {
    id: "creamy_rich",
    label: "Creamy + rich",
    emoji: "🥛",
    category: "Flavor lane",
    kind: "flavor",
    description: "Cream, butter, yogurt, cheese, coconut milk.",
    epicure: {
      sourceModel: "core",
      basis: "fatty and dairy modes",
      ingredients: ["cream", "butter", "yogurt", "cheese", "coconut_milk"],
      modes: ["fatty_score", "fg_Dairy/Creamy dairy and egg emulsions"],
      poles: [],
      coocSeeds: ["cream", "yogurt", "coconut_milk"],
    },
    controversyWeight: 0,
    restrictionTags: ["dairy"],
  },
  {
    id: "smoky_charred",
    label: "Smoky + charred",
    emoji: "🔥",
    category: "Flavor lane",
    kind: "flavor",
    description: "Smoked paprika, chipotle, barbecue, liquid smoke.",
    epicure: {
      sourceModel: "core",
      basis: "woody and chile-family modes",
      ingredients: ["smoked_paprika", "chipotle_pepper", "barbecue_sauce", "liquid_smoke"],
      modes: ["cf_woody/Dried and fresh New World chiles", "fg_Spice/Pungent chiles and warm spices"],
      poles: ["cuisine:Latin_American", "cuisine:Western_Atlantic"],
      coocSeeds: ["chipotle_pepper", "smoked_paprika", "barbecue_sauce"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "cilantro_coriander",
    label: "Cilantro / coriander",
    emoji: "🌿",
    category: "Weed-out food",
    kind: "controversial",
    description: "A tiny herb with a giant compatibility signal.",
    epicure: {
      sourceModel: "core",
      basis: "canonical herb ingredient and South Asian pole examples",
      ingredients: ["coriander", "coriander_root"],
      modes: ["cf_minty/South Asian aromatic whole spices", "fg_Spice/Pan-Asian aromatic whole spices and masalas"],
      poles: ["cuisine:South_Asian", "cuisine:Latin_American"],
      coocSeeds: ["coriander"],
    },
    controversyWeight: 3,
    restrictionTags: [],
  },
  {
    id: "olives",
    label: "Olives",
    emoji: "🫒",
    category: "Weed-out food",
    kind: "controversial",
    description: "Briny, oily, Mediterranean, polarizing.",
    epicure: {
      sourceModel: "cooc",
      basis: "Mediterranean pantry and balsamic modes",
      ingredients: ["olive", "black_olive", "green_olive", "olive_oil"],
      modes: ["cf_savory/Mediterranean savory herbs and cheeses", "cf_balsamic/Mediterranean vinegars and peppery aromatics"],
      poles: ["cuisine:Mediterranean"],
      coocSeeds: ["olive", "olive_oil"],
    },
    controversyWeight: 3,
    restrictionTags: [],
  },
  {
    id: "mushrooms",
    label: "Mushrooms",
    emoji: "🍄",
    category: "Weed-out food",
    kind: "controversial",
    description: "Earthy, springy, umami, texture-forward.",
    epicure: {
      sourceModel: "chem",
      basis: "umami mushroom modes and chemistry-aware similarity",
      ingredients: ["mushroom", "shiitake_mushroom", "portobello_mushroom", "wood_ear_mushroom"],
      modes: ["umami_score/East Asian mushrooms and umami staples", "cf_earthy"],
      poles: [],
      coocSeeds: ["shiitake_mushroom", "portobello_mushroom"],
    },
    controversyWeight: 3,
    restrictionTags: [],
  },
  {
    id: "blue_cheese",
    label: "Blue cheese",
    emoji: "🧀",
    category: "Weed-out food",
    kind: "controversial",
    description: "Salty, creamy, moldy, intense.",
    epicure: {
      sourceModel: "cooc",
      basis: "dairy and European cheese modes",
      ingredients: ["blue_cheese", "gorgonzola_cheese", "cheese"],
      modes: ["fg_Dairy/European melting and table cheeses", "fatty_score/European artisan cheeses"],
      poles: ["cuisine:Mediterranean", "cuisine:Western_Atlantic"],
      coocSeeds: ["blue_cheese"],
    },
    controversyWeight: 4,
    restrictionTags: ["dairy"],
  },
  {
    id: "anchovy_sardine",
    label: "Anchovies + sardines",
    emoji: "🐟",
    category: "Weed-out food",
    kind: "controversial",
    description: "Tiny oily fish, salt, umami, intensity.",
    epicure: {
      sourceModel: "cooc",
      basis: "fish and umami co-occurrence neighborhoods",
      ingredients: ["anchovy", "sardine", "fish", "olive_oil"],
      modes: ["cf_meaty/Japanese umami seafood and dashi ingredients", "cf_earthy/East-Asian seafood and umami proteins"],
      poles: ["cuisine:Mediterranean", "cuisine:East_Asian"],
      coocSeeds: ["anchovy", "sardine"],
    },
    controversyWeight: 4,
    restrictionTags: ["fish"],
  },
  {
    id: "oyster_uni",
    label: "Oysters + uni",
    emoji: "🦪",
    category: "Weed-out food",
    kind: "controversial",
    description: "Oceanic, slippery, mineral, raw-bar energy.",
    epicure: {
      sourceModel: "cooc",
      basis: "seafood protein and raw-chilled co-occurrence",
      ingredients: ["oyster", "sea_urchin", "clam", "sushi_vinegar"],
      modes: ["usda_protein_g/High-protein seafood seeds and soy", "cf_meaty/Japanese umami seafood and dashi ingredients"],
      poles: ["cuisine:Western_Atlantic", "cuisine:East_Asian"],
      coocSeeds: ["oyster", "sea_urchin"],
    },
    controversyWeight: 5,
    restrictionTags: ["shellfish", "fish"],
  },
  {
    id: "octopus_squid",
    label: "Octopus + squid",
    emoji: "🐙",
    category: "Weed-out food",
    kind: "controversial",
    description: "Chewy seafood and ink-friendly savory flavors.",
    epicure: {
      sourceModel: "cooc",
      basis: "high-protein seafood mode and East Asian seafood mode",
      ingredients: ["octopus", "squid", "squid_ink"],
      modes: ["usda_protein_g/High-protein seafood seeds and soy", "cf_earthy/East-Asian seafood and umami proteins"],
      poles: ["cuisine:Mediterranean", "cuisine:East_Asian"],
      coocSeeds: ["octopus", "squid"],
    },
    controversyWeight: 4,
    restrictionTags: ["shellfish"],
  },
  {
    id: "fish_sauce_shrimp_paste",
    label: "Fish sauce + shrimp paste",
    emoji: "🧂",
    category: "Weed-out food",
    kind: "controversial",
    description: "Deep fermented seafood salt and funk.",
    epicure: {
      sourceModel: "cooc",
      basis: "Southeast Asian and East Asian umami pantry modes",
      ingredients: ["fish_sauce", "shrimp_paste", "fermented_fish"],
      modes: ["cf_earthy/East-Asian seafood and umami proteins", "cf_woody/Southeast Asian woody-spicy aromatics"],
      poles: ["cuisine:Southeast_Asian", "cuisine:East_Asian"],
      coocSeeds: ["fish_sauce", "shrimp_paste"],
    },
    controversyWeight: 5,
    restrictionTags: ["fish", "shellfish"],
  },
  {
    id: "kimchi_natto",
    label: "Kimchi + natto",
    emoji: "🥬",
    category: "Weed-out food",
    kind: "controversial",
    description: "Fermented, pungent, sour, sticky, alive-tasting.",
    epicure: {
      sourceModel: "cooc",
      basis: "fermented East Asian staples and pantry modes",
      ingredients: ["kimchi", "natto", "fermented_black_bean"],
      modes: ["nova_level/East Asian umami pantry staples", "cf_balsamic/East Asian fermented sauces and aromatics"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["kimchi", "natto"],
    },
    controversyWeight: 5,
    restrictionTags: [],
  },
  {
    id: "durian",
    label: "Durian",
    emoji: "🍈",
    category: "Weed-out food",
    kind: "controversial",
    description: "Creamy tropical fruit with maximum room-clearing power.",
    epicure: {
      sourceModel: "core",
      basis: "canonical fruit ingredient with strong niche signal",
      ingredients: ["durian"],
      modes: ["fg_Fruit", "cf_sweet"],
      poles: ["cuisine:Southeast_Asian"],
      coocSeeds: ["durian"],
    },
    controversyWeight: 5,
    restrictionTags: [],
  },
  {
    id: "liver_offal",
    label: "Liver + offal",
    emoji: "🫀",
    category: "Weed-out food",
    kind: "controversial",
    description: "Mineral, iron-rich, old-school animal flavor.",
    epicure: {
      sourceModel: "core",
      basis: "canonical organ-meat ingredients",
      ingredients: ["liver", "offal", "blood_sausage"],
      modes: ["cf_meaty", "usda_protein_g"],
      poles: ["cuisine:Eastern_European", "cuisine:Western_Atlantic"],
      coocSeeds: ["liver", "offal"],
    },
    controversyWeight: 5,
    restrictionTags: ["meat", "pork"],
  },
  {
    id: "bone_marrow",
    label: "Bone marrow",
    emoji: "🦴",
    category: "Weed-out food",
    kind: "controversial",
    description: "Fatty, roasted, primal, rich.",
    epicure: {
      sourceModel: "chem",
      basis: "fatty and meaty chemistry-aware signals",
      ingredients: ["bone_marrow"],
      modes: ["fatty_score", "cf_meaty"],
      poles: ["cuisine:Western_Atlantic"],
      coocSeeds: ["bone_marrow"],
    },
    controversyWeight: 5,
    restrictionTags: ["meat", "beef"],
  },
  {
    id: "very_spicy_peppers",
    label: "Very spicy peppers",
    emoji: "🌶️",
    category: "Weed-out food",
    kind: "controversial",
    description: "Habanero, Sichuan peppercorn, chili oil.",
    epicure: {
      sourceModel: "core",
      basis: "spice and pungent chile modes",
      ingredients: ["habanero_pepper", "sichuan_peppercorn", "chili_oil", "birds_eye_chili"],
      modes: ["fg_Spice/Pungent chiles and warm spices", "pungent_score"],
      poles: ["cuisine:Latin_American", "cuisine:East_Asian", "cuisine:Southeast_Asian"],
      coocSeeds: ["habanero_pepper", "sichuan_peppercorn"],
    },
    controversyWeight: 4,
    restrictionTags: [],
  },
  {
    id: "mayo_cottage",
    label: "Mayo + cottage cheese",
    emoji: "🥫",
    category: "Weed-out food",
    kind: "controversial",
    description: "Creamy, white, polarizing fridge staples.",
    epicure: {
      sourceModel: "cooc",
      basis: "dairy and creamy emulsion modes",
      ingredients: ["mayonnaise", "cottage_cheese"],
      modes: ["fg_Dairy/Creamy dairy and egg emulsions", "fatty_score"],
      poles: ["cuisine:Western_Atlantic"],
      coocSeeds: ["mayonnaise", "cottage_cheese"],
    },
    controversyWeight: 4,
    restrictionTags: ["dairy", "egg"],
  },
  {
    id: "okra_eggplant",
    label: "Okra + eggplant",
    emoji: "🍆",
    category: "Weed-out food",
    kind: "controversial",
    description: "Soft vegetable textures with big opinion range.",
    epicure: {
      sourceModel: "cooc",
      basis: "vegetable and Mediterranean or South Asian co-occurrence",
      ingredients: ["okra", "eggplant"],
      modes: ["fg_Vegetable/Fresh whole vegetables and aromatics", "cf_savory/Mediterranean savory herbs and cheeses"],
      poles: ["cuisine:Mediterranean", "cuisine:South_Asian"],
      coocSeeds: ["okra", "eggplant"],
    },
    controversyWeight: 3,
    restrictionTags: [],
  },
  {
    id: "stinky_ferments",
    label: "Stinky tofu + fermented fish",
    emoji: "🧫",
    category: "Weed-out food",
    kind: "controversial",
    description: "The unapologetic end of fermented food.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical fermented niche ingredients",
      ingredients: ["stinky_tofu", "stinky_mandarin_fish", "fermented_fish"],
      modes: ["nova_level/East Asian umami pantry staples", "cf_balsamic/East Asian fermented sauces and aromatics"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["stinky_tofu", "fermented_fish"],
    },
    controversyWeight: 6,
    restrictionTags: ["fish"],
  },
  {
    id: "tahini_chickpea_followup",
    label: "Tahini + chickpea",
    emoji: "🌰",
    category: "Epicure follow-up",
    kind: "dynamic",
    description: "Co-occurrence follow-up from Mediterranean share plates.",
    triggerIds: ["mediterranean_share", "briny_pickled"],
    epicure: {
      sourceModel: "cooc",
      basis: "triggered by Mediterranean co-occurrence seeds",
      ingredients: ["tahini", "chickpea", "olive_oil", "cumin"],
      modes: ["cf_savory/Mediterranean savory herbs and cheeses", "usda_fiber_g/Fiber-rich herbs legumes and spices"],
      poles: ["cuisine:Mediterranean"],
      coocSeeds: ["tahini", "chickpea"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "eggplant_yogurt_followup",
    label: "Eggplant + yogurt",
    emoji: "🍆",
    category: "Epicure follow-up",
    kind: "dynamic",
    description: "Co-occurrence follow-up from Mediterranean and South Asian plates.",
    triggerIds: ["mediterranean_share", "south_asian_spiced_plate", "okra_eggplant"],
    epicure: {
      sourceModel: "cooc",
      basis: "eggplant plus creamy dairy co-occurrence",
      ingredients: ["eggplant", "yogurt", "cumin", "coriander"],
      modes: ["cf_savory/South Asian savory spice and vegetable pantry", "fg_Dairy/Creamy dairy and egg emulsions"],
      poles: ["cuisine:Mediterranean", "cuisine:South_Asian"],
      coocSeeds: ["eggplant", "yogurt"],
    },
    controversyWeight: 2,
    restrictionTags: ["dairy"],
  },
  {
    id: "wasabi_pickle_followup",
    label: "Wasabi + pickled ginger",
    emoji: "🍥",
    category: "Epicure follow-up",
    kind: "dynamic",
    description: "Co-occurrence follow-up from raw and chilled plates.",
    triggerIds: ["raw_chilled_small_plates", "bright_tangy", "briny_pickled"],
    epicure: {
      sourceModel: "cooc",
      basis: "sushi-adjacent condiment co-occurrence",
      ingredients: ["wasabi", "pickled_ginger", "sushi_vinegar", "rice_vinegar"],
      modes: ["cf_citrus/East Asian spicy fish and aromatics", "sour_score"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["wasabi", "pickled_ginger"],
    },
    controversyWeight: 2,
    restrictionTags: [],
  },
  {
    id: "miso_mushroom_followup",
    label: "Miso + mushroom broth",
    emoji: "🍲",
    category: "Epicure follow-up",
    kind: "dynamic",
    description: "Co-occurrence follow-up from brothy, umami, and mushroom likes.",
    triggerIds: ["brothy_noodle_table", "umami_earthy", "mushrooms"],
    epicure: {
      sourceModel: "cooc",
      basis: "miso, mushroom, and broth co-occurrence",
      ingredients: ["miso", "shiitake_mushroom", "enoki_mushroom", "vegetable_stock", "tofu"],
      modes: ["umami_score/East Asian mushrooms and umami staples", "F_2/East Asian savory broth ingredients"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["miso", "shiitake_mushroom", "tofu"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "sichuan_chili_followup",
    label: "Sichuan pepper + chili oil",
    emoji: "⚡",
    category: "Epicure follow-up",
    kind: "dynamic",
    description: "Co-occurrence follow-up from chili heat and East Asian spice.",
    triggerIds: ["spicy_east_asian_table", "chili_heat", "very_spicy_peppers"],
    epicure: {
      sourceModel: "cooc",
      basis: "East Asian aromatic spice co-occurrence",
      ingredients: ["sichuan_peppercorn", "chili_oil", "napa_cabbage", "tofu"],
      modes: ["cf_balsamic/East Asian fermented sauces and aromatics", "fg_Spice/Pungent chiles and warm spices"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["sichuan_peppercorn", "chili_oil"],
    },
    controversyWeight: 3,
    restrictionTags: [],
  },
  {
    id: "gochujang_kimchi_followup",
    label: "Gochujang + kimchi",
    emoji: "🥬",
    category: "Epicure follow-up",
    kind: "dynamic",
    description: "Co-occurrence follow-up from fermented and spicy East Asian cards.",
    triggerIds: ["spicy_east_asian_table", "fermented_funky", "kimchi_natto"],
    epicure: {
      sourceModel: "cooc",
      basis: "fermented sauce and cabbage co-occurrence",
      ingredients: ["gochujang", "kimchi", "tofu", "sesame_oil"],
      modes: ["nova_level/East Asian umami pantry staples", "cf_balsamic/East Asian fermented sauces and aromatics"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["gochujang", "kimchi"],
    },
    controversyWeight: 3,
    restrictionTags: [],
  },
  {
    id: "corn_salsa_chile_followup",
    label: "Corn tortilla + salsa verde",
    emoji: "🌮",
    category: "Epicure follow-up",
    kind: "dynamic",
    description: "Co-occurrence follow-up from Latin American taco spread.",
    triggerIds: ["latin_taco_spread", "smoky_charred", "very_spicy_peppers"],
    epicure: {
      sourceModel: "cooc",
      basis: "Latin American cuisine pole and chile co-occurrence",
      ingredients: ["corn_tortilla", "salsa_verde", "poblano_pepper", "chipotle_pepper"],
      modes: ["cf_minty/Mexican and Latin American chiles", "cf_woody/Dried and fresh New World chiles"],
      poles: ["cuisine:Latin_American"],
      coocSeeds: ["corn_tortilla", "salsa_verde"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "cumin_coriander_followup",
    label: "Cumin + coriander + chickpea",
    emoji: "🧆",
    category: "Epicure follow-up",
    kind: "dynamic",
    description: "Co-occurrence follow-up from South Asian spice and cilantro likes.",
    triggerIds: ["south_asian_spiced_plate", "cilantro_coriander", "tahini_chickpea_followup"],
    epicure: {
      sourceModel: "core",
      basis: "South Asian pole and aromatic spice direction",
      ingredients: ["cumin", "coriander", "chickpea", "turmeric"],
      modes: ["cf_minty/South Asian aromatic whole spices", "cf_savory/South Asian savory spice and vegetable pantry"],
      poles: ["cuisine:South_Asian"],
      coocSeeds: ["cumin", "coriander", "chickpea"],
    },
    controversyWeight: 1,
    restrictionTags: [],
  },
  {
    id: "cheese_olive_followup",
    label: "Funky cheese + olives",
    emoji: "🧀",
    category: "Epicure follow-up",
    kind: "dynamic",
    description: "Co-occurrence follow-up from cheese, olives, and briny likes.",
    triggerIds: ["cheese_cured_plate", "blue_cheese", "olives", "briny_pickled"],
    epicure: {
      sourceModel: "cooc",
      basis: "European cheese and Mediterranean pantry co-occurrence",
      ingredients: ["blue_cheese", "goat_cheese", "olive", "black_olive"],
      modes: ["fg_Dairy/European melting and table cheeses", "cf_balsamic/Mediterranean vinegars and peppery aromatics"],
      poles: ["cuisine:Mediterranean", "cuisine:Western_Atlantic"],
      coocSeeds: ["blue_cheese", "olive"],
    },
    controversyWeight: 4,
    restrictionTags: ["dairy"],
  },
];

const DETAIL_CARDS = [
  {
    id: "food_oysters",
    label: "Oysters",
    emoji: "🦪",
    category: "Specific food",
    kind: "food",
    description: "Briny raw shellfish with a slippery, mineral bite.",
    explain: "Oysters are usually served raw on the half shell with lemon, vinegar, or hot sauce. They are a strong signal for raw-bar comfort.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical shellfish protein in raw-bar neighborhoods",
      ingredients: ["oyster", "lemon", "hot_sauce"],
      modes: ["usda_protein_g/High-protein seafood seeds and soy", "cf_meaty/Japanese umami seafood and dashi ingredients"],
      poles: ["cuisine:Western_Atlantic", "cuisine:East_Asian"],
      coocSeeds: ["oyster"],
    },
    controversyWeight: 5,
    restrictionTags: ["shellfish"],
  },
  {
    id: "food_uni",
    label: "Uni",
    emoji: "🟠",
    category: "Specific food",
    kind: "food",
    description: "Sea urchin, creamy and oceanic, often served with sushi.",
    explain: "Uni is the edible part of sea urchin. People often describe it as creamy, briny, sweet, and very ocean-forward.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical sea_urchin ingredient in sushi-adjacent space",
      ingredients: ["sea_urchin", "sushi_vinegar", "wasabi"],
      modes: ["usda_protein_g/High-protein seafood seeds and soy", "cf_meaty/Japanese umami seafood and dashi ingredients"],
      poles: ["cuisine:East_Asian", "cuisine:Western_Atlantic"],
      coocSeeds: ["sea_urchin", "sushi_vinegar"],
    },
    controversyWeight: 6,
    restrictionTags: ["fish", "shellfish"],
  },
  {
    id: "food_crudo",
    label: "Crudo / raw fish",
    emoji: "🐟",
    category: "Specific food",
    kind: "food",
    description: "Thin raw fish with citrus, oil, herbs, or salt.",
    explain: "Crudo is a raw fish preparation. It is less sauce-heavy than many cooked dishes and is often bright, chilled, and delicate.",
    epicure: {
      sourceModel: "cooc",
      basis: "raw and chilled fish ingredients plus citrus-acid modes",
      ingredients: ["tuna", "salmon", "lemon", "olive_oil"],
      modes: ["usda_protein_g/High-protein seafood seeds and soy", "cf_citrus/Savory aromatic herbs and warm spices"],
      poles: ["cuisine:Mediterranean", "cuisine:Western_Atlantic"],
      coocSeeds: ["tuna", "salmon"],
    },
    controversyWeight: 3,
    restrictionTags: ["fish"],
  },
  {
    id: "food_kimchi",
    label: "Kimchi",
    emoji: "🥬",
    category: "Specific food",
    kind: "food",
    description: "Spicy, sour fermented cabbage.",
    explain: "Kimchi is fermented cabbage or vegetables, usually tangy, spicy, garlicky, and crunchy.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical fermented vegetable and East Asian pantry mode",
      ingredients: ["kimchi", "napa_cabbage", "gochujang", "garlic"],
      modes: ["nova_level/East Asian umami pantry staples", "cf_balsamic/East Asian fermented sauces and aromatics"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["kimchi", "gochujang"],
    },
    controversyWeight: 4,
    restrictionTags: [],
  },
  {
    id: "food_miso",
    label: "Miso",
    emoji: "🍲",
    category: "Specific food",
    kind: "food",
    description: "Savory fermented soybean paste.",
    explain: "Miso is a fermented soybean paste used in soups, sauces, marinades, and dressings. It is salty and deeply umami.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical fermented soybean ingredient near broth and mushroom modes",
      ingredients: ["miso", "tofu", "shiitake_mushroom", "vegetable_stock"],
      modes: ["umami_score/East Asian mushrooms and umami staples", "F_2/East Asian savory broth ingredients"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["miso", "tofu"],
    },
    controversyWeight: 2,
    restrictionTags: [],
  },
  {
    id: "food_natto",
    label: "Natto",
    emoji: "🫘",
    category: "Specific food",
    kind: "food",
    description: "Sticky fermented soybeans.",
    explain: "Natto is fermented soybean with a sticky texture and strong aroma. It is a very high-signal compatibility food.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical fermented soybean ingredient",
      ingredients: ["natto", "soy_sauce", "mustard"],
      modes: ["nova_level/East Asian umami pantry staples", "cf_balsamic/East Asian fermented sauces and aromatics"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["natto"],
    },
    controversyWeight: 6,
    restrictionTags: [],
  },
  {
    id: "food_fish_sauce",
    label: "Fish sauce",
    emoji: "🧂",
    category: "Specific food",
    kind: "food",
    description: "Salty fermented fish condiment.",
    explain: "Fish sauce is a fermented seafood condiment used in many Southeast and East Asian dishes. It can smell intense but adds deep savoriness.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical fermented seafood condiment in umami pantry space",
      ingredients: ["fish_sauce", "fermented_fish", "lime", "chili_pepper"],
      modes: ["cf_earthy/East-Asian seafood and umami proteins", "cf_woody/Southeast Asian woody-spicy aromatics"],
      poles: ["cuisine:Southeast_Asian", "cuisine:East_Asian"],
      coocSeeds: ["fish_sauce", "fermented_fish"],
    },
    controversyWeight: 6,
    restrictionTags: ["fish"],
  },
  {
    id: "food_stinky_tofu",
    label: "Stinky tofu",
    emoji: "🧫",
    category: "Specific food",
    kind: "food",
    description: "Fermented tofu with a famously strong smell.",
    explain: "Stinky tofu is fermented tofu. It can be fried or stewed and is known for a very intense aroma.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical stinky_tofu ingredient and fermented East Asian mode",
      ingredients: ["stinky_tofu", "fermented_tofu", "tofu"],
      modes: ["nova_level/East Asian umami pantry staples", "cf_balsamic/East Asian fermented sauces and aromatics"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["stinky_tofu", "fermented_tofu"],
    },
    controversyWeight: 7,
    restrictionTags: [],
  },
  {
    id: "food_olives",
    label: "Olives",
    emoji: "🫒",
    category: "Specific food",
    kind: "food",
    description: "Briny cured fruit, usually salty and oily.",
    explain: "Olives are cured, salty, and briny. They anchor a lot of Mediterranean pantry flavor.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical olive ingredients and Mediterranean pantry mode",
      ingredients: ["olive", "black_olive", "green_olive", "olive_oil"],
      modes: ["cf_savory/Mediterranean savory herbs and cheeses", "cf_balsamic/Mediterranean vinegars and peppery aromatics"],
      poles: ["cuisine:Mediterranean"],
      coocSeeds: ["olive", "olive_oil"],
    },
    controversyWeight: 4,
    restrictionTags: [],
  },
  {
    id: "food_anchovies",
    label: "Anchovies",
    emoji: "🐟",
    category: "Specific food",
    kind: "food",
    description: "Small salty fish with concentrated umami.",
    explain: "Anchovies are tiny cured fish. They can read as fishy, salty, or deeply savory depending on the dish.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical anchovy ingredient near briny and umami modes",
      ingredients: ["anchovy", "olive_oil", "lemon"],
      modes: ["cf_meaty/Japanese umami seafood and dashi ingredients", "cf_balsamic/Mediterranean vinegars and peppery aromatics"],
      poles: ["cuisine:Mediterranean"],
      coocSeeds: ["anchovy"],
    },
    controversyWeight: 5,
    restrictionTags: ["fish"],
  },
  {
    id: "food_pickles",
    label: "Pickles",
    emoji: "🥒",
    category: "Specific food",
    kind: "food",
    description: "Crunchy, sour, salty preserved vegetables.",
    explain: "Pickles here means sour preserved vegetables, like pickled cucumber, pickled radish, or pickled onion.",
    epicure: {
      sourceModel: "core",
      basis: "canonical pickled vegetable ingredients and sour modes",
      ingredients: ["pickled_cucumber", "pickled_radish", "pickled_onion", "rice_vinegar"],
      modes: ["sour_score", "cf_balsamic"],
      poles: ["cuisine:East_Asian", "cuisine:Western_Atlantic"],
      coocSeeds: ["pickled_cucumber", "pickled_radish"],
    },
    controversyWeight: 3,
    restrictionTags: [],
  },
  {
    id: "food_shiitake",
    label: "Shiitake mushrooms",
    emoji: "🍄",
    category: "Specific food",
    kind: "food",
    description: "Earthy, savory mushrooms.",
    explain: "Shiitake mushrooms are meaty, earthy, and umami-heavy. They show up often in broths, stir-fries, and mushroom-forward dishes.",
    epicure: {
      sourceModel: "chem",
      basis: "umami and earthy mushroom modes",
      ingredients: ["shiitake_mushroom", "miso", "soy_sauce"],
      modes: ["umami_score/East Asian mushrooms and umami staples", "cf_earthy"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["shiitake_mushroom", "miso"],
    },
    controversyWeight: 3,
    restrictionTags: [],
  },
  {
    id: "food_wood_ear_enoki",
    label: "Wood ear + enoki",
    emoji: "🍜",
    category: "Specific food",
    kind: "food",
    description: "Crunchy or springy mushrooms with distinctive texture.",
    explain: "Wood ear is crunchy and gelatinous; enoki is thin and springy. This card is mostly a texture test.",
    epicure: {
      sourceModel: "cooc",
      basis: "East Asian vegetable and mushroom mode",
      ingredients: ["wood_ear_mushroom", "enoki_mushroom", "napa_cabbage"],
      modes: ["fg_Vegetable/East Asian mushrooms and greens", "cf_savory/East Asian savory pantry staples"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["wood_ear_mushroom", "enoki_mushroom"],
    },
    controversyWeight: 4,
    restrictionTags: [],
  },
  {
    id: "food_blue_cheese",
    label: "Blue cheese",
    emoji: "🧀",
    category: "Specific food",
    kind: "food",
    description: "Funky, salty, sharp cheese.",
    explain: "Blue cheese is aged with blue mold cultures. It is creamy, salty, and one of the best food-compatibility weed-outs.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical blue_cheese in dairy and fatty cheese modes",
      ingredients: ["blue_cheese", "gorgonzola_cheese", "cheese"],
      modes: ["fg_Dairy/European melting and table cheeses", "fatty_score/European artisan cheeses"],
      poles: ["cuisine:Western_Atlantic", "cuisine:Mediterranean"],
      coocSeeds: ["blue_cheese"],
    },
    controversyWeight: 6,
    restrictionTags: ["dairy"],
  },
  {
    id: "food_cottage_cheese",
    label: "Cottage cheese",
    emoji: "🥣",
    category: "Specific food",
    kind: "food",
    description: "Mild curds with a lumpy creamy texture.",
    explain: "Cottage cheese is less about strong flavor and more about texture. Some people love it, some people cannot do it.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical cottage_cheese ingredient in creamy dairy modes",
      ingredients: ["cottage_cheese", "cream", "yogurt"],
      modes: ["fg_Dairy/Creamy dairy and egg emulsions", "fatty_score"],
      poles: ["cuisine:Western_Atlantic"],
      coocSeeds: ["cottage_cheese"],
    },
    controversyWeight: 4,
    restrictionTags: ["dairy"],
  },
  {
    id: "food_liver",
    label: "Liver",
    emoji: "🫀",
    category: "Specific food",
    kind: "food",
    description: "Mineral, iron-rich organ meat.",
    explain: "Liver is an organ meat with a strong mineral flavor. It is a hard line for many people.",
    epicure: {
      sourceModel: "core",
      basis: "canonical organ-meat ingredient",
      ingredients: ["liver", "offal", "onion"],
      modes: ["cf_meaty", "usda_protein_g"],
      poles: ["cuisine:Eastern_European", "cuisine:Western_Atlantic"],
      coocSeeds: ["liver", "offal"],
    },
    controversyWeight: 6,
    restrictionTags: ["meat"],
  },
  {
    id: "food_bone_marrow",
    label: "Bone marrow",
    emoji: "🦴",
    category: "Specific food",
    kind: "food",
    description: "Roasted fatty marrow from bones.",
    explain: "Bone marrow is rich, fatty, and usually scooped from roasted bones. It is less common but very revealing.",
    epicure: {
      sourceModel: "chem",
      basis: "canonical bone_marrow ingredient with fatty and meaty signals",
      ingredients: ["bone_marrow"],
      modes: ["fatty_score", "cf_meaty"],
      poles: ["cuisine:Western_Atlantic"],
      coocSeeds: ["bone_marrow"],
    },
    controversyWeight: 6,
    restrictionTags: ["meat", "beef"],
  },
  {
    id: "food_sichuan_peppercorn",
    label: "Sichuan peppercorn",
    emoji: "⚡",
    category: "Specific food",
    kind: "food",
    description: "Tingly, numbing spice.",
    explain: "Sichuan peppercorn creates a numbing, buzzing sensation. It is not just heat, it is a mouthfeel.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical East Asian spice in pungent and balsamic modes",
      ingredients: ["sichuan_peppercorn", "chili_oil", "green_sichuan_peppercorn"],
      modes: ["cf_balsamic/East Asian fermented sauces and aromatics", "fg_Spice/Pungent chiles and warm spices"],
      poles: ["cuisine:East_Asian"],
      coocSeeds: ["sichuan_peppercorn", "chili_oil"],
    },
    controversyWeight: 5,
    restrictionTags: [],
  },
  {
    id: "food_habanero",
    label: "Habanero-level heat",
    emoji: "🌶️",
    category: "Specific food",
    kind: "food",
    description: "Very hot fresh pepper intensity.",
    explain: "Habanero is a very hot pepper with fruity aroma. This checks real heat tolerance, not just liking mild spice.",
    epicure: {
      sourceModel: "core",
      basis: "canonical habanero_pepper in chile and spice modes",
      ingredients: ["habanero_pepper", "chili_pepper"],
      modes: ["fg_Spice/Pungent chiles and warm spices", "cf_minty/Mexican and Latin American chiles"],
      poles: ["cuisine:Latin_American"],
      coocSeeds: ["habanero_pepper"],
    },
    controversyWeight: 5,
    restrictionTags: [],
  },
  {
    id: "food_octopus",
    label: "Octopus",
    emoji: "🐙",
    category: "Specific food",
    kind: "food",
    description: "Chewy seafood, often grilled or served chilled.",
    explain: "Octopus can be tender or chewy depending on preparation. It is a seafood and texture compatibility test.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical octopus ingredient in seafood protein mode",
      ingredients: ["octopus", "olive_oil", "lemon"],
      modes: ["usda_protein_g/High-protein seafood seeds and soy", "cf_earthy/East-Asian seafood and umami proteins"],
      poles: ["cuisine:Mediterranean", "cuisine:East_Asian"],
      coocSeeds: ["octopus"],
    },
    controversyWeight: 5,
    restrictionTags: ["shellfish"],
  },
  {
    id: "food_squid",
    label: "Squid",
    emoji: "🦑",
    category: "Specific food",
    kind: "food",
    description: "Chewy seafood, sometimes served with squid ink.",
    explain: "Squid is a texture-forward seafood. Squid ink adds dark, briny, savory flavor.",
    epicure: {
      sourceModel: "cooc",
      basis: "canonical squid and squid_ink ingredients in seafood mode",
      ingredients: ["squid", "squid_ink", "lemon"],
      modes: ["usda_protein_g/High-protein seafood seeds and soy", "cf_earthy/East-Asian seafood and umami proteins"],
      poles: ["cuisine:Mediterranean", "cuisine:East_Asian"],
      coocSeeds: ["squid", "squid_ink"],
    },
    controversyWeight: 5,
    restrictionTags: ["shellfish"],
  },
];

CARDS.push(...DETAIL_CARDS);

const DETAIL_ROUTES = {
  raw_chilled_small_plates: ["food_oysters", "food_uni", "food_crudo", "food_octopus", "food_squid"],
  fermented_funky: ["food_kimchi", "food_miso", "food_natto", "food_fish_sauce", "food_stinky_tofu"],
  briny_pickled: ["food_olives", "food_anchovies", "food_pickles", "food_fish_sauce"],
  umami_earthy: ["food_shiitake", "food_wood_ear_enoki", "food_miso"],
  mushrooms: ["food_shiitake", "food_wood_ear_enoki"],
  cheese_cured_plate: ["food_blue_cheese", "food_olives", "food_cottage_cheese"],
  blue_cheese: ["food_blue_cheese"],
  anchovy_sardine: ["food_anchovies"],
  oyster_uni: ["food_oysters", "food_uni"],
  octopus_squid: ["food_octopus", "food_squid"],
  fish_sauce_shrimp_paste: ["food_fish_sauce"],
  kimchi_natto: ["food_kimchi", "food_natto"],
  liver_offal: ["food_liver", "food_bone_marrow"],
  bone_marrow: ["food_bone_marrow"],
  very_spicy_peppers: ["food_sichuan_peppercorn", "food_habanero"],
  mayo_cottage: ["food_cottage_cheese"],
  stinky_ferments: ["food_stinky_tofu", "food_fish_sauce"],
  spicy_east_asian_table: ["food_sichuan_peppercorn", "food_kimchi", "food_miso"],
};

Object.entries(DETAIL_ROUTES).forEach(([cardId, detailIds]) => {
  const card = CARDS.find((item) => item.id === cardId);
  if (card) card.detailIds = detailIds;
});

const DAYLIST_WORDS = {
  raw_chilled_small_plates: ["raw bar", "chilled"],
  food_oysters: ["oyster"],
  food_uni: ["uni"],
  food_crudo: ["crudo"],
  food_octopus: ["octopus"],
  food_squid: ["squid ink"],
  oyster_uni: ["raw bar"],
  octopus_squid: ["chewy seafood"],
  fermented_funky: ["fermented"],
  food_kimchi: ["kimchi"],
  food_miso: ["miso"],
  food_natto: ["natto"],
  food_fish_sauce: ["fish sauce"],
  food_stinky_tofu: ["stinky tofu"],
  kimchi_natto: ["fermented"],
  gochujang_kimchi_followup: ["gochujang"],
  briny_pickled: ["briny"],
  olives: ["olive"],
  food_olives: ["olive"],
  anchovy_sardine: ["anchovy"],
  food_anchovies: ["anchovy"],
  food_pickles: ["pickle"],
  umami_earthy: ["umami"],
  mushrooms: ["mushroom"],
  food_shiitake: ["shiitake"],
  food_wood_ear_enoki: ["wood ear"],
  spicy_east_asian_table: ["chili oil"],
  chili_heat: ["chili"],
  food_sichuan_peppercorn: ["sichuan tingle"],
  food_habanero: ["habanero"],
  mediterranean_share: ["mezze"],
  tahini_chickpea_followup: ["tahini"],
  eggplant_yogurt_followup: ["eggplant yogurt"],
  latin_taco_spread: ["salsa verde"],
  south_asian_spiced_plate: ["cumin coriander"],
  brothy_noodle_table: ["brothy noodle"],
  cheese_cured_plate: ["cheese board"],
  food_blue_cheese: ["blue cheese"],
  food_cottage_cheese: ["cottage cheese"],
  liver_offal: ["liver"],
  food_liver: ["liver"],
  bone_marrow: ["bone marrow"],
  food_bone_marrow: ["bone marrow"],
  fish_sauce_shrimp_paste: ["fish sauce"],
  light_fresh_protein: ["fresh protein"],
  bright_tangy: ["bright tangy"],
  garlicky_onion: ["garlic"],
  creamy_rich: ["creamy"],
  smoky_charred: ["smoky"],
};

const state = {
  route: "quiz",
  incomingProfile: null,
  compareProfiles: null,
  selectedProfile: null,
  toast: "",
  quiz: makeEmptyQuiz(),
};

const app = document.querySelector("#app");

function makeEmptyQuiz() {
  return {
    phase: "restrictions",
    name: "",
    restrictions: [],
    queue: [],
    index: 0,
    responses: {},
  };
}

function cardById(id) {
  return CARDS.find((card) => card.id === id);
}

function selectedFilters(restrictionIds) {
  const filters = new Set();
  restrictionIds.forEach((id) => {
    const restriction = RESTRICTIONS.find((item) => item.id === id);
    restriction?.filters.forEach((filter) => filters.add(filter));
  });
  return filters;
}

function isCardAllowed(card, restrictionIds) {
  const filters = selectedFilters(restrictionIds);
  return !card.restrictionTags.some((tag) => filters.has(tag));
}

function staticCardIds(restrictionIds) {
  return CARDS
    .filter((card) => !card.triggerIds)
    .filter((card) => card.kind === "food")
    .filter((card) => isCardAllowed(card, restrictionIds))
    .map((card) => card.id);
}

function insertDetailCards(card) {
  const detailIds = card.detailIds || [];
  if (!detailIds.length) return;

  const queued = new Set(state.quiz.queue);
  const detailCards = detailIds
    .map(cardById)
    .filter(Boolean)
    .filter((item) => !queued.has(item.id))
    .filter((item) => state.quiz.responses[item.id] === undefined)
    .filter((item) => isCardAllowed(item, state.quiz.restrictions));

  if (!detailCards.length) return;
  state.quiz.queue.splice(state.quiz.index + 1, 0, ...detailCards.map((item) => item.id));
}

function maybeAppendDynamicCards(answeredCardId) {
  const answeredCard = cardById(answeredCardId);
  if (!answeredCard || state.quiz.responses[answeredCardId] !== true) return;

  const queued = new Set(state.quiz.queue);
  for (const card of CARDS) {
    if (!card.triggerIds || queued.has(card.id)) continue;
    if (!isCardAllowed(card, state.quiz.restrictions)) continue;
    if (card.triggerIds.includes(answeredCardId)) {
      state.quiz.queue.push(card.id);
      queued.add(card.id);
    }
  }
}

function beginQuiz(incomingProfile = null) {
  state.route = "quiz";
  state.incomingProfile = incomingProfile;
  state.compareProfiles = null;
  state.selectedProfile = null;
  state.quiz = makeEmptyQuiz();
  render();
}

function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

function startCards() {
  state.quiz.phase = "cards";
  state.quiz.queue = staticCardIds(state.quiz.restrictions);
  state.quiz.index = 0;
  render();
}

function answerCurrent(answer) {
  const id = state.quiz.queue[state.quiz.index];
  if (!id) {
    finishQuiz();
    return;
  }
  const card = cardById(id);
  if (answer === "details") {
    state.quiz.responses[id] = "details";
    insertDetailCards(card);
  } else {
    state.quiz.responses[id] = answer;
  }
  if (answer === true) maybeAppendDynamicCards(id);
  state.quiz.index += 1;
  if (state.quiz.index >= state.quiz.queue.length) {
    finishQuiz();
  } else {
    render();
  }
}

function finishQuiz() {
  const profile = buildProfile();
  saveProfile(profile);
  if (state.incomingProfile) {
    recordMetric("comparisonsCreated");
    state.route = "compare";
    state.compareProfiles = [state.incomingProfile, profile];
    state.selectedProfile = profile;
    history.replaceState(null, "", compareUrl(state.incomingProfile, profile));
  } else {
    state.route = "profile";
    state.selectedProfile = profile;
    history.replaceState(null, "", profileUrl(profile));
  }
  render();
}

function buildProfile() {
  const id = `fm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    version: VERSION,
    id,
    name: normalizeName(state.quiz.name),
    createdAt: new Date().toISOString(),
    restrictions: state.quiz.restrictions,
    responses: state.quiz.responses,
  };
}

function loadProfiles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveProfile(profile) {
  const profiles = loadProfiles().filter((item) => item.id !== profile.id);
  profiles.unshift(profile);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.slice(0, 12)));
  recordMetric("profilesCreated");
}

function defaultMetrics() {
  return {
    profilesCreated: 0,
    inviteShares: 0,
    profileLinkShares: 0,
    comparisonShares: 0,
    incomingInviteOpens: 0,
    comparisonsCreated: 0,
    perProfileInviteShares: {},
    seenInviteOpens: [],
    updatedAt: null,
  };
}

function loadMetrics() {
  try {
    return { ...defaultMetrics(), ...JSON.parse(localStorage.getItem(METRICS_KEY) || "{}") };
  } catch {
    return defaultMetrics();
  }
}

function saveMetrics(metrics) {
  localStorage.setItem(METRICS_KEY, JSON.stringify({ ...metrics, updatedAt: new Date().toISOString() }));
}

function recordMetric(metricName, profileId = null) {
  const metrics = loadMetrics();
  metrics[metricName] = (metrics[metricName] || 0) + 1;
  if (metricName === "inviteShares" && profileId) {
    metrics.perProfileInviteShares[profileId] = (metrics.perProfileInviteShares[profileId] || 0) + 1;
  }
  saveMetrics(metrics);
}

function recordInviteOpen(profile) {
  if (!profile?.id) return;
  const metrics = loadMetrics();
  if (metrics.seenInviteOpens.includes(profile.id)) return;
  metrics.seenInviteOpens.push(profile.id);
  metrics.incomingInviteOpens = (metrics.incomingInviteOpens || 0) + 1;
  saveMetrics(metrics);
}

function encodePayload(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodePayload(payload) {
  const padded = payload.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function baseUrl() {
  return location.href.split("#")[0];
}

function profileUrl(profile) {
  return `${baseUrl()}#profile=${encodePayload(profile)}`;
}

function inviteUrl(profile) {
  return `${baseUrl()}#take=${encodePayload(profile)}`;
}

function compareUrl(a, b) {
  return `${baseUrl()}#compare=${encodePayload(a)}.${encodePayload(b)}`;
}

function parseRoute() {
  const hash = location.hash.slice(1);
  if (!hash) return beginQuiz();

  try {
    if (hash.startsWith("take=")) {
      const incomingProfile = decodePayload(hash.slice(5));
      recordInviteOpen(incomingProfile);
      return beginQuiz(incomingProfile);
    }
    if (hash.startsWith("profile=")) {
      state.route = "profile";
      state.selectedProfile = decodePayload(hash.slice(8));
      state.incomingProfile = null;
      state.compareProfiles = null;
      return render();
    }
    if (hash.startsWith("compare=")) {
      const [a, b] = hash.slice(8).split(".");
      state.route = "compare";
      state.compareProfiles = [decodePayload(a), decodePayload(b)];
      state.incomingProfile = null;
      return render();
    }
  } catch {
    showToast("That link could not be opened");
  }

  beginQuiz();
}

function profileLabel(profile) {
  const liked = likedCards(profile);
  const priority = liked.find((card) => ["food", "controversial", "meal", "flavor", "dynamic"].includes(card.kind));
  const icon = priority?.emoji || "🍽️";
  return `${icon} ${profileDaylistTitle(profile)}`;
}

function profileDaylistTitle(profile) {
  const name = normalizeName(profile.name);
  const title = daylistCoreTitle(profile);
  return name ? `${name}'s ${title}` : title;
}

function daylistCoreTitle(profile) {
  const likedCardsList = likedCards(profile);
  const likedSpecificIds = new Set(likedCardsList.filter((card) => card.kind === "food").map((card) => card.id));
  const liked = likedCardsList
    .filter((card) => !card.detailIds?.some((id) => likedSpecificIds.has(id)))
    .sort((a, b) => daylistWeight(b) - daylistWeight(a));
  const words = [];
  for (const card of liked) {
    const candidates = DAYLIST_WORDS[card.id] || [card.label.toLowerCase().replaceAll("+", "").replace(/\s+/g, " ").trim()];
    for (const word of candidates) {
      if (words.length >= 3) break;
      if (!words.includes(word)) words.push(word);
    }
    if (words.length >= 3) break;
  }
  if (!words.length) words.push("open table");
  if (words.length === 1) words.push("curious");
  return `${words.join(" ")} ${dayLabel(profile.createdAt)}`;
}

function daylistWeight(card) {
  if (card.kind === "food") return 100 + card.controversyWeight;
  if (card.kind === "controversial") return 70 + card.controversyWeight;
  if (card.kind === "dynamic") return 45 + card.controversyWeight;
  return 20 + card.controversyWeight;
}

function dayLabel(createdAt) {
  const date = createdAt ? new Date(createdAt) : new Date();
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" }).toLowerCase();
  const hour = Number.isFinite(date.getHours()) ? date.getHours() : new Date().getHours();
  const part = hour < 5 ? "late night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 22 ? "evening" : "night";
  return `${weekday} ${part}`;
}

function likedCards(profile) {
  return Object.entries(profile.responses || {})
    .filter(([, value]) => value === true)
    .map(([id]) => cardById(id))
    .filter(Boolean);
}

function dislikedCards(profile) {
  return Object.entries(profile.responses || {})
    .filter(([, value]) => value === false)
    .map(([id]) => cardById(id))
    .filter(Boolean);
}

function unknownCards(profile) {
  return Object.entries(profile.responses || {})
    .filter(([, value]) => value === "unknown")
    .map(([id]) => cardById(id))
    .filter(Boolean);
}

function addWeighted(map, key, value) {
  map[key] = (map[key] || 0) + value;
}

function isHighSignal(card) {
  return card.kind === "controversial" || card.kind === "food";
}

function profileSignals(profile) {
  const liked = likedCards(profile);
  const disliked = dislikedCards(profile);
  const signals = {
    ingredients: {},
    modes: {},
    poles: {},
    cardLikes: {},
    cardDislikes: {},
    controversialLikes: {},
    controversialDislikes: {},
  };

  liked.forEach((card) => {
    const cardWeight = isHighSignal(card) ? 2 + card.controversyWeight : 1;
    addWeighted(signals.cardLikes, card.id, cardWeight);
    card.epicure.ingredients.forEach((item) => addWeighted(signals.ingredients, item, cardWeight));
    card.epicure.modes.forEach((item) => addWeighted(signals.modes, item, cardWeight * 1.15));
    card.epicure.poles.forEach((item) => addWeighted(signals.poles, item, cardWeight));
    if (isHighSignal(card)) addWeighted(signals.controversialLikes, card.id, card.controversyWeight);
  });

  disliked.forEach((card) => {
    addWeighted(signals.cardDislikes, card.id, isHighSignal(card) ? 2 : 1);
    if (isHighSignal(card)) addWeighted(signals.controversialDislikes, card.id, card.controversyWeight);
  });

  return signals;
}

function weightedJaccard(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  if (!keys.size) return 0;
  let overlap = 0;
  let union = 0;
  keys.forEach((key) => {
    overlap += Math.min(a[key] || 0, b[key] || 0);
    union += Math.max(a[key] || 0, b[key] || 0);
  });
  return union ? overlap / union : 0;
}

function compareProfiles(a, b) {
  const sa = profileSignals(a);
  const sb = profileSignals(b);
  let sharedCards = intersectionKeys(sa.cardLikes, sb.cardLikes).map(cardById).filter(Boolean);
  let sharedNiche = intersectionKeys(sa.controversialLikes, sb.controversialLikes).map(cardById).filter(Boolean);
  const sharedSpecificIds = new Set(sharedCards.filter((card) => card.kind === "food").map((card) => card.id));
  const hidesSpecificDuplicate = (card) => card.detailIds?.some((id) => sharedSpecificIds.has(id));
  sharedCards = sharedCards.filter((card) => !hidesSpecificDuplicate(card));
  sharedNiche = sharedNiche.filter((card) => !hidesSpecificDuplicate(card));
  const conflictCards = [
    ...intersectionKeys(sa.cardLikes, sb.cardDislikes),
    ...intersectionKeys(sb.cardLikes, sa.cardDislikes),
  ].map(cardById).filter(Boolean);
  const restrictionConflicts = restrictionConflictsFor(a, b);

  const broad = weightedJaccard(sa.cardLikes, sb.cardLikes);
  const ingredient = weightedJaccard(sa.ingredients, sb.ingredients);
  const mode = weightedJaccard(sa.modes, sb.modes);
  const pole = weightedJaccard(sa.poles, sb.poles);
  const nicheBonus = Math.min(18, sharedNiche.reduce((sum, card) => sum + card.controversyWeight * 2, 0));
  const conflictPenalty = Math.min(22, conflictCards.reduce((sum, card) => sum + (isHighSignal(card) ? card.controversyWeight * 2 : 2), 0));
  const restrictionPenalty = Math.min(18, restrictionConflicts.length * 5);
  const score = Math.round(clamp(18 + ingredient * 30 + mode * 28 + pole * 12 + broad * 10 + nicheBonus - conflictPenalty - restrictionPenalty, 0, 100));
  const recommendations = bridgeRecommendations(a, b, sa, sb);

  return {
    score,
    components: { direct: broad, ingredient, mode, pole, nicheBonus, conflictPenalty, restrictionPenalty },
    sharedCards,
    sharedNiche,
    conflictCards,
    restrictionConflicts,
    bridgeRecommendations: recommendations,
    bridgeCards: recommendations.map((item) => item.card),
    topIngredients: topSharedKeys(sa.ingredients, sb.ingredients, 10),
    topModes: topSharedKeys(sa.modes, sb.modes, 6),
  };
}

function restrictionConflictsFor(a, b) {
  const aFilters = selectedFilters(a.restrictions || []);
  const bFilters = selectedFilters(b.restrictions || []);
  const conflicts = [];
  likedCards(a).forEach((card) => {
    if (card.restrictionTags.some((tag) => bFilters.has(tag))) conflicts.push(card);
  });
  likedCards(b).forEach((card) => {
    if (card.restrictionTags.some((tag) => aFilters.has(tag))) conflicts.push(card);
  });
  return uniqueCards(conflicts);
}

function bridgeRecommendations(a, b, sa, sb) {
  const disliked = new Set([...Object.keys(sa.cardDislikes), ...Object.keys(sb.cardDislikes)]);
  const alreadyShared = new Set(intersectionKeys(sa.cardLikes, sb.cardLikes));
  const filters = [...selectedFilters(a.restrictions || []), ...selectedFilters(b.restrictions || [])];
  const blocked = new Set(filters);

  return CARDS
    .filter((card) => RECOMMENDABLE_KINDS.has(card.kind))
    .filter((card) => !disliked.has(card.id) && !alreadyShared.has(card.id))
    .filter((card) => !isBlockedByProfileDislikes(card, a) && !isBlockedByProfileDislikes(card, b))
    .filter((card) => !card.restrictionTags.some((tag) => blocked.has(tag)))
    .map((card) => {
      const evidence = recommendationEvidence(card, sa, sb);
      return { card, evidence, score: evidence.score };
    })
    .filter((item) => item.score >= 2)
    .sort((aItem, bItem) => bItem.score - aItem.score)
    .slice(0, 5);
}

function isBlockedByProfileDislikes(candidate, profile) {
  const candidateKeys = new Set(dislikeBlockerKeys(candidate));
  return dislikedCards(profile).some((card) => dislikeBlockerKeys(card).some((key) => candidateKeys.has(key)));
}

function dislikeBlockerKeys(card) {
  return [...new Set([card.epicure.ingredients[0], ...card.epicure.coocSeeds].filter(Boolean))];
}

function recommendationEvidence(card, sa, sb) {
  const sharedIngredients = card.epicure.ingredients.filter((item) => sa.ingredients[item] && sb.ingredients[item]);
  const sharedModes = card.epicure.modes.filter((item) => sa.modes[item] && sb.modes[item]);
  const sharedPoles = card.epicure.poles.filter((item) => sa.poles[item] && sb.poles[item]);
  const aIngredientHits = card.epicure.ingredients.filter((item) => sa.ingredients[item]);
  const bIngredientHits = card.epicure.ingredients.filter((item) => sb.ingredients[item]);
  const aModeHits = card.epicure.modes.filter((item) => sa.modes[item]);
  const bModeHits = card.epicure.modes.filter((item) => sb.modes[item]);
  const aPoleHits = card.epicure.poles.filter((item) => sa.poles[item]);
  const bPoleHits = card.epicure.poles.filter((item) => sb.poles[item]);
  const crossIngredientSupport = Math.min(aIngredientHits.length, bIngredientHits.length);
  const crossModeSupport = Math.min(aModeHits.length, bModeHits.length);
  const exactSupport = (sa.cardLikes[card.id] ? 1 : 0) + (sb.cardLikes[card.id] ? 1 : 0);
  const score = sharedIngredients.length * 5
    + sharedModes.length * 4
    + sharedPoles.length * 3
    + crossIngredientSupport * 1.5
    + crossModeSupport
    + exactSupport;

  return {
    sharedIngredients,
    sharedModes,
    sharedPoles,
    aIngredientHits,
    bIngredientHits,
    aModeHits,
    bModeHits,
    aPoleHits,
    bPoleHits,
    score,
  };
}

function intersectionKeys(a, b) {
  return Object.keys(a).filter((key) => b[key]);
}

function topSharedKeys(a, b, count) {
  return intersectionKeys(a, b)
    .map((key) => ({ key, score: Math.min(a[key], b[key]) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, count)
    .map((item) => item.key);
}

function topWeightedKeys(map, count) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => key);
}

function relationEvidence(cardA, cardB) {
  const ingredients = overlap(cardA.epicure.ingredients, cardB.epicure.ingredients);
  const modes = overlap(cardA.epicure.modes, cardB.epicure.modes);
  const poles = overlap(cardA.epicure.poles, cardB.epicure.poles);
  const coocSeeds = overlap(cardA.epicure.coocSeeds, cardB.epicure.coocSeeds);
  return {
    ingredients,
    modes,
    poles,
    coocSeeds,
    score: ingredients.length * 4 + modes.length * 3 + poles.length * 2 + coocSeeds.length,
  };
}

function overlap(a, b) {
  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item));
}

function boundaryCards(profile) {
  const liked = likedCards(profile);
  return dislikedCards(profile)
    .map((disliked) => {
      const related = liked
        .map((likedCard) => ({ card: likedCard, evidence: relationEvidence(disliked, likedCard) }))
        .filter((item) => item.evidence.score > 0)
        .sort((a, b) => b.evidence.score - a.evidence.score)[0];
      return related ? { card: disliked, related: related.card, evidence: related.evidence } : null;
    })
    .filter(Boolean)
    .slice(0, 5);
}

function displayKey(key) {
  const cleaned = key.includes("/") ? key.split("/").pop() : key;
  const modeAliases = [
    ["umami_score", "umami"],
    ["sour_score", "sour"],
    ["bitter_score", "bitter"],
    ["sweet_score", "sweet"],
    ["pungent_score", "pungent"],
    ["fatty_score", "fatty"],
    ["cf_balsamic", "briny / fermented"],
    ["cf_earthy", "earthy"],
    ["cf_meaty", "meaty / seafood umami"],
    ["cf_citrus", "citrus"],
    ["cf_woody", "woody / smoky"],
    ["cf_minty", "herbal / spice"],
    ["cf_savory", "savory"],
    ["fg_Dairy", "dairy"],
    ["fg_Spice", "spice"],
    ["fg_Vegetable", "vegetable"],
    ["usda_protein_g", "protein"],
    ["cuisine:East_Asian", "East Asian"],
    ["cuisine:Mediterranean", "Mediterranean"],
    ["cuisine:South_Asian", "South Asian"],
    ["cuisine:Latin_American", "Latin American"],
    ["cuisine:Southeast_Asian", "Southeast Asian"],
    ["cuisine:Western_Atlantic", "Western Atlantic"],
  ];
  const alias = modeAliases.find(([prefix]) => key.startsWith(prefix));
  return (alias ? alias[1] : cleaned).replaceAll("_", " ");
}

function shortCardLabel(card) {
  return (DAYLIST_WORDS[card.id]?.[0] || card.label)
    .replace(" / ", " ")
    .replace(" + ", " ")
    .slice(0, 18);
}

function profileDriverSummary(profile) {
  const signals = profileSignals(profile);
  return {
    ingredients: topWeightedKeys(signals.ingredients, 8),
    modes: topWeightedKeys(signals.modes, 6),
    poles: topWeightedKeys(signals.poles, 4),
    boundaries: boundaryCards(profile),
  };
}

function graphForProfile(profile) {
  const liked = likedCards(profile).sort((a, b) => daylistWeight(b) - daylistWeight(a)).slice(0, 8);
  const boundaries = boundaryCards(profile).map((item) => item.card);
  const unknown = unknownCards(profile).slice(0, 3);
  const cards = uniqueCards([...liked, ...boundaries, ...unknown]).slice(0, 14);
  const drivers = profileDriverSummary(profile);
  const modeNodes = drivers.modes.slice(0, 3).map((mode) => ({
    id: `mode:${mode}`,
    label: displayKey(mode),
    kind: "mode",
  }));
  const nodes = [
    ...cards.map((card) => ({
      id: card.id,
      label: shortCardLabel(card),
      emoji: card.emoji,
      kind: responseKind(profile.responses[card.id]),
    })),
    ...modeNodes,
  ];

  const edges = [];
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const evidence = relationEvidence(cards[i], cards[j]);
      if (evidence.score > 0) edges.push({ from: cards[i].id, to: cards[j].id, score: evidence.score, evidence });
    }
  }
  modeNodes.forEach((modeNode) => {
    const mode = modeNode.id.replace("mode:", "");
    cards.forEach((card) => {
      if (card.epicure.modes.includes(mode)) {
        edges.push({ from: card.id, to: modeNode.id, score: 3, evidence: { modes: [mode] } });
      }
    });
  });

  return {
    title: "Your Epicure food topology",
    caption: "Edges connect foods that share Epicure canonical ingredients, modes, cuisine poles, or Cooc seeds.",
    nodes,
    edges: edges.sort((a, b) => b.score - a.score).slice(0, 22),
  };
}

function graphForComparison(a, b, result) {
  const cards = uniqueCards([
    ...result.sharedNiche,
    ...result.sharedCards,
    ...result.conflictCards,
    ...result.bridgeRecommendations.map((item) => item.card),
  ]).slice(0, 14);
  const modeNodes = result.topModes.slice(0, 3).map((mode) => ({
    id: `mode:${mode}`,
    label: displayKey(mode),
    kind: "mode",
  }));
  const nodes = [
    ...cards.map((card) => ({
      id: card.id,
      label: shortCardLabel(card),
      emoji: card.emoji,
      kind: compareNodeKind(card, a, b, result),
    })),
    ...modeNodes,
  ];
  const edges = [];
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const evidence = relationEvidence(cards[i], cards[j]);
      if (evidence.score > 0) edges.push({ from: cards[i].id, to: cards[j].id, score: evidence.score, evidence });
    }
  }
  modeNodes.forEach((modeNode) => {
    const mode = modeNode.id.replace("mode:", "");
    cards.forEach((card) => {
      if (card.epicure.modes.includes(mode)) {
        edges.push({ from: card.id, to: modeNode.id, score: 3, evidence: { modes: [mode] } });
      }
    });
  });
  return {
    title: "Why this match exists",
    caption: "Shared modes and ingredients matter more than exact same-food overlap.",
    nodes,
    edges: edges.sort((x, y) => y.score - x.score).slice(0, 24),
  };
}

function responseKind(response) {
  if (response === true) return "liked";
  if (response === false) return "disliked";
  if (response === "unknown") return "unknown";
  return "neutral";
}

function compareNodeKind(card, a, b, result) {
  if (result.conflictCards.some((item) => item.id === card.id)) return "conflict";
  if (result.bridgeRecommendations.some((item) => item.card.id === card.id)) return "bridge";
  if (a.responses[card.id] === true && b.responses[card.id] === true) return "shared";
  if (a.responses[card.id] === true || b.responses[card.id] === true) return "liked";
  return "neutral";
}

function uniqueCards(cards) {
  const seen = new Set();
  return cards.filter((card) => {
    if (seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function render() {
  if (state.route === "profile") return renderProfile();
  if (state.route === "compare") return renderCompare();
  if (state.route === "profiles") return renderProfileHistory();
  renderQuiz();
}

function renderShell(content) {
  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">🍽️</div>
        <div>
          <h1>Food Match</h1>
          <p>A tasting deck for eating together.</p>
        </div>
      </div>
      <div class="top-actions">
        <button class="pill-button" data-action="new-quiz" data-icon="↻">Retake</button>
        <button class="pill-button" data-action="history" data-icon="☰">Profiles</button>
      </div>
    </header>
    <section class="stage">${content}</section>
    <footer class="source-strip">
      Epicure mappings use canonical ingredients, Cooc/Core/Chem modes, and cuisine poles from
      <a href="https://huggingface.co/Kaikaku/epicure-cooc" target="_blank" rel="noreferrer">Epicure Cooc</a>,
      <a href="https://huggingface.co/Kaikaku/epicure-core" target="_blank" rel="noreferrer">Epicure Core</a>, and
      <a href="https://arxiv.org/abs/2605.22391" target="_blank" rel="noreferrer">arXiv 2605.22391</a>.
    </footer>
    ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
  `;
  bindGlobalActions();
}

function renderQuiz() {
  if (state.quiz.phase === "restrictions") {
    renderShell(`
      <article class="tool-card quiz-card">
        <div class="card-kicker">
          ${state.incomingProfile ? `<span class="tag data">Comparing with ${escapeHtml(profileLabel(state.incomingProfile))}</span>` : ""}
          <span class="tag good">Step 1</span>
        </div>
        <div class="question">
          <div class="emoji-hero">⚠️</div>
          <h2>Ground rules</h2>
          <p>Pick any restrictions. The quiz asks about specific foods by default and removes foods that should never appear.</p>
        </div>
        <label class="name-field">
          <span>Name for this profile</span>
          <input id="profile-name" type="text" maxlength="40" autocomplete="name" placeholder="Optional, e.g. Eve" value="${escapeHtml(state.quiz.name)}">
        </label>
        <div class="restriction-grid">
          ${RESTRICTIONS.map(renderRestrictionButton).join("")}
        </div>
        <div class="button-row">
          <button class="primary-button" data-action="start-cards">Start quiz</button>
        </div>
      </article>
    `);
    bindRestrictionActions();
    return;
  }

  const id = state.quiz.queue[state.quiz.index];
  const card = cardById(id);
  if (!card) return finishQuiz();
  const percent = Math.round(((state.quiz.index) / Math.max(1, state.quiz.queue.length)) * 100);
  const category = card.kind === "food" ? "Specific food" : card.detailIds ? "Food situation" : card.category;
  renderShell(`
    <article class="tool-card quiz-card">
      <div class="progress-wrap">
        <div class="progress-meta">
          <span>${state.quiz.index + 1} / ${state.quiz.queue.length}</span>
          <button class="ghost-button" data-action="finish-early">Finish</button>
        </div>
        <div class="progress-track"><div class="progress-bar" style="width: ${percent}%"></div></div>
      </div>
      <div class="card-kicker">
        <span class="tag ${isHighSignal(card) ? "hot" : "good"}">${escapeHtml(category)}</span>
        <span class="tag data">${escapeHtml(card.epicure.sourceModel.toUpperCase())}</span>
        ${card.triggerIds ? `<span class="tag data">dynamic</span>` : ""}
        ${card.detailIds ? `<span class="tag data">${card.detailIds.length} specifics</span>` : ""}
      </div>
      <div class="question">
        <div class="emoji-hero">${card.emoji}</div>
        <h2>${escapeHtml(card.label)}</h2>
        <p>${escapeHtml(card.description)}</p>
      </div>
      ${renderClarifier(card)}
      ${renderChoiceRow(card)}
      ${renderTrace(card)}
    </article>
  `);
  bindAnswerActions();
}

function renderChoiceRow(card) {
  if (card.kind !== "food") {
    const detailsButton = card.detailIds?.length
      ? `<button class="choice-button details" data-answer="details"><span>🔎</span> Show foods</button>`
      : "";
    return `
      <div class="choice-row moment ${card.detailIds?.length ? "has-details" : ""}">
        <button class="choice-button like" data-answer="true"><span>👍</span> Usually yes</button>
        <button class="choice-button dislike" data-answer="false"><span>👎</span> Usually no</button>
        ${detailsButton}
        <button class="choice-button skip" data-answer="skip"><span>↷</span> Skip</button>
      </div>
    `;
  }

  return `
    <div class="choice-row food">
      <button class="choice-button like" data-answer="true"><span>👍</span> Like</button>
      <button class="choice-button dislike" data-answer="false"><span>👎</span> Don't like</button>
      <button class="choice-button unknown" data-answer="unknown"><span>🤷</span> Don't know</button>
    </div>
  `;
}

function renderClarifier(card) {
  const details = (card.detailIds || []).map(cardById).filter(Boolean);
  const summary = card.kind === "food" ? "What is this?" : details.length ? "What foods count?" : "Why this card?";
  const body = card.explain || card.description;
  return `
    <details class="clarifier">
      <summary>${summary}</summary>
      <p>${escapeHtml(body)}</p>
      ${details.length ? `<div class="detail-preview">${details.map(renderCardChip).join("")}</div>` : ""}
    </details>
  `;
}

function renderRestrictionButton(restriction) {
  const active = restriction.id === "no_restrictions"
    ? state.quiz.restrictions.length === 0
    : state.quiz.restrictions.includes(restriction.id);
  return `
    <button class="restriction-button ${active ? "active" : ""}" data-restriction="${restriction.id}">
      ${restriction.emoji} ${escapeHtml(restriction.label)}
    </button>
  `;
}

function renderTrace(card) {
  return `
    <details class="trace">
      <summary>Epicure trace</summary>
      <div class="trace-grid">
        ${traceGroup("Source", [card.epicure.sourceModel, card.epicure.basis])}
        ${traceGroup("Canonical ingredients", card.epicure.ingredients)}
        ${traceGroup("Modes", card.epicure.modes)}
        ${traceGroup("Cuisine poles", card.epicure.poles)}
        ${traceGroup("Cooc seeds", card.epicure.coocSeeds)}
      </div>
    </details>
  `;
}

function traceGroup(label, items) {
  if (!items.length) return "";
  return `
    <div class="trace-group">
      <div class="trace-label">${escapeHtml(label)}</div>
      <div class="trace-chips">${items.map((item) => `<span class="trace-chip">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
  `;
}

function renderEvidenceGraph(graph) {
  if (!graph.nodes.length) return "";
  const positions = graphPositions(graph.nodes);
  const lines = graph.edges
    .filter((edge) => positions[edge.from] && positions[edge.to])
    .map((edge) => {
      const from = positions[edge.from];
      const to = positions[edge.to];
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke-width="${Math.min(4, 1 + edge.score / 4)}"></line>`;
    })
    .join("");
  const nodes = graph.nodes
    .map((node) => {
      const point = positions[node.id];
      return `
        <g class="graph-node ${escapeHtml(node.kind)}" transform="translate(${point.x} ${point.y})">
          <circle r="${node.kind === "mode" ? 24 : 20}"></circle>
          <text class="graph-emoji" y="${node.kind === "mode" ? -2 : -4}">${node.emoji || "◆"}</text>
          <text class="graph-node-label" y="${node.kind === "mode" ? 34 : 32}">${escapeHtml(node.label)}</text>
        </g>
      `;
    })
    .join("");

  return `
    <article class="tool-card panel graph-panel">
      <div>
        <h3>${escapeHtml(graph.title)}</h3>
        <p>${escapeHtml(graph.caption)}</p>
      </div>
      <svg class="food-graph" viewBox="0 0 360 280" role="img" aria-label="${escapeHtml(graph.title)}">
        <g class="graph-edges">${lines}</g>
        <g>${nodes}</g>
      </svg>
      <div class="graph-legend">
        <span><i class="liked"></i>liked/shared</span>
        <span><i class="disliked"></i>boundary</span>
        <span><i class="unknown"></i>unknown</span>
        <span><i class="bridge"></i>bridge</span>
        <span><i class="mode"></i>Epicure mode</span>
      </div>
    </article>
  `;
}

function graphPositions(nodes) {
  const positions = {};
  const modeNodes = nodes.filter((node) => node.kind === "mode");
  const foodNodes = nodes.filter((node) => node.kind !== "mode");
  modeNodes.forEach((node, index) => {
    const offset = (index - (modeNodes.length - 1) / 2) * 70;
    positions[node.id] = { x: 180 + offset, y: 138 };
  });
  foodNodes.forEach((node, index) => {
    const angle = (-Math.PI / 2) + (index / Math.max(1, foodNodes.length)) * Math.PI * 2;
    positions[node.id] = {
      x: Math.round(180 + Math.cos(angle) * 135),
      y: Math.round(138 + Math.sin(angle) * 88),
    };
  });
  return positions;
}

function renderGeneralizedReadout(profile) {
  const summary = profileDriverSummary(profile);
  return `
    <article class="tool-card panel">
      <h3>Generalized profile</h3>
      <p>This readout is built from Epicure ingredients and modes, so it can generalize beyond exact foods.</p>
      <div class="evidence-grid">
        ${evidenceBlock("Ingredient center", summary.ingredients.map(displayKey))}
        ${evidenceBlock("Mode center", summary.modes.map(displayKey))}
        ${evidenceBlock("Cuisine pull", summary.poles.map(displayKey))}
      </div>
      ${summary.boundaries.length ? `
        <div class="boundary-list">
          <h3>Boundaries</h3>
          ${summary.boundaries.map(renderBoundary).join("")}
        </div>
      ` : ""}
    </article>
  `;
}

function evidenceBlock(title, items) {
  return `
    <div class="evidence-block">
      <strong>${escapeHtml(title)}</strong>
      <div class="mini-list">${items.length ? items.map((item) => `<span class="status-chip">${escapeHtml(item)}</span>`).join("") : `<span class="status-chip">not enough signal</span>`}</div>
    </div>
  `;
}

function renderBoundary(item) {
  const evidence = [
    ...item.evidence.ingredients.map(displayKey),
    ...item.evidence.modes.map(displayKey),
    ...item.evidence.poles.map(displayKey),
  ].slice(0, 3);
  return `
    <div class="boundary-row">
      <span>${item.card.emoji} ${escapeHtml(item.card.label)}</span>
      <small>near ${item.related.emoji} ${escapeHtml(item.related.label)} through ${escapeHtml(evidence.join(", ") || "Epicure overlap")}</small>
    </div>
  `;
}

function renderMatchEvidence(result) {
  return `
    <article class="tool-card panel">
      <h3>Score evidence</h3>
      <p>The score favors generalized overlap in Epicure ingredient and mode space, then adds exact niche-food agreement.</p>
      <div class="evidence-bars">
        ${evidenceBar("Ingredient space", result.components.ingredient)}
        ${evidenceBar("Mode space", result.components.mode)}
        ${evidenceBar("Cuisine poles", result.components.pole)}
        ${evidenceBar("Exact food overlap", result.components.direct)}
      </div>
      <div class="evidence-grid">
        ${evidenceBlock("Shared ingredients", result.topIngredients.map(displayKey))}
        ${evidenceBlock("Shared modes", result.topModes.map(displayKey))}
      </div>
    </article>
  `;
}

function evidenceBar(label, value) {
  const percent = Math.round(value * 100);
  return `
    <div class="evidence-bar">
      <div><strong>${escapeHtml(label)}</strong><span>${percent}%</span></div>
      <div class="evidence-track"><span style="width: ${percent}%"></span></div>
    </div>
  `;
}

function renderRecommendations(recommendations, a, b) {
  return `
    <article class="tool-card panel">
      <h3>Substantiated recommendations</h3>
      <p>These are concrete food or dish-pair candidates supported by shared Epicure ingredients, modes, or cuisine poles, then filtered against restrictions and ingredient-level dislikes.</p>
      <div class="recommendation-list">
        ${recommendations.length ? recommendations.map((item) => renderRecommendation(item, a, b)).join("") : `<div class="empty">Not enough shared generalized signal yet.</div>`}
      </div>
    </article>
  `;
}

function renderRecommendation(item, a, b) {
  const evidence = [
    ...item.evidence.sharedIngredients.map(displayKey),
    ...item.evidence.sharedModes.map(displayKey),
    ...item.evidence.sharedPoles.map(displayKey),
  ].slice(0, 5);
  const aSupport = recommendationSupport(item.evidence.aIngredientHits, item.evidence.aModeHits, item.evidence.aPoleHits);
  const bSupport = recommendationSupport(item.evidence.bIngredientHits, item.evidence.bModeHits, item.evidence.bPoleHits);
  return `
    <div class="recommendation-row">
      <strong>${item.card.emoji} ${escapeHtml(item.card.label)}</strong>
      <p>Shared basis: ${escapeHtml(evidence.join(", ") || "cross-profile Epicure proximity")}.</p>
      <div class="support-grid">
        <small>${escapeHtml(profileName(a, "Profile A"))}: ${escapeHtml(aSupport)}</small>
        <small>${escapeHtml(profileName(b, "Profile B"))}: ${escapeHtml(bSupport)}</small>
      </div>
    </div>
  `;
}

function recommendationSupport(ingredients, modes, poles) {
  const terms = [
    ...ingredients.map(displayKey),
    ...modes.map(displayKey),
    ...poles.map(displayKey),
  ].slice(0, 4);
  return terms.length ? terms.join(", ") : "weak direct support";
}

function profileName(profile, fallback) {
  return normalizeName(profile.name) || fallback;
}

function renderProfile() {
  const profile = state.selectedProfile;
  const liked = likedCards(profile);
  const unknown = unknownCards(profile);
  const invite = inviteUrl(profile);
  const profileLink = profileUrl(profile);
  renderShell(`
    <article class="tool-card panel">
      <div class="card-kicker">
        <span class="tag good">Saved locally</span>
        <span class="tag data">${escapeHtml(profile.id)}</span>
      </div>
      <h2>${escapeHtml(profileLabel(profile))}</h2>
      <p class="profile-subtitle">profile ${escapeHtml(profile.id.slice(-5).toUpperCase())}</p>
      <p>This profile can be retaken anytime. The invite link carries this profile so a friend can quiz and compare without an account.</p>
      <div class="button-row">
        <button class="primary-button" data-copy="${escapeHtml(invite)}" data-metric="inviteShares" data-profile-id="${escapeHtml(profile.id)}">Copy friend invite</button>
        <button class="secondary-button" data-copy="${escapeHtml(profileLink)}" data-metric="profileLinkShares">Copy profile link</button>
        <button class="ghost-button" data-action="new-quiz">Retake</button>
      </div>
    </article>
    ${renderGeneralizedReadout(profile)}
    ${renderEvidenceGraph(graphForProfile(profile))}
    <article class="tool-card panel">
      <h3>Liked signals</h3>
      ${liked.length ? `<div class="mini-list">${liked.map(renderCardChip).join("")}</div>` : `<div class="empty">No likes were selected.</div>`}
    </article>
    ${unknown.length ? `
      <article class="tool-card panel">
        <h3>Foods to learn later</h3>
        <div class="mini-list">${unknown.map(renderCardChip).join("")}</div>
      </article>
    ` : ""}
  `);
  bindCopyActions();
}

function renderCompare() {
  const [a, b] = state.compareProfiles;
  const result = compareProfiles(a, b);
  renderShell(`
    <article class="tool-card panel">
      <div class="score-band">
        <div class="score-number">${result.score}</div>
        <div>
          <h2>${escapeHtml(profileLabel(a))} × ${escapeHtml(profileLabel(b))}</h2>
          <p class="profile-subtitle">${escapeHtml(a.id.slice(-5).toUpperCase())} × ${escapeHtml(b.id.slice(-5).toUpperCase())}</p>
          <p>${scoreLine(result)}</p>
        </div>
      </div>
      <div class="button-row">
        <button class="primary-button" data-copy="${escapeHtml(compareUrl(a, b))}" data-metric="comparisonShares">Copy comparison</button>
        <button class="secondary-button" data-copy="${escapeHtml(inviteUrl(a))}" data-metric="inviteShares" data-profile-id="${escapeHtml(a.id)}">Invite another friend</button>
        <button class="ghost-button" data-action="new-quiz">Retake</button>
      </div>
    </article>
    <section class="result-grid">
      ${resultPanel("🔥 Shared niche loves", result.sharedNiche, "The weed-out foods you both like.")}
      ${resultPanel("✅ Safe bets", result.sharedCards, "Cards both profiles liked.")}
      ${resultPanel("⚠️ Danger zone", [...result.conflictCards, ...result.restrictionConflicts], "Like/dislike clashes or restriction conflicts.")}
      ${resultPanel("🔁 Bridge foods", result.bridgeCards, "Cooc/Core candidates close to both profiles.")}
    </section>
    ${renderEvidenceGraph(graphForComparison(a, b, result))}
    ${renderMatchEvidence(result)}
    ${renderRecommendations(result.bridgeRecommendations, a, b)}
  `);
  bindCopyActions();
}

function resultPanel(title, cards, emptyText) {
  return `
    <article class="tool-card mini-card">
      <strong>${title}</strong>
      ${cards.length ? `<div class="mini-list">${uniqueCards(cards).map(renderCardChip).join("")}</div>` : `<p>${emptyText}</p>`}
    </article>
  `;
}

function scoreLine(result) {
  if (result.sharedNiche.length >= 3) return "Extremely useful overlap: shared niche foods are doing real work here.";
  if (result.score >= 75) return "Strong overlap across meal shapes, ingredients, and Epicure modes.";
  if (result.score >= 50) return "Good bridge potential with a few clear watch-outs.";
  if (result.conflictCards.length) return "There are real taste clashes. The danger zone matters.";
  return "Light overlap. Use the bridge foods before picking a restaurant.";
}

function renderCardChip(card) {
  return `<span class="status-chip">${card.emoji} ${escapeHtml(card.label)}</span>`;
}

function renderProfileHistory() {
  const profiles = loadProfiles();
  renderShell(`
    ${renderStatsPanel(profiles)}
    <article class="tool-card panel">
      <h2>Profiles</h2>
      <p>Profiles live in this browser. Share links carry the profile data to friends.</p>
      <div class="button-row">
        <button class="primary-button" data-action="new-quiz">New quiz</button>
      </div>
    </article>
    <section class="profile-grid">
      ${profiles.length ? profiles.map(renderProfileHistoryCard).join("") : `<div class="empty">No profiles saved yet.</div>`}
    </section>
  `);
  bindCopyActions();
}

function renderStatsPanel(profiles) {
  const metrics = loadMetrics();
  const shareTotal = (metrics.inviteShares || 0) + (metrics.profileLinkShares || 0) + (metrics.comparisonShares || 0);
  return `
    <article class="tool-card panel">
      <h2>Stats</h2>
      <p>Local tracking for this browser. Real link opens across friends would need a hosted backend.</p>
      <div class="stats-grid">
        ${renderStat("Profiles saved", profiles.length)}
        ${renderStat("Profiles created", metrics.profilesCreated || 0)}
        ${renderStat("Shares copied", shareTotal)}
        ${renderStat("Friend invites", metrics.inviteShares || 0)}
        ${renderStat("Comparison links", metrics.comparisonShares || 0)}
        ${renderStat("Comparisons made", metrics.comparisonsCreated || 0)}
        ${renderStat("Invite opens here", metrics.incomingInviteOpens || 0)}
      </div>
    </article>
  `;
}

function renderStat(label, value) {
  return `
    <div class="stat-card">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function renderProfileHistoryCard(profile) {
  const liked = likedCards(profile).slice(0, 4);
  const metrics = loadMetrics();
  const inviteShareCount = metrics.perProfileInviteShares[profile.id] || 0;
  return `
    <article class="tool-card mini-card">
      <strong>${escapeHtml(profileLabel(profile))}</strong>
      <p>${new Date(profile.createdAt).toLocaleString()}</p>
      <div class="mini-list"><span class="status-chip">🔗 ${inviteShareCount} invite shares</span></div>
      <div class="mini-list">${liked.map(renderCardChip).join("") || `<span class="status-chip">No likes</span>`}</div>
      <div class="button-row">
        <button class="secondary-button" data-copy="${escapeHtml(inviteUrl(profile))}" data-metric="inviteShares" data-profile-id="${escapeHtml(profile.id)}">Invite</button>
        <button class="ghost-button" data-open-profile="${escapeHtml(encodePayload(profile))}">Open</button>
      </div>
    </article>
  `;
}

function bindGlobalActions() {
  document.querySelectorAll("[data-action='new-quiz']").forEach((button) => {
    button.addEventListener("click", () => {
      history.replaceState(null, "", baseUrl());
      beginQuiz();
    });
  });
  document.querySelectorAll("[data-action='history']").forEach((button) => {
    button.addEventListener("click", () => {
      state.route = "profiles";
      render();
    });
  });
  document.querySelectorAll("[data-action='finish-early']").forEach((button) => {
    button.addEventListener("click", finishQuiz);
  });
}

function bindRestrictionActions() {
  document.querySelector("#profile-name")?.addEventListener("input", (event) => {
    state.quiz.name = event.target.value;
  });
  document.querySelectorAll("[data-restriction]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.restriction;
      if (id === "no_restrictions") {
        state.quiz.restrictions = [];
      } else if (state.quiz.restrictions.includes(id)) {
        state.quiz.restrictions = state.quiz.restrictions.filter((item) => item !== id);
      } else {
        state.quiz.restrictions.push(id);
      }
      render();
    });
  });
  document.querySelector("[data-action='start-cards']")?.addEventListener("click", startCards);
}

function bindAnswerActions() {
  document.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const raw = button.dataset.answer;
      const answer = raw === "true" ? true : raw === "false" ? false : raw;
      answerCurrent(answer === "skip" ? null : answer);
    });
  });
}

function bindCopyActions() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      await copyText(button.dataset.copy);
      if (button.dataset.metric) {
        recordMetric(button.dataset.metric, button.dataset.profileId || null);
      }
      showToast("Link copied");
    });
  });
  document.querySelectorAll("[data-open-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      const profile = decodePayload(button.dataset.openProfile);
      state.route = "profile";
      state.selectedProfile = profile;
      history.replaceState(null, "", profileUrl(profile));
      render();
    });
  });
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function showToast(message) {
  state.toast = message;
  render();
  window.setTimeout(() => {
    state.toast = "";
    render();
  }, 1600);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("hashchange", parseRoute);
parseRoute();
