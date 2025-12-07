import { act } from '@testing-library/react';
import { useRestaurantData } from '@/store/restaurant';

describe('store/restaurant', () => {
  beforeEach(() => {
    const { reset } = useRestaurantData.getState();
    act(() => reset());
  });

  test('items CRUD and toggles', () => {
    const s = useRestaurantData.getState();

    const item = { _id: 'i1', isPopular: false, isAvailable: true } as any;
    const other = { _id: 'i2', isPopular: false, isAvailable: true } as any;
    act(() => s.addItem(item));
    act(() => s.addItem(other));
    expect(useRestaurantData.getState().items).toHaveLength(2);

    act(() => s.toggleItemPopular('i1'));
    expect(useRestaurantData.getState().items[0].isPopular).toBe(true);

    act(() => s.toggleItemAvailability('i1'));
    expect(useRestaurantData.getState().items[0].isAvailable).toBe(false);

    act(() => s.updateItem({ _id: 'i1', isPopular: true, isAvailable: true } as any));
    expect(useRestaurantData.getState().items[0].isAvailable).toBe(true);

    act(() => s.deleteItem('i1'));
    expect(useRestaurantData.getState().items).toHaveLength(1);
  });

  test('bookings add and update status with sorting', () => {
    const s = useRestaurantData.getState();

    const b1 = { bookingID: 'b1', status: 'pending', bookingAt: '2023-01-01T10:00:00Z' } as any;
    const b2 = { bookingID: 'b2', status: 'pending', bookingAt: '2023-01-02T10:00:00Z' } as any;

    act(() => s.addBooking(b1));
    act(() => s.addBooking(b2));

    expect(useRestaurantData.getState().bookings[0].bookingID).toBe('b2');

    act(() => s.updateBookingStatus('b1', 'accepted'));
    const ids = useRestaurantData.getState().bookings.map((b) => b.bookingID);
    expect(ids).toEqual(['b2', 'b1']);

    act(() => s.clearBookings());
    expect(useRestaurantData.getState().bookings).toHaveLength(0);
  });

  test('setBookings overwrites booking list', () => {
    const s = useRestaurantData.getState();
    const bookings = [
      { bookingID: 'bx', status: 'pending', bookingAt: '2023-03-01T10:00:00Z' } as any,
    ];
    act(() => s.setBookings(bookings));
    expect(useRestaurantData.getState().bookings).toHaveLength(1);
  });
});
