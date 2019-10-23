import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthLandingComponent } from './auth-landing/auth-landing.component';
import { SidebarExternalRegisterComponent } from './sidebar-external-register/sidebar-external-register.component';
import { SidebarLoginComponent } from './sidebar-login/sidebar-login.component';
import { SidebarOTPVerifyComponent } from './sidebar-otp-verify/sidebar-otp-verify.component';
import { SidebarRegisterComponent } from './sidebar-register/sidebar-register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthForgotPassComponent } from './auth-forgot-pass/auth-forgot-pass.component';
import { ConfirmOTPComponent, NewPasswordComponent, SendOTPComponent } from './forgotpass-dialogs';

const routes: Routes = [
  {path: '', component: AuthLandingComponent},
  {path: 'forgotPassword', component: AuthForgotPassComponent}
];

@NgModule({
  declarations: [
    AuthLandingComponent,
    SidebarExternalRegisterComponent,
    SidebarLoginComponent,
    SidebarOTPVerifyComponent,
    SidebarRegisterComponent,
    AuthForgotPassComponent,
    ConfirmOTPComponent,
    NewPasswordComponent,
    SendOTPComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
