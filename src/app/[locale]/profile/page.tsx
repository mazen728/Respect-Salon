
"use client";

import { useState, useEffect, type FormEvent, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { auth, db, upsertUserData, reauthenticateUser, updateUserPassword } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Cake, Phone, Save, Edit3, ImageIcon, CalendarDays, X, LogOut, KeyRound, ShieldCheck, Eye, EyeOff, ImagePlus, XCircle } from 'lucide-react';
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
    changeProfilePicture: "Change Profile Picture",
    uploadFromGallery: "Upload from Gallery",
    deletePicture: "Delete Picture",
    imageUrlDesc: "Upload an image from your device's gallery. Max 500KB. (jpeg, png, gif, webp)",
    noName: "Not Provided",
    noAge: "Not Provided",
    noPhoneNumber: "Not Provided",
    emailAddress: "Email Address",
    noEmail: "Not Provided",
    loading: "Loading profile...",
    errorFetchingProfile: "Could not load profile data.",
    userNotAuthenticated: "User not authenticated. Redirecting...",
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
    logoutButton: "Log Out",
    logoutSuccess: "Logged Out Successfully",
    logoutError: "Failed to Log Out",
    passwordSettings: "Password Settings",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    passwordPlaceholder: "••••••••",
    updatePasswordButton: "Update Password",
    passwordUpdateSuccess: "Password Updated Successfully",
    passwordUpdateError: "Failed to Update Password",
    reauthError: "Re-authentication failed. Please check your current password.",
    passwordMin: "Password must be at least 6 characters.",
    confirmPasswordMatch: "Passwords do not match.",
    fileTooLarge: "File is too large. Max 500KB.",
    invalidFileType: "Invalid file type. Please select an image (jpeg, png, gif, webp).",
    uploadError: "Error uploading image. Please try again.",
    imageRemoved: "Profile picture removed.",
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
    changeProfilePicture: "تغيير الصورة الشخصية",
    uploadFromGallery: "تحميل من المعرض",
    deletePicture: "حذف الصورة",
    imageUrlDesc: "قم بتحميل صورة من معرض جهازك. الحد الأقصى 500 كيلوبايت. (jpeg, png, gif, webp)",
    noName: "غير متوفر",
    noAge: "غير متوفر",
    noPhoneNumber: "غير متوفر",
    emailAddress: "البريد الإلكتروني",
    noEmail: "غير متوفر",
    loading: "جارٍ تحميل الملف الشخصي...",
    errorFetchingProfile: "تعذر تحميل بيانات الملف الشخصي.",
    userNotAuthenticated: "المستخدم غير مصادق عليه. يتم التوجيه...",
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
    logoutButton: "تسجيل الخروج",
    logoutSuccess: "تم تسجيل الخروج بنجاح",
    logoutError: "فشل تسجيل الخروج",
    passwordSettings: "إعدادات كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    passwordPlaceholder: "••••••••",
    updatePasswordButton: "تحديث كلمة المرور",
    passwordUpdateSuccess: "تم تحديث كلمة المرور بنجاح",
    passwordUpdateError: "فشل تحديث كلمة المرور",
    reauthError: "فشلت إعادة المصادقة. يرجى التحقق من كلمة مرورك الحالية.",
    passwordMin: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
    confirmPasswordMatch: "كلمتا المرور الجديدتان غير متطابقتين.",
    fileTooLarge: "الملف كبير جدًا. الحد الأقصى 500 كيلوبايت.",
    invalidFileType: "نوع الملف غير صالح. الرجاء اختيار صورة (jpeg, png, gif, webp).",
    uploadError: "خطأ في تحميل الصورة. يرجى المحاولة مرة أخرى.",
    imageRemoved: "تمت إزالة الصورة الشخصية.",
  }
};

const generateDummyEmailFromPhone = (phone: string | null | undefined) => {
  if (!phone) return `unknown-user@auth.local`;
  return `user-${phone}@auth.local`;
}


export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const t = translations[locale] || translations.en;

  const commonPasswordSchema = z.string().min(6, { message: t.passwordMin });

  const editProfileFormSchema = z.object({
    name: z.string().min(2, { message: t.nameMin }).max(50, { message: t.nameMax }),
    imageUrl: z.string().optional().or(z.literal('')),
    age: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number().positive({ message: t.ageMin }).max(120, { message: t.ageMax }).optional()
    ),
    phoneNumber: z.string()
      .min(11, { message: t.phoneInvalidPrefixOrLength })
      .max(11, { message: t.phoneInvalidPrefixOrLength })
      .regex(/^(010|011|012|015)\d{8}$/, { message: t.phoneInvalidPrefixOrLength })
      .or(z.literal('')),
  });

  const updatePasswordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: t.passwordPlaceholder }),
    newPassword: commonPasswordSchema,
    confirmNewPassword: commonPasswordSchema,
  }).refine(data => data.newPassword === data.confirmNewPassword, {
    message: t.confirmPasswordMatch,
    path: ["confirmNewPassword"],
  });


  type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;
  type UpdatePasswordFormValues = z.infer<typeof updatePasswordFormSchema>;

  const editProfileForm = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: { name: "", imageUrl: "", age: undefined, phoneNumber: "" },
  });

  const updatePasswordForm = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          let fetchedData: UserProfileData;

          if (docSnap.exists()) {
            fetchedData = docSnap.data() as UserProfileData;
             if (!fetchedData.email || fetchedData.email !== (user.email || generateDummyEmailFromPhone(fetchedData.phoneNumber))) {
                fetchedData.email = user.email || generateDummyEmailFromPhone(fetchedData.phoneNumber);
            }
          } else {
             const derivedPhoneNumber = user.email?.startsWith('user-') && user.email.includes('@auth.local')
                                      ? user.email.substring(5, user.email.indexOf('@auth.local'))
                                      : null;
            fetchedData = {
                name: user.displayName || null,
                email: user.email || generateDummyEmailFromPhone(derivedPhoneNumber),
                imageUrl: user.photoURL || null,
                age: null,
                phoneNumber: derivedPhoneNumber,
            };
            await upsertUserData(user.uid, {
                name: fetchedData.name,
                email: fetchedData.email,
                // imageUrl: fetchedData.imageUrl, // Do not pass imageUrl here to prevent overwriting with null
                age: fetchedData.age,
                phoneNumber: fetchedData.phoneNumber,
                isAnonymous: false,
            });
          }
          setUserProfile(fetchedData);
          editProfileForm.reset({
            name: fetchedData.name || "",
            imageUrl: fetchedData.imageUrl || "",
            age: fetchedData.age === null ? undefined : fetchedData.age,
            phoneNumber: fetchedData.phoneNumber || "",
          });

        } catch (e) {
          console.error("Error fetching/setting user profile:", e);
          setError(t.errorFetchingProfile);
          toast({ variant: "destructive", title: t.errorFetchingProfile, description: e instanceof Error ? e.message : String(e) });
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        toast({ title: t.userNotAuthenticated, variant: "destructive" });
        router.push(`/${locale}/auth`);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, locale, t, editProfileForm, toast]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 0.5 * 1024 * 1024) { // Max 500KB
        toast({ variant: "destructive", title: t.uploadError, description: t.fileTooLarge });
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({ variant: "destructive", title: t.uploadError, description: t.invalidFileType });
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        editProfileForm.setValue('imageUrl', reader.result as string, { shouldValidate: true, shouldDirty: true });
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: t.uploadError, description: "Could not read file." });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    editProfileForm.setValue('imageUrl', '', { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    toast({ title: t.imageRemoved });
  };

  const handleEditProfileSubmit = async (values: EditProfileFormValues) => {
    if (!currentUser || !userProfile) return;
    try {
      const dataToUpdate: Partial<UserProfileData> & { isAnonymous?: boolean } = {
        name: values.name,
        imageUrl: values.imageUrl || null,
        age: values.age !== undefined ? Number(values.age) : null,
        isAnonymous: false,
      };

      // Pass existing email and phone number to upsertUserData for context,
      // especially if its internal logic might need them for a complete record.
      // These fields are not directly editable in this form but are part of the UserProfileData structure.
      await upsertUserData(currentUser.uid, {
        ...dataToUpdate,
        email: userProfile.email, // Current email from state
        phoneNumber: userProfile.phoneNumber, // Current phone from state
      });

      setUserProfile(prev => {
        if (!prev) return null;
        // Create a new object for state update to ensure React detects the change
        const updatedProfile = {
            ...prev,
            name: dataToUpdate.name !== undefined ? dataToUpdate.name : prev.name,
            imageUrl: dataToUpdate.imageUrl !== undefined ? dataToUpdate.imageUrl : prev.imageUrl,
            age: dataToUpdate.age !== undefined ? dataToUpdate.age : prev.age,
        };
        return updatedProfile;
      });
      toast({ title: t.profileUpdatedSuccess });
      setIsEditing(false);
      editProfileForm.reset(values); // Reset form with submitted values to clear dirty state
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: t.profileUpdatedError, description: error instanceof Error ? error.message : String(error), variant: "destructive" });
    }
  };

  const handlePasswordUpdate = async (values: UpdatePasswordFormValues) => {
    if (!currentUser || !userProfile?.email) {
        toast({ title: t.passwordUpdateError, description: "User or user email not found.", variant: "destructive" });
        return;
    }
    try {
        await reauthenticateUser(currentUser, userProfile.email, values.currentPassword);
        await updateUserPassword(currentUser, values.newPassword);
        toast({ title: t.passwordUpdateSuccess });
        updatePasswordForm.reset();
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmNewPassword(false);
    } catch (error: any) {
        console.error("Error updating password:", error);
        if (error.code === 'auth/wrong-password' || error.message.includes("INVALID_LOGIN_CREDENTIALS") || error.message.includes("auth/invalid-credential")) {
            updatePasswordForm.setError("currentPassword", { type: "manual", message: t.reauthError });
            toast({ title: t.reauthError, variant: "destructive" });
        } else {
            toast({ title: t.passwordUpdateError, description: error.message || t.genericError, variant: "destructive" });
        }
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: t.logoutSuccess });
      // Clear local state as well
      setCurrentUser(null);
      setUserProfile(null);
      editProfileForm.reset({ name: "", imageUrl: "", age: undefined, phoneNumber: "" });
      updatePasswordForm.reset({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      router.push(`/${locale}/auth`);
    } catch (error) {
      console.error("Error logging out:", error);
      toast({ title: t.logoutError, description: error instanceof Error ? error.message : String(error), variant: "destructive" });
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size={48} /> <p className="ms-4 text-lg">{t.loading}</p>
      </div>
    );
  }
  if (error && !userProfile) {
    return (
      <div className="container mx-auto py-12 px-4 text-center text-destructive">
        <p>{error}</p>
        <Button onClick={() => router.push(`/${locale}/auth`)} className="mt-4">
          {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
        </Button>
      </div>
    );
  }
  if (!currentUser || !userProfile) {
    // This case should ideally be handled by the onAuthStateChanged listener redirecting.
    // If somehow reached, show loading or a message.
    return (<div className="flex justify-center items-center min-h-screen"><p>{t.loading}</p></div>);
  }

  const displayImageUrl = editProfileForm.watch('imageUrl') || userProfile.imageUrl;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        {displayImageUrl ? (
            <Image
              src={displayImageUrl} alt={t.profilePicture} width={128} height={128}
              className="rounded-full object-cover border-4 border-accent mx-auto mb-4"
              data-ai-hint="user profile picture"
              onError={(e: FormEvent<HTMLImageElement>) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/128x128.png';
                (e.target as HTMLImageElement).alt = 'Placeholder User Image';
              }}
            />
        ) : (
            <UserCircle className="h-32 w-32 text-primary mx-auto mb-4" />
        )}
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{editProfileForm.watch('name') || userProfile.name || t.noName}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{userProfile.phoneNumber || t.noPhoneNumber}</p>
      </div>

      <Card className="shadow-lg max-w-2xl mx-auto mb-8">
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-2xl">{t.personalInfo}</CardTitle>
                {!isEditing && (
                    <Button onClick={() => {
                        editProfileForm.reset({ // Ensure form is reset with current profile data before editing
                            name: userProfile.name || "",
                            imageUrl: userProfile.imageUrl || "",
                            age: userProfile.age === null ? undefined : userProfile.age,
                            phoneNumber: userProfile.phoneNumber || "",
                        });
                        setIsEditing(true);
                    }} variant="outline" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Edit3 className="h-4 w-4 me-2" />{t.editProfile}
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <Form {...editProfileForm}>
              <form onSubmit={editProfileForm.handleSubmit(handleEditProfileSubmit)} className="space-y-6">
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
                  control={editProfileForm.control} name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Phone className="me-2 h-4 w-4 text-muted-foreground" />{t.phoneNumber}</FormLabel>
                      <FormControl><Input type="tel" placeholder={userProfile.phoneNumber || t.phonePlaceholder} value={userProfile.phoneNumber || ""} readOnly className="bg-muted/50 cursor-not-allowed" /></FormControl>
                       <FormDescription>{locale === 'ar' ? 'لا يمكن تغيير رقم الهاتف من هنا لأنه المعرف الرئيسي للحساب.' : 'Phone number cannot be changed as it is the main account identifier.'}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel className="flex items-center"><ImageIcon className="me-2 h-4 w-4 text-muted-foreground" />{t.changeProfilePicture}</FormLabel>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-grow sm:flex-grow-0"
                    >
                      <ImagePlus className="me-2 h-4 w-4" />
                      {t.uploadFromGallery}
                    </Button>
                    {(editProfileForm.watch('imageUrl') || userProfile.imageUrl) && ( // Show delete if form has image or profile has image
                       <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={handleDeleteImage}
                        aria-label={t.deletePicture}
                        title={t.deletePicture}
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    )}
                    <Input
                      id="profileImageUpload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  {editProfileForm.watch('imageUrl') && typeof editProfileForm.watch('imageUrl') === 'string' && (editProfileForm.watch('imageUrl') as string).startsWith('data:image') && (
                    <div className="mt-2 text-xs text-muted-foreground truncate">
                       {locale === 'ar' ? 'تم اختيار صورة للمعالجة. ' : 'Image selected for processing. '}
                    </div>
                  )}
                   <FormField
                      control={editProfileForm.control} name="imageUrl"
                      render={() => <FormMessage />}
                    />
                  <FormDescription>{t.imageUrlDesc}</FormDescription>
                </FormItem>

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
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={editProfileForm.formState.isSubmitting || !editProfileForm.formState.isDirty}>
                    {editProfileForm.formState.isSubmitting ? <LoadingSpinner size={20} className="me-2"/> : <Save className="h-5 w-5 me-2" /> }
                    {t.saveChanges}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => {
                    setIsEditing(false);
                    // Reset form to original userProfile data
                    editProfileForm.reset({
                        name: userProfile.name || "",
                        imageUrl: userProfile.imageUrl || "",
                        age: userProfile.age === null ? undefined : userProfile.age,
                        phoneNumber: userProfile.phoneNumber || "",
                    });
                     if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input on cancel
                  }}>
                    <X className="h-5 w-5 me-2" />{t.cancel}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <>
              <div className="flex items-center text-foreground">
                <UserCircle className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-3' : 'me-3'}`} />
                <span className='font-medium'>{t.name}:</span>
                <span className={`${locale === 'ar' ? 'me-2' : 'ms-2'}`}>{userProfile.name || t.noName}</span>
              </div>
               <div className="flex items-center text-foreground">
                <Phone className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-3' : 'me-3'}`} />
                 <span className='font-medium'>{t.phoneNumber}:</span>
                <span className={`${locale === 'ar' ? 'me-2' : 'ms-2'}`}>{userProfile.phoneNumber || t.noPhoneNumber}</span>
              </div>
              <div className="flex items-center text-foreground">
                <Cake className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-3' : 'me-3'}`} />
                <span className='font-medium'>{t.age}:</span>
                <span className={`${locale === 'ar' ? 'me-2' : 'ms-2'}`}>{userProfile.age ? `${userProfile.age} ${locale === 'ar' ? 'سنة' : 'years old'}` : t.noAge}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t.passwordSettings}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...updatePasswordForm}>
            <form onSubmit={updatePasswordForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
              <FormField
                control={updatePasswordForm.control} name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><KeyRound className="me-2 h-4 w-4 text-muted-foreground" />{t.currentPassword}</FormLabel>
                    <div className="relative">
                      <FormControl><Input type={showCurrentPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} {...field} /></FormControl>
                      <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updatePasswordForm.control} name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><KeyRound className="me-2 h-4 w-4 text-muted-foreground" />{t.newPassword}</FormLabel>
                     <div className="relative">
                      <FormControl><Input type={showNewPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} {...field} /></FormControl>
                       <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updatePasswordForm.control} name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><ShieldCheck className="me-2 h-4 w-4 text-muted-foreground" />{t.confirmNewPassword}</FormLabel>
                    <div className="relative">
                      <FormControl><Input type={showConfirmNewPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} {...field} /></FormControl>
                       <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                        {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={updatePasswordForm.formState.isSubmitting}>
                {updatePasswordForm.formState.isSubmitting ? <LoadingSpinner size={20} className="me-2" /> : <Save className="h-5 w-5 me-2" />}
                {t.updatePasswordButton}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-12 text-center">
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full max-w-xs mx-auto"
          disabled={isLoading && !currentUser} // Disable if still initial loading and no user yet
        >
          <LogOut className="h-5 w-5 me-2" />
          {t.logoutButton}
        </Button>
      </div>
    </div>
  );
}

