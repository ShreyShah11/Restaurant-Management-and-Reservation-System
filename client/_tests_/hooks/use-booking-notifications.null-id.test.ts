import { renderHook } from '@testing-library/react';
import { useBookingNotifications } from '@/hooks/use-booking-notifications';

jest.mock('@/lib/socket', () => ({
  initSocket: jest.fn(() => { throw new Error('should not be called'); }),
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
}));

describe('useBookingNotifications - null id no-op', () => {
  test('does nothing when restaurantId is null', () => {
    const { result, unmount } = renderHook(() => useBookingNotifications(null));
    expect(result.current.isConnected).toBe(false);
    expect(result.current.newBooking).toBeNull();
    unmount();
  });
});
