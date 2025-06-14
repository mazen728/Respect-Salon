// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, query, where, limit } from 'firebase/firestore';
import type { Barber } from './types';
import { getMockBarbers as getOriginalMockBarbers } from './mockData'; // Temporary import for seeding

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export { db };

// Basic seeding function for Barbers data
export async function seedBarbersData(): Promise<string> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return "Firebase project ID not configured. Seeding skipped.";
  }
  try {
    const barbersRef = collection(db, 'barbers');
    const existingDataQuery = query(barbersRef, limit(1));
    const existingDataSnapshot = await getDocs(existingDataQuery);

    if (!existingDataSnapshot.empty) {
      console.log('Barbers data already exists in Firestore. Seeding skipped.');
      return 'Barbers data already exists. Seeding skipped.';
    }

    const batch = writeBatch(db);
    const locales: ['en', 'ar'] = ['en', 'ar'];
    let count = 0;

    for (const locale of locales) {
      // Use the original mock data generator for each locale
      const mockBarbersForLocale: Omit<Barber, 'id'>[] = getOriginalMockBarbers(locale).map(({ id, ...rest }) => ({
        ...rest, // All other properties (name, imageUrl, specialties, rating, availability, dataAiHint)
        originalMockId: id, // Keep track of the original mock ID
        locale: locale,     // Add locale field
      }));
      
      mockBarbersForLocale.forEach((barberData) => {
        // Firestore will auto-generate document IDs
        const docRef = collection(db, 'barbers').doc(); 
        batch.set(docRef, barberData);
        count++;
      });
    }

    await batch.commit();
    console.log(`Successfully seeded ${count} barber documents into Firestore.`);
    return `Successfully seeded ${count} barber documents.`;
  } catch (error) {
    console.error('Error seeding barbers data to Firestore:', error);
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        return "Error seeding barbers: Missing or insufficient Firestore permissions. Please check your Firestore security rules.";
    }
    if (error instanceof Error && (error.message.includes('Failed to get document because the client is offline') || error.message.includes('Could not reach Cloud Firestore backend'))) {
        return "Error seeding barbers: Could not reach Cloud Firestore. Check your internet connection and Firebase configuration.";
    }
    return `Error seeding barbers data: ${error instanceof Error ? error.message : String(error)}`;
  }
}
