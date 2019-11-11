import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationMessages, FeedbackMessages } from '@app/core/messages';
import { AuthenticationService, NotificationsService, AnalyticsService } from '@app/core';
import { NzMessageService } from 'ng-zorro-antd'

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    newPasswordForm: FormGroup;
    settingsForm: FormGroup;
    receiveNotifications = false;
    submitted = false;
    validationMsgs: any;
    sections: {
        changePassword: boolean,
        notifications: boolean
    } = {
        changePassword: true,
        notifications: false
    }
    showPassword: {
        currentPass: boolean,
        rePass: boolean,
        confirmPass: boolean
    } = {
        currentPass: false,
        rePass: false,
        confirmPass: false
    }

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthenticationService,
        private message: NzMessageService,
        private notificationService: NotificationsService,
        private analyticsService: AnalyticsService
    ) {}
    
    ngOnInit(){
        // Initialize 'newPasswordForm' with validations
        this.newPasswordForm = this.formBuilder.group({
            currentPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
            newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
        });
        this.settingsForm = this.formBuilder.group({
            enable: [false]
        });
        this.authService.loggedInUser.subscribe((userDetails) => {
            if (userDetails && userDetails.candidateProfile){
                this.receiveNotifications = userDetails['candidateProfile']['receiveNotifications'];
                this.settingsForm.get('enable').setValue(userDetails['candidateProfile']['receiveNotifications']);
            }
        })    
        this.validationMsgs = ValidationMessages;
    }

    /**
    * getter funtion for easy form controls
    * @return form control values
    */
    get f() {
        return this.newPasswordForm.controls;
    }

    /**
     * Change the password by calling changepassword API
     */
    changePassword() {
        this.submitted = true;
        if (this.newPasswordForm.invalid) {
            return;
        } else {
            const loading = this.message.loading(FeedbackMessages.loading.SettingsChangePassword, { nzDuration: 0 }).messageId;
            this.authService.changePassword(this.newPasswordForm.value).subscribe((response) => {
                this.message.remove(loading);
                if (response.code && response.code === 200) {
                    this.submitted = false;
                    this.analyticsService.eventEmitter('ChangePasswordScreen', 'ChangePassword', 'ChangePassword');
                    this.message.success(response.message, {nzDuration: 1500});
                    this.newPasswordForm.reset();
                    this.togglePass('');
                }
            }, (error) => {
                this.submitted = false;
                this.message.remove(loading);
            });
        }
    }

    /**
     * Change the notification setting
     * @param event JS event type
     */
    changeSetting(value) {
        let setting = value; 
        this.notificationService.settings(setting).subscribe((response) => {
            this.analyticsService.eventEmitter('SettingScreen', 'SettingNotificationOnOff', 'SettingNotificationOnOff');
            this.authService.updateCurrentUserData(value);
        });
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
     * Show section based on the sectionName. Switch between the changepassword/notifications
     * @param sectionName section name changepassword/notifications
     */
    showSection(sectionName) {
        for(let key in this.sections) {
            this.sections[key] = false;
        }
        this.sections[sectionName] = true;
    }
}