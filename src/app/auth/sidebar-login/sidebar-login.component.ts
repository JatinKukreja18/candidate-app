import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { AuthenticationService, AnalyticsService } from '@app/core';
import { ValidationMessages, FeedbackMessages } from '@app/core/messages';

@Component({
  selector: 'app-sidebar-login',
  templateUrl: './sidebar-login.component.html',
  styleUrls: ['./sidebar-login.component.scss']
})
export class SidebarLoginComponent implements OnInit {

    loginForm: FormGroup;
    submitted = false;
    submitting = false;
    showpass = false;
    validationMsgs: any;
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthenticationService,
        private router: Router,
        private message: NzMessageService,
        private analyticsService: AnalyticsService
    ) {
        this.validationMsgs = ValidationMessages
     }

    ngOnInit() {
        this.analyticsService.eventEmitter('SocialLoginScreen', 'Login', 'Login');
        // Initialize the 'loginForm' with validations
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
            rememberMe: [false]
        });
        // Get user details if user opted for remember me and pre-populate into the fields
        let savedUser = this.authService.getUserData();
        if (savedUser) {
            this.loginForm.get('email').setValue(savedUser.username);
            this.loginForm.get('password').setValue(savedUser.password);
            this.loginForm.get('rememberMe').setValue(true);
        }
    }

    /**
    * getter funtion for easy form controls
    * @return form control values
    */
    get f() {
        return this.loginForm.controls;
    }

    /**
    * toggle funtion to show/hide password
    */
    togglePass() {
        this.showpass = !this.showpass;
    }

    /**
    * submit function for form to validate and signin user
    * @return return landing page if inputs are valid
    */
    onSubmit() {
        this.submitted = true;
        if (this.loginForm.invalid) {
        return;
        } else {
            this.submitting = true;
            const loading = this.message.loading(FeedbackMessages.loading.UserSignin, { nzDuration: 0 }).messageId;
            const formData = {UserName: this.loginForm.value.email, Password: this.loginForm.value.password};
            // If user opted for remember me then save user's data
            if (this.loginForm.value.rememberMe) {
                this.authService.saveUserData(formData);
            } else {
                this.authService.saveUserData();
            }
            // Make API request to login API
            this.authService.login(formData).subscribe((res) => {
                this.submitting = false;
                this.message.remove(loading);
                if (res.body.code === 200) {
                    this.router.navigateByUrl('/dashboard/coverPage');
                    this.analyticsService.eventEmitter('Authentication', 'Login', 'Login');
              }
            }, (error) => {
                this.submitting = false;
                this.message.remove(loading);
            });
        }
    }

}
412462
