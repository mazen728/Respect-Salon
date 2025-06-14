"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getMockUserProfile } from '@/lib/mockData';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { User, KeyRound, Bell, CreditCard, Save } from 'lucide-react';
import type { Locale } from "@/lib/types";

interface ProfilePageProps {
  params: { locale: Locale };
}

const translations = {
  en: {
    pageTitle: "Your Royal Profile",
    pageDescription: "Manage your personal details, preferences, and settings.",
    personalInfo: "Personal Information",
    personalInfoDesc: "Update your personal details here.",
    fullName: "Full Name",
    fullNamePlaceholder: "e.g., Valued Customer",
    emailAddress: "Email Address",
    emailPlaceholder: "customer@example.com",
    phoneNumber: "Phone Number",
    phonePlaceholder: "+1234567890",
    addressOptional: "Address (Optional)",
    addressPlaceholder: "123 Royal Palace, Capital City",
    passwordSettings: "Password Settings",
    passwordSettingsDesc: "Change your password. Leave blank if you don't want to change it.",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    notificationPrefs: "Notification Preferences",
    notificationPrefsDesc: "Manage how we contact you.",
    appointmentReminders: "Appointment Reminders",
    appointmentRemindersDesc: "Receive reminders for your upcoming appointments.",
    promotionsOffers: "Promotions & Offers",
    promotionsOffersDesc: "Get notified about new promotions and special offers.",
    serviceUpdates: "Service Updates",
    serviceUpdatesDesc: "Receive updates about new services or changes.",
    savedPayments: "Saved Payment Methods",
    savedPaymentsDesc: "Manage your saved payment methods (mock data).",
    endingIn: "ending in",
    expires: "Expires",
    remove: "Remove",
    noSavedPayments: "No saved payment methods.",
    addNewPayment: "Add New Payment Method",
    saveChanges: "Save Changes",
    profileUpdated: "Profile Updated",
    profileUpdatedDesc: "Your profile information has been saved successfully.",
    passwordsDontMatch: "Passwords don't match",
    nameMin: "Name must be at least 2 characters.",
    nameMax: "Name must be at most 50 characters.",
    invalidEmail: "Invalid email address.",
    phoneMin: "Phone number seems too short.",
    phoneMax: "Phone number seems too long.",
    passwordMin: "New password must be at least 8 characters.",
  },
  ar: {
    pageTitle: "ملفك الشخصي الملكي",
    pageDescription: "إدارة التفاصيل الشخصية والتفضيلات والإعدادات الخاصة بك.",
    personalInfo: "المعلومات الشخصية",
    personalInfoDesc: "قم بتحديث التفاصيل الشخصية الخاصة بك هنا.",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "مثال: عميل مميز",
    emailAddress: "عنوان البريد الإلكتروني",
    emailPlaceholder: "customer@example.com",
    phoneNumber: "رقم الهاتف",
    phonePlaceholder: "+1234567890",
    addressOptional: "العنوان (اختياري)",
    addressPlaceholder: "123 القصر الملكي، العاصمة",
    passwordSettings: "إعدادات كلمة المرور",
    passwordSettingsDesc: "قم بتغيير كلمة المرور الخاصة بك. اترك الحقل فارغًا إذا كنت لا ترغب في تغييرها.",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    notificationPrefs: "تفضيلات الإشعارات",
    notificationPrefsDesc: "إدارة كيفية اتصالنا بك.",
    appointmentReminders: "تذكيرات المواعيد",
    appointmentRemindersDesc: "استقبل تذكيرات لمواعيدك القادمة.",
    promotionsOffers: "العروض والتخفيضات",
    promotionsOffersDesc: "احصل على إشعارات حول العروض الجديدة والعروض الخاصة.",
    serviceUpdates: "تحديثات الخدمة",
    serviceUpdatesDesc: "استقبل تحديثات حول الخدمات الجديدة أو التغييرات.",
    savedPayments: "طرق الدفع المحفوظة",
    savedPaymentsDesc: "إدارة طرق الدفع المحفوظة (بيانات وهمية).",
    endingIn: "تنتهي بـ",
    expires: "تنتهي صلاحيتها في",
    remove: "إزالة",
    noSavedPayments: "لا توجد طرق دفع محفوظة.",
    addNewPayment: "إضافة طريقة دفع جديدة",
    saveChanges: "حفظ التغييرات",
    profileUpdated: "تم تحديث الملف الشخصي",
    profileUpdatedDesc: "تم حفظ معلومات ملفك الشخصي بنجاح.",
    passwordsDontMatch: "كلمات المرور غير متطابقة",
    nameMin: "يجب أن يتكون الاسم من حرفين على الأقل.",
    nameMax: "يجب ألا يتجاوز الاسم 50 حرفًا.",
    invalidEmail: "عنوان بريد إلكتروني غير صالح.",
    phoneMin: "رقم الهاتف يبدو قصيرًا جدًا.",
    phoneMax: "رقم الهاتف يبدو طويلًا جدًا.",
    passwordMin: "يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.",
  }
};


export default function ProfilePage({ params: { locale } }: ProfilePageProps) {
  const t = translations[locale];
  const mockUserProfile = getMockUserProfile(locale);

  const profileFormSchema = z.object({
    name: z.string().min(2, t.nameMin).max(50, t.nameMax),
    email: z.string().email(t.invalidEmail),
    phone: z.string().min(10, t.phoneMin).max(15, t.phoneMax),
    address: z.string().optional(),
    newPassword: z.string().min(8, t.passwordMin).optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
    notifications: z.object({
      appointments: z.boolean(),
      promotions: z.boolean(),
      serviceUpdates: z.boolean(),
    }),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: t.passwordsDontMatch,
    path: ["confirmPassword"],
  });
  
  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      ...mockUserProfile,
      newPassword: '',
      confirmPassword: '',
    },
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data); 
    toast({
      title: t.profileUpdated,
      description: t.profileUpdatedDesc,
    });
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <User className="h-12 w-12 text-accent mx-auto mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">{t.pageTitle}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.pageDescription}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><User className="me-2 h-6 w-6 text-accent" /> {t.personalInfo}</CardTitle>
              <CardDescription>{t.personalInfoDesc}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fullName}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.fullNamePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.emailAddress}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t.emailPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.phoneNumber}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.phonePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.addressOptional}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.addressPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><KeyRound className="me-2 h-6 w-6 text-accent" /> {t.passwordSettings}</CardTitle>
              <CardDescription>{t.passwordSettingsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.newPassword}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.confirmNewPassword}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><Bell className="me-2 h-6 w-6 text-accent" /> {t.notificationPrefs}</CardTitle>
              <CardDescription>{t.notificationPrefsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notifications.appointments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t.appointmentReminders}</FormLabel>
                      <FormDescription>{t.appointmentRemindersDesc}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifications.promotions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t.promotionsOffers}</FormLabel>
                      <FormDescription>{t.promotionsOffersDesc}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="notifications.serviceUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t.serviceUpdates}</FormLabel>
                      <FormDescription>{t.serviceUpdatesDesc}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><CreditCard className="me-2 h-6 w-6 text-accent" /> {t.savedPayments}</CardTitle>
              <CardDescription>{t.savedPaymentsDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {mockUserProfile.savedPaymentMethods.length > 0 ? (
                <ul className="space-y-3">
                  {mockUserProfile.savedPaymentMethods.map(method => (
                    <li key={method.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <span className="font-medium">{method.type}</span>
                        {method.last4 !== "N/A" && <span className="text-muted-foreground"> {t.endingIn} {method.last4}</span>}
                      </div>
                      <span className="text-sm text-muted-foreground">{t.expires} {method.expiry}</span>
                      <Button variant="outline" size="sm" disabled>{t.remove}</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{t.noSavedPayments}</p>
              )}
              <Button variant="outline" className="mt-4" disabled>{t.addNewPayment}</Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="me-2 h-5 w-5" /> {t.saveChanges}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
