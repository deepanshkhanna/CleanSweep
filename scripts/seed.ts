// Run this script to seed dummy data into Firestore:
//   npx tsx scripts/seed.ts
//
// Make sure .env.local has the real Firebase config before running.

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dummyReports = [
  {
    lat: 12.8231,
    lng: 80.0444,
    severity: "high",
    status: "reported",
    description: "Large pile of mixed waste near entrance",
    photoUrl: "",
    address: "Near SRM Main Gate, Kattankulathur",
    createdAt: Timestamp.now(),
  },
  {
    lat: 12.8215,
    lng: 80.042,
    severity: "medium",
    status: "reported",
    description: "Plastic bottles and bags along lakeside",
    photoUrl: "",
    address: "SRM Campus Lake Area",
    createdAt: Timestamp.now(),
  },
  {
    lat: 12.8245,
    lng: 80.046,
    severity: "low",
    status: "reported",
    description: "Small scattered litter near parking",
    photoUrl: "",
    address: "Behind Tech Park, SRM Campus",
    createdAt: Timestamp.now(),
  },
  {
    lat: 12.8195,
    lng: 80.0395,
    severity: "high",
    status: "reported",
    description: "Overflowing public bin, waste on road",
    photoUrl: "",
    address: "Potheri Bus Stop",
    createdAt: Timestamp.now(),
  },
  {
    lat: 12.826,
    lng: 80.048,
    severity: "medium",
    status: "reported",
    description: "Construction debris dumped on sidewalk",
    photoUrl: "",
    address: "SRM Hospital Road",
    createdAt: Timestamp.now(),
  },
  {
    lat: 12.818,
    lng: 80.041,
    severity: "low",
    status: "in_progress",
    description: "Minor littering, volunteer assigned",
    photoUrl: "",
    address: "Estancia Apartments Area",
    claimedBy: "Rahul V",
    createdAt: Timestamp.now(),
  },
  {
    lat: 12.8235,
    lng: 80.0415,
    severity: "high",
    status: "reported",
    description: "Overflowing plastic bins in cafeteria area",
    photoUrl: "",
    address: "UB Block Cafeteria Area, SRM",
    createdAt: Timestamp.now(),
  },
  {
    lat: 12.8251,
    lng: 80.0432,
    severity: "medium",
    status: "reported",
    description: "Food waste accumulation near canteen",
    photoUrl: "",
    address: "Java Canteen Rear, SRM Campus",
    createdAt: Timestamp.now(),
  },
  {
    lat: 12.8201,
    lng: 80.0385,
    severity: "high",
    status: "reported",
    description: "Heavy littering on stairs and footbridge",
    photoUrl: "",
    address: "Potheri Railway Station Footbridge",
    createdAt: Timestamp.now(),
  },
];

async function seed() {
  console.log("Seeding reports...");
  for (const report of dummyReports) {
    const docRef = await addDoc(collection(db, "reports"), report);
    console.log(`  Added: ${report.description} (${docRef.id})`);
  }
  console.log(`Done! Seeded ${dummyReports.length} reports.`);
}

seed().catch(console.error);
