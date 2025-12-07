import { renderHook, act } from '@testing-library/react';
import { useBookingNotifications } from '@/hooks/use-booking-notifications';
import * as store from '@/store/restaurant';

jest.mock('@/config/env', () => ({ __esModule: true, default: { PUBLIC_BACKEND_URL: 'http://localhost:3001' } }));

// Event map for our faux socket
const onMap: Record<string, Function[]> = {};
const mockEmit = jest.fn();
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@/lib/socket', () => ({
  initSocket: jest.fn(() => ({
    on: (event: string, cb: Function) => { (onMap[event] ||= []).push(cb); },
    off: (event: string, cb: Function) => { onMap[event] = (onMap[event]||[]).filter((f) => f !== cb); },
    emit: (...args: any[]) => mockEmit(...args),
  })),
  connectSocket: () => mockConnect(),
  disconnectSocket: () => mockDisconnect(),
}));

describe('useBookingNotifications - disconnect and permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const k of Object.keys(onMap)) delete onMap[k];
  });

  test('handles disconnect and requests notification permission when default', async () => {
    const addBooking = jest.fn();
    jest.spyOn(store, 'useRestaurantData').mockReturnValue({ addBooking } as any);

    // Force Notification.permission to default and spy on requestPermission
    (window as any).Notification.permission = 'default';
    const reqSpy = jest.spyOn((window as any).Notification, 'requestPermission').mockResolvedValue('granted');

    const { result, unmount } = renderHook(() => useBookingNotifications('rest-2'));

    // Simulate connection
    act(() => { onMap['connect'].forEach((cb) => cb()); });
    expect(result.current.isConnected).toBe(true);

    // Simulate disconnect
    act(() => { onMap['disconnect'].forEach((cb) => cb()); });
    expect(result.current.isConnected).toBe(false);

    // Permission request should have been called once on mount
    expect(reqSpy).toHaveBeenCalled();

    // Unmount should emit leave-restaurant and call disconnect
    unmount();
    expect(mockEmit).toHaveBeenCalledWith('leave-restaurant', 'rest-2');
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
