
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
import { Mail, KeyRound, UserPlus, LogIn, UserCircle, PhoneIcon } from 'lucide-react';
import type { Locale } from "@/lib/types";
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const translations = {
  en: {
    pageTitle: "Access Your Account",
    pageDescription: "Log in or create an account to manage your appointments and profile.",
    loginTab: "Log In",
    signUpTab: "Sign Up",
    signUpWithPhoneTab: "Sign Up with Phone",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    loginButton: "Log In",
    passwordPlaceholderLogin: "••••••••",
    passwordPlaceholderSignUp: "Minimum 8 characters",
    confirmPasswordLabel: "Confirm Password",
    signUpButton: "Create Account",
    phoneNumberLabel: "Phone Number",
    phoneNumberPlaceholder: "e.g., +11234567890",
    sendOtpButton: "Send Verification Code",
    otpLabel: "Verification Code (OTP)",
    otpPlaceholder: "Enter 6-digit code",
    verifyAndSignUpButton: "Verify & Sign Up",
    loginSuccessTitle: "Login Successful",
    loginSuccessDesc: "Welcome back! Redirecting you...",
    loginErrorTitle: "Login Failed",
    signUpSuccessTitle: "Account Created",
    signUpSuccessDesc: "Welcome! Your account has been successfully created. Redirecting...",
    signUpErrorTitle: "Sign Up Failed",
    phoneSignUpSuccessTitle: "Account Created with Phone",
    phoneSignUpSuccessDesc: "Your account has been created. Redirecting...",
    phoneSignUpErrorTitle: "Phone Sign Up Failed",
    otpSentSuccessTitle: "OTP Sent",
    otpSentSuccessDesc: "A verification code has been sent to your phone.",
    otpVerificationErrorTitle: "OTP Verification Failed",
    passwordsDontMatch: "Passwords do not match.",
    invalidEmail: "Invalid email address.",
    passwordRequired: "Password is required.",
    passwordMinLength: "Password must be at least 8 characters.",
    anErrorOccurred: "An error occurred. Please try again.",
    invalidCredentials: "Invalid email or password.",
    emailInUse: "This email address is already in use.",
    invalidPhoneNumber: "Invalid phone number format. Include country code.",
    otpRequired: "Verification code is required.",
    otpMinLength: "Verification code must be 6 digits.",
    recaptchaError: "reCAPTCHA verification failed or not completed. Please try again.",
    recaptchaLoading: "Initializing reCAPTCHA...",
  },
  ar: {
    pageTitle: "الوصول إلى حسابك",
    pageDescription: "سجل الدخول أو أنشئ حسابًا لإدارة مواعيدك وملفك الشخصي.",
    loginTab: "تسجيل الدخول",
    signUpTab: "إنشاء حساب بالبريد",
    signUpWithPhoneTab: "إنشاء حساب بالهاتف",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "you@example.com",
    passwordLabel: "كلمة المرور",
    loginButton: "تسجيل الدخول",
    passwordPlaceholderLogin: "••••••••",
    passwordPlaceholderSignUp: "8 أحرف على الأقل",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    signUpButton: "إنشاء حساب",
    phoneNumberLabel: "رقم الهاتف",
    phoneNumberPlaceholder: "مثال: +966123456789",
    sendOtpButton: "إرسال رمز التحقق",
    otpLabel: "رمز التحقق (OTP)",
    otpPlaceholder: "أدخل الرمز المكون من 6 أرقام",
    verifyAndSignUpButton: "تحقق وأنشئ الحساب",
    loginSuccessTitle: "تم تسجيل الدخول بنجاح",
    loginSuccessDesc: "مرحباً بعودتك! يتم توجيهك...",
    loginErrorTitle: "فشل تسجيل الدخول",
    signUpSuccessTitle: "تم إنشاء الحساب",
    signUpSuccessDesc: "مرحباً بك! تم إنشاء حسابك بنجاح. يتم توجيهك...",
    signUpErrorTitle: "فشل إنشاء الحساب",
    phoneSignUpSuccessTitle: "تم إنشاء الحساب بالهاتف",
    phoneSignUpSuccessDesc: "تم إنشاء حسابك. يتم توجيهك...",
    phoneSignUpErrorTitle: "فشل إنشاء الحساب بالهاتف",
    otpSentSuccessTitle: "تم إرسال الرمز",
    otpSentSuccessDesc: "تم إرسال رمز التحقق إلى هاتفك.",
    otpVerificationErrorTitle: "فشل التحقق من الرمز",
    passwordsDontMatch: "كلمتا المرور غير متطابقتين.",
    invalidEmail: "بريد إلكتروني غير صالح.",
    passwordRequired: "كلمة المرور مطلوبة.",
    passwordMinLength: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    anErrorOccurred: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    emailInUse: "عنوان البريد الإلكتروني هذا مستخدم بالفعل.",
    invalidPhoneNumber: "صيغة رقم الهاتف غير صحيحة. يرجى إدخال رمز الدولة.",
    otpRequired: "رمز التحقق مطلوب.",
    otpMinLength: "يجب أن يتكون رمز التحقق من 6 أرقام.",
    recaptchaError: "فشل التحقق من reCAPTCHA أو لم يكتمل. يرجى المحاولة مرة أخرى.",
    recaptchaLoading: "جاري تهيئة reCAPTCHA...",
  }
};

// Add a global variable for RecaptchaVerifier if it doesn't exist
if (typeof window !== 'undefined') {
  (window as any).recaptchaVerifier = (window as any).recaptchaVerifier || null;
  (window as any).confirmationResult = (window as any).confirmationResult || null;
}


export default function AuthPage() {
  const routeParams = useParams();
  const locale = routeParams.locale as Locale;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [isPhoneSignUpLoading, setIsPhoneSignUpLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  // State for reCAPTCHA initialization
  const [recaptchaInitialized, setRecaptchaInitialized] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).recaptchaVerifier && auth) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log("reCAPTCHA verified");
            setRecaptchaInitialized(true);
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            toast({ variant: "destructive", title: t.phoneSignUpErrorTitle, description: t.recaptchaError });
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.render().catch((err: any) => console.error("Recaptcha render error after expiry:", err));
            }
            setRecaptchaInitialized(false); // Reset initialized state
          }
        });
        (window as any).recaptchaVerifier.render()
          .then(() => {
            console.log("Invisible reCAPTCHA rendered successfully.");
            setRecaptchaInitialized(true);
          })
          .catch((error: any) => {
            console.error("Error rendering invisible reCAPTCHA:", error);
            toast({ variant: "destructive", title: t.phoneSignUpErrorTitle, description: `${t.recaptchaError} (render)`});
            setRecaptchaInitialized(false);
          });
      } catch (error) {
          console.error("Error initializing RecaptchaVerifier:", error);
          toast({ variant: "destructive", title: t.phoneSignUpErrorTitle, description: `${t.recaptchaError} (init)`});
          setRecaptchaInitialized(false);
      }
    } else if ((window as any).recaptchaVerifier) {
        setRecaptchaInitialized(true); // Already initialized
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]); // Add auth and t to dependency array

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

  const phoneSignUpFormSchema = z.object({
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, t.invalidPhoneNumber), // Basic E.164 format validation
    otp: z.string().optional(),
  }).refine(data => !isOtpSent || (data.otp && data.otp.length === 6), {
    message: t.otpMinLength,
    path: ["otp"],
  });


  type LoginFormValues = z.infer<typeof loginFormSchema>;
  type SignUpFormValues = z.infer<typeof signUpFormSchema>;
  type PhoneSignUpFormValues = z.infer<typeof phoneSignUpFormSchema>;

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

  const phoneSignUpForm = useForm<PhoneSignUpFormValues>({
    resolver: zodResolver(phoneSignUpFormSchema),
    defaultValues: { phoneNumber: "", otp: "" },
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
         errorMessage = `${error.message || error.code || 'Unknown Firebase error'}`;
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
        errorMessage = `${error.message || error.code || 'Unknown Firebase error'}`;
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

  async function onSendOtp(data: PhoneSignUpFormValues) {
    if (!(window as any).recaptchaVerifier || !recaptchaInitialized) {
      toast({ variant: "destructive", title: t.phoneSignUpErrorTitle, description: t.recaptchaError });
      // Attempt to re-render if not initialized
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().catch((err:any) => console.error("Recaptcha render error on send OTP:", err));
      }
      return;
    }
    setIsPhoneSignUpLoading(true);
    try {
      const verifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, data.phoneNumber, verifier);
      (window as any).confirmationResult = confirmation;
      setIsOtpSent(true);
      toast({
        title: t.otpSentSuccessTitle,
        description: t.otpSentSuccessDesc,
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      let errorMessage = `${t.anErrorOccurred} (${error.message || error.code || 'Unknown Firebase error'})`;
      if (error.code === 'auth/invalid-phone-number'){
        errorMessage = t.invalidPhoneNumber;
      } else if (error.message?.includes("reCAPTCHA")){
         errorMessage = t.recaptchaError;
      }
      toast({
        variant: "destructive",
        title: t.phoneSignUpErrorTitle,
        description: errorMessage,
      });
       if ((window as any).recaptchaVerifier) {
         (window as any).recaptchaVerifier.clear(); // Clear the existing verifier
         (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {size: 'invisible'});
         (window as any).recaptchaVerifier.render().catch((err: any) => console.error("Recaptcha re-render error:", err));
       }
    } finally {
      setIsPhoneSignUpLoading(false);
    }
  }

  async function onVerifyOtpAndSignUp(data: PhoneSignUpFormValues) {
    if (!(window as any).confirmationResult) {
        toast({ variant: "destructive", title: t.otpVerificationErrorTitle, description: t.anErrorOccurred });
        return;
    }
    if (!data.otp || data.otp.length !== 6) {
        phoneSignUpForm.setError("otp", { type: "manual", message: t.otpMinLength });
        return;
    }
    setIsPhoneSignUpLoading(true);
    try {
      const confirmation = (window as any).confirmationResult as ConfirmationResult;
      await confirmation.confirm(data.otp);
      toast({
        title: t.phoneSignUpSuccessTitle,
        description: t.phoneSignUpSuccessDesc,
      });
      router.push(`/${locale}/profile`);
      setIsOtpSent(false); // Reset OTP state
      phoneSignUpForm.reset();
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      let errorMessage = `${t.anErrorOccurred} (${error.message || error.code || 'Unknown Firebase error'})`;
       if (error.code === 'auth/invalid-verification-code') {
        errorMessage = t.otpVerificationErrorTitle;
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "Verification code has expired. Please request a new one."; // TODO: Add translation
      }
      toast({
        variant: "destructive",
        title: t.otpVerificationErrorTitle,
        description: errorMessage,
      });
    } finally {
      setIsPhoneSignUpLoading(false);
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">{t.loginTab}</TabsTrigger>
              <TabsTrigger value="signup">{t.signUpTab}</TabsTrigger>
              <TabsTrigger value="phonesignup">{t.signUpWithPhoneTab}</TabsTrigger>
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
            <TabsContent value="phonesignup" className="pt-6">
              <Form {...phoneSignUpForm}>
                <form 
                    onSubmit={
                        isOtpSent 
                        ? phoneSignUpForm.handleSubmit(onVerifyOtpAndSignUp) 
                        : phoneSignUpForm.handleSubmit(onSendOtp)
                    } 
                    className="space-y-6"
                >
                  {!isOtpSent ? (
                    <FormField
                      control={phoneSignUpForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <PhoneIcon className={`me-2 h-4 w-4 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />
                            {t.phoneNumberLabel}
                          </FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder={t.phoneNumberPlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={phoneSignUpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <KeyRound className={`me-2 h-4 w-4 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />
                            {t.otpLabel}
                          </FormLabel>
                          <FormControl>
                            <Input type="text" maxLength={6} placeholder={t.otpPlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div id="recaptcha-container"></div>
                  {!recaptchaInitialized && <p className="text-sm text-muted-foreground">{t.recaptchaLoading}</p>}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={isPhoneSignUpLoading || !recaptchaInitialized}
                  >
                    {isPhoneSignUpLoading ? <LoadingSpinner size={20} /> : (
                      isOtpSent ? 
                      <UserPlus className={`me-2 h-5 w-5 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} /> 
                      : 
                      <UserPlus className={`me-2 h-5 w-5 ${locale === 'ar' ? 'ms-0 me-2' : 'me-2 ms-0'}`} />
                    )}
                    {isOtpSent ? t.verifyAndSignUpButton : t.sendOtpButton}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


    