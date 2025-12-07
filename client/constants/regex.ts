export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
export const OTP_REGEX = /^\d{6}$/;
export const NAME_REGEX = /^[A-Za-z][A-Za-z' -]{1,}$/;
export const ROLE_REGEX = /^(customer|owner)$/;
