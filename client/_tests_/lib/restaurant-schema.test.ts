import { restaurantSchema } from '@/lib/restaurant-schema';

describe('restaurant-schema', () => {
  const base = {
    restaurantName: 'My Resto',
    address: {
      line1: '123 Main',
      line2: 'Suite 1',
      line3: '',
      zip: '123456',
      city: 'City',
      state: 'ST',
      country: 'Country',
    },
    ownerName: 'Owner',
    phoneNumber: '0123456789',
    restaurantEmail: 'email@example.com',
    websiteURL: '',
    socialMedia: { facebook: '', twitter: '', instagram: '' },
    openingHours: {
      weekday: { start: '09:00', end: '18:00' },
      weekend: { start: '10:00', end: '16:00' },
    },
    logoURL: '',
    bannerURL: '',
    about: 'A wonderful place',
    since: 2020,
    slogan: 'Good Food',
    bankAccount: { name: 'Bank', number: '12345', IFSC: 'IFSC1' },
  };

  test('valid schema passes', () => {
    const res = restaurantSchema.safeParse(base);
    expect(res.success).toBe(true);
  });

  test('invalid zip fails', () => {
    const res = restaurantSchema.safeParse({ ...base, address: { ...base.address, zip: '123' } });
    expect(res.success).toBe(false);
  });

  test('invalid phone fails', () => {
    const res = restaurantSchema.safeParse({ ...base, phoneNumber: '123' });
    expect(res.success).toBe(false);
  });

  test('invalid email fails', () => {
    const res = restaurantSchema.safeParse({ ...base, restaurantEmail: 'not-an-email' });
    expect(res.success).toBe(false);
  });

  test('weekday end before start fails with message', () => {
    const bad = { ...base, openingHours: { ...base.openingHours, weekday: { start: '18:00', end: '09:00' } } };
    const res = restaurantSchema.safeParse(bad);
    expect(res.success).toBe(false);
    if (!res.success) {
      const msg = res.error.issues.map(i => i.message).join(' ');
      expect(msg).toMatch(/Weekday opening must be earlier/);
    }
  });

  test('weekend end before start fails', () => {
    const bad = { ...base, openingHours: { ...base.openingHours, weekend: { start: '20:00', end: '07:00' } } };
    const res = restaurantSchema.safeParse(bad);
    expect(res.success).toBe(false);
  });

  test('same-hour range allowed when minutes increase', () => {
    const good = {
      ...base,
      openingHours: {
        weekday: { start: '09:15', end: '09:45' },
        weekend: base.openingHours.weekend,
      },
    };
    const res = restaurantSchema.safeParse(good);
    expect(res.success).toBe(true);
  });
});
