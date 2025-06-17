
"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle, Mail, KeyRound, Phone } from 'lucide-react';
import type { Locale } from "@/lib/types";
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { upsertUserData } from '@/lib/firebase';

const translations = {
  en: {
    pageTitle: "Access Your Account",
    pageDescription: "Sign in or create an account with your email and password, or use your phone number to continue.",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    phoneNumberLabel: "Phone Number (Optional with Email)",
    phoneNumberPlaceholder: "+11234567890",
    phoneOnlyLabel: "Or Continue with Phone Number",
    submitButton: "Continue",
    processing: "Processing...",
    loginSuccess: "Login Successful!",
    loginSuccessDesc: "Welcome!",
    signupSuccess: "Account Created!",
    signupSuccessDesc: "Your account has been successfully created.",
    anonymousSuccess: "Proceeding with Phone Number!",
    anonymousSuccessDesc: "You're signed in with your phone number.",
    invalidEmail: "Invalid email address.",
    passwordMinLength: "Password must be at least 6 characters.",
    invalidPhoneNumberShort: "Phone number seems too short.",
    invalidPhoneNumberLong: "Phone number seems too long.",
    provideEmailOrPhone: "Please provide either Email/Password or a Phone Number.",
    passwordRequiredWithEmail: "Password is required if email is provided.",
    genericError: "An error occurred. Please try again.",
    userNotFound: "No account found with this email. Creating a new one...",
    authError: "Authentication Error",
    firestoreError: "Database Error",
    errorSavingData: "Could not save user data. Please try again.",
  },
  ar: {
    pageTitle: "الوصول إلى حسابك",
    pageDescription: "سجل الدخول أو أنشئ حسابًا باستخدام بريدك الإلكتروني وكلمة المرور، أو استخدم رقم هاتفك للمتابعة.",
    emailLabel: "عنوان البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    phoneNumberLabel: "رقم الهاتف (اختياري مع البريد الإلكتروني)",
    phoneNumberPlaceholder: "+11234567890",
    phoneOnlyLabel: "أو المتابعة برقم الهاتف",
    submitButton: "متابعة",
    processing: "جاري المعالجة...",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    loginSuccessDesc: "مرحباً بك!",
    signupSuccess: "تم إنشاء الحساب!",
    signupSuccessDesc: "لقد تم إنشاء حسابك بنجاح.",
    anonymousSuccess: "المتابعة برقم الهاتف!",
    anonymousSuccessDesc: "لقد سجلت الدخول باستخدام رقم هاتفك.",
    invalidEmail: "عنوان بريد إلكتروني غير صالح.",
    passwordMinLength: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
    invalidPhoneNumberShort: "رقم الهاتف يبدو قصيرًا جدًا.",
    invalidPhoneNumberLong: "رقم الهاتف يبدو طويلًا جدًا.",
    provideEmailOrPhone: "يرجى تقديم البريد الإلكتروني/كلمة المرور أو رقم الهاتف.",
    passwordRequiredWithEmail: "كلمة المرور مطلوبة إذا تم تقديم البريد الإلكتروني.",
    genericError: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    userNotFound: "لم يتم العثور على حساب بهذا البريد الإلكتروني. جاري إنشاء حساب جديد...",
    authError: "خطأ في المصادقة",
    firestoreError: "خطأ في قاعدة البيانات",
    errorSavingData: "لم نتمكن من حفظ بيانات المستخدم. يرجى المحاولة مرة أخرى.",
  }
};

const authFormSchema = (t: any) => z.object({
  email: z.string().email({ message: t.invalidEmail }).optional().or(z.literal('')),
  password: z.string().optional().or(z.literal('')), // Min length applied conditionally
  phoneNumber: z.string().optional().or(z.literal('')), // Min/max length applied conditionally
}).refine(data => {
  const hasEmailPassword = !!data.email && !!data.password;
  const hasPhone = !!data.phoneNumber;
  return hasEmailPassword || hasPhone;
}, {
  message: (data) => {
    const currentTranslations = translations[data.locale as Locale || 'en'];
    return currentTranslations.provideEmailOrPhone;
  },
  path: ["email"], // Apply error to a common field or use a global form error display
}).refine(data => {
  if (data.email && !data.password) return false;
  return true;
}, {
  message: (data) => {
    const currentTranslations = translations[data.locale as Locale || 'en'];
    return currentTranslations.passwordRequiredWithEmail;
  },
  path: ["password"],
}).refine(data => {
    if (data.email && data.password && data.password.length < 6) return false;
    return true;
}, {
    message: (data) => {
        const currentTranslations = translations[data.locale as Locale || 'en'];
        return currentTranslations.passwordMinLength;
    },
    path: ["password"],
}).refine(data => {
    if (data.phoneNumber) {
        const phone = data.phoneNumber.replace(/\s+/g, ''); // Remove spaces for validation
        if (phone.length > 0 && (phone.length < 10 || phone.length > 15 || !/^\+?[1-9]\d{1,14}$/.test(phone))) return false;
    }
    return true;
}, {
    message: (data) => {
        const currentTranslations = translations[data.locale as Locale || 'en'];
        return currentTranslations.invalidPhoneNumberShort; // Use a general phone error or pick one
    },
    path: ["phoneNumber"],
});


export default function AuthPage() {
  const routeParams = useParams();
  const locale = routeParams.locale as Locale;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[locale] || translations.en;

  const form = useForm<z.infer<ReturnType<typeof authFormSchema>>>({
    resolver: zodResolver(authFormSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: z.infer<ReturnType<typeof authFormSchema>>) => {
    setIsLoading(true);
    const { email, password, phoneNumber } = values;

    try {
      let userId: string | null = null;
      let userEmail: string | null = email || null;
      let isAnonymousUser = false;

      if (email && password) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          userId = userCredential.user.uid;
          userEmail = userCredential.user.email;
          toast({ title: t.loginSuccess, description: t.loginSuccessDesc });
        } catch (signInError: any) {
          if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
            toast({ title: t.userNotFound });
            const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
            userId = newUserCredential.user.uid;
            userEmail = newUserCredential.user.email;
            toast({ title: t.signupSuccess, description: t.signupSuccessDesc });
          } else {
            throw signInError; // Re-throw other sign-in errors
          }
        }
      } else if (phoneNumber) {
        // If user is already signed in (e.g. with email), sign them out before anonymous sign in
        if (auth.currentUser && !auth.currentUser.isAnonymous) {
            await signOut(auth);
        }
        const userCredential = await signInAnonymously(auth);
        userId = userCredential.user.uid;
        isAnonymousUser = true;
        toast({ title: t.anonymousSuccess, description: t.anonymousSuccessDesc });
      } else {
        // This case should be caught by Zod validation, but as a fallback:
        form.setError("root.formError", { message: t.provideEmailOrPhone });
        setIsLoading(false);
        return;
      }

      if (userId) {
        const userData: { email?: string; phoneNumber?: string; isAnonymous?: boolean } = {};
        if (userEmail) userData.email = userEmail;
        if (phoneNumber) userData.phoneNumber = phoneNumber;
        if (isAnonymousUser) userData.isAnonymous = true;
        
        await upsertUserData(userId, userData);
        router.push(`/${locale}/profile`);
      }

    } catch (error: any) {
      console.error("Authentication/DB error:", error);
      let errorTitle = t.authError;
      let errorMessage = t.genericError;
      if (error.code) { // Firebase error codes
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage = translations[locale as Locale]?.emailInUseError || translations.en.emailInUseError;
                break;
            case 'auth/weak-password':
                errorMessage = translations[locale as Locale]?.weakPasswordError || translations.en.weakPasswordError;
                break;
            case 'auth/invalid-email':
                 errorMessage = translations[locale as Locale]?.invalidEmail || translations.en.invalidEmail;
                break;
            // Add more specific Firebase auth error codes if needed
        }
      } else if (error.message.includes("Firestore")) { // Basic check for Firestore errors
        errorTitle = t.firestoreError;
        errorMessage = t.errorSavingData;
      }
      toast({ variant: "destructive", title: errorTitle, description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <UserCircle className="h-12 w-12 text-accent mx-auto mb-4" />
          <CardTitle className="font-headline text-3xl text-primary">{t.pageTitle}</CardTitle>
          <CardDescription>{t.pageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Mail className="me-2 h-4 w-4 text-muted-foreground" />{t.emailLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.emailPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><KeyRound className="me-2 h-4 w-4 text-muted-foreground" />{t.passwordLabel}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t.passwordPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t.phoneOnlyLabel}
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Phone className="me-2 h-4 w-4 text-muted-foreground" />{form.getValues("email") ? t.phoneNumberLabel : t.phoneOnlyLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.phoneNumberPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {form.formState.errors.root?.formError && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.formError.message}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isLoading ? t.processing : t.submitButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    