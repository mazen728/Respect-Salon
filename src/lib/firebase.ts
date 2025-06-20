
// src/lib/firebase.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { 
  getAuth, 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as firebaseUpdatePassword,
  type UserCredential,
  type User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, collection, getDocs, writeBatch, query, where, limit, doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getAnalytics, isSupported } from "firebase/analytics";
import type { Barber, Locale, Promotion, UserProfileData } from './types';
import { generateMockBarbers as getOriginalMockBarbers, getRawMockPromotions } from './mockData';

// Your web app's Firebase configuration
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
const auth = getAuth(app);

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { db, auth, analytics };

// Function to upsert user data in Firestore
export async function upsertUserData(uid: string, data: Partial<UserProfileData> & { email?: string | null, isAnonymous?: boolean, phoneNumber?: string | null, name?: string | null, imageUrl?: string | null }) {
  if (!firebaseConfig.projectId) {
    console.warn("Firebase project ID not configured. User data operation skipped.");
    throw new Error("Firestore not configured for user data.");
  }
  const userRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(userRef);
    const commonData = {
      lastLoginAt: serverTimestamp(),
    };

    const payload: any = {};
    if (data.email !== undefined) payload.email = data.email; // Dummy email
    if (data.name !== undefined) payload.name = data.name;
    if (data.imageUrl !== undefined) payload.imageUrl = data.imageUrl; // Will likely be null or user-uploaded
    if (data.age !== undefined) payload.age = data.age;
    if (data.phoneNumber !== undefined) payload.phoneNumber = data.phoneNumber;
    if (data.isAnonymous !== undefined) payload.isAnonymous = data.isAnonymous;


    if (docSnap.exists()) {
      await updateDoc(userRef, {
        ...payload,
        ...commonData,
      });
      console.log("User data updated in Firestore for UID:", uid);
    } else {
      await setDoc(userRef, {
        uid,
        createdAt: serverTimestamp(),
        ...payload,
        ...commonData,
      });
      console.log("New user data created in Firestore for UID:", uid);
    }
  } catch (error) {
    console.error(`Error upserting user data for UID ${uid} in Firestore:`, error);
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.error("Firestore Security Rules might be denying access for 'users' collection.");
    }
    throw new Error(`Firestore: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
  }
}

// Function to create user with email (dummy) and password
export async function createUserWithEmailAndPasswordAuth(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Function to sign in user with email (dummy) and password
export async function signInWithEmailAndPasswordAuth(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

// Function to re-authenticate user
export async function reauthenticateUser(user: FirebaseUser, currentPasswordDummmyEmail: string, currentActualPasswordVal: string): Promise<void> {
  const credential = EmailAuthProvider.credential(currentPasswordDummmyEmail, currentActualPasswordVal);
  return reauthenticateWithCredential(user, credential);
}

// Function to update user's password
export async function updateUserPassword(user: FirebaseUser, newPasswordVal: string): Promise<void> {
  return firebaseUpdatePassword(user, newPasswordVal);
}


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
      if (querySnapshot.docs.indexOf(docSnapshot) === 0) {
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

// Function to find user by phone number (primarily to get their dummy email for password reset)
export async function findUserByPhoneNumber(phoneNumber: string): Promise<{ uid: string, email: string | null } | null> {
  if (!firebaseConfig.projectId) {
    console.warn("Firebase project ID not configured. Cannot search for user by phone number.");
    return null;
  }
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phoneNumber", "==", phoneNumber), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`No user found with phone number: ${phoneNumber}`);
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    return {
      uid: userDoc.id,
      email: userData.email || null, // This should be the dummy email
    };
  } catch (error) {
    console.error(`Error finding user by phone number ${phoneNumber}:`, error);
    return null;
  }
}

// Password reset functionality
export async function sendPasswordResetEmail(email: string): Promise<void> {
    return firebaseSendPasswordResetEmail(auth, email);
}
