import { AuthService } from 'angularx-social-login';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from './../shared/shared.module';
import { SidebarRegisterComponent, SidebarExternalRegisterComponent, SidebarLoginComponent, AuthLandingComponent, SidebarOTPVerifyComponent } from './index';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthForgotPassComponent } from './auth-forgot-pass/auth-forgot-pass.component';
import { SendOTPComponent, ConfirmOTPComponent, NewPasswordComponent } from '@app/auth/forgotpass-dialogs';

@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule,
        SharedModule,
        ReactiveFormsModule
    ],
    declarations: [
        SidebarRegisterComponent,
        SidebarExternalRegisterComponent,
        SidebarLoginComponent,
        SidebarOTPVerifyComponent,
        AuthLandingComponent,
        AuthForgotPassComponent,
        SendOTPComponent,
        ConfirmOTPComponent,
        NewPasswordComponent
    ],
    providers: [AuthService]
})
export class AuthModule { }
