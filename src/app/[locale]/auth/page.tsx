
"use client";

import type { Locale } from "@/lib/types";
import { useRouter, useParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auth, upsertUserData } from '@/lib/firebase';
import { createUserWithEmailAndPassword, type AuthError } from 'firebase/auth';

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
import { useToast } from "@/hooks/use-toast";
import { UserCircle, UserPlus, Image as ImageIcon, Phone, AtSign, Lock, ShieldCheck, CalendarDays } from 'lucide-react';

const translations = {
  en: {
    pageTitle: "Create Your Account",
    pageDescription: "Join us by creating a new account to manage your appointments and preferences.",
    createAccountCardTitle: "Enter Your Details",
    email: "Email Address",
    emailPlaceholder: "name@example.com",
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
    createAccountSuccess: "Account Created Successfully",
    createAccountSuccessDesc: "Your account is ready. Redirecting you to your profile...",
    passwordsDontMatch: "Passwords do not match.",
    genericError: "An unexpected error occurred. Please try again.",
    authError: "Authentication Error",
    emailInUse: "This email is already in use. Please use a different email.",
    weakPassword: "Password is too weak. It should be at least 6 characters.",
    invalidEmail: "Invalid email address format.",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name must be at most 50 characters.",
    ageMin: "Age must be a positive number.",
    ageMax: "Age seems too high.",
    phoneInvalidPrefixOrLength: "Phone number must be 11 digits and start with 010, 011, 012, or 015.",
    phoneRequired: "Phone number is required.",
    configurationNotFound: "Firebase auth configuration not found. Please ensure sign-in methods are enabled in Firebase console.",
    firestoreError: "Database Error",
    firestorePermissionsError: "Could not save your profile information due to database permission issues. This is a server-side configuration problem. Please check your Firestore security rules.",
  },
  ar: {
    pageTitle: "أنشئ حسابك",
    pageDescription: "انضم إلينا عن طريق إنشاء حساب جديد لإدارة مواعيدك وتفضيلاتك.",
    createAccountCardTitle: "أدخل بياناتك",
    email: "البريد الإلكتروني",
    emailPlaceholder: "name@example.com",
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
    createAccountSuccess: "تم إنشاء الحساب بنجاح",
    createAccountSuccessDesc: "حسابك جاهز. يتم توجيهك إلى ملفك الشخصي...",
    passwordsDontMatch: "كلمتا المرور غير متطابقتين.",
    genericError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    authError: "خطأ في المصادقة",
    emailInUse: "هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر.",
    weakPassword: "كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.",
    invalidEmail: "صيغة البريد الإلكتروني غير صالحة.",
    nameMin: "يجب أن يتكون الاسم من حرفين على الأقل.",
    nameMax: "يجب ألا يتجاوز الاسم 50 حرفًا.",
    ageMin: "يجب أن يكون العمر رقمًا موجبًا.",
    ageMax: "العمر يبدو كبيرًا جدًا.",
    phoneInvalidPrefixOrLength: "يجب أن يتكون رقم الهاتف من 11 رقمًا وأن يبدأ بـ 010 أو 011 أو 012 أو 015.",
    phoneRequired: "رقم الهاتف مطلوب.",
    configurationNotFound: "لم يتم العثور على تكوين المصادقة في Firebase. يرجى التأكد من تفعيل أساليب تسجيل الدخول في لوحة تحكم Firebase.",
    firestoreError: "خطأ في قاعدة البيانات",
    firestorePermissionsError: "تعذر حفظ معلومات ملفك الشخصي بسبب مشكلات في أذونات قاعدة البيانات. هذه مشكلة في إعدادات الخادم. يرجى التحقق من قواعد الأمان في Firestore.",
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

  const handleAuthError = (error: AuthError | Error) => {
    console.error("Auth or Firestore Error:", error);
    let title = t.authError;
    let description = t.genericError;

    if ('code' in error && typeof (error as AuthError).code === 'string') { 
      const authError = error as AuthError;
      title = t.authError; 
      switch (authError.code) {
        case 'auth/email-already-in-use':
          description = t.emailInUse;
          createAccountForm.setError("email", { type: "manual", message: t.emailInUse });
          break;
        case 'auth/invalid-email':
          description = t.invalidEmail;
          createAccountForm.setError("email", { type: "manual", message: t.invalidEmail });
          break;
        case 'auth/weak-password':
          description = t.weakPassword;
          createAccountForm.setError("password", { type: "manual", message: t.weakPassword });
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
  };

  async function onCreateAccountSubmit(values: CreateAccountFormValues) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      await upsertUserData(user.uid, {
        email: user.email,
        name: values.name,
        imageUrl: values.imageUrl || null,
        age: values.age !== undefined ? Number(values.age) : null,
        phoneNumber: values.phone,
        isAnonymous: false, 
      });
      toast({ title: t.createAccountSuccess, description: t.createAccountSuccessDesc });
      router.push(`/${locale}/profile`); // Redirect to profile page
    } catch (error) {
      handleAuthError(error as AuthError | Error);
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 flex flex-col items-center">
      <UserPlus className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-3xl font-bold mb-2 text-center font-headline">{t.pageTitle}</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">{t.pageDescription}</p>

      <Card className="w-full max-w-md">
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
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6" disabled={createAccountForm.formState.isSubmitting}>
                 {createAccountForm.formState.isSubmitting ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <UserPlus className="me-2 h-4 w-4" />
                  )}
                  {t.createAccountButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    