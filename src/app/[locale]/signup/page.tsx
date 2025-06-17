
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, KeyRound, UserPlus } from 'lucide-react';
import type { Locale } from "@/lib/types";
import { auth } from '@/lib/firebase'; // Import auth
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";


const translations = {
  en: {
    pageTitle: "Join the Salon",
    pageDescription: "Create your account to book and manage services.",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Minimum 8 characters",
    confirmPasswordLabel: "Confirm Password",
    signUpButton: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    loginLink: "Log In",
    signUpSuccessTitle: "Account Created",
    signUpSuccessDesc: "Welcome! Your account has been successfully created. Redirecting...",
    signUpErrorTitle: "Sign Up Failed",
    passwordsDontMatch: "Passwords do not match.",
    invalidEmail: "Invalid email address.",
    passwordMinLength: "Password must be at least 8 characters.",
    anErrorOccurred: "An error occurred. Please try again.",
    emailInUse: "This email address is already in use."
  },
  ar: {
    pageTitle: "انضم إلى الصالون",
    pageDescription: "أنشئ حسابك لحجز وإدارة الخدمات.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "8 أحرف على الأقل",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    signUpButton: "إنشاء حساب",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول",
    signUpSuccessTitle: "تم إنشاء الحساب",
    signUpSuccessDesc: "مرحباً بك! تم إنشاء حسابك بنجاح. يتم توجيهك...",
    signUpErrorTitle: "فشل إنشاء الحساب",
    passwordsDontMatch: "كلمتا المرور غير متطابقتين.",
    invalidEmail: "بريد إلكتروني غير صالح.",
    passwordMinLength: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    anErrorOccurred: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    emailInUse: "عنوان البريد الإلكتروني هذا مستخدم بالفعل."
  }
};

export default function SignUpPage() {
  const routeParams = useParams();
  const locale = routeParams.locale as Locale;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!locale || (locale !== 'en' && locale !== 'ar')) {
    return <div>Loading page...</div>;
  }

  const t = translations[locale];

  const signUpFormSchema = z.object({
    email: z.string().email(t.invalidEmail),
    password: z.string().min(8, t.passwordMinLength),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t.passwordsDontMatch,
    path: ["confirmPassword"],
  });

  type SignUpFormValues = z.infer<typeof signUpFormSchema>;

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: SignUpFormValues) {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: t.signUpSuccessTitle,
        description: t.signUpSuccessDesc,
      });
      router.push(`/${locale}/profile`);
      // Here you could also create a user document in Firestore
      // e.g., await setDoc(doc(db, "users", userCredential.user.uid), { email: data.email, createdAt: new Date() });
    } catch (error: any) {
      let errorMessage = t.anErrorOccurred;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t.emailInUse;
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t.invalidEmail;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t.passwordMinLength;
      } else {
        // Append the actual Firebase error message for unhandled cases
        errorMessage = `${t.anErrorOccurred} (${error.message || error.code || 'Unknown Firebase error'})`;
      }
      toast({
        variant: "destructive",
        title: t.signUpErrorTitle,
        description: errorMessage,
      });
      console.error("Firebase sign-up error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="h-12 w-12 text-accent mx-auto mb-4" />
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
                    <FormLabel className="flex items-center">
                      <Mail className={`me-2 h-4 w-4 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />
                      {t.emailLabel}
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t.emailPlaceholder} {...field} />
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
                    <FormLabel className="flex items-center">
                      <KeyRound className={`me-2 h-4 w-4 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />
                      {t.passwordLabel}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t.passwordPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <KeyRound className={`me-2 h-4 w-4 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />
                      {t.confirmPasswordLabel}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size={20} /> : <UserPlus className={`me-2 h-5 w-5 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />}
                {t.signUpButton}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center flex-col">
          <p className="text-sm text-muted-foreground">
            {t.alreadyHaveAccount}{' '}
            <Button variant="link" asChild className="text-accent p-0 h-auto">
              <Link href={`/${locale}/login`}>{t.loginLink}</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
