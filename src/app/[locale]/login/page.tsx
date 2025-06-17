
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
import { Mail, KeyRound, LogIn } from 'lucide-react';
import type { Locale } from "@/lib/types";
import { auth } from '@/lib/firebase'; // Import auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";


const translations = {
  en: {
    pageTitle: "Royal Welcome Back",
    pageDescription: "Log in to manage your appointments and profile.",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    loginButton: "Log In",
    dontHaveAccount: "Don't have an account?",
    signUpLink: "Sign Up",
    loginSuccessTitle: "Login Successful",
    loginSuccessDesc: "Welcome back! Redirecting you...",
    loginErrorTitle: "Login Failed",
    invalidEmail: "Invalid email address.",
    passwordRequired: "Password is required.",
    anErrorOccurred: "An error occurred. Please try again.",
    invalidCredentials: "Invalid email or password." // New translation
  },
  ar: {
    pageTitle: "عودة ملكية",
    pageDescription: "سجل الدخول لإدارة مواعيدك وملفك الشخصي.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    passwordLabel: "كلمة المرور",
    loginButton: "تسجيل الدخول",
    dontHaveAccount: "ليس لديك حساب؟",
    signUpLink: "إنشاء حساب",
    loginSuccessTitle: "تم تسجيل الدخول بنجاح",
    loginSuccessDesc: "مرحباً بعودتك! يتم توجيهك...",
    loginErrorTitle: "فشل تسجيل الدخول",
    invalidEmail: "بريد إلكتروني غير صالح.",
    passwordRequired: "كلمة المرور مطلوبة.",
    anErrorOccurred: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة." // New translation
  }
};

export default function LoginPage() {
  const routeParams = useParams();
  const locale = routeParams.locale as Locale;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!locale || (locale !== 'en' && locale !== 'ar')) {
    return <div>Loading page...</div>;
  }

  const t = translations[locale];

  const loginFormSchema = z.object({
    email: z.string().email(t.invalidEmail),
    password: z.string().min(1, t.passwordRequired),
  });

  type LoginFormValues = z.infer<typeof loginFormSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: t.loginSuccessTitle,
        description: t.loginSuccessDesc,
      });
      router.push(`/${locale}/profile`);
    } catch (error: any) {
      let errorMessage = t.anErrorOccurred;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = t.invalidCredentials;
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t.invalidEmail;
      } else {
        // Append the actual Firebase error message for unhandled cases
        errorMessage = `${t.anErrorOccurred} (${error.message || error.code || 'Unknown Firebase error'})`;
      }
      toast({
        variant: "destructive",
        title: t.loginErrorTitle,
        description: errorMessage,
      });
      console.error("Firebase login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="h-12 w-12 text-accent mx-auto mb-4" />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size={20} /> : <LogIn className={`me-2 h-5 w-5 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />}
                {t.loginButton}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center flex-col">
          <p className="text-sm text-muted-foreground">
            {t.dontHaveAccount}{' '}
            <Button variant="link" asChild className="text-accent p-0 h-auto">
              <Link href={`/${locale}/signup`}>{t.signUpLink}</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
