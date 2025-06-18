
"use client";

import type { Locale } from "@/lib/types";
import { useRouter, useParams } from 'next/navigation';
import { auth, signInWithGoogle, upsertUserData } from '@/lib/firebase';
import { onAuthStateChanged, type AuthError } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { salonInfo as getSalonInfo } from '@/lib/mockData';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, LogIn } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Google Icon SVG (simple one)
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.988,35.953,44,30.605,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);


const translations = {
  en: {
    pageTitle: "Access Your Account",
    pageDescription: "Sign in with your Google account to manage your appointments and preferences.",
    signInWithGoogleButton: "Sign in with Google",
    signInSuccess: "Signed In Successfully",
    signInSuccessDesc: "Welcome! Redirecting you...",
    genericError: "An unexpected error occurred. Please try again.",
    authError: "Authentication Error",
    popupClosedError: "Sign-in process was cancelled. Please try again if this was unintentional.",
    checkingAuth: "Checking authentication status...",
    alreadyLoggedIn: "You are already logged in. Redirecting to profile...",
    technicalSupport: "Technical Support",
    contactSupportMessage: "If you encounter any issues, please contact our ",
  },
  ar: {
    pageTitle: "الوصول إلى حسابك",
    pageDescription: "سجل الدخول باستخدام حساب جوجل الخاص بك لإدارة مواعيدك وتفضيلاتك.",
    signInWithGoogleButton: "تسجيل الدخول باستخدام جوجل",
    signInSuccess: "تم تسجيل الدخول بنجاح",
    signInSuccessDesc: "أهلاً بك! يتم توجيهك...",
    genericError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    authError: "خطأ في المصادقة",
    popupClosedError: "تم إلغاء عملية تسجيل الدخول. يرجى المحاولة مرة أخرى إذا كان هذا غير مقصود.",
    checkingAuth: "جارٍ التحقق من حالة المصادقة...",
    alreadyLoggedIn: "أنت مسجل الدخول بالفعل. يتم توجيهك إلى الملف الشخصي...",
    technicalSupport: "الدعم الفني",
    contactSupportMessage: "في حال واجهتك أي مشاكل، يرجى التواصل مع ",
  },
};


export default function AuthPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;
  const { toast } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const t = translations[locale] || translations.en;
  const salonInfoData = getSalonInfo(locale);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Ensure user data is in Firestore, especially if they are returning
        // This might be redundant if signInWithGoogle always upserts, but good for robustness
        if (user.email) { // Google users always have an email
            upsertUserData(user.uid, {
                name: user.displayName,
                email: user.email,
                imageUrl: user.photoURL,
                isAnonymous: false,
                phoneNumber: user.phoneNumber || null,
            }).catch(err => console.error("Error ensuring user data on auth state change:", err));
        }
        toast({ title: t.alreadyLoggedIn });
        router.push(`/${locale}/profile`);
      } else {
        setIsCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, locale, toast]);


  const handleAuthError = (error: AuthError | Error) => {
    console.error(`Google Sign-In Error:`, error);
    let title = t.authError;
    let description = t.genericError;

    if (error.message.includes("Sign-in popup closed by user") || (error as AuthError).code === 'auth/popup-closed-by-user') {
        description = t.popupClosedError;
    } else if ((error as AuthError).code) {
        const authError = error as AuthError;
        // Handle other specific Firebase auth errors if needed
        description = authError.message || t.genericError;
    } else if (error.message) {
        description = error.message;
    }
    toast({ variant: "destructive", title, description });
  };

  async function handleGoogleSignIn() {
    setIsSigningIn(true);
    try {
      await signInWithGoogle(); // signInWithGoogle now handles upsertUserData
      toast({ title: t.signInSuccess, description: t.signInSuccessDesc });
      router.push(`/${locale}/profile`);
    } catch (error) {
      handleAuthError(error as AuthError | Error);
    } finally {
      setIsSigningIn(false);
    }
  }


  if (!locale || (locale !== 'en' && locale !== 'ar')) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size={48} /></div>;
  }


  if (isCheckingAuth) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-muted-foreground">{t.checkingAuth}</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-12 px-4 flex flex-col items-center">
      <UserCircle className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-3xl font-bold mb-2 text-center font-headline">{t.pageTitle}</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">{t.pageDescription}</p>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-center">{t.signInWithGoogleButton}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full bg-primary hover:bg-primary/90 mt-4" 
            disabled={isSigningIn}
            variant="default"
            size="lg"
          >
            {isSigningIn ? <LoadingSpinner className="me-2" /> : <GoogleIcon />}
            {t.signInWithGoogleButton}
          </Button>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t.contactSupportMessage}
            <a
              href={salonInfoData.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:text-accent/80 underline"
            >
              {t.technicalSupport}
            </a>
            {locale === 'en' ? '.' : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
