'use client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Building2,
  MapPin,
  Clock,
  ImageIcon,
  CreditCard,
  CheckCircle,
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
import { PremiumImageUpload } from '@/components/image-upload';
import { ProgressIndicator } from '@/components/progress-indicator';
import { Toast } from '@/components/Toast';

import { backend } from '@/config/backend';
import { useRestaurantData } from '@/store/restaurant';
import {
  restaurantSchema,
  type RestaurantFormData,
} from '@/lib/restaurant-schema';


// ---------------------------
// Step Definitions
// ---------------------------
const STEPS = [
  { number: 1, label: 'Basic Info', icon: '🏠' },
  { number: 2, label: 'Address', icon: '📍' },
  { number: 3, label: 'Hours & Contact', icon: '🕓' },
  { number: 4, label: 'Branding', icon: '🖼' },
  { number: 5, label: 'Bank Details', icon: '💳' },
];


// ---------------------------
// Component
// ---------------------------
export function MultiStepRestaurantForm(): React.ReactElement {
  const router = useRouter();
  const { setRestaurant } = useRestaurantData();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  function normalizeUrlForServer(value?: string | null): string | undefined {
    if (!value) return undefined;
    const v = value.trim();
    if (v === '') return undefined;
    // If user typed "facebook.com/abc" or "www.site.com", prefix https://
    if (!/^https?:\/\//i.test(v)) return `https://${v}`;
    return v;
  }
  

  // ---------------------------
  // React Hook Form
  // ---------------------------
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


  
  const stepFieldMap: Record<number, (keyof RestaurantFormData)[]> = {
    1: ['restaurantName', 'ownerName', 'since', 'slogan', 'about'],
    2: ['address'],
    3: ['phoneNumber', 'restaurantEmail', 'websiteURL', 'openingHours'],
    4: ['logoURL', 'bannerURL', 'socialMedia'],
    5: ['bankAccount'],
  };


  // ---------------------------
  // Step Change Handler
  // ---------------------------
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


  // ---------------------------
  // Submission Handler
  // ---------------------------
  const onSubmit = async (fData: RestaurantFormData) => {
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      const formatTime = (time: string) =>
        `${today}T${time}:00`;

      const formattedOpeningHours = {
        weekday: {
          start: formatTime(fData.openingHours.weekday.start),
          end: formatTime(fData.openingHours.weekday.end),
        },
        weekend: {
          start: formatTime(fData.openingHours.weekend.start),
          end: formatTime(fData.openingHours.weekend.end),
        },
      };

      const formattedData: RestaurantFormData = {
        ...fData,
        openingHours: formattedOpeningHours,
        websiteURL: normalizeUrlForServer(fData.websiteURL),
  socialMedia: {
    facebook: normalizeUrlForServer(fData.socialMedia?.facebook),
    twitter: normalizeUrlForServer(fData.socialMedia?.twitter),
    instagram: normalizeUrlForServer(fData.socialMedia?.instagram),
  },
      };

      const { data } = await backend.post('/api/v1/restaurants/add-restaurant', formattedData);

      if (data.success) {
        setRestaurant(data.restaurantID);
        setShowSuccessModal(true);

        setTimeout(() => {
          setShowSuccessModal(false);
          router.replace('/restaurant/dashboard');
        }, 1200);
      } else {
        Toast.error('Error', { description: data.message || 'Failed to create restaurant.' });
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      Toast.error('Error', {
        description: err.response?.data?.message || err.message || 'An unknown error occurred.',
      });
      setCurrentStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };


  // ---------------------------
  // JSX
  // ---------------------------
  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <ProgressIndicator steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} />

      <Card className="shadow-lg border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 p-6 sm:p-8">

            {/* ---------------- STEP 1 ---------------- */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Building2 /> Basic Information
                </h2>

                <FormField
                  control={form.control}
                  name="restaurantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="The Golden Fork" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="since"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Since Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2020"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slogan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slogan *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your motto here..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Restaurant</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about your restaurant..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ---------------- STEP 2 ---------------- */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <MapPin /> Address
                </h2>

                <FormField
                  control={form.control}
                  name="address.line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1 *</FormLabel>
                      <FormControl>
                        <Input placeholder="Road / Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 *</FormLabel>
                      <FormControl>
                        <Input placeholder="Building / Area" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.line3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional detail" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="ZIP" maxLength={6} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* ---------------- STEP 3 ---------------- */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Clock /> Hours & Contact
                </h2>

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="restaurantEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="websiteURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="Website URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Opening Hours */}
                <div className="bg-muted border border-border rounded-lg p-4 space-y-6">
                  <div>
                    <p className="font-semibold">Weekday</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="openingHours.weekday.start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opening *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="openingHours.weekday.end"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Closing *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold">Weekend</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="openingHours.weekend.start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opening *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="openingHours.weekend.end"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Closing *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- STEP 4 ---------------- */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <ImageIcon /> Branding
                </h2>

                <FormField
                  control={form.control}
                  name="logoURL"
                  render={({ field }) => (
                    <FormItem>
                      <PremiumImageUpload
                        label="Restaurant Logo"
                        onImageUpload={field.onChange}
                        value={field.value}
                        preset="logo"
                        required={false}
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bannerURL"
                  render={({ field }) => (
                    <FormItem>
                      <PremiumImageUpload
                        label="Banner"
                        onImageUpload={field.onChange}
                        value={field.value}
                        preset="banner"
                        required
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <h3 className="font-semibold mt-6">Social Media</h3>

                <FormField
                  control={form.control}
                  name="socialMedia.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="Facebook URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMedia.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="Twitter URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMedia.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="Instagram URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ---------------- STEP 5 ---------------- */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <CreditCard /> Bank Details
                </h2>

                <FormField
                  control={form.control}
                  name="bankAccount.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccount.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccount.IFSC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., HDFC0001234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ---------------- NAVIGATION BUTTONS ---------------- */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-8 border-t border-border">
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => handleStepChange(currentStep - 1)}
                className="w-full sm:w-auto"
              >
                Previous
              </Button>

              {currentStep <=5 ? (
                <Button
                  type="button"
                  onClick={() => handleStepChange(currentStep + 1)}
                  className="w-full sm:w-auto"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Card>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-center text-2xl font-bold text-foreground">
              Restaurant Created!
            </h2>
            <p className="text-center text-muted-foreground">
              Redirecting to dashboard...
            </p>
            <Button onClick={() => router.push('/restaurant/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
