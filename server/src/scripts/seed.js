import bcrypt from 'bcryptjs';
import { connectDb } from '../db/index.js';
import { bootstrapAdmin } from '../services/bootstrap.js';
import { calculateValue } from '../services/valueCalculator.js';
import { config } from '../config.js';

// Realistic demo data (Pune, India). Change the coordinates/cities to suit your audience.
// Items have no photos: add real ones by editing a listing in the app, or set `images` below to hosted URLs.
const PASSWORD = 'Demo@12345';

const USERS = [
  { name: 'Aarav Sharma', email: 'aarav@clothswap.test', city: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.894 },
  { name: 'Neha Kulkarni', email: 'neha@clothswap.test', city: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077 },
  { name: 'Rohan Mehta', email: 'rohan@clothswap.test', city: 'Viman Nagar, Pune', lat: 18.5679, lng: 73.9143 },
  { name: 'Priya Deshpande', email: 'priya@clothswap.test', city: 'Aundh, Pune', lat: 18.558, lng: 73.8075 },
];

const ITEMS = {
  'aarav@clothswap.test': [
    { title: "Levi's 511 Slim Fit Jeans", category: 'Bottoms', brand: "Levi's", size: '32', condition: 'Good', description: 'Dark indigo wash, worn a handful of times. No rips or fading.' },
    { title: 'Nike Air Force 1 Low, White', category: 'Shoes', brand: 'Nike', size: '8', condition: 'Like New', description: 'UK 8. Cleaned and stored in the box, minimal creasing.' },
    { title: 'H&M Oversized Cotton Hoodie', category: 'Outerwear', brand: 'H&M', size: 'L', condition: 'Good', description: 'Charcoal grey, fleece lined. Soft, no pilling.' },
  ],
  'neha@clothswap.test': [
    { title: 'Zara Floral Midi Dress', category: 'Dresses', brand: 'Zara', size: 'M', condition: 'Like New', description: 'Worn once to a wedding lunch. Side zip, lined.' },
    { title: 'Fabindia Cotton Kurta, Indigo', category: 'Ethnic Wear', brand: 'Fabindia', size: 'M', condition: 'Good', description: 'Hand block print, straight fit. Washed gently every time.' },
    { title: 'Adidas Ultraboost Running Shoes', category: 'Shoes', brand: 'Adidas', size: '7', condition: 'Good', description: 'About 200 km of road running. Plenty of cushioning left.' },
  ],
  'rohan@clothswap.test': [
    { title: 'Tommy Hilfiger Polo T-shirt', category: 'Tops', brand: 'Tommy Hilfiger', size: 'L', condition: 'Like New', description: 'Navy with the classic small flag logo. Collar still crisp.' },
    { title: 'Roadster Denim Jacket', category: 'Outerwear', brand: 'Roadster', size: 'M', condition: 'Fair', description: 'Light wash, some fading on the cuffs, all buttons intact.' },
    { title: 'Puma Track Pants', category: 'Bottoms', brand: 'Puma', size: 'M', condition: 'Good', description: 'Black with white side stripe, zip pockets.' },
  ],
  'priya@clothswap.test': [
    { title: 'Ray-Ban Wayfarer Sunglasses', category: 'Accessories', brand: 'Ray-Ban', size: 'Free', condition: 'Good', description: 'Classic black frame, original case included. Light scratches on the case only.' },
    { title: 'Uniqlo Ultra Light Down Jacket', category: 'Outerwear', brand: 'Uniqlo', size: 'S', condition: 'Like New', description: 'Packs into its own pouch. Ideal for hill-station trips.' },
    { title: 'Biba Anarkali Kurta Set', category: 'Ethnic Wear', brand: 'Biba', size: 'S', condition: 'New with tags', description: 'Mustard with dupatta. Bought in the wrong size, never worn.' },
  ],
};

const db = await connectDb();
await bootstrapAdmin();
const hash = await bcrypt.hash(PASSWORD, 10);

for (const u of USERS) {
  let user = await db.users.findByEmail(u.email);
  if (!user) user = await db.users.create({ ...u, passwordHash: hash });
  const existing = await db.listings.search({ userId: user.id, limit: 1 });
  if (existing.length) continue;
  for (const item of ITEMS[u.email]) {
    await db.listings.create({
      ...item,
      userId: user.id,
      city: user.city,
      lat: user.lat,
      lng: user.lng,
      estimatedValue: calculateValue(item).estimatedValue,
      images: [],
    });
  }
}

console.log(`Seeded ${USERS.length} demo users and their listings (db=${config.db.type}).`);
console.log(`Demo login: any of the emails above with password ${PASSWORD}`);
await db.close();
