import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AnalyticsService } from 'src/app/core/services/analytics.service';
import { ValidationMessages } from 'src/app/core/messages/validation.messages';
import { FeedbackMessages } from 'src/app/core/messages/feedback.messages';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {
  @Input() email: string; // Get the value of user's email to create new password
  @Input() otp: string; // Get the value of user's verified OTP to create new password
  @Output() formSubmit = new EventEmitter<boolean>(); // Emit event with true on successfull form submit
  newPasswordForm: FormGroup;
  submitted = false; // Propety used to show form validation error
  submitting = false; // Property used to disable the submit button while making API request
  showPassword: {
    pass: boolean,
    confirmPass: boolean
  } = {
    pass: false,
    confirmPass: false
  }
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
    // Initialize 'newPasswordForm' with validations
    this.newPasswordForm = this.formBuilder.group({
      pass: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)]],
      repass: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)]],
    });
  }

  /**
  * getter funtion for easy form controls
  * @return form control values
  */
  get f() {
    return this.newPasswordForm.controls;
  }

  /**
   * Show/hide password for specified fields currentPass/repass
   * @param fieldName currentPass/rePass
   */
  togglePass(fieldName: string) {
    if (this.showPassword[fieldName]) this.showPassword[fieldName] = false;
    else this.showPassword[fieldName] = true;
  }

  /**
  * submit function for form
  * @return return null if inputs are invalid else submits form
  */
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.newPasswordForm.invalid) {
        return;
    } else {
      if (this.newPasswordForm.value.pass === this.newPasswordForm.value.repass) {
        const reqData = {
          email: this.email,
          newPassword: this.newPasswordForm.value.pass,
          otp: this.otp
        }
        this.submitting = true;
        const loading = this.message.loading(FeedbackMessages.loading.PasswordReset, { nzDuration: 0 }).messageId;
        // Make the API call to the reset password API
        this.authService.resetPassword(reqData).subscribe((response) => {
          this.submitting = false;
          this.message.remove(loading);
          if (response.code && response.code === 200) {
            this.formSubmit.emit(true);
            // this.analyticsService.eventEmitter('ForgotPasswordNewPasswordOtpScreen', 'Forgot Password Set New Password', 'Forgot Password Set New Password');
          }
        }, (error) => {
          this.submitting = false;
          this.message.remove(loading);
        });
      } else {
        // Return if the new and confirm password are not same
        return;
      }
    }
  }

}

