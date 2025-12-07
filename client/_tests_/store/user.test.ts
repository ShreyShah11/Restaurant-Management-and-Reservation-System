import { act } from '@testing-library/react';
import { useUserData } from '@/store/user';

describe('store/user', () => {
  beforeEach(() => {
    const { reset } = useUserData.getState();
    act(() => reset());
  });

  test('auth flow: login, isAuthenticated, logout', () => {
    const s = useUserData.getState();
    expect(s.isAuthenticated()).toBe(false);

    act(() => s.makeLogin({ _id: 'u1', firstName: 'A', lastName: 'B', email: 'a@b.com', createdAt: 'now', role: 'customer' } as any, 'token123'));
    expect(useUserData.getState().isAuthenticated()).toBe(true);

    act(() => s.makeLogout());
    expect(useUserData.getState().isAuthenticated()).toBe(false);
  });

  test('bookings setters', () => {
    const s = useUserData.getState();
    const b1 = { bookingID: 'b1' } as any;
    const b2 = { bookingID: 'b2' } as any;

    act(() => s.addBooking(b1));
    act(() => s.addBooking(b2));
    expect(useUserData.getState().bookings.map(b => b.bookingID)).toEqual(['b2', 'b1']);

    act(() => s.clearBookings());
    expect(useUserData.getState().bookings).toHaveLength(0);

    act(() => s.setBookings([b1, b2]));
    expect(useUserData.getState().bookings).toHaveLength(2);
  });

  test('setters for user, token, verifying', () => {
    const s = useUserData.getState();
    act(() => s.setUser({ _id: 'u2', firstName: 'X', lastName: 'Y', email: 'x@y.com', createdAt: 'now', role: 'owner' } as any));
    expect(useUserData.getState().user?.role).toBe('owner');

    act(() => s.setToken('tkn'));
    expect(useUserData.getState().token).toBe('tkn');

    act(() => s.setVerifying(true));
    expect(useUserData.getState().verifying).toBe(true);
  });
});
