import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';


@Component({
    selector: 'app-auth-forgot-pass',
    templateUrl: './auth-forgot-pass.component.html',
    styleUrls: ['./auth-forgot-pass.component.scss']
})
export class AuthForgotPassComponent implements OnInit {
    email: string;
    confirmOTPSubmittedValue: {
        email: string,
        otp: string
    } = { email: '', otp: ''};
    forms: {
        sendOTP: boolean,
        confirmOTP: boolean,
        newPassword: boolean
    } = { sendOTP: true, confirmOTP: false, newPassword: false };

    constructor(
        private router: Router,
        private analyticsService: AnalyticsService
    ) { }

    ngOnInit() {
        // this.analyticsService.eventEmitter('LoginScreen', 'ForgotPassword', 'ForgotPassword');
    }

    /**
    * Shows the form respective to provided form name in forgot password
    * @param formName form name to show
    */
    showForm (formName: string) {
        for (const key in this.forms) {
            if (this.forms[key]) {
                this.forms[key] = false;
            }
        }
        this.forms[formName] = true;
    }

    /**
    * Sends OTP to registerer email
    * @param submittedValue email of resgisterer
    * @param formName form name to show
    */
    otpSent (submittedValue, formName) {
        if (submittedValue) this.email = submittedValue;
        this.showForm(formName);
    }

    /**
    * Matches entered OTP sent to registerer
    * @param submittedValue sent OTP
    * @param formName form name to show
    */
    otpConfrimed(submittedValue, formName) {
        if (submittedValue) this.confirmOTPSubmittedValue = submittedValue;
        this.showForm(formName);
    }

    /**
    * Redirect user to homepage
    */
    passwordChanged() {
        this.router.navigateByUrl('/');
    }
}
