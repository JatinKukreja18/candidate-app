import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationMessages } from '../../../../app/core/messages/validation.messages';
import { FeedbackMessages } from '../../../../app/core/messages/feedback.messages';
import { AuthenticationService } from '../../../../app/core/services/auth.service';
import { AnalyticsService } from '../../../../app/core/services/analytics.service';
import { CommonService } from '../../../../app/core/services/common.service';
import { Response } from './../../../core/models/response.model';

@Component({
  selector: 'app-sidebar-register',
  templateUrl: './sidebar-register.component.html',
  styleUrls: ['./sidebar-register.component.scss']
})
export class SidebarRegisterComponent implements OnInit {
    @Output() formSubmit = new EventEmitter<string>(); // Emit an event with registered user email after successfull registration
    registerForm: FormGroup;
    submitted = false;
    submitting = false;
    countries: any = [];
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
        private commonService: CommonService,
        private message: NzMessageService,
        private analyticsService: AnalyticsService
    ) {
        this.validationMsgs = ValidationMessages;
    }

    ngOnInit() {
        // this.analyticsService.eventEmitter('SocialLoginScreen', 'Register', 'Register');
        this.getCountriesList();
        // Initialize the 'registerForm' with validations
        this.registerForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
            lastName: ['', [Validators.maxLength(25)]],
            email: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)]],
            password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20),  Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)]],
            confirmPassword: ['', [Validators.required, Validators.maxLength(20)]],
            country: ['', [Validators.required]],
            phone: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)]]
        });
    }

    /**
     * Get the list of countries
     */
    getCountriesList() {
        this.commonService.getCountryList().subscribe((response) => {
            this.countries = response['data'];
        });
    }

    /**
    * toggle funtion to show/hide password
    */
    togglePass(fieldName: string) {
        if (this.showPassword[fieldName]) this.showPassword[fieldName] = false;
        else this.showPassword[fieldName] = true;
    }

    /**
    * getter funtion for easy form controls
    * @return form control values
    */
    get f() {
       return this.registerForm.controls;
    }

    /**
    * submit function for form to register new user
    * @return return null if inputs are invalid else submits form
    */
    onSubmit() {
        this.submitted = true;
        //stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        } else {
            // Proceed only if password and confirm password are same
            if (this.registerForm.value.password == this.registerForm.value.confirmPassword) {
                this.submitting = true;
                const loading = this.message.loading(FeedbackMessages.loading.UserRegister, { nzDuration: 0 }).messageId;
                const formData = {
                    firstName: this.registerForm.value.firstName,
                    lastName: this.registerForm.value.lastName,
                    email: this.registerForm.value.email,
                    countrycode: this.registerForm.value.country ? this.registerForm.value.country.split('+')[1].split(')')[0] : '',
                    password: this.registerForm.value.password
                }
                if (this.registerForm.value.phone) formData['phone'] = this.registerForm.value.phone;
                // if (this.registerForm.value.country) formData['countrycode'] = this.registerForm.value.country.split('+')[1].split(')')[0];
                this.authService.register(formData).subscribe((response) => {
                    this.submitting = false;
                    this.message.remove(loading);
                    if(response.code && response.code === 200) {
                        this.formSubmit.emit(this.registerForm.value.email);
                        this.message.success(FeedbackMessages.success.AccountRegistered, {nzDuration: 1500});
                        // this.analyticsService.eventEmitter('RegisterScreen', 'Register', 'Register');
                    }
                }, (error) => {
                    this.submitting = false;
                    this.message.remove(loading);
                });
            } else {
                return; // Return incase of password missmatch
            }
        }
    }
}
