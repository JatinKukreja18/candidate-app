import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from '@app/core/models/response.model';
import {
    RegisterForm,
    LoginForm,
    ExternalRegisterForm,
    GenerateOTPForm,
    ValidateOTPForm,
    ResetPasswordForm,
    ChangePasswordForm,
    ExternalLoginForm,
    RefreshTokenForm
} from '@app/core/models/auth-form.model';

import { environment } from '../../../environments/environment';
const apiUrl = environment.apiUrl;

import * as SecureLS from 'secure-ls';

@Injectable()
export class AuthenticationService {

    public currentUserSubject: BehaviorSubject<any>; // Emit the value of current user on change
    public loggedInUser: Observable<any>;
    private ls:any;

    constructor(private http: HttpClient) {
        this.ls = new SecureLS({encodingType: 'Base64', isCompression: false});
        // Logged In user behavior subject
        this.currentUserSubject = new BehaviorSubject<any>(this.ls.get('currentUser'));
        this.loggedInUser = this.currentUserSubject.asObservable(); // Saving the current user as observable
    }

    public get loggedInUserValue(): any {
        return this.currentUserSubject.value;
    }

    /**
     * Create new local account
     * @param reqBody request body of type RegisterForm
     */
    register(reqBody: RegisterForm): Observable<Response> {
        return this.http.post<Response>(apiUrl + environment.apiPaths.register, reqBody);
    }

    /**
     * Login into account
     * @param reqBody request body of type LoginForm
     */
    login(reqBody: LoginForm): Observable<HttpResponse<any>> {
      return this.http.post<Response>(apiUrl + environment.apiPaths.login, reqBody,{observe: 'response'}).pipe(tap(res => {
            const currentUser = {};
            if (res.headers.get('access_token')) {
                currentUser['access_token'] = res.headers.get('access_token');
            }
            if (res.headers.get('refresh_token')) {
                currentUser['refresh_token'] = res.headers.get('refresh_token');
            }
            if (res.headers.get('expires_in')) {
                currentUser['expires_in'] = res.headers.get('expires_in');
            }
            if (res.body && res.body.code === 200 && res.body.data){
                currentUser['candidateProfile'] = res.body['data'];
            }
            this.currentUserSubject.next(currentUser);
            // Set current user into the local storage
            this.ls.set('currentUser', currentUser)
        }));

        // return this.http.post('/account/login', reqBody, {observe: 'response'}).pipe(tap(res => {
        //     const currentUser = {};
        //     if (res.headers.get('access_token')) {
        //         currentUser['access_token'] = res.headers.get('access_token');
        //     }
        //     if (res.headers.get('refresh_token')) {
        //         currentUser['refresh_token'] = res.headers.get('refresh_token');
        //     }
        //     if (res.headers.get('expires_in')) {
        //         currentUser['expires_in'] = res.headers.get('expires_in');
        //     }
        //     if (res.body && res.body.code === 200 && res.body.data){
        //         currentUser['candidateProfile'] = res.body['data'];
        //     }
        //     this.currentUserSubject.next(currentUser);
        //     // Set current user into the local storage
        //     this.ls.set('currentUser', currentUser)
        // }));
    }

    /**
     * Login using external provider
     * @param reqBody request body of type ExternalLoginForm
     */
    externalLogin(reqBody: ExternalLoginForm): Observable<HttpResponse<any>> {
        return this.http.post<Response>('/account/externallogin', reqBody, {observe: 'response'}).pipe(tap(res => {
            let currentUser = {};
            if (res.body && res.body.code === 200 && res.body['data']){
                currentUser = res.body['data'];
            }
            if (res.headers.get('access_token')) {
                currentUser['access_token'] = res.headers.get('access_token');
            }
            if (res.headers.get('refresh_token')) {
                currentUser['refresh_token'] = res.headers.get('refresh_token');
            }
            if (res.headers.get('expires_in')) {
                currentUser['expires_in'] = res.headers.get('expires_in');
            }
            this.currentUserSubject.next(currentUser);
            // Set current user into the local storage
            this.ls.set('currentUser', currentUser)
        }));
    }

    /**
     * Register account using google, facebook, linkedIn
     * @param reqBody request body of type ExternalRegisterForm
     */
    externalRegister(reqBody: ExternalRegisterForm): Observable<HttpResponse<any>> {
        return this.http.post<Response>('/account/externalregister', reqBody, {observe: 'response'}).pipe(tap(res => {
            const currentUser = {};
            if (res.headers.get('access_token')) {
                currentUser['access_token'] = res.headers.get('access_token');
            }
            if (res.headers.get('refresh_token')) {
                currentUser['refresh_token'] = res.headers.get('refresh_token');
            }
            if (res.headers.get('expires_in')) {
                currentUser['expires_in'] = res.headers.get('expires_in');
            }
            if (res.body && res.body.code === 200 || res.body.code === 708){
                currentUser['candidateProfile'] = res.body['data']['candidateProfile'];
                currentUser['socialProfileDetails'] = res.body['data']['socialProfileDetails'];
            }
            this.currentUserSubject.next(currentUser);
            // Set current user into the local storage
            this.ls.set('currentUser', currentUser)
        }));
    }

    /**
     * Send OTP to the provided email ID
     * @param reqBody request body of type GenerateOTPForm
     */
    generateOTP(reqBody: GenerateOTPForm): Observable<Response> {
        return this.http.post<Response>('/account/generateotp', reqBody);
    }

    /**
     * Verify OTP for the provided email ID
     * @param reqBody request body of type ValidateOTPForm
     */
    validateOTP(reqBody: ValidateOTPForm): Observable<Response> {
        return this.http.post<Response>(apiUrl + environment.apiPaths.validateOtp , reqBody);
    }

    /**
     * Reset password for provided email for forgot password
     * @param reqBody request body of type ResetPasswordForm
     */
    resetPassword(reqBody: ResetPasswordForm): Observable<Response> {
        return this.http.post<Response>('/account/resetpassword', reqBody);
    }

    /**
     * Change password for logged in user
     * @param reqBody request body of type ChangePasswordForm
     */
    changePassword(reqBody: ChangePasswordForm): Observable<Response> {
        return this.http.post<Response>('/account/changepassword', reqBody);
    }

    /**
     * Refresh auth token using refresh token
     * @param reqBody request body of type RefreshTokenForm
     */
    refreshAuthToken(reqBody: RefreshTokenForm): Observable<Response> {
        return this.http.post<Response>('/account/refreshtoken', reqBody);
    }

    /**
     * Logout current user from server i.e invalidate the auth token
     */
    logout(): Observable<Response> {
        return this.http.get<Response>('/account/logout').pipe(tap((res) => {
            this.clearLocalStorage();
        }));
    }

    /**
     * Clear local storage before redirecting to landing page
     */
    clearLocalStorage() {
        this.ls.remove('currentUser');
        this.ls.remove('skills');
        this.ls.remove('currentSearch');
        this.ls.remove('externalUser');
        this.ls.remove('results');
        this.ls.remove('selectedJob');
        this.ls.remove('selectedJobDetails');
        this.ls.remove('userDetails');
        this.ls.remove('assessments');
        this.ls.remove('history');
        this.ls.remove('preInterviewRedirectPage');
        this.ls.remove('searchPage');
        this.ls.remove('searchPageHistory');
        this.ls.remove('searchType');
        this.currentUserSubject.next(null);
    }

    /**
     * Get current user details
     */
    getUserDetails(): Observable<Response> {
        return this.http.get<Response>('/profile/detail').pipe(tap((res) => {
            if (res.code === 200) this.ls.set('userDetails', res.data);
        }));
    }

    /**
     * Fetch access token from local storage
     * @returns access_token API access token on success and blank string on failure
     */
    getAccessToken() {
        const currentUser = this.ls.get('currentUser');
        if (currentUser != null) {
            return currentUser.access_token;
        }
        return '';
    }

    /**
     * Save current user in the local storage
     * @param userData user object
     */
    saveUserData(userData?: LoginForm) {
        if (userData) {
            this.ls.set('user', userData);
        } else {
            this.ls.remove('user');
        }

    }

    /**
     * Get current user form the Local Storage
     */
    getUserData() {
        return this.ls.get('user');
    }

    /**
     * Set external user into the Local Storage
     * @param userData
     */
    setExternalRegisterUser(userData) {
        this.ls.set('externalUser', userData);
    }

    /**
     * Get external user from the local storage
     */
    getExternalRegisterUser() {
        return this.ls.get('externalUser');
    }

    /**
     * Get Current User
     */
    getCurrentUser() {
        return this.ls.get('currentUser');
    }

    /**
     * Update notification setting
     * @param settingEnabled boolean value
     */
    updateCurrentUserData(settingEnabled: boolean, lat?: number, lng?: number) {
        let userDetails = this.ls.get('currentUser');
        if(userDetails && userDetails.candidateProfile && settingEnabled != null) {
            userDetails.candidateProfile.receiveNotifications = settingEnabled;
        }
        if (userDetails && userDetails.candidateProfile && lat && lng) {
            userDetails.candidateProfile.lat = lat;
            userDetails.candidateProfile.lng = lng;
        }
        this.ls.set('currentUser', userDetails);
    }

    /**
     *
     * @param routeHistoryArray Array of routes previously visited
     */
    routeHistory(routeHistoryArray?: string[]) {
        if (routeHistoryArray) this.ls.set('history', routeHistoryArray);
        return this.ls.get('history');
    }

    searchPageRouteHistory(lastSearchPage?: string[]) {
        if (lastSearchPage) this.ls.set('searchPageHistory', lastSearchPage);
        return this.ls.get('searchPageHistory');
    }

    preInterviewRedirectPage(redirectPage?: string) {
        if (redirectPage) this.ls.set('preInterviewRedirectPage', redirectPage);
        return this.ls.get('preInterviewRedirectPage');
    }



}
