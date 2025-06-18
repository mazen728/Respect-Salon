
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { auth, db, upsertUserData } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, updatePassword, type User as FirebaseUser } from 'firebase/auth';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Cake, ShieldCheck, Phone, Save, Edit3, Eye, EyeOff, Image as ImageIcon, CalendarDays, X } from 'lucide-react';
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
    pageDescription: "View and manage your personal details and account settings.",
    personalInfo: "Personal Information",
    name: "Full Name",
    namePlaceholder: "e.g., John Doe",
    age: "Age",
    agePlaceholder: "e.g., 30",
    phoneNumber: "Phone Number",
    phonePlaceholder: "01xxxxxxxxx",
    profilePicture: "Profile Picture",
    imageUrl: "Image URL (Optional)",
    imageUrlPlaceholder: "https://example.com/your-image.png",
    imageUrlDesc: "Link to your profile picture.",
    noName: "Not Provided",
    noAge: "Not Provided",
    noPhoneNumber: "Not Provided",
    passwordSettings: "Password Settings",
    passwordSettingsDesc: "Change your password.",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    updatePasswordButton: "Update Password",
    passwordUpdatedSuccess: "Password Updated Successfully",
    passwordUpdatedError: "Failed to Update Password",
    passwordsDontMatch: "New passwords do not match.",
    passwordMinLength: "New password must be at least 6 characters.",
    loading: "Loading profile...",
    errorFetchingProfile: "Could not load profile data.",
    userNotAuthenticated: "User not authenticated. Redirecting to login...",
    tooManyRequests: "Too many recent attempts. Please try again later.",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    profileUpdatedSuccess: "Profile Updated Successfully",
    profileUpdatedError: "Failed to Update Profile",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name must be at most 50 characters.",
    ageMin: "Age must be a positive number.",
    ageMax: "Age seems too high.",
    phoneInvalidPrefixOrLength: "Phone number must be 11 digits and start with 010, 011, 012, or 015.",
    phoneRequired: "Phone number is required.",
    genericError: "An unexpected error occurred. Please try again.",
  },
  ar: {
    pageTitle: "ملفك الشخصي",
    pageDescription: "عرض وإدارة تفاصيلك الشخصية وإعدادات حسابك.",
    personalInfo: "المعلومات الشخصية",
    name: "الاسم الكامل",
    namePlaceholder: "مثال: جون دو",
    age: "العمر",
    agePlaceholder: "مثال: 30",
    phoneNumber: "رقم الهاتف",
    phonePlaceholder: "01xxxxxxxxx",
    profilePicture: "الصورة الشخصية",
    imageUrl: "رابط الصورة (اختياري)",
    imageUrlPlaceholder: "https://example.com/your-image.png",
    imageUrlDesc: "رابط لصورة ملفك الشخصي.",
    noName: "غير متوفر",
    noAge: "غير متوفر",
    noPhoneNumber: "غير متوفر",
    passwordSettings: "إعدادات كلمة المرور",
    passwordSettingsDesc: "قم بتغيير كلمة المرور الخاصة بك.",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    updatePasswordButton: "تحديث كلمة المرور",
    passwordUpdatedSuccess: "تم تحديث كلمة المرور بنجاح",
    passwordUpdatedError: "فشل تحديث كلمة المرور",
    passwordsDontMatch: "كلمات المرور الجديدة غير متطابقة.",
    passwordMinLength: "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.",
    loading: "جارٍ تحميل الملف الشخصي...",
    errorFetchingProfile: "تعذر تحميل بيانات الملف الشخصي.",
    userNotAuthenticated: "المستخدم غير مصادق عليه. يتم التوجيه إلى صفحة تسجيل الدخول...",
    tooManyRequests: "محاولات كثيرة مؤخرًا. يرجى المحاولة مرة أخرى لاحقًا.",
    editProfile: "تعديل البيانات",
    saveChanges: "حفظ التغييرات",
    cancel: "إلغاء",
    profileUpdatedSuccess: "تم تحديث الملف الشخصي بنجاح",
    profileUpdatedError: "فشل تحديث الملف الشخصي",
    nameMin: "يجب أن يتكون الاسم من حرفين على الأقل.",
    nameMax: "يجب ألا يتجاوز الاسم 50 حرفًا.",
    ageMin: "يجب أن يكون العمر رقمًا موجبًا.",
    ageMax: "العمر يبدو كبيرًا جدًا.",
    phoneInvalidPrefixOrLength: "يجب أن يتكون رقم الهاتف من 11 رقمًا وأن يبدأ بـ 010 أو 011 أو 012 أو 015.",
    phoneRequired: "رقم الهاتف مطلوب.",
    genericError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
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
  const [isEditing, setIsEditing] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const t = translations[locale] || translations.en;

  const editProfileFormSchema = z.object({
    name: z.string().min(2, { message: t.nameMin }).max(50, { message: t.nameMax }),
    imageUrl: z.string().url({ message: t.imageUrlDesc }).optional().or(z.literal('')),
    age: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number().positive({ message: t.ageMin }).max(120, { message: t.ageMax }).optional()
    ),
    phoneNumber: z.string()
      .min(1, { message: t.phoneRequired })
      .regex(/^(010|011|012|015)\d{8}$/, { message: t.phoneInvalidPrefixOrLength }),
  });
  type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

  const editProfileForm = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      age: undefined,
      phoneNumber: "",
    },
  });

  const passwordFormSchema = z.object({
    newPassword: z.string().min(6, { message: t.passwordMinLength }),
    confirmPassword: z.string(),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: t.passwordsDontMatch,
    path: ["confirmPassword"],
  });
  type PasswordFormValues = z.infer<typeof passwordFormSchema>;

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const fetchedData = docSnap.data() as UserProfileData;
            setUserProfile(fetchedData);
            editProfileForm.reset({
              name: fetchedData.name || "",
              imageUrl: fetchedData.imageUrl || "",
              age: fetchedData.age === null ? undefined : fetchedData.age,
              phoneNumber: fetchedData.phoneNumber || "",
            });
          } else {
            // Fallback if user doc doesn't exist, though upsertUserData should prevent this
             setUserProfile({ 
                name: user.displayName, 
                // email: user.email, // Not displaying dummy email
                email: null, // Explicitly set to null as we don't want to show dummy
                imageUrl: user.photoURL, 
                age: null, 
                phoneNumber: user.phoneNumber 
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, locale, t, editProfileForm]);


  const handlePasswordUpdate = async (values: PasswordFormValues) => {
    if (!currentUser) { 
      toast({ title: t.passwordUpdatedError, description: "User not properly authenticated.", variant: "destructive" });
      return;
    }
    try {
      await updatePassword(currentUser, values.newPassword);
      toast({ title: t.passwordUpdatedSuccess });
      passwordForm.reset();
    } catch (err: any) {
      console.error("Password update error:", err);
      let description = t.passwordUpdatedError;
      if (err.code === 'auth/too-many-requests') {
        description = t.tooManyRequests;
      } else if (err.code === 'auth/weak-password') {
        description = t.passwordMinLength;
         passwordForm.setError("newPassword", { type: "manual", message: description });
      }
      toast({ title: t.passwordUpdatedError, description, variant: "destructive" });
    }
  };

  const handleEditProfileSubmit = async (values: EditProfileFormValues) => {
    if (!currentUser) return;
    try {
      await upsertUserData(currentUser.uid, {
        name: values.name,
        imageUrl: values.imageUrl || null,
        age: values.age !== undefined ? Number(values.age) : null,
        phoneNumber: values.phoneNumber,
      });
      setUserProfile(prev => prev ? { ...prev, ...values, age: values.age !== undefined ? Number(values.age) : null } : null);
      toast({ title: t.profileUpdatedSuccess });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: t.profileUpdatedError, description: error instanceof Error ? error.message : String(error), variant: "destructive" });
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size={48} /> <p className="ms-4 text-lg">{t.loading}</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center text-destructive">
        <p>{error}</p>
        <Button onClick={() => router.push(`/${locale}/auth`)} className="mt-4">
          {locale === 'ar' ? 'العودة لإنشاء حساب' : 'Back to Create Account'}
        </Button>
      </div>
    );
  }
  if (!currentUser || !userProfile) {
    return (<div className="container mx-auto py-12 px-4 text-center"><p>{t.userNotAuthenticated}</p></div>);
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <UserCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{t.pageTitle}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.pageDescription}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="items-center">
              {!isEditing && userProfile.imageUrl ? (
                <Image
                  src={userProfile.imageUrl} alt={t.profilePicture} width={128} height={128}
                  className="rounded-full object-cover border-4 border-accent"
                  data-ai-hint="user profile picture"
                  onError={(e: FormEvent<HTMLImageElement>) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/128x128.png';
                    (e.target as HTMLImageElement).alt = 'Placeholder User Image';
                  }}
                />
              ) : !isEditing && (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-accent">
                  <UserCircle className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              {!isEditing && <CardTitle className="font-headline text-2xl mt-4">{userProfile.name || t.noName}</CardTitle>}
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditing ? (
                <Form {...editProfileForm}>
                  <form onSubmit={editProfileForm.handleSubmit(handleEditProfileSubmit)} className="space-y-4">
                    <FormField
                      control={editProfileForm.control} name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><UserCircle className="me-2 h-4 w-4 text-muted-foreground" />{t.name}</FormLabel>
                          <FormControl><Input placeholder={t.namePlaceholder} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editProfileForm.control} name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><ImageIcon className="me-2 h-4 w-4 text-muted-foreground" />{t.imageUrl}</FormLabel>
                          <FormControl><Input type="url" placeholder={t.imageUrlPlaceholder} {...field} /></FormControl>
                          <FormDescription>{t.imageUrlDesc}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editProfileForm.control} name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><CalendarDays className="me-2 h-4 w-4 text-muted-foreground" />{t.age}</FormLabel>
                          <FormControl><Input type="number" placeholder={t.agePlaceholder} {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editProfileForm.control} name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Phone className="me-2 h-4 w-4 text-muted-foreground" />{t.phoneNumber}</FormLabel>
                          <FormControl><Input type="tel" placeholder={t.phonePlaceholder} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={editProfileForm.formState.isSubmitting}>
                        {editProfileForm.formState.isSubmitting ? <LoadingSpinner size={20} className="me-2"/> : <Save className="h-5 w-5 me-2" /> }
                        {t.saveChanges}
                      </Button>
                      <Button type="button" variant="outline" className="flex-1" onClick={() => {
                        setIsEditing(false);
                        editProfileForm.reset({
                            name: userProfile.name || "",
                            imageUrl: userProfile.imageUrl || "",
                            age: userProfile.age === null ? undefined : userProfile.age,
                            phoneNumber: userProfile.phoneNumber || "",
                        });
                      }}>
                        <X className="h-5 w-5 me-2" />{t.cancel}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div className="flex items-center text-muted-foreground">
                    <Cake className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} />
                    <span>{userProfile.age ? `${userProfile.age} ${locale === 'ar' ? 'سنة' : 'years old'}` : t.noAge}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-2' : 'me-2'}`} />
                    <span>{userProfile.phoneNumber || t.noPhoneNumber}</span>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Edit3 className="h-5 w-5 me-2" />{t.editProfile}
                  </Button>
                </>
              )}
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
                    control={passwordForm.control} name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.newPassword}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showNewPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control} name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.confirmNewPassword}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                    <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90" disabled={passwordForm.formState.isSubmitting}>
                      {passwordForm.formState.isSubmitting ? <LoadingSpinner size={20} className="me-2"/> : <Save className="h-5 w-5 me-2" /> }
                      {t.updatePasswordButton}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
    

    
