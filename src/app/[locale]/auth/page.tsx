
"use client";

import React, { useEffect, useState, useRef } from 'react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle, Mail, KeyRound, Phone, ShieldCheck } from 'lucide-react';
import type { Locale } from "@/lib/types";
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult
} from 'firebase/auth';

const translations = {
  en: {
    pageTitle: "Access Your Account",
    pageDescription: "Log in or create an account to manage your appointments and profile.",
    loginTab: "Log In",
    loginTitle: "Welcome Back",
    loginDesc: "Enter your credentials to access your account.",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    loginButton: "Log In",
    signupEmailTab: "Sign Up with Email",
    signupEmailTitle: "Create Email Account",
    signupEmailDesc: "Fill in the details to create your account.",
    confirmPasswordLabel: "Confirm Password",
    signupEmailButton: "Create Account",
    signupPhoneTab: "Sign Up with Phone",
    signupPhoneTitle: "Create Account with Phone",
    signupPhoneDesc: "Enter your phone number to begin.",
    phoneNumberLabel: "Phone Number",
    phoneNumberPlaceholder: "+11234567890",
    sendOtpButton: "Send Verification Code",
    otpLabel: "Verification Code",
    otpPlaceholder: "Enter 6-digit code",
    verifyOtpButton: "Verify & Create Account",
    passwordsDoNotMatch: "Passwords do not match.",
    signupSuccess: "Account Created!",
    signupSuccessDesc: "Your account has been successfully created.",
    loginSuccess: "Login Successful!",
    loginSuccessDesc: "Welcome back!",
    invalidCredentialsError: "Invalid email or password. Please try again.",
    emailInUseError: "This email address is already in use.",
    weakPasswordError: "Password is too weak. It should be at least 6 characters.",
    genericError: "An error occurred. Please try again.",
    otpSent: "Verification code sent to your phone.",
    otpError: "Failed to send verification code. Please try again.",
    otpVerificationFailed: "Invalid verification code. Please try again.",
    recaptchaError: "reCAPTCHA verification failed. Please try again.",
    loading: "Loading...",
    processing: "Processing...",
  },
  ar: {
    pageTitle: "الوصول إلى حسابك",
    pageDescription: "سجل الدخول أو أنشئ حسابًا لإدارة مواعيدك وملفك الشخصي.",
    loginTab: "تسجيل الدخول",
    loginTitle: "مرحباً بعودتك",
    loginDesc: "أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك.",
    emailLabel: "عنوان البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    passwordLabel: "كلمة المرور",
    loginButton: "تسجيل الدخول",
    signupEmailTab: "إنشاء حساب بالبريد",
    signupEmailTitle: "إنشاء حساب بالبريد الإلكتروني",
    signupEmailDesc: "املأ التفاصيل لإنشاء حسابك.",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    signupEmailButton: "إنشاء حساب",
    signupPhoneTab: "إنشاء حساب بالهاتف",
    signupPhoneTitle: "إنشاء حساب برقم الهاتف",
    signupPhoneDesc: "أدخل رقم هاتفك للبدء.",
    phoneNumberLabel: "رقم الهاتف",
    phoneNumberPlaceholder: "+11234567890",
    sendOtpButton: "إرسال رمز التحقق",
    otpLabel: "رمز التحقق",
    otpPlaceholder: "أدخل الرمز المكون من 6 أرقام",
    verifyOtpButton: "تحقق وأنشئ الحساب",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة.",
    signupSuccess: "تم إنشاء الحساب!",
    signupSuccessDesc: "لقد تم إنشاء حسابك بنجاح.",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    loginSuccessDesc: "مرحباً بعودتك!",
    invalidCredentialsError: "بريد إلكتروني أو كلمة مرور غير صالحة. يرجى المحاولة مرة أخرى.",
    emailInUseError: "عنوان البريد الإلكتروني هذا مستخدم بالفعل.",
    weakPasswordError: "كلمة المرور ضعيفة جدًا. يجب أن تتكون من 6 أحرف على الأقل.",
    genericError: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    otpSent: "تم إرسال رمز التحقق إلى هاتفك.",
    otpError: "فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.",
    otpVerificationFailed: "رمز التحقق غير صالح. يرجى المحاولة مرة أخرى.",
    recaptchaError: "فشل التحقق من reCAPTCHA. يرجى المحاولة مرة أخرى.",
    loading: "جار التحميل...",
    processing: "جاري المعالجة...",
  }
};

const loginSchema = (t: any) => z.object({
  email: z.string().email({ message: t.invalidCredentialsError }),
  password: z.string().min(1, { message: t.invalidCredentialsError }),
});

const signupEmailSchema = (t: any) => z.object({
  email: z.string().email({ message: t.invalidCredentialsError }),
  password: z.string().min(6, { message: t.weakPasswordError }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t.passwordsDoNotMatch,
  path: ["confirmPassword"],
});

const phoneSchema = (t: any) => z.object({
  phoneNumber: z.string().min(10, { message: t.genericError }).max(15, {message: t.genericError}), // Basic validation
});

const otpSchema = (t: any) => z.object({
  otp: z.string().length(6, { message: t.otpVerificationFailed }),
});


export default function AuthPage() {
  const routeParams = useParams();
  const locale = routeParams.locale as Locale;
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'enterPhone' | 'enterOtp'>('enterPhone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && recaptchaContainerRef.current && !recaptchaVerifier && auth) {
      try {
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            toast({ variant: "destructive", title: t.recaptchaError, description: "reCAPTCHA challenge expired." });
          }
        });
        setRecaptchaVerifier(verifier);
      } catch (error) {
        console.error("Error initializing RecaptchaVerifier:", error);
        toast({ variant: "destructive", title: t.genericError, description: t.recaptchaError });
      }
    }
    // Cleanup on unmount
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, auth]); // Removed toast, t from dependencies as they are stable


  if (!isClient || !locale || (locale !== 'en' && locale !== 'ar')) {
    // Fallback for server-side rendering or invalid locale before client hydration
    const staticTranslations = translations.en; // Default to English for static parts
    return (
        <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-15rem)]">
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
            <UserCircle className="h-12 w-12 text-accent mx-auto mb-4" />
            <CardTitle className="font-headline text-3xl text-primary">{staticTranslations.pageTitle}</CardTitle>
            <CardDescription>{staticTranslations.loading}</CardDescription>
            </CardHeader>
            <CardContent><div className="h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></CardContent>
        </Card>
        </div>
    );
  }
  const t = translations[locale];

  const loginForm = useForm<z.infer<ReturnType<typeof loginSchema>>>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  const signupEmailForm = useForm<z.infer<ReturnType<typeof signupEmailSchema>>>({
    resolver: zodResolver(signupEmailSchema(t)),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });
  
  const phoneForm = useForm<z.infer<ReturnType<typeof phoneSchema>>>({
    resolver: zodResolver(phoneSchema(t)),
    defaultValues: { phoneNumber: "" },
  });

  const otpForm = useForm<z.infer<ReturnType<typeof otpSchema>>>({
    resolver: zodResolver(otpSchema(t)),
    defaultValues: { otp: "" },
  });


  const handleLogin = async (values: z.infer<ReturnType<typeof loginSchema>>) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: t.loginSuccess, description: t.loginSuccessDesc });
      router.push(\`/\${locale}/profile\`);
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = t.genericError;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = t.invalidCredentialsError;
      }
      toast({ variant: "destructive", title: "Login Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupEmail = async (values: z.infer<ReturnType<typeof signupEmailSchema>>) => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: t.signupSuccess, description: t.signupSuccessDesc });
      router.push(\`/\${locale}/profile\`);
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = t.genericError;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t.emailInUseError;
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t.weakPasswordError;
      }
      toast({ variant: "destructive", title: "Sign Up Failed", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (values: z.infer<ReturnType<typeof phoneSchema>>) => {
    setIsLoading(true);
    if (!recaptchaVerifier) {
        toast({ variant: "destructive", title: t.genericError, description: t.recaptchaError + " (Verifier not ready)" });
        setIsLoading(false);
        return;
    }
    try {
      const result = await signInWithPhoneNumber(auth, values.phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      setPhoneStep('enterOtp');
      toast({ title: t.otpSent });
    } catch (error: any) {
      console.error("OTP send error:", error);
      toast({ variant: "destructive", title: t.otpError, description: error.message || t.genericError });
       // Reset reCAPTCHA if necessary
       if (window.grecaptcha && recaptchaVerifier) {
        //  window.grecaptcha.reset(recaptchaVerifier.id); // This might not be the correct way if using invisible
       }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (values: z.infer<ReturnType<typeof otpSchema>>) => {
    setIsLoading(true);
    if (!confirmationResult) {
      toast({ variant: "destructive", title: t.genericError, description: "Confirmation result not found." });
      setIsLoading(false);
      return;
    }
    try {
      await confirmationResult.confirm(values.otp);
      toast({ title: t.signupSuccess, description: t.signupSuccessDesc });
      router.push(\`/\${locale}/profile\`);
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({ variant: "destructive", title: t.otpVerificationFailed, description: error.message || t.genericError });
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
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">{t.loginTab}</TabsTrigger>
              <TabsTrigger value="signup-email">{t.signupEmailTab}</TabsTrigger>
              <TabsTrigger value="signup-phone">{t.signupPhoneTab}</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader className="px-0 pt-6 pb-2">
                <CardTitle className="font-headline text-2xl flex items-center"><KeyRound className="me-2 h-5 w-5 text-accent"/>{t.loginTitle}</CardTitle>
                <CardDescription>{t.loginDesc}</CardDescription>
              </CardHeader>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.emailLabel}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.emailPlaceholder} {...field} />
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
                        <FormLabel>{t.passwordLabel}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <KeyRound className="me-2 h-4 w-4" />}
                    {isLoading ? t.processing : t.loginButton}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Signup with Email Tab */}
            <TabsContent value="signup-email">
              <CardHeader className="px-0 pt-6 pb-2">
                <CardTitle className="font-headline text-2xl flex items-center"><Mail className="me-2 h-5 w-5 text-accent"/>{t.signupEmailTitle}</CardTitle>
                <CardDescription>{t.signupEmailDesc}</CardDescription>
              </CardHeader>
              <Form {...signupEmailForm}>
                <form onSubmit={signupEmailForm.handleSubmit(handleSignupEmail)} className="space-y-6">
                  <FormField
                    control={signupEmailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.emailLabel}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.emailPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupEmailForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.passwordLabel}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupEmailForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.confirmPasswordLabel}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Mail className="me-2 h-4 w-4" />}
                    {isLoading ? t.processing : t.signupEmailButton}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Signup with Phone Tab */}
            <TabsContent value="signup-phone">
              <CardHeader className="px-0 pt-6 pb-2">
                 <CardTitle className="font-headline text-2xl flex items-center"><Phone className="me-2 h-5 w-5 text-accent"/>{t.signupPhoneTitle}</CardTitle>
                <CardDescription>{t.signupPhoneDesc}</CardDescription>
              </CardHeader>
              {phoneStep === 'enterPhone' ? (
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-6">
                    <FormField
                      control={phoneForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.phoneNumberLabel}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.phoneNumberPlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Phone className="me-2 h-4 w-4" />}
                      {isLoading ? t.processing : t.sendOtpButton}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.otpLabel}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.otpPlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="me-2 h-4 w-4" />}
                      {isLoading ? t.processing : t.verifyOtpButton}
                    </Button>
                     <Button variant="link" onClick={() => setPhoneStep('enterPhone')} className="w-full">{locale === 'ar' ? 'إعادة إرسال الرمز أو تغيير الرقم' : 'Resend code or change number'}</Button>
                  </form>
                </Form>
              )}
              <div ref={recaptchaContainerRef} id="recaptcha-container" className="mt-4"></div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

