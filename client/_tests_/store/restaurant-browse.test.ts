import { act } from '@testing-library/react';
import { useBrowseRestaurantStore, markBrowseStoreHydrated } from '@/store/restaurant-browse';

describe('store/restaurant-browse', () => {
  test('set and clear restaurants', () => {
    const { setRestaurants, clearRestaurants } = useBrowseRestaurantStore.getState();
    const list = [
      { _id: '1', restaurantName: 'A', logoURL: '', bannerURL: '', ratingsSum: 0, ratingsCount: 0, slogan: '', address: { street: '', city: '' }, openingHours: { weekdayOpen: '09:00', weekdayClose: '18:00', weekendOpen: '10:00', weekendClose: '16:00' }, status: 'open', city: 'X', cuisines: [] },
    ];

    act(() => setRestaurants(list as any));
    expect(useBrowseRestaurantStore.getState().restaurants).toHaveLength(1);

    act(() => clearRestaurants());
    expect(useBrowseRestaurantStore.getState().restaurants).toHaveLength(0);
  });

  test('getRestaurantById normalizes id', () => {
    const { setRestaurants, getRestaurantById } = useBrowseRestaurantStore.getState();
    const list = [
      { _id: '  "abc"  ', restaurantName: 'A', logoURL: '', bannerURL: '', ratingsSum: 0, ratingsCount: 0, slogan: '', address: { street: '', city: '' }, openingHours: { weekdayOpen: '09:00', weekdayClose: '18:00', weekendOpen: '10:00', weekendClose: '16:00' }, status: 'open', city: 'X', cuisines: [] },
    ];
    act(() => setRestaurants(list as any));

    expect(getRestaurantById('abc')!._id).toContain('abc');
    expect(getRestaurantById(['abc'])!._id).toContain('abc');
    expect(getRestaurantById('"abc"')!._id).toContain('abc');
    expect(getRestaurantById(undefined)).toBeUndefined();
  });

  test('setHydrated toggles hydrated flag and helper marks true', () => {
    const store = useBrowseRestaurantStore.getState();
    act(() => store.setHydrated(false));
    expect(useBrowseRestaurantStore.getState().hydrated).toBe(false);

    markBrowseStoreHydrated(store);
    expect(useBrowseRestaurantStore.getState().hydrated).toBe(true);
  });
});
