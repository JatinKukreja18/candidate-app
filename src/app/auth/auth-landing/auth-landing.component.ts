/**
 * This file contains code for landing page.
 * This contains external login functionality
 */
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { AuthenticationService, LinkedInService, AnalyticsService } from '@app/core';
import { GoogleLoginProvider, FacebookLoginProvider, AuthService } from 'angularx-social-login';
import { Router } from '@angular/router';
import { FeedbackMessages } from '@app/core/messages'

@Component({
  selector: 'app-auth-landing',
  templateUrl: './auth-landing.component.html',
  styleUrls: ['./auth-landing.component.scss']
})
export class AuthLandingComponent implements OnInit {
    // Class property to show/hide auth right section
    sections: {
        external: boolean,
        register: boolean,
        login: boolean,
        verifyOTP: boolean,
        externalRegister: boolean
    } = { external: true, register: false, login: false, verifyOTP: false, externalRegister: false };
    emailRegistered: string; // Registered user email for verifying OTP
    
    constructor( 
        private authService: AuthenticationService,
        private socialAuthService: AuthService,
        private router: Router,
        private messageService: NzMessageService,
        private linkedInService: LinkedInService,
        private analyticsService: AnalyticsService   
    ) {}
    
    ngOnInit() {}

    /**
     * Open consent screen for linkedIn login and 
     * Fetch user details after successfull login and 
     * Call 'externalLoginLinkedIn' method
     */
    signInWithLinkedIn() {
        console.log("signin with linkedlin",);
        let url = this.linkedInService.initLinkedInAuth();
        console.log("url will be:",url);
        this.analyticsService.eventEmitter('SocialLoginScreen', 'LinkedInLogin', 'LinkedInLogin');
        let currentUrl = window.document.URL;
        let consentWindow = window.open(url, 'name','height=700,width=500');
        let pollTimer = window.setInterval(()=>{
            try {
                if (consentWindow.closed) {
                    this.messageService.error( FeedbackMessages.error.ExternalLoginCanceledByUser, { nzDuration: 1500 });
                    window.clearInterval(pollTimer);
                } else if (consentWindow.document.URL.indexOf(currentUrl) != -1) {
                    window.clearInterval(pollTimer);
                    let url = new URL(consentWindow.document.URL);
                    let authCode = url.searchParams.get('code');
                    consentWindow.close();
                    console.log("the url will be:",url);
                    this.linkedInService.getAccessToken(authCode).subscribe((response) => {
                        console.log("the response will be:",response);
                        if (response['id'] && response['authToken']) {
                            this.externalLoginLinkedIn(response);
                        }
                    });
                }  
            } catch(e) {}
        }, 100);
    }

    /**
     * Open consent screen for google and facebook login and
     * Fetch user details from the google/facebook
     * @param socialPlatform platform name : google/facebook
     */
    socialSignIn(socialPlatform: string) {
        console.log("solical platform:string",socialPlatform);
        let socialPlatformProvider, providerId;
        if(socialPlatform == "facebook"){
            this.analyticsService.eventEmitter('SocialLoginScreen', 'FacebookLogin', 'FacebookLogin');
            socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
            providerId = 2;
        } else if(socialPlatform == "google"){
            this.analyticsService.eventEmitter('SocialLoginScreen', 'GoogleLogin', 'GoogleLogin');
            socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
            providerId = 1;
        }

        this.socialAuthService.signIn(socialPlatformProvider).then((userData) => {
            console.log("The userdata will be::",userData);
            // Now sign-in with userData
            let socialUserId: string;
            let reqBody = {
                UserName:userData.email,
                Provider: socialPlatform.charAt(0).toUpperCase() + socialPlatform.slice(1),
                ExternalAccessToken: userData['idToken']
            }
            console.log("request body will be:",reqBody);
            if (providerId == 1) {
                reqBody.ExternalAccessToken = userData['idToken']; //authToken
                socialUserId = userData.email;
            } else if (providerId == 2) {
                reqBody.ExternalAccessToken = userData['authToken'];
                socialUserId = userData.id;
            } 
            this.authService.externalLogin(reqBody).subscribe((response) => {
                if(response && response['has_Registered']){
                    this.router.navigate(['/dashboard']);
                }else{
                    this.router.navigate(['/'],{queryParams:{register:true}})
                }
                // console.log("req body will be:",reqBody,"The response will be:",response);
                // if (response.body && response.body.data) this.authService.setExternalRegisterUser(response.body.data['socialProfileDetails']);
                // if (response.body.code === 708 && !response.body.data['has_Registered']) {
                //     response.body.data['socialProfileDetails']['socialUserId'] = socialUserId;
                //     this.authService.setExternalRegisterUser(response.body.data['socialProfileDetails']);
                //     this.showSection(null, 'externalRegister');
                // } else if (response.body.code === 200 ){
                //     if(response.body.data['has_Registered']){
                //         console.log("has register",response.body.data['has_Registered'],'res bodhy',response.body);
                //         this.router.navigateByUrl('/dashboard');
                //     }else{
                //         this.sections.register = true; 
                //         // this.sections.alreadyRegister = true;
                //     }
                    
                // } else {
                //     this.messageService.error(FeedbackMessages.error.ExternalRegisterFailure, { nzDuration: 1500 });
                // }
            }, (error) => {
                this.messageService.error(FeedbackMessages.error.ExternalRegisterFailure, { nzDuration: 1500 });
            });
        }).catch((error) => {
            this.messageService.error(error, { nzDuration: 1500 });
        });
    }

    /**
     * Make API request to 'ExternalLogin' to check if user is already registered or new user
     * @param userData User's linkedIn data object with fields email, firstname, lastname, email, accessToken
     */
    externalLoginLinkedIn(userData) {
        let reqBody = {
            ProviderId: 3,
            ExternalAccessToken: userData['authToken']
        }
        this.authService.externalLogin(reqBody).subscribe((response) => {
            if (response.body && response.body.data) this.authService.setExternalRegisterUser(response.body.data['socialProfileDetails']);
            if (response.body.code === 708 && !response.body.data['isRegistered']) {
                this.showSection(null, 'externalRegister');
                response.body.data['socialProfileDetails']['socialUserId'] = userData.id;
                this.authService.setExternalRegisterUser(response.body.data['socialProfileDetails']);
            } else if (response.body.code === 200 && response.body.data['isRegistered']){
                this.router.navigateByUrl('/dashboard');
            }
        });
    }

    /**
     * Show the section provided in '@sectionName' and hide previously active section
     * @param sectionName section name to show
    */
    showSection (email, sectionName: string) {
        if (email) this.emailRegistered = email;
        for (const key in this.sections) {
            if (this.sections[key]) {
                this.sections[key] = false;
            }
        }
        this.sections[sectionName] = true;

    }
}

