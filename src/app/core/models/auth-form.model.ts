export interface RegisterForm {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    mobile?: string;
    countrycode?: string;
}

export interface LoginForm {
    username: string;
    password: string;
}

export interface ExternalRegisterForm {
    lastName?: string;
    firstName: string;
    email: string;
    mobile?: string;
    countrycode?: string;
    socialUserId: string;
}

export interface GenerateOTPForm {
    email: string;
    actionfrom: number;
}

export interface ValidateOTPForm {
    email: string;
    otp: string;
    actionfrom: number;
}

export interface ResetPasswordForm {
    newPassword: string;
    email: string;
    otp: string;
}

export interface ChangePasswordForm {
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ExternalLoginForm {
    ProviderId: number;
    ExternalAccessToken: string;
}

export interface RefreshTokenForm {
    refreshToken: string;
}
