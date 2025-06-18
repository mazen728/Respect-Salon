
"use client";

import type { Locale } from "@/lib/types";
import { useRouter, useParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth, upsertUserData } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type AuthError, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, UserPlus, LogIn, Image as ImageIcon, Phone, Lock, ShieldCheck, CalendarDays } from 'lucide-react';
import { LoadingSpinner } from "@/components/LoadingSpinner";

const translations = {
  en: {
    pageTitle: "Account Access",
    pageDescription: "Create a new account or log in to manage your appointments and preferences.",
    createAccountTab: "Create Account",
    loginTab: "Login",
    createAccountCardTitle: "Enter Your Details",
    loginCardTitle: "Welcome Back",
    loginCardDescription: "Enter your credentials to access your account.",
    // email: "Email Address",
    // emailPlaceholder: "name@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    name: "Full Name",
    namePlaceholder: "e.g., John Doe",
    imageUrl: "Image URL (Optional)",
    imageUrlPlaceholder: "https://example.com/your-image.png",
    imageUrlDesc: "Link to your profile picture.",
    age: "Age (Optional)",
    agePlaceholder: "e.g., 30",
    phone: "Phone Number",
    phonePlaceholder: "01xxxxxxxxx",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "••••••••",
    createAccountButton: "Create Account",
    loginButton: "Login",
    createAccountSuccess: "Account Created Successfully",
    createAccountSuccessDesc: "Your account is ready. Redirecting you to your profile...",
    loginSuccess: "Logged In Successfully",
    loginSuccessDesc: "Welcome back! Redirecting you...",
    passwordsDontMatch: "Passwords do not match.",
    genericError: "An unexpected error occurred. Please try again.",
    authError: "Authentication Error",
    loginError: "Login Error",
    // emailInUse: "This email is already in use. Please use a different email or log in.",
    phoneInUseError: "This phone number seems to be associated with an existing account. Please try logging in.",
    weakPassword: "Password is too weak. It should be at least 6 characters.",
    // invalidEmail: "Invalid email address format.",
    userNotFound: "No user found with this phone number. Please check your number or create an account.",
    wrongPassword: "Incorrect password. Please try again.",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name must be at most 50 characters.",
    ageMin: "Age must be a positive number.",
    ageMax: "Age seems too high.",
    phoneInvalidPrefixOrLength: "Phone number must be 11 digits and start with 010, 011, 012, or 015.",
    phoneRequired: "Phone number is required.",
    configurationNotFound: "Firebase auth configuration not found. Please ensure sign-in methods are enabled in Firebase console.",
    firestoreError: "Database Error",
    firestorePermissionsError: "Could not save your profile information due to database permission issues. This is a server-side configuration problem. Please check your Firestore security rules.",
    checkingAuth: "Checking authentication status...",
    alreadyLoggedIn: "You are already logged in. Redirecting to profile...",
  },
  ar: {
    pageTitle: "الوصول إلى الحساب",
    pageDescription: "أنشئ حسابًا جديدًا أو سجل الدخول لإدارة مواعيدك وتفضيلاتك.",
    createAccountTab: "إنشاء حساب",
    loginTab: "تسجيل الدخول",
    createAccountCardTitle: "أدخل بياناتك",
    loginCardTitle: "أهلاً بعودتك",
    loginCardDescription: "أدخل بيانات اعتمادك للوصول إلى حسابك.",
    // email: "البريد الإلكتروني",
    // emailPlaceholder: "name@example.com",
    password: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    name: "الاسم الكامل",
    namePlaceholder: "مثال: جون دو",
    imageUrl: "رابط الصورة (اختياري)",
    imageUrlPlaceholder: "https://example.com/your-image.png",
    imageUrlDesc: "رابط لصورة ملفك الشخصي.",
    age: "العمر (اختياري)",
    agePlaceholder: "مثال: 30",
    phone: "رقم الهاتف",
    phonePlaceholder: "01xxxxxxxxx",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "••••••••",
    createAccountButton: "إنشاء حساب",
    loginButton: "تسجيل الدخول",
    createAccountSuccess: "تم إنشاء الحساب بنجاح",
    createAccountSuccessDesc: "حسابك جاهز. يتم توجيهك إلى ملفك الشخصي...",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    loginSuccessDesc: "أهلاً بعودتك! يتم توجيهك...",
    passwordsDontMatch: "كلمتا المرور غير متطابقتين.",
    genericError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    authError: "خطأ في المصادقة",
    loginError: "خطأ في تسجيل الدخول",
    // emailInUse: "هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.",
    phoneInUseError: "يبدو أن رقم الهاتف هذا مرتبط بحساب موجود. يرجى محاولة تسجيل الدخول.",
    weakPassword: "كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.",
    // invalidEmail: "صيغة البريد الإلكتروني غير صالحة.",
    userNotFound: "لم يتم العثور على مستخدم برقم الهاتف هذا. يرجى التحقق من رقمك أو إنشاء حساب.",
    wrongPassword: "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
    nameMin: "يجب أن يتكون الاسم من حرفين على الأقل.",
    nameMax: "يجب ألا يتجاوز الاسم 50 حرفًا.",
    ageMin: "يجب أن يكون العمر رقمًا موجبًا.",
    ageMax: "العمر يبدو كبيرًا جدًا.",
    phoneInvalidPrefixOrLength: "يجب أن يتكون رقم الهاتف من 11 رقمًا وأن يبدأ بـ 010 أو 011 أو 012 أو 015.",
    phoneRequired: "رقم الهاتف مطلوب.",
    configurationNotFound: "لم يتم العثور على تكوين المصادقة في Firebase. يرجى التأكد من تفعيل أساليب تسجيل الدخول في لوحة تحكم Firebase.",
    firestoreError: "خطأ في قاعدة البيانات",
    firestorePermissionsError: "تعذر حفظ معلومات ملفك الشخصي بسبب مشكلات في أذونات قاعدة البيانات. هذه مشكلة في إعدادات الخادم. يرجى التحقق من قواعد الأمان في Firestore.",
    checkingAuth: "جارٍ التحقق من حالة المصادقة...",
    alreadyLoggedIn: "أنت مسجل الدخول بالفعل. يتم توجيهك إلى الملف الشخصي...",
  },
};

// Helper to generate a dummy email from phone number
const generateDummyEmailFromPhone = (phone: string) => {
  const sanitizedPhone = phone.startsWith('+') ? phone.substring(1) : phone; // Remove '+' if present
  return `user-${sanitizedPhone.replace(/\D/g, '')}@auth.local`;
};


export default function AuthPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;
  const { toast } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        toast({ title: t.alreadyLoggedIn });
        router.push(`/${locale}/profile`);
      } else {
        setIsCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, locale]); // t was removed as it's defined later


  const t = translations[locale] || translations.en;

  const createAccountFormSchema = z.object({
    name: z.string().min(2, { message: t.nameMin }).max(50, { message: t.nameMax }),
    imageUrl: z.string().url({ message: t.imageUrlDesc }).optional().or(z.literal('')),
    age: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number().positive({ message: t.ageMin }).max(120, { message: t.ageMax }).optional()
    ),
    phone: z.string()
      .min(1, { message: t.phoneRequired })
      .regex(/^(010|011|012|015)\d{8}$/, { message: t.phoneInvalidPrefixOrLength }),
    // email: z.string().email({ message: t.invalidEmail }), // Removed email
    password: z.string().min(6, { message: t.weakPassword }),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: t.passwordsDontMatch,
    path: ["confirmPassword"],
  });
  type CreateAccountFormValues = z.infer<typeof createAccountFormSchema>;

  const loginFormSchema = z.object({
    // email: z.string().email({ message: t.invalidEmail }), // Removed email
    phone: z.string().min(1, {message: t.phoneRequired}),
    password: z.string().min(1, { message: t.passwordPlaceholder }),
  });
  type LoginFormValues = z.infer<typeof loginFormSchema>;

  const createAccountForm = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      age: undefined,
      phone: "",
      // email: "", // Removed email
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      // email: "", // Removed email
      phone: "",
      password: "",
    },
  });

  const handleAuthError = (error: AuthError | Error, formType: 'create' | 'login') => {
    console.error(`${formType} Error:`, error);
    let title = formType === 'create' ? t.authError : t.loginError;
    let description = t.genericError;

    if ('code' in error && typeof (error as AuthError).code === 'string') {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/email-already-in-use': // This code might still appear if the generated dummy email collides
          description = t.phoneInUseError; // Changed to a phone-specific message
          if (formType === 'create') createAccountForm.setError("phone", { type: "manual", message: description });
          break;
        // case 'auth/invalid-email': // Less likely with generated emails, but keep for safety
        //   description = t.invalidEmail;
        //   if (formType === 'create') createAccountForm.setError("phone", { type: "manual", message: "Internal error: Invalid format for generated email." });
        //   if (formType === 'login') loginForm.setError("phone", { type: "manual", message: "Internal error: Invalid format for generated email." });
        //   break;
        case 'auth/weak-password':
          description = t.weakPassword;
          if (formType === 'create') createAccountForm.setError("password", { type: "manual", message: t.weakPassword });
          break;
        case 'auth/user-not-found':
          description = t.userNotFound;
          if (formType === 'login') loginForm.setError("phone", { type: "manual", message: t.userNotFound });
          break;
        case 'auth/wrong-password':
          description = t.wrongPassword;
          if (formType === 'login') loginForm.setError("password", { type: "manual", message: t.wrongPassword });
          break;
        case 'auth/configuration-not-found':
           description = t.configurationNotFound;
           break;
        default:
          if (authError.message) {
            description = authError.message;
          }
      }
    } else if (error.message && (error.message.includes('Firestore: Missing or insufficient permissions') || error.message.includes('permission-denied'))) {
      title = t.firestoreError;
      description = t.firestorePermissionsError;
    } else if (error.message) {
        description = error.message;
    }

    toast({ variant: "destructive", title, description });
    if (formType === 'create') createAccountForm.formState.isSubmitting = false;
    if (formType === 'login') loginForm.formState.isSubmitting = false;
  };

  async function onCreateAccountSubmit(values: CreateAccountFormValues) {
    createAccountForm.formState.isSubmitting = true;
    try {
      const dummyEmail = generateDummyEmailFromPhone(values.phone);
      const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, values.password);
      const user = userCredential.user;
      await upsertUserData(user.uid, {
        email: dummyEmail, // Store the dummy email
        name: values.name,
        imageUrl: values.imageUrl || null,
        age: values.age !== undefined ? Number(values.age) : null,
        phoneNumber: values.phone,
        isAnonymous: false,
      });
      toast({ title: t.createAccountSuccess, description: t.createAccountSuccessDesc });
      // Redirection is handled by onAuthStateChanged
    } catch (error) {
      handleAuthError(error as AuthError | Error, 'create');
    } finally {
        if (createAccountForm && createAccountForm.formState.isSubmitting) {
             createAccountForm.formState.isSubmitting = false;
        }
    }
  }

  async function onLoginSubmit(values: LoginFormValues) {
    loginForm.formState.isSubmitting = true;
    try {
      const dummyEmail = generateDummyEmailFromPhone(values.phone);
      const userCredential = await signInWithEmailAndPassword(auth, dummyEmail, values.password);
      // upsertUserData will update lastLoginAt and ensure email is consistent
      await upsertUserData(userCredential.user.uid, { email: dummyEmail, phoneNumber: values.phone }); // Pass phone number to ensure it's in DB if login is first interaction post-migration
      toast({ title: t.loginSuccess, description: t.loginSuccessDesc });
      // Redirection is handled by onAuthStateChanged
    } catch (error) {
      handleAuthError(error as AuthError | Error, 'login');
    } finally {
        if (loginForm && loginForm.formState.isSubmitting) {
            loginForm.formState.isSubmitting = false;
        }
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

      <Tabs defaultValue="create-account" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create-account" className="py-3">
            <UserPlus className="me-2 h-5 w-5" /> {t.createAccountTab}
          </TabsTrigger>
          <TabsTrigger value="login" className="py-3">
            <LogIn className="me-2 h-5 w-5" /> {t.loginTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create-account">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t.createAccountCardTitle}</CardTitle>
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
                        <FormLabel className="flex items-center"><CalendarDays className="me-2 h-4 w-4 text-muted-foreground" />{t.age}</FormLabel>
                        <FormControl>
                           <Input type="number" placeholder={t.agePlaceholder} {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} />
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
                  {/* Email field removed from create account form */}
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
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6" disabled={createAccountForm.formState.isSubmitting}>
                    {createAccountForm.formState.isSubmitting ? <LoadingSpinner className="me-2" /> : <UserPlus className="me-2 h-4 w-4" />}
                    {t.createAccountButton}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t.loginCardTitle}</CardTitle>
              <CardDescription>{t.loginCardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="phone" // Changed from email to phone
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
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6" disabled={loginForm.formState.isSubmitting}>
                    {loginForm.formState.isSubmitting ? <LoadingSpinner className="me-2" /> : <LogIn className="me-2 h-4 w-4" />}
                    {t.loginButton}
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
