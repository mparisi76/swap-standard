/**
 * SwapStandard Listing Seeder
 * ----------------------------
 * Creates realistic published listings in Directus with Pexels photos.
 *
 * Usage:
 *   node scripts/seed-listings.mjs
 *
 * Required env vars in .env.local:
 *   NEXT_PUBLIC_DIRECTUS_URL
 *   DIRECTUS_STATIC_TOKEN   (admin token)
 *   PEXELS_API_KEY
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env.local");
try {
  const raw = readFileSync(envPath, "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key) process.env[key] = val;
  }
} catch {
  console.error("Could not read .env.local — make sure you're running from the project root.");
  process.exit(1);
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

if (!DIRECTUS_URL || !DIRECTUS_TOKEN || !PEXELS_KEY) {
  console.error("Missing required env vars: NEXT_PUBLIC_DIRECTUS_URL, DIRECTUS_STATIC_TOKEN, PEXELS_API_KEY");
  process.exit(1);
}

// ── Config ────────────────────────────────────────────────────────────────────
// Increase SEED_ROUNDS to create more listings without duplicates.
// Round 1 uses the original titles. Round 2+ appends the city name to each
// title so every listing is unique (e.g. "Cordless Drill — Beacon, NY").
const SEED_ROUNDS = 3;

// ── ZIP Codes ─────────────────────────────────────────────────────────────────
// Heavily weighted toward the Hudson Valley region.
// A small national tail keeps the exchange feeling real, not local-only.
const ZIPS = [
  // Dutchess County
  "12601", "12603",           // Poughkeepsie
  "12508",                    // Beacon
  "12524",                    // Fishkill
  "12538",                    // Hyde Park
  "12572",                    // Rhinebeck
  "12590",                    // Wappingers Falls
  "12545",                    // Millbrook
  "12564",                    // Pawling

  // Ulster County
  "12401", "12402",           // Kingston
  "12561",                    // New Paltz
  "12498",                    // Woodstock
  "12477",                    // Saugerties
  "12472",                    // Rosendale
  "12428",                    // Ellenville

  // Columbia County
  "12534",                    // Hudson
  "12414",                    // Catskill
  "12037",                    // Chatham
  "12106",                    // Kinderhook

  // Greene County
  "12496",                    // Windham
  "12413",                    // Cairo
  "12051",                    // Coxsackie

  // Orange County
  "12550",                    // Newburgh
  "10940",                    // Middletown
  "10990",                    // Warwick
  "12518",                    // Cornwall-on-Hudson

  // Putnam County
  "10512",                    // Carmel
  "10516",                    // Cold Spring

  // Sullivan County
  "12701",                    // Monticello
  "12758",                    // Livingston Manor

  // National tail (~20% of slots — keeps it from looking purely local)
  "44105",                    // Cleveland, OH
  "78701",                    // Austin, TX
  "30318",                    // Atlanta, GA
  "97201",                    // Portland, OR
  "55401",                    // Minneapolis, MN
  "27601",                    // Raleigh, NC
  "80202",                    // Denver, CO
  "19103",                    // Philadelphia, PA
];

// ── Seed Listings ─────────────────────────────────────────────────────────────
const LISTINGS = [

  // ── GOODS: Tools & Hardware ──
  {
    title: "DeWalt 20V Cordless Drill + 2 Batteries",
    type: "goods",
    offering: "DeWalt 20V MAX cordless drill/driver with two lithium batteries and a charger. Used but works perfectly. Comes with a small bit set.",
    seeking: "Looking for a circular saw, jigsaw, or other power tool. Open to garden equipment or quality hand tools.",
    offering_tags: ["Drill", "Power Tools"],
    seeking_tags: ["Circular Saw", "Power Tools", "Garden Tools"],
    pexels_query: "cordless drill power tool workshop",
  },
  {
    title: "Craftsman 230-Piece Mechanics Tool Set",
    type: "goods",
    offering: "Full Craftsman socket and wrench set, 230 pieces in the original hard case. Complete set, nothing missing. Great condition.",
    seeking: "Interested in a quality drill, impact driver, or sawzall. Also open to outdoor/garden equipment.",
    offering_tags: ["Socket Set", "Wrench Set", "Hand Tools"],
    seeking_tags: ["Impact Driver", "Drill", "Power Tools"],
    pexels_query: "mechanic tool set wrench socket",
  },
  {
    title: "Ryobi 10\" Compound Miter Saw",
    type: "goods",
    offering: "Ryobi 10-inch compound miter saw with stand. Good working condition, blade is fairly new. Has some dust buildup but runs great.",
    seeking: "Looking for a table saw, band saw, or router. Also open to quality lumber or building materials.",
    offering_tags: ["Miter Saw", "Power Tools"],
    seeking_tags: ["Table Saw", "Power Tools", "Lumber & Wood"],
    pexels_query: "miter saw woodworking workshop",
  },
  {
    title: "Milwaukee M18 Impact Driver Kit",
    type: "goods",
    offering: "Milwaukee M18 impact driver with two batteries, charger, and original case. Barely used — bought a new combo kit and have two of these now.",
    seeking: "Looking for a reciprocating saw, oscillating tool, or angle grinder. Open to other power tools.",
    offering_tags: ["Impact Driver", "Power Tools"],
    seeking_tags: ["Reciprocating Saw", "Oscillating Tool", "Power Tools"],
    pexels_query: "impact driver battery tool",
  },
  {
    title: "16-Foot Werner Aluminum Extension Ladder",
    type: "goods",
    offering: "Werner 16-foot aluminum extension ladder, Type II rated (225 lb). Solid and safe, no bends or damage. Rarely used.",
    seeking: "Looking for scaffolding, a good quality drill, or pressure washing equipment.",
    offering_tags: ["Ladders & Scaffolding"],
    seeking_tags: ["Pressure Washer", "Power Tools"],
    pexels_query: "extension ladder aluminum construction",
  },
  {
    title: "5-Ton Electric Log Splitter",
    type: "goods",
    offering: "5-ton electric log splitter. Works great on logs up to 20 inches long. Lightly used over two seasons. No gas, no fumes.",
    seeking: "Looking for a chainsaw, wood chipper, or other yard equipment. Also open to firewood.",
    offering_tags: ["Log Splitter"],
    seeking_tags: ["Chainsaw", "Wood Chipper"],
    pexels_query: "log splitter firewood wood",
  },
  {
    title: "Husqvarna 455 Rancher Chainsaw — 20\" Bar",
    type: "goods",
    offering: "Husqvarna 455 Rancher, 20-inch bar. Runs well, recently tuned up with fresh bar oil. Comes with an extra chain.",
    seeking: "Looking for a log splitter, ATV accessories, or utility trailer. Open to quality hand tools.",
    offering_tags: ["Chainsaw", "Power Tools"],
    seeking_tags: ["Log Splitter", "ATV", "Utility Trailer"],
    pexels_query: "chainsaw logging forest wood cutting",
  },
  {
    title: "Simpson 2800 PSI Gas Pressure Washer",
    type: "goods",
    offering: "Simpson MegaShot 2800 PSI with Honda GC190 engine. Starts on first pull every time. Includes 4 nozzle tips and 25-ft hose.",
    seeking: "Looking for a leaf blower, shop vac, or generator. Also open to outdoor furniture.",
    offering_tags: ["Pressure Washer"],
    seeking_tags: ["Leaf Blower", "Generator"],
    pexels_query: "pressure washer cleaning driveway house",
  },
  {
    title: "Bostitch 6-Gallon Pancake Air Compressor",
    type: "goods",
    offering: "Bostitch 6-gallon pancake air compressor, 150 PSI max. Runs great. Comes with a brad nailer and 25-ft coil hose.",
    seeking: "Looking for a finish nailer, framing nailer, or spray gun. Open to other air tools.",
    offering_tags: ["Air Compressor", "Nail Gun"],
    seeking_tags: ["Power Tools", "Nail Gun"],
    pexels_query: "air compressor workshop garage",
  },

  // ── GOODS: Farm & Yard ──
  {
    title: "Troy-Bilt 21\" Self-Propelled Gas Mower",
    type: "goods",
    offering: "Troy-Bilt 21-inch self-propelled gas mower. Starts reliably, cuts well. Blade sharpened last season. One small crack in the deck shroud but fully functional.",
    seeking: "Looking for a string trimmer, edger, or riding mower parts.",
    offering_tags: ["Push Mower"],
    seeking_tags: ["Lawn Equipment", "Garden Tools"],
    pexels_query: "lawn mower grass cutting yard",
  },
  {
    title: "Ariens 24\" Two-Stage Snowblower",
    type: "goods",
    offering: "Ariens Deluxe 24-inch two-stage snowblower. Electric start, heated handles, headlight. Only 3 seasons old. Clears everything effortlessly.",
    seeking: "Looking for a push mower, leaf blower, or generator.",
    offering_tags: ["Snow Blower"],
    seeking_tags: ["Push Mower", "Leaf Blower", "Generator"],
    pexels_query: "snowblower winter snow clearing",
  },
  {
    title: "17\" Front-Tine Rototiller",
    type: "goods",
    offering: "17-inch front-tine gas rototiller. Tills well in established beds. Great for breaking up garden beds in spring. Runs fine.",
    seeking: "Looking for raised bed materials, compost, or garden tools.",
    offering_tags: ["Rototiller", "Garden Tools"],
    seeking_tags: ["Raised Bed", "Soil & Compost", "Garden Tools"],
    pexels_query: "rototiller garden tilling soil",
  },
  {
    title: "6x10 Steel Utility Trailer with Ramp Gate",
    type: "goods",
    offering: "Steel 6x10 utility trailer with ramp gate, stake sides, and 2-inch ball hitch. Title in hand. Hauls up to 2,000 lbs. Good tires.",
    seeking: "Looking for a dump trailer, cargo trailer, or ATV. Open to large yard equipment.",
    offering_tags: ["Utility Trailer", "Trailer"],
    seeking_tags: ["Dump Trailer", "ATV"],
    pexels_query: "utility trailer cargo hauling truck",
  },
  {
    title: "10-Frame Langstroth Beehive — Complete Setup",
    type: "goods",
    offering: "Complete 10-frame Langstroth hive: bottom board, two deeps, one super, inner and outer cover. Assembled and painted. No bees included.",
    seeking: "Looking for a nucleus colony (nuc), beekeeper starter kit, or raw honey.",
    offering_tags: ["Beehive"],
    seeking_tags: ["Honey & Bee Products"],
    pexels_query: "beehive langstroth beekeeper honeybee",
  },
  {
    title: "4x8 Cedar Raised Garden Beds — Set of 2",
    type: "goods",
    offering: "Two 4x8 cedar raised beds, 12 inches deep. Corners are double-screwed with cedar timber. One season old, no rot, no bowing.",
    seeking: "Looking for compost, topsoil, seeds, or starts. Also open to garden tools.",
    offering_tags: ["Raised Bed"],
    seeking_tags: ["Soil & Compost", "Seeds & Bulbs", "Garden Tools"],
    pexels_query: "raised garden bed vegetables gardening",
  },
  {
    title: "Chicken Coop — 4 to 6 Hen Capacity",
    type: "goods",
    offering: "Wooden chicken coop with nesting boxes, roosting bar, and attached run. Fits 4–6 hens comfortably. Paint is fading but structure is solid.",
    seeking: "Looking for chicken wire, t-posts, or livestock feed.",
    offering_tags: ["Chicken Coop"],
    seeking_tags: ["Livestock Feed", "Chicken Wire", "T-Posts"],
    pexels_query: "chicken coop backyard hens eggs",
  },
  {
    title: "250-Gallon IBC Tote — Food Grade",
    type: "goods",
    offering: "Food-grade 250-gallon IBC tote in metal cage. Used for water collection. Cage and valve intact. Great for rain harvesting or stock water.",
    seeking: "Looking for irrigation supplies, garden hose, or garden tools.",
    offering_tags: ["Rain Barrel"],
    seeking_tags: ["Irrigation System", "Garden Hose"],
    pexels_query: "water storage tank ibc tote farm",
  },

  // ── GOODS: Kitchen ──
  {
    title: "KitchenAid Artisan Stand Mixer — Empire Red",
    type: "goods",
    offering: "KitchenAid Artisan 5-quart stand mixer in Empire Red. Comes with dough hook, flat beater, wire whisk, and splash guard. Excellent condition.",
    seeking: "Looking for a food processor, dehydrator, or bread machine. Open to canning equipment.",
    offering_tags: ["Stand Mixer", "Kitchen Appliances"],
    seeking_tags: ["Food Processor", "Dehydrator", "Canning Equipment"],
    pexels_query: "kitchenaid stand mixer kitchen baking",
  },
  {
    title: "Instant Pot Duo 8-Quart 7-in-1",
    type: "goods",
    offering: "Instant Pot Duo 8-quart. Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer. All accessories included. Barely used.",
    seeking: "Looking for a dehydrator, vacuum sealer, or grain mill.",
    offering_tags: ["Instant Pot", "Pressure Cooker"],
    seeking_tags: ["Dehydrator", "Vacuum Sealer", "Canning Equipment"],
    pexels_query: "instant pot pressure cooker kitchen cooking",
  },
  {
    title: "Lodge Cast Iron Skillet Set — 3 Pieces",
    type: "goods",
    offering: "Lodge cast iron set: 8-inch, 10-inch, and 12-inch skillets. Well-seasoned and ready to cook. Minor surface rust on the 8-inch, easily restored.",
    seeking: "Looking for a Dutch oven, wok, or other cast iron cookware. Open to food trades.",
    offering_tags: ["Cast Iron Skillet", "Cookware"],
    seeking_tags: ["Dutch Oven", "Cookware"],
    pexels_query: "cast iron skillet cooking lodge kitchen",
  },
  {
    title: "Excalibur 9-Tray Food Dehydrator",
    type: "goods",
    offering: "Excalibur 9-tray dehydrator with timer and adjustable thermostat. Perfect for jerky, dried fruit, herbs. Includes mesh screens and fruit leather sheets.",
    seeking: "Looking for a vacuum sealer, grain mill, or pressure canner.",
    offering_tags: ["Dehydrator", "Kitchen Appliances"],
    seeking_tags: ["Vacuum Sealer", "Pressure Canner", "Grain Mill"],
    pexels_query: "food dehydrator dried fruit herbs jerky",
  },
  {
    title: "Vitamix 5200 Blender",
    type: "goods",
    offering: "Vitamix 5200 in black. Powerful enough for nut butters, smoothies, soups. Tamper included. Some scratches on the container but motor is strong.",
    seeking: "Looking for a juicer, food processor, or stand mixer.",
    offering_tags: ["Blender", "Kitchen Appliances"],
    seeking_tags: ["Juicer", "Food Processor", "Stand Mixer"],
    pexels_query: "vitamix blender smoothie healthy kitchen",
  },
  {
    title: "Water Bath Canner + Rack + Jar Lifter",
    type: "goods",
    offering: "21-quart Granite Ware water bath canner with rack, jar lifter, funnel, and lid wand. Used two seasons. Everything included.",
    seeking: "Looking for a pressure canner, mason jars, or fermentation supplies.",
    offering_tags: ["Water Bath Canner", "Canning Equipment"],
    seeking_tags: ["Pressure Canner", "Mason Jars", "Canning Equipment"],
    pexels_query: "canning jars preserving food kitchen",
  },

  // ── GOODS: Electronics ──
  {
    title: "MacBook Pro 2019 15\" — 16GB / 512GB",
    type: "goods",
    offering: "2019 MacBook Pro 15-inch, 16GB RAM, 512GB SSD, Core i7. Battery health at 82%. Some wear on the lid but screen is flawless. Charger included.",
    seeking: "Looking for a newer MacBook, iPad Pro, or quality monitor. Open to other electronics or professional equipment.",
    offering_tags: ["Laptop", "Computers & Laptops"],
    seeking_tags: ["Laptop", "Tablet", "Monitor"],
    pexels_query: "macbook laptop computer workspace desk",
  },
  {
    title: "DJI Mini 2 Drone — Fly More Combo",
    type: "goods",
    offering: "DJI Mini 2 Fly More Combo: 3 batteries, dual charger, shoulder bag, and extra props. Under 100 hours total flight time. FAA registered.",
    seeking: "Looking for a camera, GoPro, mirrorless camera, or video equipment.",
    offering_tags: ["Drone", "Cameras"],
    seeking_tags: ["DSLR Camera", "Mirrorless Camera", "GoPro"],
    pexels_query: "drone dji flying aerial photography",
  },
  {
    title: "Sony WH-1000XM4 Noise-Canceling Headphones",
    type: "goods",
    offering: "Sony WH-1000XM4 wireless headphones in black. LDAC hi-res audio. Comes with original case, 3.5mm cable, and USB-C. Minor wear on the headband.",
    seeking: "Looking for speakers, a DAC/amp, turntable, or other audio equipment.",
    offering_tags: ["Headphones", "Audio Equipment"],
    seeking_tags: ["Speakers", "Audio Equipment"],
    pexels_query: "headphones wireless music audio",
  },

  // ── GOODS: Furniture & Home ──
  {
    title: "Solid Oak Dining Table — Seats 6",
    type: "goods",
    offering: "Solid oak dining table, 72\" x 36\". Refinished two years ago, still in great shape. Some minor scratches near one leaf. Chairs not included.",
    seeking: "Looking for a coffee table, bookshelf, dresser, or other solid wood furniture.",
    offering_tags: ["Dining Table", "Living Room Furniture"],
    seeking_tags: ["Coffee Table", "Bookshelf", "Bedroom Furniture"],
    pexels_query: "oak dining table wood furniture home",
  },
  {
    title: "NSF Metal Wire Shelving — 5-Tier (Set of 2)",
    type: "goods",
    offering: "Two 5-tier NSF wire shelving units, 48\"W x 18\"D x 72\"H. Rated 800 lbs per shelf. Perfect for garage, basement, or pantry.",
    seeking: "Looking for a workbench, toolbox, or garage storage solutions.",
    offering_tags: ["Shelving Unit", "Storage & Shelving"],
    seeking_tags: ["Workbench", "Storage & Shelving"],
    pexels_query: "metal shelving storage garage pantry",
  },
  {
    title: "Weber Spirit II E-310 3-Burner Gas Grill",
    type: "goods",
    offering: "Weber Spirit II 3-burner gas grill. GS4 grilling system, iGrill-ready. Cover included. Grates cleaned and in good shape. 3 years old.",
    seeking: "Looking for a smoker, outdoor furniture, or cast iron cookware.",
    offering_tags: ["Outdoor Grill"],
    seeking_tags: ["Smoker", "Cast Iron Skillet", "Outdoor Furniture"],
    pexels_query: "gas grill barbecue backyard grilling",
  },
  {
    title: "Propane Patio Heater — 48,000 BTU",
    type: "goods",
    offering: "Tall stainless steel propane patio heater. 48,000 BTU, heats up to 15 ft radius. Tank not included. Works perfectly.",
    seeking: "Looking for a fire pit, outdoor furniture set, or grill.",
    offering_tags: ["Propane Heater", "Outdoor Furniture"],
    seeking_tags: ["Fire Pit", "Outdoor Furniture", "Outdoor Grill"],
    pexels_query: "patio heater outdoor deck evening",
  },

  // ── GOODS: Sports & Recreation ──
  {
    title: "Trek FX3 Hybrid Bike — Large Frame",
    type: "goods",
    offering: "Trek FX3 hybrid bike, large frame, hydraulic disc brakes, carbon fork. 2021 model, under 200 miles. Comes with rear rack and fenders.",
    seeking: "Looking for a road bike, mountain bike, or quality cycling gear.",
    offering_tags: ["Road Bike", "Bicycles"],
    seeking_tags: ["Mountain Bike", "Bicycles"],
    pexels_query: "hybrid bicycle cycling road bike",
  },
  {
    title: "Perception 10' Sit-In Kayak — with Paddle",
    type: "goods",
    offering: "Perception Conduit 10 sit-in kayak in blue. Includes paddle and life jacket. Small scuff on the hull, no structural damage.",
    seeking: "Looking for a paddleboard, canoe, fishing gear, or camping equipment.",
    offering_tags: ["Kayak"],
    seeking_tags: ["Paddleboard", "Canoe", "Fishing Equipment"],
    pexels_query: "kayak river paddling water outdoors",
  },
  {
    title: "REI Half Dome 4+ Tent",
    type: "goods",
    offering: "REI Half Dome 4+ tent. Stakes, rainfly, and footprint all included. Seams sealed and in good condition. Used on 5 trips.",
    seeking: "Looking for a sleeping bag, backpack, or camp stove.",
    offering_tags: ["Tent", "Camping & Hiking Gear"],
    seeking_tags: ["Sleeping Bag", "Backpack", "Camping & Hiking Gear"],
    pexels_query: "tent camping nature outdoor wilderness",
  },
  {
    title: "Bowflex SelectTech 552 Adjustable Dumbbells",
    type: "goods",
    offering: "Bowflex SelectTech 552 adjustable dumbbells, pair. 5–52.5 lbs each. Both stands included. Like new — barely used.",
    seeking: "Looking for a barbell set, kettlebells, or weight bench.",
    offering_tags: ["Weights", "Exercise Equipment"],
    seeking_tags: ["Barbell", "Kettlebell", "Exercise Equipment"],
    pexels_query: "dumbbells home gym workout fitness",
  },

  // ── GOODS: Food & Produce ──
  {
    title: "Fresh Pasture-Raised Chicken Eggs",
    type: "goods",
    offering: "Fresh pasture-raised chicken eggs from our small flock of 12 hens. Mixed sizes. About 5–6 dozen available per week. Unwashed.",
    seeking: "Looking for fresh produce, herbs, seeds, or baked goods. Open to canning jars or preserving supplies.",
    offering_tags: ["Eggs", "Eggs & Dairy"],
    seeking_tags: ["Fresh Produce", "Herbs & Spices", "Preserved Foods"],
    pexels_query: "fresh farm eggs chickens basket",
  },
  {
    title: "Raw Wildflower Honey — 2024 Harvest",
    type: "goods",
    offering: "Raw, unfiltered wildflower honey from our backyard hives. 2024 harvest. Available in quart jars. Deep amber, rich flavor.",
    seeking: "Looking for beeswax, candle-making supplies, or other preserved foods.",
    offering_tags: ["Honey", "Honey & Bee Products"],
    seeking_tags: ["Preserved Foods", "Baked Goods"],
    pexels_query: "raw honey jar beekeeper wildflower",
  },
  {
    title: "Garden Surplus — Tomatoes, Zucchini & Peppers",
    type: "goods",
    offering: "Garden is overproducing this week. Have roma tomatoes, yellow zucchini, and assorted peppers. Pick up only, about 10 lbs available.",
    seeking: "Looking for other fresh produce, herbs, canning supplies, or seeds.",
    offering_tags: ["Tomatoes", "Zucchini", "Peppers", "Fresh Produce"],
    seeking_tags: ["Fresh Produce", "Herbs & Spices", "Seeds & Starts"],
    pexels_query: "fresh vegetables garden harvest tomatoes",
  },
  {
    title: "Freshly Baked Sourdough Loaves",
    type: "goods",
    offering: "Freshly baked sourdough loaves using a 5-year-old starter. Country style, scored, with a dark crust. Available Tuesday and Friday mornings.",
    seeking: "Looking for fresh produce, local honey, butter, or other artisan food.",
    offering_tags: ["Sourdough Bread", "Baked Goods"],
    seeking_tags: ["Honey", "Eggs & Dairy", "Fresh Produce"],
    pexels_query: "sourdough bread artisan loaf bakery",
  },
  {
    title: "Home-Canned Salsa Verde — 6 Pint Jars",
    type: "goods",
    offering: "Home-canned salsa verde made from tomatillos, jalapeños, and garlic from our garden. Water bath processed. 6 pint jars.",
    seeking: "Looking for other home-preserved foods, fresh produce, or kitchen equipment.",
    offering_tags: ["Salsa", "Preserved Foods"],
    seeking_tags: ["Preserved Foods", "Fresh Produce"],
    pexels_query: "canned salsa verde preserves jars homemade",
  },
  {
    title: "Pure Maple Syrup — Locally Tapped",
    type: "goods",
    offering: "Pure maple syrup tapped and boiled on our property this spring. Grade A amber, rich taste. Available in pint and quart sizes.",
    seeking: "Looking for other local foods, honey, canned goods, or fresh produce.",
    offering_tags: ["Maple Syrup", "Preserved Foods"],
    seeking_tags: ["Honey", "Preserved Foods", "Fresh Produce"],
    pexels_query: "maple syrup bottle local farm syrup",
  },

  // ── SKILLS ──
  {
    title: "Deck Building & Carpentry",
    type: "skills",
    offering: "15 years of carpentry experience. Build or repair decks, fences, framing, and trim work. I bring tools and know-how. References available.",
    seeking: "Looking for plumbing work, electrical rough-in, HVAC, or roofing help.",
    offering_tags: ["Deck Building", "Carpentry & Woodworking"],
    seeking_tags: ["Plumbing", "Electrical Work", "Roofing"],
    pexels_query: "deck building carpentry wood construction",
  },
  {
    title: "Residential Plumbing — Repairs & Installation",
    type: "skills",
    offering: "Licensed journeyman plumber. Fixture installs, leak repairs, drain clearing, water heater replacement. Weekends available.",
    seeking: "Looking for carpentry, electrical work, or drywall repair in exchange.",
    offering_tags: ["Plumbing"],
    seeking_tags: ["Carpentry & Woodworking", "Electrical Work", "Drywall Repair"],
    pexels_query: "plumber pipes plumbing residential repair",
  },
  {
    title: "Small Engine Repair",
    type: "skills",
    offering: "10+ years repairing small engines: mowers, chainsaws, generators, tillers. Carburetor cleaning, blade sharpening, oil changes, full tune-ups.",
    seeking: "Looking for auto/truck repair, welding work, or quality tools in trade.",
    offering_tags: ["Small Engine Repair"],
    seeking_tags: ["Vehicle Repair", "Welding & Fabrication"],
    pexels_query: "small engine repair mechanic lawn mower",
  },
  {
    title: "Welding & Metal Fabrication",
    type: "skills",
    offering: "Certified welder, MIG and TIG. Custom brackets, repairs, gates, trailers, and implements. I have a full shop. Most projects welcome.",
    seeking: "Looking for machining, electrical work, auto body, or engine repair.",
    offering_tags: ["Welding & Fabrication"],
    seeking_tags: ["Engine Repair", "Electrical Work", "Vehicle Repair"],
    pexels_query: "welding metal fabrication sparks workshop",
  },
  {
    title: "Web Development — React & Next.js",
    type: "skills",
    offering: "Full-stack web developer, 8 years experience. React, Next.js, Node.js. Landing pages, e-commerce, web apps, or fixing existing sites.",
    seeking: "Looking for accounting/bookkeeping, legal help, graphic design, or photography.",
    offering_tags: ["Web Development"],
    seeking_tags: ["Accounting & Bookkeeping", "Legal Advice", "Graphic Design"],
    pexels_query: "web developer coding laptop programming",
  },
  {
    title: "Sewing & Clothing Alterations",
    type: "skills",
    offering: "25 years of sewing experience. Hemming, tailoring, zipper replacements, patches, and custom curtains. Bring me your pile of 'someday I'll fix this' clothing.",
    seeking: "Looking for knitting/crocheting, embroidery, or fabric/notions.",
    offering_tags: ["Sewing & Alterations"],
    seeking_tags: ["Knitting & Crocheting", "Embroidery"],
    pexels_query: "sewing machine alterations clothing tailor",
  },
  {
    title: "Knife & Tool Sharpening",
    type: "skills",
    offering: "Japanese water stone sharpening for kitchen knives, hunting knives, pocket knives, chisels, and plane blades. Edge geometry restored. Same-day turnaround.",
    seeking: "Looking for leatherworking, blacksmithing, woodworking, or quality hand tools.",
    offering_tags: ["Knife Sharpening"],
    seeking_tags: ["Leatherworking", "Blacksmithing", "Hand Tools"],
    pexels_query: "knife sharpening whetstone kitchen blade",
  },
  {
    title: "Sourdough & Bread Baking Lessons",
    type: "skills",
    offering: "Teach sourdough from scratch: starter cultivation, scoring, and baking in a Dutch oven. 2-hour hands-on session — you leave with your own starter and a fresh loaf.",
    seeking: "Looking for cooking lessons, canning instruction, or fermentation skills.",
    offering_tags: ["Sourdough", "Bread Baking", "Baking & Pastry"],
    seeking_tags: ["Cooking & Meal Prep", "Canning & Food Preservation", "Fermentation"],
    pexels_query: "sourdough bread baking teaching lesson",
  },
  {
    title: "Beekeeping Consultation & Hive Setup",
    type: "skills",
    offering: "10 years keeping bees. Help with hive setup, inspection technique, swarm management, disease ID, and extraction. On-site visits available.",
    seeking: "Looking for gardening help, irrigation setup, or fresh produce.",
    offering_tags: ["Beekeeping"],
    seeking_tags: ["Farming & Agriculture", "Fresh Produce"],
    pexels_query: "beekeeper hive inspection honeybee",
  },
  {
    title: "Portrait & Product Photography",
    type: "skills",
    offering: "Professional photographer, 7 years experience. Portrait, family, product, and event photography. Edited gallery delivered within a week.",
    seeking: "Looking for videography, graphic design, web development, or business services.",
    offering_tags: ["Photography"],
    seeking_tags: ["Videography", "Graphic Design", "Web Development"],
    pexels_query: "portrait photographer camera photography session",
  },
  {
    title: "Furniture Restoration & Refinishing",
    type: "skills",
    offering: "Strip, repair, stain, and finish wood furniture. Tables, chairs, dressers, cabinets. 12 years experience. On-site or bring pieces to me.",
    seeking: "Looking for upholstery work, cabinet making, or quality woodworking tools.",
    offering_tags: ["Furniture Restoration"],
    seeking_tags: ["Upholstery", "Cabinet Making"],
    pexels_query: "furniture restoration refinishing wood staining",
  },
  {
    title: "Tree Work & Pruning — ISA Certified",
    type: "skills",
    offering: "ISA certified arborist. Pruning, crown reduction, deadwood removal, small tree removal up to 30 ft. Chainsaw work. Debris removal included.",
    seeking: "Looking for stump grinding, landscaping, or fence installation.",
    offering_tags: ["Tree Work"],
    seeking_tags: ["Stump Grinding", "Landscaping", "Fence Building"],
    pexels_query: "tree trimming arborist pruning chainsaw",
  },
  {
    title: "Graphic Design — Logos & Brand Identity",
    type: "skills",
    offering: "Brand identity designer with 6 years experience. Logo design, business cards, packaging, social media graphics. Clean, modern aesthetic.",
    seeking: "Looking for web development, photography, videography, or bookkeeping.",
    offering_tags: ["Graphic Design", "Logo Design"],
    seeking_tags: ["Web Development", "Photography", "Accounting & Bookkeeping"],
    pexels_query: "graphic design logo branding creative",
  },
  {
    title: "Canning & Food Preservation Lessons",
    type: "skills",
    offering: "Certified Master Food Preserver. Water bath and pressure canning, fermentation, dehydrating. Hands-on class at my kitchen — max 4 students.",
    seeking: "Looking for cooking lessons, sourdough instruction, or fresh produce.",
    offering_tags: ["Canning & Food Preservation"],
    seeking_tags: ["Cooking & Meal Prep", "Sourdough", "Fresh Produce"],
    pexels_query: "canning preservation food jars kitchen",
  },

  // ── SERVICES ──
  {
    title: "Split & Delivered Hardwood Firewood",
    type: "services",
    offering: "Split and delivered hardwood firewood (mostly oak and hickory). 1/4 cord minimum. Stacking available for extra. Delivered within 20 miles.",
    seeking: "Looking for chainsaw work, tree removal, or yard cleanup.",
    offering_tags: ["Firewood Delivery"],
    seeking_tags: ["Tree Work", "Brush Clearing"],
    pexels_query: "firewood split stacked logs delivery",
  },
  {
    title: "Lawn Mowing & Yard Maintenance",
    type: "services",
    offering: "Weekly or bi-weekly lawn mowing with string trimming, edging, and blowing included. Commercial equipment. Reliable and thorough.",
    seeking: "Looking for other home maintenance services or garden help.",
    offering_tags: ["Lawn Mowing"],
    seeking_tags: ["Garden Tools", "Fresh Produce"],
    pexels_query: "lawn mowing yard service maintenance",
  },
  {
    title: "Moving Help — Truck & Muscle",
    type: "services",
    offering: "3/4-ton truck and happy to help with local moves, appliance delivery, furniture hauling, or junk removal. Available most weekends.",
    seeking: "Looking for auto repair, mechanic work, or general labor trades.",
    offering_tags: ["Moving & Hauling", "Truck & Trailer Use"],
    seeking_tags: ["Vehicle Repair", "Engine Repair"],
    pexels_query: "moving truck hauling furniture help",
  },
  {
    title: "Residential Snow Removal",
    type: "services",
    offering: "Driveway and walkway snow removal. Have a snowblower and shovels. Available 6am–8pm. Dependable and thorough. Within 5 miles.",
    seeking: "Looking for lawn mowing in summer, or home repair help in exchange.",
    offering_tags: ["Snow Removal"],
    seeking_tags: ["Lawn Mowing", "Carpentry & Woodworking"],
    pexels_query: "snow removal driveway winter residential",
  },
  {
    title: "Pet Sitting — Dogs & Cats",
    type: "services",
    offering: "Experienced pet sitter, CPR certified, years of references. Daily visits or overnight stays. Comfortable with dogs, cats, and small animals. Fenced yard.",
    seeking: "Looking for childcare, housecleaning, or meal prep in exchange.",
    offering_tags: ["Pet Sitting", "Dog Walking"],
    seeking_tags: ["Childcare & Babysitting", "House Cleaning"],
    pexels_query: "dog walking pet sitting care",
  },
  {
    title: "Pressure Washing — Driveway, Deck & Siding",
    type: "services",
    offering: "Professional pressure washing. Driveways, patios, decks, house siding, fences. 3000 PSI machine. Results look brand new.",
    seeking: "Looking for gutter cleaning, painting, or deck building work.",
    offering_tags: ["Pressure Washing"],
    seeking_tags: ["Gutter Cleaning", "Painting & Finishing", "Deck Building"],
    pexels_query: "pressure washing power wash driveway clean",
  },
  {
    title: "Grocery Shopping & Errand Running",
    type: "services",
    offering: "Happy to run errands, pick up groceries, or handle pharmacy runs for elderly or mobility-limited neighbors. Available weekday afternoons.",
    seeking: "Looking for elder care, housecleaning, or cooking in exchange.",
    offering_tags: ["Grocery Shopping"],
    seeking_tags: ["Elder Care", "House Cleaning", "Meal Delivery"],
    pexels_query: "grocery shopping errands help community",
  },
  {
    title: "Thorough House Cleaning",
    type: "services",
    offering: "Thorough house cleaning: kitchen, bathrooms, floors, dusting. Bring my own supplies. 3-bedroom house takes about 3 hours. Available Tuesdays and Thursdays.",
    seeking: "Looking for lawn care, pet sitting, or childcare in trade.",
    offering_tags: ["House Cleaning"],
    seeking_tags: ["Lawn Mowing", "Pet Sitting", "Childcare & Babysitting"],
    pexels_query: "house cleaning service home mop",
  },
  {
    title: "After-School Childcare & Weekend Sitting",
    type: "services",
    offering: "Experienced nanny, CPR certified, 5 years experience with children ages 2–12. After school pickup, homework help, and meals. Weekends available too.",
    seeking: "Looking for pet sitting, house cleaning, or cooking in trade.",
    offering_tags: ["Childcare & Babysitting"],
    seeking_tags: ["Pet Sitting", "House Cleaning", "Cooking & Meal Prep"],
    pexels_query: "childcare babysitting children playing",
  },
  {
    title: "Junk Removal & Property Cleanouts",
    type: "services",
    offering: "Truck and trailer for junk removal, property cleanouts, and debris hauling. Appliances, furniture, yard waste — you name it. Same-week service.",
    seeking: "Looking for moving help, landscaping, or general labor in return.",
    offering_tags: ["Junk Removal", "Moving & Hauling"],
    seeking_tags: ["Moving & Hauling", "Landscaping"],
    pexels_query: "junk removal truck hauling debris cleanup",
  },
];

// ── Seed Users ────────────────────────────────────────────────────────────────
// These get created in Directus before listings are seeded.
// Listings are distributed round-robin across these users.

const SEED_USERS = [
  { first_name: "Dale",    last_name: "Harmon",    email: "dale.harmon@seed.swapstandard.com" },
  { first_name: "Patrice", last_name: "Wills",     email: "patrice.wills@seed.swapstandard.com" },
  { first_name: "Marcus",  last_name: "Oduya",     email: "marcus.oduya@seed.swapstandard.com" },
  { first_name: "Jenny",   last_name: "Callahan",  email: "jenny.callahan@seed.swapstandard.com" },
  { first_name: "Roy",     last_name: "Teague",    email: "roy.teague@seed.swapstandard.com" },
  { first_name: "Sandra",  last_name: "Fitch",     email: "sandra.fitch@seed.swapstandard.com" },
  { first_name: "Darnell", last_name: "Pruitt",    email: "darnell.pruitt@seed.swapstandard.com" },
  { first_name: "Claire",  last_name: "Vandenberg",email: "claire.vandenberg@seed.swapstandard.com" },
  { first_name: "Hector",  last_name: "Salinas",   email: "hector.salinas@seed.swapstandard.com" },
  { first_name: "Beth",    last_name: "Kowalski",  email: "beth.kowalski@seed.swapstandard.com" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function lookupZip(zip) {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) return null;
  const data = await res.json();
  const place = data.places[0];
  return {
    latitude: parseFloat(place.latitude),
    longitude: parseFloat(place.longitude),
    location_label: `${place["place name"]}, ${place["state abbreviation"]} ${zip}`,
  };
}

// Cache Pexels results so duplicate queries don't burn rate limit
const pexelsCache = {};

async function fetchPexelsPhotoUrl(query) {
  if (pexelsCache[query]) return pexelsCache[query];
  await sleep(400);
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
    { headers: { Authorization: PEXELS_KEY } }
  );
  if (!res.ok) {
    console.warn(`  Pexels error for "${query}": HTTP ${res.status}`);
    return null;
  }
  const data = await res.json();
  if (!data.photos?.length) {
    console.warn(`  No Pexels results for "${query}"`);
    return null;
  }
  const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
  const url = photo.src.large;
  pexelsCache[query] = url;
  return url;
}

async function importPhotoToDirectus(url) {
  const res = await fetch(`${DIRECTUS_URL}/files/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    console.warn(`  Directus file import failed: HTTP ${res.status}`);
    return null;
  }
  const { data } = await res.json();
  return data.id;
}

async function getMemberRoleId() {
  const res = await fetch(
    `${DIRECTUS_URL}/roles?filter[name][_eq]=Member&fields=id&limit=1`,
    { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } }
  );
  if (!res.ok) return null;
  const { data } = await res.json();
  return data[0]?.id ?? null;
}

async function ensureSeedUsers(roleId) {
  const userIds = [];

  for (const u of SEED_USERS) {
    // Check if the user already exists
    const checkRes = await fetch(
      `${DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(u.email)}&fields=id&limit=1`,
      { headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` } }
    );
    if (checkRes.ok) {
      const { data } = await checkRes.json();
      if (data[0]?.id) {
        userIds.push(data[0].id);
        console.log(`  ↩  Existing user: ${u.first_name} ${u.last_name} (${data[0].id})`);
        continue;
      }
    }

    // Create the user
    const createRes = await fetch(`${DIRECTUS_URL}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        password: crypto.randomUUID(), // random — these accounts are not meant to log in
        role: roleId,
        status: "active",
      }),
    });

    if (!createRes.ok) {
      console.warn(`  ✗  Failed to create user ${u.email}: ${await createRes.text()}`);
      continue;
    }

    const { data } = await createRes.json();
    userIds.push(data.id);
    console.log(`  ✓  Created user: ${u.first_name} ${u.last_name} (${data.id})`);
    await sleep(100);
  }

  return userIds;
}

async function createAsset(payload) {
  const res = await fetch(`${DIRECTUS_URL}/items/assets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    console.warn(`  Asset create failed: ${body}`);
    return null;
  }
  const { data } = await res.json();
  return data.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nSwapStandard Listing Seeder`);
  console.log(`Directus: ${DIRECTUS_URL}`);
  console.log(`Listings to create: ${LISTINGS.length}\n`);

  // ── Step 1: Resolve Member role ──
  process.stdout.write("Looking up Member role... ");
  const roleId = await getMemberRoleId();
  if (!roleId) {
    console.error("Could not find a role named 'Member' in Directus. Check your role names.");
    process.exit(1);
  }
  console.log(`✓  (${roleId})\n`);

  // ── Step 2: Ensure seed users exist ──
  console.log("Ensuring seed users exist...");
  const userIds = await ensureSeedUsers(roleId);
  if (userIds.length === 0) {
    console.error("No seed users could be created or found. Aborting.");
    process.exit(1);
  }
  console.log(`\n${userIds.length} seed users ready.`);

  const total = LISTINGS.length * SEED_ROUNDS;
  console.log(`Creating ${LISTINGS.length} listings × ${SEED_ROUNDS} round(s) = ${total} total\n`);

  let created = 0;
  let failed = 0;
  let globalIndex = 0;

  for (let round = 0; round < SEED_ROUNDS; round++) {
    if (SEED_ROUNDS > 1) console.log(`\n── Round ${round + 1} of ${SEED_ROUNDS} ──`);

    for (let i = 0; i < LISTINGS.length; i++) {
      const listing = LISTINGS[i];
      const zip = ZIPS[globalIndex % ZIPS.length];
      const userId = userIds[globalIndex % userIds.length];
      globalIndex++;

      process.stdout.write(`[${String(globalIndex).padStart(3)}/${total}] ${listing.title.slice(0, 46).padEnd(46)}  `);

      // 1. Resolve ZIP → coordinates
      const geo = await lookupZip(zip);
      if (!geo) {
        console.log("✗  ZIP lookup failed");
        failed++;
        continue;
      }

      // Round 2+ appends city to title so listings are unique across rounds
      const city = geo.location_label.split(",")[0];
      const title = round === 0 ? listing.title : `${listing.title} — ${city}`;

      // 2. Fetch photo URL from Pexels
      const photoUrl = await fetchPexelsPhotoUrl(listing.pexels_query);

      // 3. Import photo into Directus
      let thumbnailId = null;
      if (photoUrl) {
        thumbnailId = await importPhotoToDirectus(photoUrl);
      }

      // 4. Create the asset
      const assetId = await createAsset({
        title,
        type: listing.type,
        offering: listing.offering,
        seeking: listing.seeking,
        offering_tags: listing.offering_tags.join(","),
        seeking_tags: listing.seeking_tags.join(","),
        status: "published",
        asset_status: "available",
        thumbnail: thumbnailId,
        latitude: geo.latitude,
        longitude: geo.longitude,
        location_label: geo.location_label,
        user_created: userId,
      });

      if (assetId) {
        const owner = SEED_USERS[userIds.indexOf(userId)];
        console.log(`✓  id:${assetId}  ${geo.location_label.padEnd(30).slice(0, 30)}  owner:${(owner?.first_name ?? userId).padEnd(8).slice(0, 8)}  photo:${thumbnailId ? "✓" : "✗"}`);
        created++;
      } else {
        console.log("✗  asset create failed");
        failed++;
      }

      await sleep(150);
    }
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`Created: ${created}  |  Failed: ${failed}`);
  console.log(`─────────────────────────────────────\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
