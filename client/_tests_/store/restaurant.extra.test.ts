import { act } from '@testing-library/react';
import { useRestaurantData } from '@/store/restaurant';

describe('store/restaurant additional', () => {
  beforeEach(() => {
    const { reset } = useRestaurantData.getState();
    act(() => reset());
  });

  test('setRestaurant and setItems set state correctly', () => {
    const s = useRestaurantData.getState();

    const restaurant = { _id: 'r', restaurantName: 'R' } as any;
    const items = [{ _id: 'i1', isPopular: false, isAvailable: true } as any];

    act(() => s.setRestaurant(restaurant));
    expect(useRestaurantData.getState().restaurant?._id).toBe('r');

    act(() => s.setItems(items));
    expect(useRestaurantData.getState().items).toHaveLength(1);
  });
});
