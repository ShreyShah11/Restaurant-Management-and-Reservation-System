import { renderHook, act } from '@testing-library/react';
import { useBookingNotifications } from '@/hooks/use-booking-notifications';
import * as store from '@/store/restaurant';

jest.mock('@/config/env', () => ({ __esModule: true, default: { PUBLIC_BACKEND_URL: 'http://localhost:3001' } }));

const onMap: Record<string, Function[]> = {};
const mockEmit = jest.fn();

jest.mock('@/lib/socket', () => ({
  initSocket: jest.fn(() => ({
    on: (event: string, cb: Function) => { (onMap[event] ||= []).push(cb); },
    off: (event: string, cb: Function) => { onMap[event] = (onMap[event]||[]).filter((f) => f !== cb); },
    emit: (...args: any[]) => mockEmit(...args),
  })),
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
}));

describe('useBookingNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const k of Object.keys(onMap)) delete onMap[k];
  });

  test('connects, joins room, and handles new-booking', () => {
    const addBooking = jest.fn();
    jest.spyOn(store, 'useRestaurantData').mockReturnValue({ addBooking } as any);

    const { result, unmount } = renderHook(() => useBookingNotifications('rest-1'));

    act(() => {
      onMap['connect'].forEach((cb) => cb());
    });

    expect(mockEmit).toHaveBeenCalledWith('join-restaurant', 'rest-1');

    const payload = { message: 'New booking', booking: { bookingID: 'b1' }, timestamp: new Date() } as any;
    act(() => {
      onMap['new-booking'].forEach((cb) => cb(payload));
    });

    expect(result.current.newBooking).toEqual(payload);
    expect(addBooking).toHaveBeenCalledWith(payload.booking);

    act(() => result.current.clearNotification());
    expect(result.current.newBooking).toBeNull();

    unmount();
  });

  test('returns early when restaurantId is null', () => {
    const addBooking = jest.fn();
    jest.spyOn(store, 'useRestaurantData').mockReturnValue({ addBooking } as any);
    const socketModule = require('@/lib/socket');

    renderHook(() => useBookingNotifications(null));
    expect(socketModule.connectSocket).not.toHaveBeenCalled();
    expect(onMap['connect']).toBeUndefined();
  });

  test('shows browser notification but skips addBooking when payload lacks booking', () => {
    const addBooking = jest.fn();
    jest.spyOn(store, 'useRestaurantData').mockReturnValue({ addBooking } as any);

    const OriginalNotification = (window as any).Notification;
    const notificationSpy = jest.fn();
    (window as any).Notification = function (...args: any[]) {
      return notificationSpy(...args);
    } as any;
    (window as any).Notification.permission = 'granted';

    const { unmount } = renderHook(() => useBookingNotifications('rest-3'));

    act(() => {
      onMap['new-booking'].forEach((cb) =>
        cb({ message: 'Ping', booking: null, timestamp: new Date() } as any),
      );
    });

    expect(addBooking).not.toHaveBeenCalled();
    expect(notificationSpy).toHaveBeenCalledWith('New Booking Alert!', {
      body: 'Ping',
      icon: '/icon.png',
    });

    unmount();
    (window as any).Notification = OriginalNotification;
  });
});
