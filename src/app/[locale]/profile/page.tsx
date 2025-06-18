
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { auth, db, upsertUserData } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth'; // Removed updatePassword

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardFooter
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Cake, Phone, Save, Edit3, Image as ImageIcon, CalendarDays, X, LogOut, Mail } from 'lucide-react'; // Removed ShieldCheck, Eye, EyeOff
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
    email: "Email Address",
    age: "Age",
    agePlaceholder: "e.g., 30",
    phoneNumber: "Phone Number",
    phonePlaceholder: "01xxxxxxxxx (Optional)",
    profilePicture: "Profile Picture",
    imageUrl: "Image URL (Optional)",
    imageUrlPlaceholder: "https://example.com/your-image.png",
    imageUrlDesc: "Link to your profile picture.",
    noName: "Not Provided",
    noAge: "Not Provided",
    noPhoneNumber: "Not Provided",
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
    phoneInvalidPrefixOrLength: "Phone number must be 11 digits and start with 010, 011, 012, or 015 if provided.",
    // phoneRequired: "Phone number is required.", // Phone is now optional
    genericError: "An unexpected error occurred. Please try again.",
    logoutButton: "Log Out",
    logoutSuccess: "Logged Out Successfully",
    logoutError: "Failed to Log Out",
    emailNonEditable: "Your email is linked to your Google account and cannot be changed here.",
  },
  ar: {
    pageTitle: "ملفك الشخصي",
    pageDescription: "عرض وإدارة تفاصيلك الشخصية وإعدادات حسابك.",
    personalInfo: "المعلومات الشخصية",
    name: "الاسم الكامل",
    namePlaceholder: "مثال: جون دو",
    email: "البريد الإلكتروني",
    age: "العمر",
    agePlaceholder: "مثال: 30",
    phoneNumber: "رقم الهاتف",
    phonePlaceholder: "01xxxxxxxxx (اختياري)",
    profilePicture: "الصورة الشخصية",
    imageUrl: "رابط الصورة (اختياري)",
    imageUrlPlaceholder: "https://example.com/your-image.png",
    imageUrlDesc: "رابط لصورة ملفك الشخصي.",
    noName: "غير متوفر",
    noAge: "غير متوفر",
    noPhoneNumber: "غير متوفر",
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
    phoneInvalidPrefixOrLength: "إذا تم توفيره، يجب أن يتكون رقم الهاتف من 11 رقمًا وأن يبدأ بـ 010 أو 011 أو 012 أو 015.",
    // phoneRequired: "رقم الهاتف مطلوب.",
    genericError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    logoutButton: "تسجيل الخروج",
    logoutSuccess: "تم تسجيل الخروج بنجاح",
    logoutError: "فشل تسجيل الخروج",
    emailNonEditable: "بريدك الإلكتروني مرتبط بحساب جوجل الخاص بك ولا يمكن تغييره هنا.",
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

  const t = translations[locale] || translations.en;

  const editProfileFormSchema = z.object({
    name: z.string().min(2, { message: t.nameMin }).max(50, { message: t.nameMax }),
    email: z.string().email().optional(), // Email will be read-only, but schema needs it
    imageUrl: z.string().url({ message: t.imageUrlDesc }).optional().or(z.literal('')),
    age: z.preprocess(
      (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
      z.number().positive({ message: t.ageMin }).max(120, { message: t.ageMax }).optional()
    ),
    phoneNumber: z.string()
      .optional()
      .or(z.literal(''))
      .refine(val => !val || /^(010|011|012|015)\d{8}$/.test(val), { message: t.phoneInvalidPrefixOrLength }),
  });
  type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

  const editProfileForm = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      imageUrl: "",
      age: undefined,
      phoneNumber: "",
    },
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
          } else {
            // If no data in Firestore, use data from Google Auth user object
            // This can happen if user signed up but Firestore write failed or is delayed
            fetchedData = { 
                name: user.displayName, 
                email: user.email,
                imageUrl: user.photoURL, 
                age: null, 
                phoneNumber: user.phoneNumber || null,
            };
             // Attempt to save this initial data to Firestore
            await upsertUserData(user.uid, fetchedData);
          }
          setUserProfile(fetchedData);
          editProfileForm.reset({
            name: fetchedData.name || user.displayName || "",
            email: fetchedData.email || user.email || "", // Email for display
            imageUrl: fetchedData.imageUrl || user.photoURL || "",
            age: fetchedData.age === null ? undefined : fetchedData.age,
            phoneNumber: fetchedData.phoneNumber || "",
          });

        } catch (e) {
          console.error("Error fetching/setting user profile:", e);
          setError(t.errorFetchingProfile);
          toast({ variant: "destructive", title: t.errorFetchingProfile, description: e instanceof Error ? e.message : String(e) });
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


  const handleEditProfileSubmit = async (values: EditProfileFormValues) => {
    if (!currentUser || !userProfile) return;
    try {
      // Email is not updated from here as it's tied to Google Auth
      const dataToUpdate: Partial<UserProfileData> = {
        name: values.name,
        imageUrl: values.imageUrl || null,
        age: values.age !== undefined ? Number(values.age) : null,
        phoneNumber: values.phoneNumber || null,
        email: userProfile.email, // Keep existing email from auth/profile
      };

      await upsertUserData(currentUser.uid, dataToUpdate);
      
      setUserProfile(prev => prev ? { ...prev, ...dataToUpdate } : null);
      toast({ title: t.profileUpdatedSuccess });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: t.profileUpdatedError, description: error instanceof Error ? error.message : String(error), variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: t.logoutSuccess });
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
  if (error && !userProfile) { // Only show full error if profile truly fails to load
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
     // This case should ideally be caught by the onAuthStateChanged redirect
    return (<div className="container mx-auto py-12 px-4 text-center"><p>{t.userNotAuthenticated}</p></div>);
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        {userProfile.imageUrl ? (
            <Image
              src={userProfile.imageUrl} alt={t.profilePicture} width={128} height={128}
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
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{userProfile.name || t.noName}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{userProfile.email || t.noEmail}</p>
      </div>

      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-2xl">{t.personalInfo}</CardTitle>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
                  control={editProfileForm.control} name="email" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Mail className="me-2 h-4 w-4 text-muted-foreground" />{t.email}</FormLabel>
                      <FormControl><Input placeholder={userProfile.email || t.noEmail} {...field} readOnly className="bg-muted/50 cursor-not-allowed" /></FormControl>
                      <FormDescription>{t.emailNonEditable}</FormDescription>
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
                    editProfileForm.reset({ // Reset to current profile state
                        name: userProfile.name || currentUser.displayName || "",
                        email: userProfile.email || currentUser.email || "",
                        imageUrl: userProfile.imageUrl || currentUser.photoURL || "",
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
              <div className="flex items-center text-foreground">
                <UserCircle className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-3' : 'me-3'}`} />
                <span className='font-medium'>{t.name}:</span>
                <span className={`${locale === 'ar' ? 'me-2' : 'ms-2'}`}>{userProfile.name || t.noName}</span>
              </div>
               <div className="flex items-center text-foreground">
                <Mail className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-3' : 'me-3'}`} />
                 <span className='font-medium'>{t.email}:</span>
                <span className={`${locale === 'ar' ? 'me-2' : 'ms-2'}`}>{userProfile.email || t.noEmail}</span>
              </div>
              <div className="flex items-center text-foreground">
                <Cake className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-3' : 'me-3'}`} />
                <span className='font-medium'>{t.age}:</span>
                <span className={`${locale === 'ar' ? 'me-2' : 'ms-2'}`}>{userProfile.age ? `${userProfile.age} ${locale === 'ar' ? 'سنة' : 'years old'}` : t.noAge}</span>
              </div>
              <div className="flex items-center text-foreground">
                <Phone className={`h-5 w-5 text-accent ${locale === 'ar' ? 'ms-3' : 'me-3'}`} />
                <span className='font-medium'>{t.phoneNumber}:</span>
                <span className={`${locale === 'ar' ? 'me-2' : 'ms-2'}`}>{userProfile.phoneNumber || t.noPhoneNumber}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-12 text-center">
        <Button 
          variant="destructive" 
          onClick={handleLogout}
          className="w-full max-w-xs mx-auto"
          disabled={isLoading}
        >
          <LogOut className="h-5 w-5 me-2" />
          {t.logoutButton}
        </Button>
      </div>
    </div>
  );
}
