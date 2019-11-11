import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, AnalyticsService } from '@app/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationMessages, FeedbackMessages } from '@app/core/messages';

@Component({
  selector: 'app-confirm-otp',
  templateUrl: './confirm-otp.component.html',
  styleUrls: ['./confirm-otp.component.scss']
})
export class ConfirmOTPComponent implements OnInit {
    
    @Input() email: string; // Get user's Email to verify OTP
    @Output() formSubmit = new EventEmitter<object>(); // Emit the event after successfull OTP verification with email and verified OTP
    confirmOTPForm: FormGroup;
    submitted = false; // Propety used to show form validation error
    submitting = false // Property used to disable the submit button while making API request
    reSending = false;
    validationMsgs: any;
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthenticationService,
        private message: NzMessageService,
        private analyticsService: AnalyticsService
    ) {
        this.validationMsgs = ValidationMessages
    }

    ngOnInit() {
        // Initialize 'confirmOTPForm' with validations
        this.confirmOTPForm = this.formBuilder.group({
            otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/\d{6}/)]],
        });
    }

    /**
    * getter funtion for easy form controls
    * @return form control values
    */
    get f() {
        return this.confirmOTPForm.controls;
    }

    /**
     * Resend OTP to the provided email address
     */
    resendOTP() {
        this.reSending = true;
        const reqData = {
            email: this.email,
            actionfrom: 0
        };
        const loading = this.message.loading(FeedbackMessages.loading.OTPResend, { nzDuration: 0 }).messageId;
        this.authService.generateOTP(reqData).subscribe((response) => {
            this.reSending = false;
            this.message.remove(loading); // Remove loading message
            if (response && response.code === 200){
                this.message.success(FeedbackMessages.success.OTPResent, {nzDuration: 1500});
                this.analyticsService.eventEmitter('ForgotPasswordConfirmOtpScreen', 'Forgot Password Otp Not Received', 'Forgot Password Otp Not Received');
            }
        }, (error) => {
            this.reSending = false;
            this.message.remove(loading);
        });
    }

    /**
    * submit function for form
    * @return return null if inputs are invalid else submits form
    */
    onSubmit() {
        this.submitted = true;
        console.log("Confirm OTP: ", this.confirmOTPForm);
        // stop here if form is invalid
        if (this.confirmOTPForm.invalid) {
            return;
        } else {
            const reqData = {
                email: this.email,
                otp: this.confirmOTPForm.value.otp,
                actionfrom: 0
            };
            this.submitting = true;
            const loading = this.message.loading(FeedbackMessages.loading.OTPVerify, { nzDuration: 0 }).messageId;
            this.authService.validateOTP(reqData).subscribe((response) => {
                this.message.remove(loading);
                this.submitting = false;
                if (response.code && response.code === 200) {
                    this.formSubmit.emit({email: this.email, otp: this.confirmOTPForm.value.otp});
                    this.analyticsService.eventEmitter('ForgotPasswordConfirmOtpScreen', 'Forgot Password Confirm Otp', 'Forgot Password Confirm Otp');
                }
            }, (error) => {
                this.submitting = false;
                this.message.remove(loading);
            });
        }
    }
}

