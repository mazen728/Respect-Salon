
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import getAuth
import { getFirestore, collection, getDocs, writeBatch, query, where, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";
import type { Barber, Locale, Promotion } from './types';
import { generateMockBarbers as getOriginalMockBarbers, getRawMockPromotions } from './mockData';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCPGb7DJyT6q6Ij2xRFv-If8cFnr-eRf3w",
  authDomain: "respect-salon1.firebaseapp.com",
  projectId: "respect-salon1",
  storageBucket: "respect-salon1.firebasestorage.app",
  messagingSenderId: "111339803449",
  appId: "1:111339803449:web:a3dda7848f655d7b230ee8",
  measurementId: "G-T4Q7F23EG4"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Auth

// Initialize Firebase Analytics if supported (runs only in browser)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { db, auth, analytics }; // Export auth

// Function to fetch barbers from Firestore
export async function fetchBarbersFromFirestore(locale: Locale): Promise<Barber[]> {
  if (!firebaseConfig.projectId) {
    console.warn("Firebase project ID not configured. Firestore fetch skipped for barbers.");
    return [];
  }
  try {
    const barbersRef = collection(db, 'barbers');
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
      } as Barber;
    });
    return barbers;
  } catch (error) {
    console.error(`Error fetching barbers from Firestore for locale ${locale}:`, error);
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.error("Firestore Security Rules might be denying access for barbers.");
    }
    if (error instanceof Error && (error.message.includes('Failed to get document because the client is offline') || error.message.includes('Could not reach Cloud Firestore backend'))) {
        console.error("Could not reach Cloud Firestore for barbers. Check your internet connection and Firebase configuration.");
    }
    return [];
  }
}


// Basic seeding function for Barbers data
export async function seedBarbersData(): Promise<string> {
  if (!firebaseConfig.projectId) {
    return "Firebase project ID not configured. Barbers seeding skipped.";
  }
  try {
    const barbersRef = collection(db, 'barbers');
    const existingDataQuery = query(barbersRef, limit(1));
    const existingDataSnapshot = await getDocs(existingDataQuery);

    if (!existingDataSnapshot.empty) {
      console.log('Barbers data likely already exists in Firestore. Seeding skipped.');
      return 'Barbers data likely already exists. Seeding skipped.';
    }

    const batch = writeBatch(db);
    const locales: ['en', 'ar'] = ['en', 'ar'];
    let count = 0;

    for (const currentLocale of locales) {
      const mockBarbersForLocale: Omit<Barber, 'id'>[] = getOriginalMockBarbers(currentLocale).map(({ id, ...rest }) => ({
        ...rest,
        originalMockId: id,
        locale: currentLocale,
      }));

      mockBarbersForLocale.forEach((barberData) => {
        const docRef = doc(collection(db, 'barbers'));
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
        return "Error seeding barbers: Missing or insufficient Firestore permissions.";
    }
    if (error instanceof Error && (error.message.includes('Failed to get document because the client is offline') || error.message.includes('Could not reach Cloud Firestore backend'))) {
        return "Error seeding barbers: Could not reach Cloud Firestore.";
    }
    return `Error seeding barbers data: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Function to get the global setting for promotions visibility
export async function getPromotionsVisibilitySetting(): Promise<boolean> {
  if (!firebaseConfig.projectId) {
    console.warn("[Firebase Settings] Firebase project ID not configured. Cannot fetch app settings. Defaulting to false.");
    return false;
  }
  try {
    const settingsDocRef = doc(db, 'appSettings', 'main');
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists() && docSnap.data().promotionsVisible === true) {
      console.log("[Firebase Settings] promotionsVisible is TRUE in appSettings/main.");
      return true;
    }
    console.log("[Firebase Settings] promotionsVisible is FALSE or document/field does not exist in appSettings/main.");
    return false;
  } catch (error) {
    console.error("[Firebase Settings] Error fetching promotions visibility setting:", error);
    return false;
  }
}

// Function to fetch promotions from Firestore
export async function fetchPromotionsFromFirestore(locale: Locale): Promise<Promotion[]> {
  if (!firebaseConfig.projectId) {
    console.warn("[Firebase Fetch] Firebase project ID not configured. Firestore fetch skipped for promotions.");
    return [];
  }

  const promotionsAreVisible = await getPromotionsVisibilitySetting();
  // The log for promotionsAreVisible value is now inside getPromotionsVisibilitySetting

  if (!promotionsAreVisible) {
    console.warn("[Firebase Fetch] Promotions display is DISABLED by admin settings (promotionsVisible=false or not found). Returning empty list for promotions.");
    return [];
  }

  console.log("[Firebase Fetch] Promotions display is ENABLED. Proceeding to fetch from 'promotions' collection...");
  try {
    const promotionsRef = collection(db, 'promotions');
    const querySnapshot = await getDocs(promotionsRef);
    console.log(`[Firebase Fetch] Fetched ${querySnapshot.size} documents from 'promotions' collection.`);

    if (querySnapshot.empty) {
      console.log("[Firebase Fetch] 'promotions' collection is empty. Returning empty list.");
      return [];
    }

    const promotions: Promotion[] = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // Log the data for one document to check its structure
      if (querySnapshot.docs.indexOf(docSnapshot) === 0) { // Log only the first document's data for brevity
          console.log("[Firebase Fetch] Data of first promotion document:", JSON.stringify(data, null, 2));
      }
      return {
        id: docSnapshot.id,
        title: locale === 'ar' ? data.title_ar : data.title_en,
        description: locale === 'ar' ? data.description_ar : data.description_en,
        couponCode: data.couponCode,
        imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
        dataAiHint: data.dataAiHint || 'discount offer',
      } as Promotion;
    });
    console.log(`[Firebase Fetch] Successfully mapped ${promotions.length} promotions for locale '${locale}'.`);
    return promotions;
  } catch (error) {
    console.error(`[Firebase Fetch] Error fetching promotions from Firestore for locale ${locale}:`, error);
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      console.error("[Firebase Fetch] Firestore Security Rules might be denying access for 'promotions' collection.");
    }
    if (error instanceof Error && (error.message.includes('Failed to get document because the client is offline') || error.message.includes('Could not reach Cloud Firestore backend'))) {
      console.error("[Firebase Fetch] Could not reach Cloud Firestore for 'promotions'. Check your internet connection and Firebase configuration.");
    }
    return [];
  }
}

// Basic seeding function for Promotions data
export async function seedPromotionsData(): Promise<string> {
  if (!firebaseConfig.projectId) {
    return "Firebase project ID not configured. Promotions seeding skipped.";
  }
  try {
    const promotionsRef = collection(db, 'promotions');
    const existingDataQuery = query(promotionsRef, limit(1));
    const existingDataSnapshot = await getDocs(existingDataQuery);

    let promotionsSeededMessage = 'Promotions data likely already exists. Seeding skipped.';
    let count = 0;

    if (existingDataSnapshot.empty) {
      const batch = writeBatch(db);
      const rawPromotions = getRawMockPromotions();
      rawPromotions.forEach(promoData => {
        const docRef = doc(promotionsRef, promoData.id);
        const firestoreData = {
          title_en: promoData.title.en,
          title_ar: promoData.title.ar,
          description_en: promoData.description.en,
          description_ar: promoData.description.ar,
          couponCode: promoData.couponCode ?? null,
          imageUrl: promoData.imageUrl ?? null,
          dataAiHint: promoData.dataAiHint ?? null,
        };
        batch.set(docRef, firestoreData);
        count++;
      });
      await batch.commit();
      promotionsSeededMessage = `Successfully seeded ${count} promotion documents.`;
      console.log(`[Firebase Seed] ${promotionsSeededMessage}`);
    } else {
      console.log('[Firebase Seed] Promotions data likely already exists in Firestore. Seeding skipped to avoid duplication.');
    }

    // Ensure promotions visibility is enabled
    const settingsRef = doc(db, 'appSettings', 'main');
    await setDoc(settingsRef, { promotionsVisible: true }, { merge: true });
    console.log('[Firebase Seed] Successfully ensured promotionsVisible is true in appSettings/main.');

    return `${promotionsSeededMessage} Promotions display setting is now ON.`;

  } catch (error) {
    console.error('[Firebase Seed] Error during promotions seeding process:', error);
    let specificError = "";
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      specificError = "Missing or insufficient Firestore permissions. Please check your Firestore security rules.";
    } else if (error instanceof Error && (error.message.includes('Failed to get document because the client is offline') || error.message.includes('Could not reach Cloud Firestore backend'))) {
      specificError = "Could not reach Cloud Firestore. Check your internet connection and Firebase configuration.";
    } else {
      specificError = error instanceof Error ? error.message : String(error);
    }
    return `Error during promotions seeding: ${specificError}`;
  }
}
