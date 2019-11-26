export interface RegisterForm {
    firstname: string;
    lastname?: string;
    email: string;
    password: string;
    mobile?: string;
    country_code?: string;
}

export interface LoginForm {
    UserName: string;
    Password: string;
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
