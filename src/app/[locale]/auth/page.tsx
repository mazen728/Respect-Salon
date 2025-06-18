
"use client";

import type { Locale } from "@/lib/types";
import { useRouter, useParams } from 'next/navigation';
import { 
  auth, 
  upsertUserData, 
  createUserWithEmailAndPasswordAuth, 
  signInWithEmailAndPasswordAuth,
  findUserByPhoneNumber,
  sendPasswordResetEmail
} from '@/lib/firebase';
import { type AuthError, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { salonInfo as getSalonInfo } from '@/lib/mockData';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, ShieldCheck, Eye, EyeOff, UserPlus, LogIn, Phone, Mail, Cake, KeyRound } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';


const translations = {
  en: {
    createAccountTitle: "Create Your Royal Account",
    createAccountDesc: "Join us to manage your appointments and preferences.",
    loginTitle: "Welcome Back, Sire",
    loginDesc: "Access your existing account to continue your regal journey.",
    name: "Full Name",
    namePlaceholder: "e.g., John Doe",
    phoneNumber: "Phone Number",
    phonePlaceholder: "01xxxxxxxxx",
    password: "Password",
    passwordPlaceholder: "••••••••",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "••••••••",
    age: "Age (Optional)",
    agePlaceholder: "e.g., 30",
    createAccountButton: "Create Account",
    loginButton: "Login",
    forgotPasswordLink: "Forgot Password?",
    forgotPasswordTitle: "Forgot Your Password?",
    forgotPasswordDesc: "Enter your phone number. We'll help you find your account to reset your password.",
    sendResetInstructions: "Send Reset Instructions",
    cancel: "Cancel",
    passwordResetSent: "Password Reset Initiated",
    passwordResetSentDesc: "If an account exists for this phone number, instructions have been notionally sent (check Firebase console for actual reset steps via dummy email).",
    passwordResetError: "Could not initiate password reset. Please check the phone number or contact support.",
    userNotFound: "User Not Found",
    userNotFoundDesc: "No account found with this phone number.",
    loginSuccess: "Logged In Successfully",
    loginSuccessDesc: "Welcome back! Redirecting you...",
    createAccountSuccess: "Account Created Successfully",
    createAccountSuccessDesc: "Welcome! Redirecting you...",
    genericError: "An unexpected error occurred. Please try again.",
    authError: "Authentication Error",
    checkingAuth: "Checking authentication status...",
    alreadyLoggedIn: "You are already logged in. Redirecting to profile...",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name must be at most 50 characters.",
    phoneInvalidPrefixOrLength: "Phone number must be 11 digits and start with 010, 011, 012, or 015.",
    phoneRequired: "Phone number is required.",
    passwordMin: "Password must be at least 6 characters.",
    passwordMax: "Password must be at most 100 characters.",
    confirmPasswordMatch: "Passwords do not match.",
    ageMin: "Age must be a positive number.",
    ageMax: "Age seems too high.",
    technicalSupport: "Technical Support",
    contactSupportMessage: "If you forgot your password, please contact ",
    
  },
  ar: {
    createAccountTitle: "أنشئ حسابك الملكي",
    createAccountDesc: "انضم إلينا لإدارة مواعيدك وتفضيلاتك.",
    loginTitle: "أهلاً بعودتك، يا سيدي",
    loginDesc: "قم بالوصول إلى حسابك الحالي لمواصلة رحلتك الملكية.",
    name: "الاسم الكامل",
    namePlaceholder: "مثال: جون دو",
    phoneNumber: "رقم الهاتف",
    phonePlaceholder: "01xxxxxxxxx",
    password: "كلمة المرور",
    passwordPlaceholder: "••••••••",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "••••••••",
    age: "العمر (اختياري)",
    agePlaceholder: "مثال: 30",
    createAccountButton: "إنشاء حساب",
    loginButton: "تسجيل الدخول",
    forgotPasswordLink: "هل نسيت كلمة المرور؟",
    forgotPasswordTitle: "هل نسيت كلمة مرورك؟",
    forgotPasswordDesc: "أدخل رقم هاتفك. سنساعدك في العثور على حسابك لإعادة تعيين كلمة المرور.",
    sendResetInstructions: "إرسال تعليمات إعادة التعيين",
    cancel: "إلغاء",
    passwordResetSent: "بدء إعادة تعيين كلمة المرور",
    passwordResetSentDesc: "إذا كان هناك حساب لهذا الرقم، فقد تم إرسال التعليمات افتراضيًا (راجع وحدة تحكم Firebase لمعرفة خطوات إعادة التعيين الفعلية عبر البريد الإلكتروني الوهمي).",
    passwordResetError: "تعذر بدء إعادة تعيين كلمة المرور. يرجى التحقق من رقم الهاتف أو الاتصال بالدعم.",
    userNotFound: "المستخدم غير موجود",
    userNotFoundDesc: "لم يتم العثور على حساب بهذا الرقم.",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    loginSuccessDesc: "أهلاً بعودتك! يتم توجيهك...",
    createAccountSuccess: "تم إنشاء الحساب بنجاح",
    createAccountSuccessDesc: "أهلاً بك! يتم توجيهك...",
    genericError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    authError: "خطأ في المصادقة",
    checkingAuth: "جارٍ التحقق من حالة المصادقة...",
    alreadyLoggedIn: "أنت مسجل الدخول بالفعل. يتم توجيهك إلى الملف الشخصي...",
    nameMin: "يجب أن يتكون الاسم من حرفين على الأقل.",
    nameMax: "يجب ألا يتجاوز الاسم 50 حرفًا.",
    phoneInvalidPrefixOrLength: "يجب أن يتكون رقم الهاتف من 11 رقمًا وأن يبدأ بـ 010 أو 011 أو 012 أو 015.",
    phoneRequired: "رقم الهاتف مطلوب.",
    passwordMin: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
    passwordMax: "يجب ألا تتجاوز كلمة المرور 100 حرف.",
    confirmPasswordMatch: "كلمتا المرور غير متطابقتين.",
    ageMin: "يجب أن يكون العمر رقمًا موجبًا.",
    ageMax: "العمر يبدو كبيرًا جدًا.",
    technicalSupport: "الدعم الفني",
    contactSupportMessage: "في حال نسيت كلمة السر، يرجى ",
  },
};

const generateDummyEmailFromPhone = (phone: string) => `user-${phone}@auth.local`;

export default function AuthPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;
  const { toast } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isForgotPasswordAlertOpen, setIsForgotPasswordAlertOpen] = useState(false);
  
  const t = translations[locale] || translations.en;
  const salonInfoData = getSalonInfo(locale);

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
  }, [router, locale, toast, t.alreadyLoggedIn]);

  const commonPasswordSchema = z.string().min(6, { message: t.passwordMin }).max(100, { message: t.passwordMax });
  const commonPhoneSchema = z.string()
    .min(11, { message: t.phoneInvalidPrefixOrLength })
    .max(11, { message: t.phoneInvalidPrefixOrLength })
    .regex(/^(010|011|012|015)\d{8}$/, { message: t.phoneInvalidPrefixOrLength });

  const loginFormSchema = z.object({
    phoneNumber: commonPhoneSchema,
    password: z.string().min(1, { message: t.passwordPlaceholder }), // Simple check for login
  });

  const createAccountFormSchema = z.object({
    name: z.string().min(2, { message: t.nameMin }).max(50, { message: t.nameMax }),
    phoneNumber: commonPhoneSchema,
    age: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number().positive({ message: t.ageMin }).max(120, { message: t.ageMax }).optional()
    ),
    password: commonPasswordSchema,
    confirmPassword: commonPasswordSchema,
  }).refine(data => data.password === data.confirmPassword, {
    message: t.confirmPasswordMatch,
    path: ["confirmPassword"],
  });

  const forgotPasswordFormSchema = z.object({
    phoneNumber: commonPhoneSchema,
  });

  type LoginFormValues = z.infer<typeof loginFormSchema>;
  type CreateAccountFormValues = z.infer<typeof createAccountFormSchema>;
  type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { phoneNumber: "", password: "" },
  });

  const createAccountForm = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: { name: "", phoneNumber: "", age: undefined, password: "", confirmPassword: "" },
  });
  
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { phoneNumber: "" },
  });

  const handleAuthError = (error: AuthError | Error, form?: any) => {
    console.error(`Authentication Error:`, error);
    let title = t.authError;
    let description = t.genericError;

    if (error.message.includes("auth/invalid-credential") || error.message.includes("auth/user-not-found") || error.message.includes("auth/wrong-password")) {
        description = locale === 'ar' ? "رقم الهاتف أو كلمة المرور غير صحيحة." : "Invalid phone number or password.";
        if (form) {
            form.setError("phoneNumber", { type: "manual", message: " " }); // Add error to both to avoid guessing
            form.setError("password", { type: "manual", message: description });
        }
    } else if (error.message.includes("auth/email-already-in-use")) {
        description = locale === 'ar' ? "هذا الرقم مسجل بالفعل." : "This phone number is already registered.";
        if (form) form.setError("phoneNumber", { type: "manual", message: description });
    } else if ((error as AuthError).code) {
        const authError = error as AuthError;
        description = authError.message || t.genericError;
    } else if (error.message) {
        description = error.message;
    }
    toast({ variant: "destructive", title, description });
  };

  const onLoginSubmit = async (data: LoginFormValues) => {
    const dummyEmail = generateDummyEmailFromPhone(data.phoneNumber);
    try {
      const userCredential = await signInWithEmailAndPasswordAuth(dummyEmail, data.password);
      // User data (like name) should be in Firestore. If not, it might be a partial signup.
      // The profile page handles fetching/displaying Firestore data.
      toast({ title: t.loginSuccess, description: t.loginSuccessDesc });
      router.push(`/${locale}/profile`);
    } catch (error) {
      handleAuthError(error as AuthError | Error, loginForm);
    }
  };

  const onCreateAccountSubmit = async (data: CreateAccountFormValues) => {
    const dummyEmail = generateDummyEmailFromPhone(data.phoneNumber);
    try {
      const userCredential = await createUserWithEmailAndPasswordAuth(dummyEmail, data.password);
      const user = userCredential.user;
      await upsertUserData(user.uid, {
        name: data.name,
        email: dummyEmail,
        phoneNumber: data.phoneNumber,
        age: data.age !== undefined ? Number(data.age) : null,
        isAnonymous: false,
      });
      toast({ title: t.createAccountSuccess, description: t.createAccountSuccessDesc });
      router.push(`/${locale}/profile`);
    } catch (error) {
      handleAuthError(error as AuthError | Error, createAccountForm);
    }
  };
  
  const onForgotPasswordSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      const userAccount = await findUserByPhoneNumber(data.phoneNumber);
      if (userAccount && userAccount.email) {
        await sendPasswordResetEmail(userAccount.email); // Sends to the dummy email
        toast({
          title: t.passwordResetSent,
          description: t.passwordResetSentDesc,
        });
        setIsForgotPasswordAlertOpen(false);
        forgotPasswordForm.reset();
      } else {
        toast({
          variant: "destructive",
          title: t.userNotFound,
          description: t.userNotFoundDesc,
        });
        forgotPasswordForm.setError("phoneNumber", {type: "manual", message: t.userNotFoundDesc});
      }
    } catch (error) {
       console.error("Error in forgot password flow:", error);
       toast({
         variant: "destructive",
         title: t.authError,
         description: t.passwordResetError,
       });
    }
  };

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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login" className="py-3"><LogIn className="me-2 h-5 w-5"/>{t.loginButton}</TabsTrigger>
          <TabsTrigger value="createAccount" className="py-3"><UserPlus className="me-2 h-5 w-5"/>{t.createAccountButton}</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">{t.loginTitle}</CardTitle>
              <CardDescription>{t.loginDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control} name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Phone className="me-2 h-4 w-4 text-muted-foreground"/>{t.phoneNumber}</FormLabel>
                        <FormControl><Input type="tel" placeholder={t.phonePlaceholder} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control} name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><KeyRound className="me-2 h-4 w-4 text-muted-foreground"/>{t.password}</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type={showPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} {...field} />
                          </FormControl>
                          <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loginForm.formState.isSubmitting}>
                    {loginForm.formState.isSubmitting ? <LoadingSpinner className="me-2" /> : null}
                    {t.loginButton}
                  </Button>
                </form>
              </Form>
              <div className="mt-6 text-center">
                <AlertDialog open={isForgotPasswordAlertOpen} onOpenChange={setIsForgotPasswordAlertOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="link" className="text-accent hover:text-accent/80 p-0 h-auto">
                      {t.forgotPasswordLink}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.forgotPasswordTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.forgotPasswordDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <Form {...forgotPasswordForm}>
                      <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={forgotPasswordForm.control} name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.phoneNumber}</FormLabel>
                              <FormControl><Input type="tel" placeholder={t.phonePlaceholder} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel type="button">{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction type="submit" disabled={forgotPasswordForm.formState.isSubmitting}>
                            {forgotPasswordForm.formState.isSubmitting ? <LoadingSpinner className="me-2" /> : null}
                            {t.sendResetInstructions}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </form>
                    </Form>
                  </AlertDialogContent>
                </AlertDialog>
                 <p className="mt-4 text-sm text-muted-foreground">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="createAccount">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">{t.createAccountTitle}</CardTitle>
              <CardDescription>{t.createAccountDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...createAccountForm}>
                <form onSubmit={createAccountForm.handleSubmit(onCreateAccountSubmit)} className="space-y-4">
                  <FormField
                    control={createAccountForm.control} name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><UserCircle className="me-2 h-4 w-4 text-muted-foreground"/>{t.name}</FormLabel>
                        <FormControl><Input placeholder={t.namePlaceholder} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control} name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Phone className="me-2 h-4 w-4 text-muted-foreground"/>{t.phoneNumber}</FormLabel>
                        <FormControl><Input type="tel" placeholder={t.phonePlaceholder} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control} name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Cake className="me-2 h-4 w-4 text-muted-foreground"/>{t.age}</FormLabel>
                        <FormControl><Input type="number" placeholder={t.agePlaceholder} {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control} name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><KeyRound className="me-2 h-4 w-4 text-muted-foreground"/>{t.password}</FormLabel>
                        <div className="relative">
                          <FormControl><Input type={showPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} {...field} /></FormControl>
                           <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAccountForm.control} name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><ShieldCheck className="me-2 h-4 w-4 text-muted-foreground"/>{t.confirmPassword}</FormLabel>
                         <div className="relative">
                          <FormControl><Input type={showConfirmPassword ? "text" : "password"} placeholder={t.confirmPasswordPlaceholder} {...field} /></FormControl>
                          <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={createAccountForm.formState.isSubmitting}>
                     {createAccountForm.formState.isSubmitting ? <LoadingSpinner className="me-2" /> : null}
                    {t.createAccountButton}
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
