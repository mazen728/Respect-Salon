
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, KeyRound, UserPlus, LogIn, UserCircle } from 'lucide-react';
import type { Locale } from "@/lib/types";
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const translations = {
  en: {
    pageTitle: "Access Your Account",
    pageDescription: "Log in or create an account to manage your appointments and profile.",
    loginTab: "Log In",
    signUpTab: "Sign Up",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    loginButton: "Log In",
    passwordPlaceholderLogin: "••••••••",
    passwordPlaceholderSignUp: "Minimum 8 characters",
    confirmPasswordLabel: "Confirm Password",
    signUpButton: "Create Account",
    loginSuccessTitle: "Login Successful",
    loginSuccessDesc: "Welcome back! Redirecting you...",
    loginErrorTitle: "Login Failed",
    signUpSuccessTitle: "Account Created",
    signUpSuccessDesc: "Welcome! Your account has been successfully created. Redirecting...",
    signUpErrorTitle: "Sign Up Failed",
    passwordsDontMatch: "Passwords do not match.",
    invalidEmail: "Invalid email address.",
    passwordRequired: "Password is required.",
    passwordMinLength: "Password must be at least 8 characters.",
    anErrorOccurred: "An error occurred. Please try again.",
    invalidCredentials: "Invalid email or password.",
    emailInUse: "This email address is already in use."
  },
  ar: {
    pageTitle: "الوصول إلى حسابك",
    pageDescription: "سجل الدخول أو أنشئ حسابًا لإدارة مواعيدك وملفك الشخصي.",
    loginTab: "تسجيل الدخول",
    signUpTab: "إنشاء حساب",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    passwordLabel: "كلمة المرور",
    loginButton: "تسجيل الدخول",
    passwordPlaceholderLogin: "••••••••",
    passwordPlaceholderSignUp: "8 أحرف على الأقل",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    signUpButton: "إنشاء حساب",
    loginSuccessTitle: "تم تسجيل الدخول بنجاح",
    loginSuccessDesc: "مرحباً بعودتك! يتم توجيهك...",
    loginErrorTitle: "فشل تسجيل الدخول",
    signUpSuccessTitle: "تم إنشاء الحساب",
    signUpSuccessDesc: "مرحباً بك! تم إنشاء حسابك بنجاح. يتم توجيهك...",
    signUpErrorTitle: "فشل إنشاء الحساب",
    passwordsDontMatch: "كلمتا المرور غير متطابقتين.",
    invalidEmail: "بريد إلكتروني غير صالح.",
    passwordRequired: "كلمة المرور مطلوبة.",
    passwordMinLength: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    anErrorOccurred: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    emailInUse: "عنوان البريد الإلكتروني هذا مستخدم بالفعل."
  }
};

export default function AuthPage() {
  const routeParams = useParams();
  const locale = routeParams.locale as Locale;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  if (!locale || (locale !== 'en' && locale !== 'ar')) {
    return <div>Loading page...</div>;
  }

  const t = translations[locale];

  const loginFormSchema = z.object({
    email: z.string().email(t.invalidEmail),
    password: z.string().min(1, t.passwordRequired),
  });

  const signUpFormSchema = z.object({
    email: z.string().email(t.invalidEmail),
    password: z.string().min(8, t.passwordMinLength),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t.passwordsDontMatch,
    path: ["confirmPassword"],
  });

  type LoginFormValues = z.infer<typeof loginFormSchema>;
  type SignUpFormValues = z.infer<typeof signUpFormSchema>;

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  async function onLoginSubmit(data: LoginFormValues) {
    setIsLoginLoading(true);
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
         errorMessage = `${t.anErrorOccurred} (${error.message || error.code || 'Unknown Firebase error'})`;
      }
      toast({
        variant: "destructive",
        title: t.loginErrorTitle,
        description: errorMessage,
      });
    } finally {
      setIsLoginLoading(false);
    }
  }

  async function onSignUpSubmit(data: SignUpFormValues) {
    setIsSignUpLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: t.signUpSuccessTitle,
        description: t.signUpSuccessDesc,
      });
      router.push(`/${locale}/profile`);
    } catch (error: any) {
      let errorMessage = t.anErrorOccurred;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t.emailInUse;
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t.invalidEmail;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t.passwordMinLength;
      } else {
        errorMessage = `${t.anErrorOccurred} (${error.message || error.code || 'Unknown Firebase error'})`;
      }
      toast({
        variant: "destructive",
        title: t.signUpErrorTitle,
        description: errorMessage,
      });
    } finally {
      setIsSignUpLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <UserCircle className="h-12 w-12 text-accent mx-auto mb-4" />
          <CardTitle className="font-headline text-3xl text-primary">{t.pageTitle}</CardTitle>
          <CardDescription>{t.pageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t.loginTab}</TabsTrigger>
              <TabsTrigger value="signup">{t.signUpTab}</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
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
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <KeyRound className={`me-2 h-4 w-4 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />
                          {t.passwordLabel}
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t.passwordPlaceholderLogin} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoginLoading}>
                    {isLoginLoading ? <LoadingSpinner size={20} /> : <LogIn className={`me-2 h-5 w-5 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />}
                    {t.loginButton}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="signup" className="pt-6">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-6">
                  <FormField
                    control={signUpForm.control}
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
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <KeyRound className={`me-2 h-4 w-4 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />
                          {t.passwordLabel}
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t.passwordPlaceholderSignUp} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
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
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSignUpLoading}>
                    {isSignUpLoading ? <LoadingSpinner size={20} /> : <UserPlus className={`me-2 h-5 w-5 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />}
                    {t.signUpButton}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        {/* CardFooter can be removed or used for other links if needed in the future */}
      </Card>
    </div>
  );
}

    