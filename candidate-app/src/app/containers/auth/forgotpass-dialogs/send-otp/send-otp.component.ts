import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { ValidationMessages } from 'src/app/core/messages/validation.messages';
import { FeedbackMessages } from 'src/app/core/messages/feedback.messages';

@Component({
  selector: 'app-send-otp',
  templateUrl: './send-otp.component.html',
  styleUrls: ['./send-otp.component.scss']
})
export class SendOTPComponent implements OnInit {
    @Output() formSubmit = new EventEmitter<string>(); // Event to be emitted with user's email after successfull Send OTP request.
    sendOTPForm: FormGroup;
    submitted = false; // Propety used to show form validation error
    submitting = false; // Property used to disable the submit button while making API request
    validationMsgs: any;
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthenticationService,
        private message: NzMessageService,
        private analyticsService: AnalyticsService
    ) { 
        this.validationMsgs = ValidationMessages;
    }

    ngOnInit() {
        // Initialize 'sendOTPForm' with validations
        this.sendOTPForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)]],
        });
    }

    /**
    * getter funtion for easy form controls
    * @return form control values
    */
    get f() {
        return this.sendOTPForm.controls;
    }

    /**
    * submit function for form
    * @return return null if inputs are invalid else submits form
    */
    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.sendOTPForm.invalid) {
            return false;
        } else {
            let reqData = {
                email: this.sendOTPForm.value.email,
                actionfrom: 0
            }
            this.submitting = true;
            const loading = this.message.loading(FeedbackMessages.loading.OTPSend, { nzDuration: 0 }).messageId; // Show message while submitting form to the user
            // Make request to generateOTP API
            this.authService.generateOTP(reqData).subscribe((response) => {
                this.submitting = false;
                this.message.remove(loading); // Remove loading message
                if (response.code && response.code === 200) {
                    this.formSubmit.emit(this.sendOTPForm.value.email);
                    // this.analyticsService.eventEmitter('ForgotPasswordRequestOtpScreen', 'Forgot Password Request Otp', 'Forgot Password Request Otp');
                }
            }, (error) => {
                this.submitting = false;
                this.message.remove(loading);
            });
        }
    }
}


