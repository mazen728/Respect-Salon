"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { mockUserProfile } from '@/lib/mockData';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { User, KeyRound, Bell, CreditCard, Save } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be at most 50 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number seems too short.").max(15, "Phone number seems too long."),
  address: z.string().optional(),
  newPassword: z.string().min(8, "New password must be at least 8 characters.").optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  notifications: z.object({
    appointments: z.boolean(),
    promotions: z.boolean(),
    serviceUpdates: z.boolean(),
  }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
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
    console.log(data); // In a real app, this would call an API
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <User className="h-12 w-12 text-accent mx-auto mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-3">Your Royal Profile</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your personal details, preferences, and settings.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><User className="mr-2 h-6 w-6 text-accent" /> Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sultan Al-Nahyan" {...field} />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="sultan@example.com" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
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
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Royal Palace, Capital City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center"><KeyRound className="mr-2 h-6 w-6 text-accent" /> Password Settings</CardTitle>
              <CardDescription>Change your password. Leave blank if you don't want to change it.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
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
                    <FormLabel>Confirm New Password</FormLabel>
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
              <CardTitle className="font-headline text-2xl flex items-center"><Bell className="mr-2 h-6 w-6 text-accent" /> Notification Preferences</CardTitle>
              <CardDescription>Manage how we contact you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notifications.appointments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Appointment Reminders</FormLabel>
                      <FormDescription>Receive reminders for your upcoming appointments.</FormDescription>
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
                      <FormLabel className="text-base">Promotions & Offers</FormLabel>
                      <FormDescription>Get notified about new promotions and special offers.</FormDescription>
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
                      <FormLabel className="text-base">Service Updates</FormLabel>
                      <FormDescription>Receive updates about new services or changes.</FormDescription>
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
              <CardTitle className="font-headline text-2xl flex items-center"><CreditCard className="mr-2 h-6 w-6 text-accent" /> Saved Payment Methods</CardTitle>
              <CardDescription>Manage your saved payment methods (mock data).</CardDescription>
            </CardHeader>
            <CardContent>
              {mockUserProfile.savedPaymentMethods.length > 0 ? (
                <ul className="space-y-3">
                  {mockUserProfile.savedPaymentMethods.map(method => (
                    <li key={method.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <span className="font-medium">{method.type}</span>
                        {method.last4 !== "N/A" && <span className="text-muted-foreground"> ending in {method.last4}</span>}
                      </div>
                      <span className="text-sm text-muted-foreground">Expires {method.expiry}</span>
                      <Button variant="outline" size="sm" disabled>Remove</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No saved payment methods.</p>
              )}
              <Button variant="outline" className="mt-4" disabled>Add New Payment Method</Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="mr-2 h-5 w-5" /> Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
