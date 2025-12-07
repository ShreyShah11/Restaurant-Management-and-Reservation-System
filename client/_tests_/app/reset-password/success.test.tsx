import { render, screen, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ResetPasswordSuccess from '@/app/reset-password/success/page';
import { useResetPasswordStore } from '@/store/reset-password';

type MockResetPasswordStore = {
  email: string;
  OTP: string;
  confirmPassword: string;
  reset: jest.Mock;
};

const mockUseResetPasswordStore = useResetPasswordStore as unknown as jest.MockedFunction<typeof useResetPasswordStore>;

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the reset password store
jest.mock('@/store/reset-password', () => ({
  useResetPasswordStore: jest.fn(),
}));

describe('ResetPasswordSuccess', () => {
  const mockPush = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    
    // Mock the reset password store
    mockUseResetPasswordStore.mockReturnValue({
      email: 'test@example.com',
      OTP: '123456',
      confirmPassword: 'newPassword123!',
      reset: mockReset,
      // Add any other required properties from IResetPasswordStore with default values
      password: '',
      setEmail: jest.fn(),
      setOTP: jest.fn(),
      setPassword: jest.fn(),
      setConfirmPassword: jest.fn(),
    });

    // Mock timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should render the success message with countdown', () => {
    render(<ResetPasswordSuccess />);
    
    // Check if the success message is displayed
    expect(screen.getByText(/Password Reset Successful!/i)).toBeInTheDocument();
    expect(screen.getByText(/Great! Your password has been successfully reset/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should decrement the countdown every second', () => {
    render(<ResetPasswordSuccess />);

    // Initial text should show 5 seconds
    expect(screen.getByText(/5 seconds/i)).toBeInTheDocument();

    // Fast-forward time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // After 1 second, countdown should show 4 seconds
    expect(screen.getByText(/4 seconds/i)).toBeInTheDocument();

    // Fast-forward by another second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // After 2 seconds, countdown should show 3 seconds
    expect(screen.getByText(/3 seconds/i)).toBeInTheDocument();
  });

  it('should call reset and redirect to login page when countdown reaches 0', () => {
    const mockPush = jest.fn();
    const mockReset = jest.fn();
    
    // Setup mock router and store
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockUseResetPasswordStore.mockReturnValue({
      email: 'test@example.com',
      OTP: '123456',
      confirmPassword: 'newPassword123!',
      reset: mockReset,
      // Add any other required properties from IResetPasswordStore with default values
      password: '',
      setEmail: jest.fn(),
      setOTP: jest.fn(),
      setPassword: jest.fn(),
      setConfirmPassword: jest.fn(),
    });
    
    // Mock the countdown state to immediately trigger the effect
    const mockSetCountdown = jest.fn();
    jest.spyOn(require('react'), 'useState').mockImplementationOnce(
      () => [0, mockSetCountdown] // Start with 0 to trigger the effect
    );
    
    render(<ResetPasswordSuccess />);
    
    // Verify reset function was called
    expect(mockReset).toHaveBeenCalledTimes(1);
    
    // Verify navigation to login page
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should clear the timeout when component unmounts', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    
    const { unmount } = render(<ResetPasswordSuccess />);
    
    // Unmount the component
    unmount();
    
    // Verify clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    // Clean up
    clearTimeoutSpy.mockRestore();
  });
  
  it('should redirect to reset-password if required data is missing', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    // Mock missing required data
    mockUseResetPasswordStore.mockReturnValue({
      email: '',
      OTP: '',
      confirmPassword: '',
      reset: jest.fn(),
      // Add any other required properties from IResetPasswordStore with default values
      password: '',
      setEmail: jest.fn(),
      setOTP: jest.fn(),
      setPassword: jest.fn(),
      setConfirmPassword: jest.fn(),
    });
    
    render(<ResetPasswordSuccess />);
    
    // Should redirect to reset-password page
    expect(mockPush).toHaveBeenCalledWith('/reset-password');
  });
});
