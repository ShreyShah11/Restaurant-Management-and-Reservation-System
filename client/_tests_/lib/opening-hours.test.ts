import { isRestaurantOpen } from '@/lib/opening-hours';

describe('lib/opening-hours isRestaurantOpen', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  test('returns No hours set when any missing', () => {
    jest.setSystemTime(new Date('2023-07-10T12:00:00'));
    expect(isRestaurantOpen('', '18:00')).toEqual({ isOpenNow: false, reason: 'No hours set' });
    expect(isRestaurantOpen('09:00', '')).toEqual({ isOpenNow: false, reason: 'No hours set' });
  });

  test('weekday within hours is open', () => {
    jest.setSystemTime(new Date('2023-07-10T12:00:00')); // Monday
    const r = isRestaurantOpen('09:00', '18:00');
    expect(r.isOpenNow).toBe(true);
    expect(r.reason).toMatch(/Open Now/);
  });

  test('weekday outside hours is closed', () => {
    jest.setSystemTime(new Date('2023-07-10T07:59:00')); // Monday
    const r = isRestaurantOpen('09:00', '18:00');
    expect(r.isOpenNow).toBe(false);
    expect(r.reason).toMatch(/Closed/);
  });

  test('weekend uses weekend hours', () => {
    jest.setSystemTime(new Date('2023-07-09T12:00:00')); // Sunday
    const r = isRestaurantOpen('09:00', '18:00', '10:00', '16:00');
    expect(r.isOpenNow).toBe(true);
  });

  test('temporarily closed overrides open', () => {
    jest.setSystemTime(new Date('2023-07-10T12:00:00'));
    const r = isRestaurantOpen('09:00', '18:00', undefined, undefined, true);
    expect(r.isOpenNow).toBe(false);
    expect(r.reason).toMatch(/Temporarily Closed/);
  });

  test('accepts ISO time strings', () => {
    jest.setSystemTime(new Date('2023-07-10T12:00:00'));
    const r = isRestaurantOpen('2023-07-10T09:00:00', '2023-07-10T18:00:00');
    expect(r.isOpenNow).toBe(true);
  });

  test('overnight hours crossing midnight', () => {
    jest.setSystemTime(new Date('2023-07-10T01:00:00'));
    const r = isRestaurantOpen('20:00', '02:00');
    expect(r.isOpenNow).toBe(true);
  });

  test('invalid hours string yields Invalid hours result', () => {
    jest.setSystemTime(new Date('2023-07-10T12:00:00'));
    const r = isRestaurantOpen('not-a-time', '18:00');
    expect(r).toEqual({ isOpenNow: false, reason: 'Invalid hours' });
  });
});
