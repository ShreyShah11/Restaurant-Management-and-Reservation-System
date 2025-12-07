'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm, type FieldPath } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
  
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  MapPin,
  Clock,
  ImageIcon,
  CheckCircle,
  Loader,
  CreditCard,
} from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ProgressIndicator } from '@/components/progress-indicator';
import { PremiumImageUpload } from '@/components/image-upload';
import { restaurantSchema, type RestaurantFormData } from '@/lib/restaurant-schema';
import { backend } from '@/config/backend';

const STEPS = [
  { number: 1, label: 'Basic Info', icon: '🏠' },
  { number: 2, label: 'Address', icon: '📍' },
  { number: 3, label: 'Hours & Contact', icon: '🕓' },
  { number: 4, label: 'Branding', icon: '🖼️' },
  { number: 5, label: 'Bank Details', icon: '💳' },
];

function cleanOptionalUrl(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const t = value.trim();
  return t === '' ? undefined : t;
}

export default function MultiStepRestaurantFormEdit(): React.ReactElement {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);


  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    mode: 'onChange',
    defaultValues: {
      restaurantName: '',
      ownerName: '',
      phoneNumber: '',
      restaurantEmail: '',
      websiteURL: '',
      socialMedia: {
        facebook: '',
        twitter: '',
        instagram: '',
      },
      address: {
        line1: '',
        line2: '',
        line3: '',
        city: '',
        state: '',
        country: '',
        zip: '',
      },
      openingHours: {
        weekday: { start: '09:00', end: '22:00' },
        weekend: { start: '10:00', end: '23:00' },
      },
      logoURL: '',
      bannerURL: '',
      about: '',
      since: new Date().getFullYear(),
      slogan: '',
      bankAccount: {
        name: '',
        number: '',
        IFSC: '',
      },
    },
  });

  const stepFieldMap: Record<number, FieldPath<RestaurantFormData>[]> = {
    1: ['restaurantName', 'ownerName', 'since', 'slogan', 'about'],
    2: [
      'address.line1',
      'address.line2',
      'address.line3',
      'address.city',
      'address.state',
      'address.country',
      'address.zip',
    ],
    3: [
      'phoneNumber',
      'restaurantEmail',
      'websiteURL',
      'openingHours.weekday.start',
      'openingHours.weekday.end',
      'openingHours.weekend.start',
      'openingHours.weekend.end',
    ],
    4: ['logoURL', 'bannerURL', 'socialMedia.facebook', 'socialMedia.twitter', 'socialMedia.instagram'],
    5: ['bankAccount.name', 'bankAccount.number', 'bankAccount.IFSC'],
  };

  useEffect(() => {
    const fetchRestaurantData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const { data } = await backend.post('/api/v1/restaurants/get-restaurant-by-owner');

        if (!data || !data.success) {
          setLoadError('No restaurant found for the current owner.');
          return;
        }

        const restaurantData = data.restaurant as RestaurantFormData;

        const parseTime = (iso?: string): string => {
          if (!iso) return '09:00';
          const d = new Date(iso);
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          return `${hh}:${mm}`;
        };

        form.reset({
          restaurantName: restaurantData.restaurantName ?? '',
          ownerName: restaurantData.ownerName ?? '',
          phoneNumber: restaurantData.phoneNumber ?? '',
          restaurantEmail: restaurantData.restaurantEmail ?? '',
          websiteURL: restaurantData.websiteURL ?? '',
          socialMedia: {
            facebook: restaurantData.socialMedia?.facebook ?? '',
            twitter: restaurantData.socialMedia?.twitter ?? '',
            instagram: restaurantData.socialMedia?.instagram ?? '',
          },
          address: {
            line1: restaurantData.address?.line1 ?? '',
            line2: restaurantData.address?.line2 ?? '',
            line3: restaurantData.address?.line3 ?? '',
            city: restaurantData.address?.city ?? '',
            state: restaurantData.address?.state ?? '',
            country: restaurantData.address?.country ?? '',
            zip: restaurantData.address?.zip ?? '',
          },
          openingHours: {
            weekday: {
              start: parseTime(restaurantData.openingHours?.weekday?.start),
              end: parseTime(restaurantData.openingHours?.weekday?.end),
            },
            weekend: {
              start: parseTime(restaurantData.openingHours?.weekend?.start),
              end: parseTime(restaurantData.openingHours?.weekend?.end),
            },
          },
          logoURL: restaurantData.logoURL ?? '',
          bannerURL: restaurantData.bannerURL ?? '',
          about: restaurantData.about ?? '',
          since: restaurantData.since ?? new Date().getFullYear(),
          slogan: restaurantData.slogan ?? '',
          bankAccount: {
            name: restaurantData.bankAccount?.name ?? '',
            number: restaurantData.bankAccount?.number ?? '',
            IFSC: restaurantData.bankAccount?.IFSC ?? '',
          },
        });
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setLoadError('Failed to load restaurant details');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRestaurantData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStepChange = async (nextStep: number) => {
    // Backward navigation — no validation
    if (nextStep < currentStep) {
        setCurrentStep(nextStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // If moving to Step 5 (last step) — DO NOT validate Step 5
    if (nextStep === 5) {
        // Validate Step 4 before entering Step 5
        const ok = await form.trigger(stepFieldMap[currentStep]);
        if (!ok) return;

        setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // Normal validation for Steps 1 → 2 → 3 → 4
    const fieldsToValidate = stepFieldMap[currentStep];
    const ok = await form.trigger(fieldsToValidate);
    if (!ok) return;

    setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

  

  const onSubmit = async (fData: RestaurantFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const formattedOpeningHours = {
        weekday: {
          start: `${today}T${fData.openingHours.weekday.start}:00`,
          end: `${today}T${fData.openingHours.weekday.end}:00`,
        },
        weekend: {
          start: `${today}T${fData.openingHours.weekend.start}:00`,
          end: `${today}T${fData.openingHours.weekend.end}:00`,
        },
      };

      const payload = {
        ...fData,
        openingHours: formattedOpeningHours,
        websiteURL: cleanOptionalUrl(fData.websiteURL),
        socialMedia: {
          facebook: cleanOptionalUrl(fData.socialMedia?.facebook),
          twitter: cleanOptionalUrl(fData.socialMedia?.twitter),
          instagram: cleanOptionalUrl(fData.socialMedia?.instagram),
        },
      };

      await backend.post('/api/v1/restaurants/update-restaurant', payload);

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Update error:', err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? 'Failed to update restaurant');
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Unexpected error');
      }
      
      setCurrentStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessRedirect = (): void => {
    setShowSuccessModal(false);
    void router.push('/restaurant/dashboard');
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="p-6 sm:p-8 border-destructive/50 bg-destructive/5">
        <p className="text-destructive font-semibold">{loadError}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <ProgressIndicator steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} />

      <Card className="shadow-lg border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 p-6 sm:p-8">
            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  Basic Information
                </h2>

                <FormField control={form.control} name="restaurantName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Restaurant Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Golden Fork" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="ownerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Owner Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="since" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-semibold">Since Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2020"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value, 10) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="slogan" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-semibold">Slogan <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Your restaurant motto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="about" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">About Restaurant</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about your restaurant..." className="min-h-28 sm:min-h-32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                  Address Details
                </h2>

                <FormField control={form.control} name="address.line1" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Street Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="address.line2" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Building / Apt <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Building A, Suite 200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="address.line3" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Additional Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="District, Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="address.city" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-semibold">City <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="address.state" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-semibold">State <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="address.country" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-semibold">Country <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="address.zip" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-semibold">ZIP Code (6 digits) <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="100001" maxLength={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                  Hours & Contact
                </h2>

                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Phone Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="restaurantEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Restaurant Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@restaurant.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="websiteURL" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.restaurant.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="bg-muted border border-border rounded-lg p-4 sm:p-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Opening Hours <span className="text-destructive">*</span></h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Weekdays (Mon-Fri)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField control={form.control} name="openingHours.weekday.start" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Opening Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="openingHours.weekday.end" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Closing Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Weekends (Sat-Sun)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField control={form.control} name="openingHours.weekend.start" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Opening Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="openingHours.weekend.end" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Closing Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  Branding & Social Media
                </h2>

                <FormField control={form.control} name="logoURL" render={({ field }) => (
                  <FormItem>
                    <PremiumImageUpload label="Restaurant Logo" onImageUpload={field.onChange} value={field.value} required={false} preset="logo" />
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="bannerURL" render={({ field }) => (
                  <FormItem>
                    <PremiumImageUpload label="Banner Image" onImageUpload={field.onChange} value={field.value} required preset="banner" />
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="border-t border-border pt-4 sm:pt-6">
                  <h3 className="font-semibold text-foreground mb-4">Social Media Links (Optional)</h3>

                  <div className="space-y-4">
                    <FormField control={form.control} name="socialMedia.facebook" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/yourrestaurant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="socialMedia.twitter" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Twitter / X</FormLabel>
                        <FormControl>
                          <Input placeholder="https://twitter.com/yourrestaurant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="socialMedia.instagram" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/yourrestaurant" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 */}
            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                  Bank Account Details
                </h2>

                <FormField control={form.control} name="bankAccount.name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Account Holder Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="bankAccount.number" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Account Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123456789012" maxLength={24} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="bankAccount.IFSC" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">IFSC Code <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HDFC0001234" maxLength={11} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between pt-6 sm:pt-8 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleStepChange(currentStep - 1)}
                disabled={currentStep === 1}
                className="w-full sm:w-auto"
              >
                Previous
              </Button>

              {/* {currentStep <= 5 ? (
                <Button
                  type="button"
                  onClick={() => void handleStepChange(currentStep + 1)}
                  className="w-full sm:w-auto"
                >
                  Next Step
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              )} */}
              {/* If not step 5 → normal logic */}
{currentStep < 5 && (
  <Button
    type="button"
    onClick={() => void handleStepChange(currentStep + 1)}
    className="w-full sm:w-auto"
  >
    Next Step
  </Button>
)}

{/* Step 5 → show confirmation popup instead of next-step */}
{currentStep === 5 && (
  <Button
    type="button"
    onClick={() => setConfirmOpen(true)}
    className="w-full sm:w-auto"
  >
    Submit
  </Button>
)}

            </div>
          </form>
        </Form>
      </Card>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-primary animate-bounce" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Restaurant Updated!</h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Your restaurant details have been successfully updated.
              </p>
            </div>
            <Button onClick={handleSuccessRedirect} className="w-full mt-2">Go to Dashboard</Button>
          </Card>
        </div>
      )}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Confirm Update</DialogTitle>
      <DialogDescription>
        Are you sure you want to update your restaurant details?
        This action will overwrite existing information.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter className="flex justify-end gap-3 pt-4">
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(false)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>

      <Button
        className="w-full sm:w-auto"
        disabled={isSubmitting}
        onClick={() => {
          setConfirmOpen(false);
          void form.handleSubmit(onSubmit)();
        }}
      >
        {isSubmitting ? "Saving..." : "Confirm Submit"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
}
