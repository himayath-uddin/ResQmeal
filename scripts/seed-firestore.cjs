/**
 * Seed Firestore with realistic demo food listings and users.
 * Run once: node scripts/seed-firestore.cjs
 */
const https = require("https");

const PROJECT_ID = "ai4-impact-food";
const API_KEY = "AIzaSyDk9ILzV-Yb8RZ7itsFM07yXCsO9JJAR_A";

// Hyderabad-area coordinates
const LOCATIONS = [
  { lat: 17.4400, lng: 78.3489, address: "HITEC City, Hyderabad" },
  { lat: 17.3850, lng: 78.4867, address: "Charminar, Old City, Hyderabad" },
  { lat: 17.4260, lng: 78.4480, address: "Banjara Hills, Hyderabad" },
  { lat: 17.4485, lng: 78.3908, address: "Madhapur, Hyderabad" },
  { lat: 17.3616, lng: 78.4747, address: "Falaknuma, Hyderabad" },
  { lat: 17.4940, lng: 78.3990, address: "Kukatpally, Hyderabad" },
  { lat: 17.4156, lng: 78.4347, address: "Nampally, Hyderabad" },
  { lat: 17.4399, lng: 78.4983, address: "Uppal, Hyderabad" },
  { lat: 17.3713, lng: 78.4804, address: "Salar Jung Museum Area, Hyderabad" },
  { lat: 17.4062, lng: 78.4691, address: "Malakpet, Hyderabad" },
  { lat: 17.4375, lng: 78.4483, address: "Jubilee Hills, Hyderabad" },
  { lat: 17.4969, lng: 78.3879, address: "KPHB Colony, Hyderabad" },
  { lat: 17.4522, lng: 78.3814, address: "Gachibowli, Hyderabad" },
  { lat: 17.3455, lng: 78.5522, address: "LB Nagar, Hyderabad" },
  { lat: 17.4640, lng: 78.3563, address: "Financial District, Hyderabad" },
];

const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop",
];

const DEMO_DONOR_IDS = ["seed_donor_1", "seed_donor_2", "seed_donor_3"];

const LISTINGS = [
  {
    title: "Veg Biryani — Catering Surplus",
    description: "Freshly made vegetable biryani from a wedding catering event. Packed in foil containers, still warm. Contains rice, mixed vegetables, saffron, and mild spices.",
    quantity: 120,
    expiry_hours: 4,
    donor_idx: 0,
    loc_idx: 0,
    urgency: "high",
    recommendation: "Large community shelters and homeless centers",
    storage_tip: "Serve within 3 hours. Keep sealed and at room temperature.",
    status: "available",
  },
  {
    title: "Chicken Curry with Naan",
    description: "Restaurant surplus chicken curry with fresh naan bread. Butter chicken style, mildly spiced. 50 individual portions in sealed containers.",
    quantity: 50,
    expiry_hours: 3,
    donor_idx: 1,
    loc_idx: 1,
    urgency: "high",
    recommendation: "Families and night shelters",
    storage_tip: "Keep refrigerated. Reheat before serving. Contains dairy and meat.",
    status: "available",
  },
  {
    title: "Fresh Fruit Boxes",
    description: "Assorted seasonal fruit boxes — bananas, apples, oranges, and grapes. From a corporate wellness event. Individually packed.",
    quantity: 80,
    expiry_hours: 24,
    donor_idx: 2,
    loc_idx: 2,
    urgency: "medium",
    recommendation: "Schools, orphanages, and children's homes",
    storage_tip: "Store in cool, dry place. Consume within 24 hours.",
    status: "available",
  },
  {
    title: "Paneer Tikka Platter",
    description: "Grilled paneer tikka with mint chutney from a cancelled corporate lunch. Vacuum-sealed portions.",
    quantity: 35,
    expiry_hours: 5,
    donor_idx: 0,
    loc_idx: 3,
    urgency: "high",
    recommendation: "Families and community kitchens",
    storage_tip: "Keep refrigerated. Contains dairy. Serve within 4 hours.",
    status: "available",
  },
  {
    title: "Dal Tadka & Rice Combo",
    description: "Home-style dal tadka with steamed basmati rice. Freshly cooked, packed in eco-friendly containers. Vegan-friendly.",
    quantity: 60,
    expiry_hours: 6,
    donor_idx: 1,
    loc_idx: 4,
    urgency: "medium",
    recommendation: "Community kitchens and senior care homes",
    storage_tip: "Store in sealed containers, keep shaded. Best served warm.",
    status: "available",
  },
  {
    title: "Packaged Biscuits & Snacks",
    description: "Factory-sealed biscuit packs, namkeen, and juice boxes. Long shelf life. From a retail overstock clearance.",
    quantity: 200,
    expiry_hours: 720,
    donor_idx: 2,
    loc_idx: 5,
    urgency: "low",
    recommendation: "Disaster relief kits and distribution centers",
    storage_tip: "Store in dry area away from sunlight. Check individual pack expiry dates.",
    status: "available",
  },
  {
    title: "Idli-Sambar Breakfast Set",
    description: "Freshly steamed idlis with sambar and coconut chutney. From a morning catering event. 40 sets ready to serve.",
    quantity: 40,
    expiry_hours: 3,
    donor_idx: 0,
    loc_idx: 6,
    urgency: "high",
    recommendation: "Morning shelters and transit camps",
    storage_tip: "Serve immediately. Idlis best consumed within 2 hours of steaming.",
    status: "claimed_by_ngo",
    claimed_by: "seed_ngo_1",
  },
  {
    title: "Mixed Veg Sandwich Tray",
    description: "Grilled vegetable sandwiches with cheese from a conference. Individually wrapped in paper. Contains wheat and dairy.",
    quantity: 30,
    expiry_hours: 8,
    donor_idx: 1,
    loc_idx: 7,
    urgency: "medium",
    recommendation: "Children's homes and after-school programs",
    storage_tip: "Keep wrapped and refrigerated. Best consumed within 6 hours.",
    status: "available",
  },
  {
    title: "Mutton Biryani — Party Leftover",
    description: "Hyderabadi mutton biryani from a family celebration. Richly spiced, dum-cooked. 70 generous portions.",
    quantity: 70,
    expiry_hours: 4,
    donor_idx: 2,
    loc_idx: 8,
    urgency: "high",
    recommendation: "Large families and community feasts",
    storage_tip: "Contains meat. Refrigerate immediately. Reheat thoroughly before serving.",
    status: "claimed_by_volunteer",
    claimed_by: "seed_ngo_1",
    volunteer_id: "seed_volunteer_1",
  },
  {
    title: "Milk & Yogurt Supply",
    description: "Fresh toned milk packets and plain yogurt cups approaching best-before date. From a local dairy distributor.",
    quantity: 45,
    expiry_hours: 12,
    donor_idx: 0,
    loc_idx: 9,
    urgency: "high",
    recommendation: "Families with young children, old age homes",
    storage_tip: "Must be refrigerated at all times. Dairy product — consume before expiry.",
    status: "available",
  },
  {
    title: "Rajma Chawal Lunch Packs",
    description: "North Indian style rajma (kidney bean curry) with steamed rice. Home-cooked with love for distribution.",
    quantity: 25,
    expiry_hours: 5,
    donor_idx: 1,
    loc_idx: 10,
    urgency: "medium",
    recommendation: "Working-class families and daily wage workers",
    storage_tip: "Keep sealed. Serve warm within 4 hours of cooking.",
    status: "available",
  },
  {
    title: "Chole Bhature Feast",
    description: "Spiced chickpea curry with fried bread from a temple kitchen surplus. Large batch, freshly prepared.",
    quantity: 90,
    expiry_hours: 4,
    donor_idx: 2,
    loc_idx: 11,
    urgency: "high",
    recommendation: "Community distribution and food camps",
    storage_tip: "Bhature best consumed fresh. Chole can be stored for 6 hours sealed.",
    status: "delivered",
    claimed_by: "seed_ngo_1",
    volunteer_id: "seed_volunteer_1",
  },
  {
    title: "Pasta & Garlic Bread",
    description: "Italian-style penne pasta in red sauce with garlic bread slices. From a restaurant trial batch. Contains gluten and dairy.",
    quantity: 28,
    expiry_hours: 6,
    donor_idx: 0,
    loc_idx: 12,
    urgency: "medium",
    recommendation: "College students and youth hostels",
    storage_tip: "Keep refrigerated. Reheat pasta before serving. Garlic bread best fresh.",
    status: "available",
  },
  {
    title: "South Indian Thali Set",
    description: "Complete thali with rice, sambar, rasam, poriyal, curd, and papad. From a restaurant that overprepped for the evening.",
    quantity: 55,
    expiry_hours: 3,
    donor_idx: 1,
    loc_idx: 13,
    urgency: "high",
    recommendation: "Senior care facilities and community halls",
    storage_tip: "Serve within 2 hours. Curd and rasam should be kept cool.",
    status: "available",
  },
  {
    title: "Energy Bars & Dry Fruits Pack",
    description: "Protein bars, trail mix, and dry fruit pouches from a gym event. Sealed packets with long shelf life.",
    quantity: 150,
    expiry_hours: 2160,
    donor_idx: 2,
    loc_idx: 14,
    urgency: "low",
    recommendation: "Marathon relief, trekking camps, and emergency kits",
    storage_tip: "Store in a cool, dry place. Individual packets are sealed.",
    status: "available",
  },
];

const USERS = [
  { id: "seed_donor_1", email: "freshbites.catering@demo.com", role: "donor", location: LOCATIONS[0] },
  { id: "seed_donor_2", email: "greenleaf.restaurant@demo.com", role: "donor", location: LOCATIONS[1] },
  { id: "seed_donor_3", email: "spiceroute.events@demo.com", role: "donor", location: LOCATIONS[2] },
  { id: "seed_ngo_1", email: "hopefoundation.hyd@demo.com", role: "ngo", location: LOCATIONS[4] },
  { id: "seed_volunteer_1", email: "rahul.volunteer@demo.com", role: "volunteer", location: LOCATIONS[6] },
];

function firestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(firestoreValue) } };
  if (typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = firestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function buildDoc(data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = firestoreValue(v);
  }
  return { fields };
}

function firebaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : "";
    const req = https.request({
      hostname: "firestore.googleapis.com",
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents${path}?key=${API_KEY}`,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(body ? { "Content-Length": Buffer.byteLength(postData) } : {}),
      },
    }, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        if (res.statusCode >= 400) {
          console.error(`  ✗ ${method} ${path} → ${res.statusCode}`);
          try { const e = JSON.parse(data); console.error(`    ${e.error?.message || data.slice(0, 200)}`); } catch { console.error(`    ${data.slice(0, 200)}`); }
          reject(new Error(`HTTP ${res.statusCode}`));
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(postData);
    req.end();
  });
}

async function seedUsers() {
  console.log("\n📋 Seeding users...");
  for (const user of USERS) {
    const docId = user.id;
    const doc = buildDoc({
      email: user.email,
      role: user.role,
      location: user.location,
    });
    try {
      await firebaseRequest("PATCH", `/users/${docId}`, doc);
      console.log(`  ✓ ${user.role}: ${user.email}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${user.email}`, err.message);
    }
  }
}

async function seedListings() {
  console.log("\n🍲 Seeding food listings...");
  for (let i = 0; i < LISTINGS.length; i++) {
    const item = LISTINGS[i];
    const loc = LOCATIONS[item.loc_idx];
    const now = Date.now();
    const createdAt = new Date(now - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString();
    const expiryTime = new Date(now + item.expiry_hours * 60 * 60 * 1000).toISOString();

    const data = {
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      qty: item.quantity,
      location: loc,
      lat: loc.lat,
      lng: loc.lng,
      expiry_time: expiryTime,
      donor_id: DEMO_DONOR_IDS[item.donor_idx],
      status: item.status,
      claimed_by: item.claimed_by || null,
      volunteer_id: item.volunteer_id || null,
      urgent: item.urgency === "high",
      image_url: FOOD_IMAGES[i],
      ai_insights: {
        urgency: item.urgency,
        recommendation: item.recommendation,
        storage_tip: item.storage_tip,
      },
      created_at: createdAt,
    };

    try {
      await firebaseRequest("POST", "/food_listings", buildDoc(data));
      console.log(`  ✓ ${item.title} (${item.quantity} meals, ${item.status})`);
    } catch (err) {
      console.error(`  ✗ Failed: ${item.title}`, err.message);
    }
  }
}

async function main() {
  console.log("🚀 ResQMeal Firestore Seeder");
  console.log(`   Project: ${PROJECT_ID}\n`);
  await seedUsers();
  await seedListings();
  console.log("\n✅ Seeding complete! Your dashboards should now show data.");
}

main().catch(console.error);
