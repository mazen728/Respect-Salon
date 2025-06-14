
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, query, where, limit, doc } from 'firebase/firestore';
import type { Barber, Locale } from './types';
import { generateMockBarbers as getOriginalMockBarbers } from './mockData'; // Renamed to avoid conflict for seeding

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

// Function to fetch barbers from Firestore
export async function fetchBarbersFromFirestore(locale: Locale): Promise<Barber[]> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.warn("Firebase project ID not configured. Firestore fetch skipped for barbers.");
    return []; // Return empty or handle as an error, then fallback in calling function
  }
  try {
    const barbersRef = collection(db, 'barbers');
    // Query for barbers matching the current locale
    const q = query(barbersRef, where('locale', '==', locale));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No barbers found in Firestore for locale: ${locale}.`);
      return [];
    }

    const barbers: Barber[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        imageUrl: data.imageUrl || 'https://placehold.co/300x300.png',
        dataAiHint: data.dataAiHint || 'male barber portrait',
        specialties: Array.isArray(data.specialties) ? data.specialties : [],
        rating: typeof data.rating === 'number' ? data.rating : 0,
        availability: data.availability || '',
        // Ensure locale is part of the returned object if needed, though it's used for query
        // locale: data.locale 
      } as Barber; // Type assertion
    });
    return barbers;
  } catch (error) {
    console.error(`Error fetching barbers from Firestore for locale ${locale}:`, error);
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.error("Firestore Security Rules might be denying access.");
    }
    if (error instanceof Error && (error.message.includes('Failed to get document because the client is offline') || error.message.includes('Could not reach Cloud Firestore backend'))) {
        console.error("Could not reach Cloud Firestore. Check your internet connection and Firebase configuration.");
    }
    return []; // Return empty on error, let calling function handle fallback
  }
}


// Basic seeding function for Barbers data
export async function seedBarbersData(): Promise<string> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return "Firebase project ID not configured. Seeding skipped.";
  }
  try {
    const barbersRef = collection(db, 'barbers');
    const existingDataQuery = query(barbersRef, limit(1)); // Check if any data exists at all
    const existingDataSnapshot = await getDocs(existingDataQuery);

    if (!existingDataSnapshot.empty) {
      // More robust check: verify if data for both locales has been seeded
      // This example skips if *any* data is present, can be enhanced
      console.log('Barbers data likely already exists in Firestore. Seeding skipped to avoid duplication.');
      return 'Barbers data likely already exists. Seeding skipped.';
    }

    const batch = writeBatch(db);
    const locales: ['en', 'ar'] = ['en', 'ar'];
    let count = 0;

    for (const currentLocale of locales) {
      // Use the original mock data generator for each locale
      const mockBarbersForLocale: Omit<Barber, 'id'>[] = getOriginalMockBarbers(currentLocale).map(({ id, ...rest }) => ({
        ...rest, // All other properties (name, imageUrl, specialties, rating, availability, dataAiHint)
        originalMockId: id, // Keep track of the original mock ID
        locale: currentLocale,     // Add locale field
      }));
      
      mockBarbersForLocale.forEach((barberData) => {
        // Firestore will auto-generate document IDs if you use .add()
        // If you want to use your mock IDs, use .doc(id).set(data)
        const docRef = doc(collection(db, 'barbers')); // Auto-generate ID
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
