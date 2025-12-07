import z from "zod/v3";

const isEarlierTime = (start: string, end: string) => {
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  return sH < eH || (sH === eH && sM < eM);
};

export const restaurantSchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters"),

  address: z.object({
    line1: z.string().min(3),
    line2: z.string().min(3),
    line3: z.string().optional().or(z.literal("")),
    zip: z
      .string()
      .regex(/^[0-9]{6}$/, "ZIP code must be 6 digits"),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
  }),

  ownerName: z.string().min(2),

  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),

  restaurantEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),

  websiteURL: z.string().url().optional().or(z.literal("")),

  socialMedia: z
    .object({
      facebook: z.string().trim().optional(),
      twitter: z.string().trim().optional(),
      instagram: z.string().trim().optional(),
    })
    .optional(),

  openingHours: z.object({
    weekday: z
      .object({
        start: z.string().min(1),
        end: z.string().min(1),
      })
      .refine((d) => isEarlierTime(d.start, d.end), {
        message: "Weekday opening must be earlier",
        path: ["end"],
      }),

    weekend: z
      .object({
        start: z.string().min(1),
        end: z.string().min(1),
      })
      .refine((d) => isEarlierTime(d.start, d.end), {
        message: "Weekend opening must be earlier",
        path: ["end"],
      }),
  }),

  logoURL: z.string().url().optional().or(z.literal("")),
  bannerURL: z.string().url().optional().or(z.literal("")),

  about: z.string().min(10).optional().or(z.literal("")),
  since: z.number().int().optional(),
  slogan: z.string().min(5).optional().or(z.literal("")),

  bankAccount: z.object({
    name: z.string().min(2),
    number: z.string().min(5),
    IFSC: z.string().min(5),
  }),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;
