import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { AuthenticationService } from '../../../../app/core/services/auth.service';
import { CommonService } from '../../../../app/core/services/common.service';
import { ValidationMessages } from '../../../../app/core/messages/validation.messages';
import { FeedbackMessages } from '../../../../app/core/messages/feedback.messages';
import { Response } from './../../../core/models/response.model';

@Component({
  selector: 'app-sidebar-external-register',
  templateUrl: './sidebar-external-register.component.html',
  styleUrls: ['./sidebar-external-register.component.scss']
})
export class SidebarExternalRegisterComponent implements OnInit {
    @Output() formSubmit = new EventEmitter<string>();
    externalUser: any;
    registerForm: FormGroup;
    submitted = false;
    submitting = false;
    countries: any = [];
    validationMsgs: any;
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthenticationService,
        private commonService: CommonService,
        private router: Router,
        private messageService: NzMessageService
    ) {
        this.validationMsgs = ValidationMessages;
    }

    ngOnInit() {
        console.log("External register component");
        this.getCountryList();
        // Initialize the 'registerForm' form with validations
        this.registerForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
            lastName: ['', [Validators.maxLength(25)]],
            email: ['', [Validators.required, Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)]],
            country: ['', [Validators.required]],
            phone: ['', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)]]
        });
        // Pre-populate the user details from social provider i.e google/facebook/linkedin
        this.externalUser = this.authService.getExternalRegisterUser();
        if (this.externalUser) {
            if (this.externalUser['name']['split'](' ')[1]) {
                document.querySelector('#lastName').parentNode.querySelector('label').classList.add('lastname-valid');
            }
            this.registerForm.get('firstName').setValue(this.externalUser['name']['split'](' ')[0]);
            this.registerForm.get('lastName').setValue(this.externalUser['name']['split'](' ')[1]);
            this.registerForm.get('email').setValue(this.externalUser['email']);
        }
    }

    /**
    * getter funtion for easy form controls
    * @return form control values
    */
    get f() {
       return this.registerForm.controls;
    }

    /**
     * Get the list of countries from the service and assign the values to the 'countries' class property
     */
    getCountryList() {
        this.commonService.getCountryList().subscribe((response) => {
            this.countries = response['data'];
        });
    }

    /**
    * Submit function for form to register new user
    * @return return null if inputs are invalid else submits form
    */
    onSubmit() {
        this.submitted = true;
        // this.formSubmit.emit(true);
        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        } else {
            this.submitting = true;
            const loading = this.messageService.loading(FeedbackMessages.loading.ExternalUserRegister, { nzDuration: 0 }).messageId;
            let reqBody = {
                lastName: this.registerForm.value.lastName,
                firstName: this.registerForm.value.firstName,
                email: this.registerForm.value.email,
                countrycode: this.registerForm.value.country.split('+')[1].split(')')[0],
                socialUserId:  this.externalUser ? this.externalUser.socialUserId : ''
            }
            if (this.registerForm.value.phone) reqBody['mobile'] = this.registerForm.value.phone;
            // Make API request to external register API
            this.authService.externalRegister(reqBody).subscribe((response) => {
                this.submitting = false;
                this.messageService.remove(loading);
                if (response.body.code === 200 && response.headers.get('access_token')) {
                    this.router.navigateByUrl('/dashboard');
                }
            }, (error) => {
                this.submitting = false;
                this.messageService.remove(loading);
            });
        }
    }
}
