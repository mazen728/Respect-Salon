
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential, type User as FirebaseUser } from 'firebase/auth';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Mail, Cake, ShieldCheck, Phone, Save, Edit3, Eye, EyeOff } from 'lucide-react'; // Changed KeyRound to Phone
import type { Locale } from "@/lib/types";
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface UserProfileData {
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  age: number | null;
  phoneNumber: string | null;
}

const translations = {
  en: {
    pageTitle: "Your Profile",
    pageDescription: "View your personal details and manage your account settings.",
    personalInfo: "Personal Information",
    name: "Full Name",
    age: "Age",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    profilePicture: "Profile Picture",
    noName: "Not Provided",
    noAge: "Not Provided",
    noPhoneNumber: "Not Provided",
    passwordSettings: "Password Settings",
    passwordSettingsDesc: "Change your password. Requires current password.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    updatePasswordButton: "Update Password",
    passwordUpdatedSuccess: "Password Updated Successfully",
    passwordUpdatedError: "Failed to Update Password",
    reauthenticationNeeded: "Re-authentication successful. You can now update your password.",
    reauthenticationFailed: "Re-authentication failed. Please check your current password.",
    passwordsDontMatch: "New passwords do not match.",
    passwordMinLength: "New password must be at least 6 characters.",
    loading: "Loading profile...",
    errorFetchingProfile: "Could not load profile data.",
    userNotAuthenticated: "User not authenticated. Redirecting to login...",
    currentPasswordIncorrect: "Current password is incorrect.",
    tooManyRequests: "Too many recent attempts. Please try again later.",
  },
  ar: {
    pageTitle: "ملفك الشخصي",
    pageDescription: "عرض تفاصيلك الشخصية وإدارة إعدادات حسابك.",
    personalInfo: "المعلومات الشخصية",
    name: "الاسم الكامل",
    age: "العمر",
    emailAddress: "البريد الإلكتروني",
    phoneNumber: "رقم الهاتف",
    profilePicture: "الصورة الشخصية",
    noName: "غير متوفر",
    noAge: "غير متوفر",
    noPhoneNumber: "غير متوفر",
    passwordSettings: "إعدادات كلمة المرور",
    passwordSettingsDesc: "قم بتغيير كلمة المرور الخاصة بك. يتطلب كلمة المرور الحالية.",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    updatePasswordButton: "تحديث كلمة المرور",
    passwordUpdatedSuccess: "تم تحديث كلمة المرور بنجاح",
    passwordUpdatedError: "فشل تحديث كلمة المرور",
    reauthenticationNeeded: "إعادة المصادقة ناجحة. يمكنك الآن تحديث كلمة مرورك.",
    reauthenticationFailed: "فشلت إعادة المصادقة. يرجى التحقق من كلمة مرورك الحالية.",
    passwordsDontMatch: "كلمات المرور الجديدة غير متطابقة.",
    passwordMinLength: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.",
    loading: "جارٍ تحميل الملف الشخصي...",
    errorFetchingProfile: "تعذر تحميل بيانات الملف الشخصي.",
    userNotAuthenticated: "المستخدم غير مصادق عليه. يتم التوجيه إلى صفحة تسجيل الدخول...",
    currentPasswordIncorrect: "كلمة المرور الحالية غير صحيحة.",
    tooManyRequests: "محاولات كثيرة مؤخرًا. يرجى المحاولة مرة أخرى لاحقًا.",
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const t = translations[locale] || translations.en;

  const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: t.currentPassword }),
    newPassword: z.string().min(6, { message: t.passwordMinLength }),
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: t.passwordsDontMatch,
    path: ["confirmPassword"],
  });

  type PasswordFormValues = z.infer<typeof passwordFormSchema>;

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfileData);
          } else {
            console.warn("User document not found in Firestore for UID:", user.uid);
            // Fallback if Firestore data is missing for some reason
            setUserProfile({
              name: user.displayName,
              email: user.email,
              imageUrl: user.photoURL,
              age: null, // No age info from FirebaseUser directly
              phoneNumber: user.phoneNumber,
            });
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
          setError(t.errorFetchingProfile);
        }
      } else {
        toast({ title: t.userNotAuthenticated, variant: "destructive" });
        router.push(`/${locale}/auth`);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, locale, t]);

  const handlePasswordUpdate = async (values: PasswordFormValues) => {
    if (!currentUser || !currentUser.email) {
      toast({ title: t.passwordUpdatedError, description: "User not properly authenticated.", variant: "destructive" });
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, values.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      await updatePassword(currentUser, values.newPassword);
      toast({ title: t.passwordUpdatedSuccess });
      passwordForm.reset();
    } catch (err: any) {
      console.error("Password update error:", err);
      let description = t.passwordUpdatedError;
      if (err.code === 'auth/wrong-password') {
        description = t.currentPasswordIncorrect;
        passwordForm.setError("currentPassword", { type: "manual", message: description });
      } else if (err.code === 'auth/too-many-requests') {
        description = t.tooManyRequests;
      }
      toast({ title: t.passwordUpdatedError, description, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size={48} />
        <p className="ms-4 text-lg">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center text-destructive">
        <p>{error}</p>
        <Button onClick={() => router.push(`/${locale}/auth`)} className="mt-4">
          {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
        </Button>
      </div>
    );
  }
  
  if (!currentUser || !userProfile) {
     // Should be caught by isLoading or error state, but as a final fallback
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p>{t.userNotAuthenticated}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <UserCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{t.pageTitle}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.pageDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="items-center">
              {userProfile.imageUrl ? (
                <Image
                  src={userProfile.imageUrl}
                  alt={t.profilePicture}
                  width={128}
                  height={128}
                  className="rounded-full object-cover border-4 border-accent"
                  data-ai-hint="user profile picture"
                  onError={(e: FormEvent<HTMLImageElement>) => {
                     // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://placehold.co/128x128.png';
                    (e.target as HTMLImageElement).alt = 'Placeholder User Image';
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-accent">
                  <UserCircle className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              <CardTitle className="font-headline text-2xl mt-4">{userProfile.name || t.noName}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div className="flex items-center justify-center text-muted-foreground">
                <Mail className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} />
                <span>{userProfile.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-center text-muted-foreground">
                <Cake className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} />
                <span>{userProfile.age ? `${userProfile.age} ${locale === 'ar' ? 'سنة' : 'years old'}` : t.noAge}</span>
              </div>
               <div className="flex items-center justify-center text-muted-foreground">
                <Phone className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} /> 
                <span>{userProfile.phoneNumber || t.noPhoneNumber}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center">
                <ShieldCheck className={`h-6 w-6 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} /> 
                {t.passwordSettings}
              </CardTitle>
              <CardDescription>{t.passwordSettingsDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.currentPassword}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showCurrentPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                              {showCurrentPassword ? <EyeOff /> : <Eye />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.newPassword}</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <Input type={showNewPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                             <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                              {showNewPassword ? <EyeOff /> : <Eye />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.confirmNewPassword}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={passwordForm.formState.isSubmitting}>
                    {passwordForm.formState.isSubmitting ? <LoadingSpinner size={20} className="me-2"/> : <Save className="h-5 w-5 me-2" /> }
                    {t.updatePasswordButton}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    
