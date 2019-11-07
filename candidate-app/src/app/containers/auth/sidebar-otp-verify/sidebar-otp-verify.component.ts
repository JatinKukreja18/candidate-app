import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { AuthenticationService } from '../../../../app/core/services/auth.service';
import { ValidationMessages } from '../../../../app/core/messages/validation.messages';
import { FeedbackMessages } from '../../../../app/core/messages/feedback.messages';

@Component({
  selector: 'app-sidebar-otp-verify',
  templateUrl: './sidebar-otp-verify.component.html',
  styleUrls: ['./sidebar-otp-verify.component.scss']
})
export class SidebarOTPVerifyComponent implements OnInit {
    @Input() email: string; // Input email address of newly register user
    @Output() formSubmit = new EventEmitter<string>(); // Emit an event with registered user email after successfull registration
    verifyOTPForm: FormGroup;
    submitted = false;
    submitting = false;
    validationMsgs: any;
    reSending = false;
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthenticationService,
        private message: NzMessageService
    ) {
        this.validationMsgs = ValidationMessages
    }

    ngOnInit() {
        // Initialize the 'verifyOTPForm' with validations
        this.verifyOTPForm = this.formBuilder.group({
            email: [{value: this.email ? this.email : '', disabled: true}, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)]],
            otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/\d{6}/)]],
        });
    }

    /**
    * getter funtion for easy form controls
    * @return form control values
    */
    get f() {
        return this.verifyOTPForm.controls;
    }

    /**
     * Resend OTP to the provided email address
     */
    resendOTP() {
        if (this.email) {
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
                }
            }, (error) => {
                this.reSending = false;
                this.message.remove(loading);
            });
        }
    }

    /**
    * Submit function for verifying OTP
    * @return return null if inputs are invalid else submits form
    */
    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.verifyOTPForm.invalid) {
            return;
        } else {
            this.submitting = true;
            const loading = this.message.loading(FeedbackMessages.loading.OTPVerify, { nzDuration: 0 }).messageId;
            const reqBody = {
                email: this.email,
                otp: this.verifyOTPForm.value.otp,
                actionfrom: 1
            }
            // Make API requests to validateOTP API
            this.authService.validateOTP(reqBody).subscribe((res) => {
                this.submitting = false;
                this.message.remove(loading);
                if (res && res.code === 200) {
                    this.formSubmit.emit(this.email);
                }
            }, (err) => {
                this.submitting = false;
                this.message.remove(loading);
            });
        }
    }
}
