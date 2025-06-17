
"use client";

import type { Locale } from "@/lib/types";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth, upsertUserData } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type AuthError } from 'firebase/auth';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, LogIn, UserPlus, Image as ImageIcon, Phone, AtSign, Lock, ShieldCheck, CalendarIcon } from 'lucide-react';

const translations = {
  en: {
    pageTitle: "Account Access",
    pageDescription: "Log in to your existing account or create a new one.",
    loginTab: "Login",
    createAccountTab: "Create Account",
    email: "Email Address",
    emailPlaceholder: "name@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    loginButton: "Login",
    loginSuccess: "Login Successful",
    loginSuccessDesc: "Welcome back! Redirecting you now...",
    name: "Full Name",
    namePlaceholder: "e.g., John Doe",
    imageUrl: "Image URL (Optional)",
    imageUrlPlaceholder: "https://example.com/your-image.png",
    imageUrlDesc: "Link to your profile picture.",
    age: "Age (Optional)",
    agePlaceholder: "e.g., 30",
    phone: "Phone Number (Optional)",
    phonePlaceholder: "+1234567890",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "••••••••",
    createAccountButton: "Create Account",
    createAccountSuccess: "Account Created Successfully",
    createAccountSuccessDesc: "Your account is ready. Redirecting you now...",
    passwordsDontMatch: "Passwords do not match.",
    genericError: "An unexpected error occurred. Please try again.",
    authError: "Authentication Error",
    emailInUse: "This email is already in use. Please try logging in or use a different email.",
    weakPassword: "Password is too weak. It should be at least 6 characters.",
    invalidEmail: "Invalid email address format.",
    userNotFound: "No account found with this email. Please check your email or create an account.",
    wrongPassword: "Incorrect password. Please try again.",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name must be at most 50 characters.",
    ageMin: "Age must be a positive number.",
    ageMax: "Age seems too high.",
    phoneInvalid: "Invalid phone number format.",
  },
  ar: {
    pageTitle: "الوصول إلى الحساب",
    pageDescription: "سجل الدخول إلى حسابك الحالي أو قم بإنشاء حساب جديد.",
    loginTab: "تسجيل الدخول",
    createAccountTab: "إنشاء حساب",
    email: "البريد الإلكتروني",
    emailPlaceholder: "name@example.com",
    password: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    loginButton: "تسجيل الدخول",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    loginSuccessDesc: "مرحباً بعودتك! يتم توجيهك الآن...",
    name: "الاسم الكامل",
    namePlaceholder: "مثال: جون دو",
    imageUrl: "رابط الصورة (اختياري)",
    imageUrlPlaceholder: "https://example.com/your-image.png",
    imageUrlDesc: "رابط لصورة ملفك الشخصي.",
    age: "العمر (اختياري)",
    agePlaceholder: "مثال: 30",
    phone: "رقم الهاتف (اختياري)",
    phonePlaceholder: "+1234567890",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "••••••••",
    createAccountButton: "إنشاء حساب",
    createAccountSuccess: "تم إنشاء الحساب بنجاح",
    createAccountSuccessDesc: "حسابك جاهز. يتم توجيهك الآن...",
    passwordsDontMatch: "كلمتا المرور غير متطابقتين.",
    genericError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    authError: "خطأ في المصادقة",
    emailInUse: "هذا البريد الإلكتروني مستخدم بالفعل. يرجى محاولة تسجيل الدخول أو استخدام بريد إلكتروني آخر.",
    weakPassword: "كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.",
    invalidEmail: "صيغة البريد الإلكتروني غير صالحة.",
    userNotFound: "لم يتم العثور على حساب بهذا البريد الإلكتروني. يرجى التحقق من بريدك الإلكتروني أو إنشاء حساب.",
    wrongPassword: "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
    nameMin: "يجب أن يتكون الاسم من حرفين على الأقل.",
    nameMax: "يجب ألا يتجاوز الاسم 50 حرفًا.",
    ageMin: "يجب أن يكون العمر رقمًا موجبًا.",
    ageMax: "العمر يبدو كبيرًا جدًا.",
    phoneInvalid: "صيغة رقم الهاتف غير صالحة.",
  },
};

export default function AuthPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;
  const { toast } = useToast();

  if (!locale || (locale !== 'en' && locale !== 'ar')) {
    return <div>Loading page translations...</div>;
  }
  const t = translations[locale];

  // Login Form Schema
  const loginFormSchema = z.object({
    email: z.string().email({ message: t.invalidEmail }),
    password: z.string().min(1, { message: t.passwordPlaceholder }), // Basic check, Firebase handles complexity
  });
  type LoginFormValues = z.infer<typeof loginFormSchema>;

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  // Create Account Form Schema
  const createAccountFormSchema = z.object({
    name: z.string().min(2, { message: t.nameMin }).max(50, { message: t.nameMax }),
    imageUrl: z.string().url({ message: t.imageUrlPlaceholder }).optional().or(z.literal('')),
    age: z.coerce.number().positive({ message: t.ageMin }).max(120, { message: t.ageMax }).optional().or(z.literal(0)).or(z.literal('')),
    phone: z.string().optional().or(z.literal('')), // Add more specific phone validation if needed e.g. .regex(/^\+[1-9]\d{1,14}$/
    email: z.string().email({ message: t.invalidEmail }),
    password: z.string().min(6, { message: t.weakPassword }),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t.passwordsDontMatch,
    path: ["confirmPassword"],
  });
  type CreateAccountFormValues = z.infer<typeof createAccountFormSchema>;

  const createAccountForm = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      age: undefined,
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });


  const handleAuthError = (error: AuthError) => {
    console.error("Firebase Auth Error:", error.code, error.message);
    let title = t.authError;
    let description = t.genericError;
    switch (error.code) {
      case 'auth/email-already-in-use':
        description = t.emailInUse;
        break;
      case 'auth/invalid-email':
        description = t.invalidEmail;
        break;
      case 'auth/weak-password':
        description = t.weakPassword;
        break;
      case 'auth/user-not-found':
        description = t.userNotFound;
        break;
      case 'auth/wrong-password':
        description = t.wrongPassword;
        break;
      case 'auth/configuration-not-found':
         description = "Firebase auth configuration not found. Please ensure sign-in methods are enabled in Firebase console.";
         break;
    }
    toast({ variant: "destructive", title, description });
  };

  async function onLoginSubmit(values: LoginFormValues) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await upsertUserData(userCredential.user.uid, { email: userCredential.user.email });
      toast({ title: t.loginSuccess, description: t.loginSuccessDesc });
      router.push(`/${locale}/profile`);
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  }

  async function onCreateAccountSubmit(values: CreateAccountFormValues) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      await upsertUserData(user.uid, {
        email: user.email,
        name: values.name,
        imageUrl: values.imageUrl || null,
        age: values.age ? Number(values.age) : null,
        phoneNumber: values.phone || null,
        isAnonymous: false,
      });
      toast({ title: t.createAccountSuccess, description: t.createAccountSuccessDesc });
      router.push(`/${locale}/profile`);
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  }


  return (
    <div className="container mx-auto py-12 px-4 flex flex-col items-center">
      <UserCircle className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-3xl font-bold mb-2 text-center font-headline">{t.pageTitle}</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">{t.pageDescription}</p>

      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login"><LogIn className="me-2 h-4 w-4" />{t.loginTab}</TabsTrigger>
          <TabsTrigger value="create-account"><UserPlus className="me-2 h-4 w-4" />{t.createAccountTab}</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t.loginTab}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><AtSign className="me-2 h-4 w-4 text-muted-foreground" />{t.email}</FormLabel>
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
                        <FormLabel className="flex items-center"><Lock className="me-2 h-4 w-4 text-muted-foreground" />{t.password}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t.passwordPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    <LogIn className="me-2 h-4 w-4" /> {t.loginButton}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-account">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t.createAccountTab}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...createAccountForm}>
                <form onSubmit={createAccountForm.handleSubmit(onCreateAccountSubmit)} className="space-y-4">
                  <FormField
                    control={createAccountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><UserCircle className="me-2 h-4 w-4 text-muted-foreground" />{t.name}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.namePlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><ImageIcon className="me-2 h-4 w-4 text-muted-foreground" />{t.imageUrl}</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder={t.imageUrlPlaceholder} {...field} />
                        </FormControl>
                        <FormDescription>{t.imageUrlDesc}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><CalendarIcon className="me-2 h-4 w-4 text-muted-foreground" />{t.age}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t.agePlaceholder} {...field} onChange={event => field.onChange(+event.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={createAccountForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Phone className="me-2 h-4 w-4 text-muted-foreground" />{t.phone}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={t.phonePlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><AtSign className="me-2 h-4 w-4 text-muted-foreground" />{t.email}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t.emailPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Lock className="me-2 h-4 w-4 text-muted-foreground" />{t.password}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t.passwordPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><ShieldCheck className="me-2 h-4 w-4 text-muted-foreground" />{t.confirmPassword}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t.confirmPasswordPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6">
                     <UserPlus className="me-2 h-4 w-4" /> {t.createAccountButton}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

