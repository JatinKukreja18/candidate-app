import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { mergeMap, tap, flatMap } from 'rxjs/operators';
import { Response, ProfileForm } from '@app/core/models';
import { AuthenticationService } from '@app/core/services/auth.service';
import * as SecureLS from 'secure-ls';
import { environment } from '@env/environment';

const apiUrl = environment.apiUrl;

@Injectable()
export class ProfileService {
    private ls: any;
    private profileSubject: BehaviorSubject<any> = new BehaviorSubject({});
    public profileEmitter: Observable<any>;
    public profileData = {};

    constructor(private http: HttpClient, private authService: AuthenticationService) {
        this.ls = new SecureLS({ encodingType: 'Base64', isCompression: false });
        this.profileEmitter = this.profileSubject.asObservable();
    }

    /**
     * Get current user profile details
     */
    getProfileDetails(id): Observable<any> {
        return this.http.get(apiUrl + environment.apiPaths.viewProfile + id).pipe(tap(response => {
            console.log(response);
            this.profileData = response;
            this.refreshProfileData(response);
            /* let currentUser = this.ls.get('currentUser');
            if (!currentUser['candidateProfile']) {
                currentUser['candidateProfile'] = {};
            }
            currentUser['candidateProfile']['firstname'] = response['firstName'] ? response['firstName'] : '';
            currentUser['candidateProfile']['lastname'] = response['lastName'] ? response['lastName'] : '';
            currentUser['candidateProfile']['mobile'] = response['mobile'] ? response['mobile'] : '';
            currentUser['candidateProfile']['countryPhoneCode'] = response['countryPhoneCode'] ? response['countryPhoneCode'] : '';
            currentUser['candidateProfile']['image'] = response['imageUrl'] ? response['imageUrl'] : '';

            this.ls.set('currentUser', currentUser);
            this.authService.currentUserSubject.next(currentUser); */
        }));
    }

    

    refreshProfileData(userData) {
        this.profileSubject.next(userData);
        this.profileData = userData;
    }

    updateProfileDetails(formName: string, data, username) {
        let editApi = apiUrl;
        switch(formName) {
            case 'personalDetailsForm': editApi += environment.apiPaths.editPersonalDetails + username;
              break;
            case 'primarySkillsForm': editApi += environment.apiPaths.editSkills + username;
              break;
            case 'additionalProjectsForm': editApi += environment.apiPaths.editAdditionalProjects + username;
              break;
            case 'experiencesForm': editApi += environment.apiPaths.editExperiences + username;
              break;
            case 'additionalSkillsForm': editApi += environment.apiPaths.editSkills + username;
              break;
            case 'educationForm': editApi += environment.apiPaths.editEducations + username;
              break;
            case 'trainingsForm': editApi += environment.apiPaths.editTrainings + username;
              break;
          }

        if (formName === 'personalDetailsForm') {
            return this.http.put(editApi, data).pipe(tap(response => {
                console.log(response);
                /* this.profileData = response;
                this.refreshProfileData(response); */
            }));
        } else {
            return this.http.post(editApi, data).pipe(tap(response => {
                console.log(response);
                /* this.profileData = response;
                this.refreshProfileData(response); */
                /* let currentUser = this.ls.get('currentUser');
                if (!currentUser['candidateProfile']) {
                    currentUser['candidateProfile'] = {};
                }
                currentUser['candidateProfile']['firstname'] = response['firstName'] ? response['firstName'] : '';
                currentUser['candidateProfile']['lastname'] = response['lastName'] ? response['lastName'] : '';
                currentUser['candidateProfile']['mobile'] = response['mobile'] ? response['mobile'] : '';
                currentUser['candidateProfile']['countryPhoneCode'] = response['countryPhoneCode'] ? response['countryPhoneCode'] : '';
                currentUser['candidateProfile']['image'] = response['imageUrl'] ? response['imageUrl'] : '';
    
                this.ls.set('currentUser', currentUser);
                this.authService.currentUserSubject.next(currentUser); */
            }));
        }
        
    }
    /* getProfileDetails():Observable<Response>{
        return this.http.get<Response>('profile/detail').pipe(tap((response) => {
            if (response && response.code === 200 && response.data) {
                let currentUser = this.ls.get('currentUser');
                if (response.data['basicInfo']){
                    if (!currentUser['candidateProfile']) {
                        currentUser['candidateProfile'] = {};
                    }
                    currentUser['candidateProfile']['firstname'] = response.data['basicInfo']['firstName'];
                    currentUser['candidateProfile']['lastname'] = response.data['basicInfo']['lastName'];
                    currentUser['candidateProfile']['mobile'] = response.data['basicInfo']['mobile'];
                    currentUser['candidateProfile']['countryPhoneCode'] = response.data['basicInfo']['countryPhoneCode'];
                    currentUser['candidateProfile']['image'] = response.data['basicInfo']['imageUrl'];
                }
                if (response.data['professionalInfo']){
                    currentUser['candidateProfile']['lat'] = response.data['professionalInfo']['lat'];
                    currentUser['candidateProfile']['lng'] = response.data['professionalInfo']['lng'];
                }
                this.ls.set('currentUser', currentUser);
                this.authService.currentUserSubject.next(currentUser);
            }
        }));
    } */

    /**
     * Update the value of the profile details
     * @param reqBody Profile Form
     */
   /*  updateProfileDetails(reqBody: ProfileForm): Observable<Response> {
        return this.http.post<Response>('profile/create', reqBody).pipe(
            tap(response => {
                this.ls.remove('profile');
            }),
            flatMap(response => this.getProfileDetails(''))
        );
    } */

    /**
     * Save profile data offline in local storage
     * @param reqBody Profile Form type
     */
    localProfileDetails(reqBody?: ProfileForm) {
        if (reqBody) {
            this.ls.set('profile', reqBody);
        } else {
            return this.ls.get('profile');
        }
    }

    /**
     * Upload profile pic or resume
     * @param formData 
     */
    uploadFile(formData): Observable<Response> {
        return this.http.post<Response>('profile/upload', formData).pipe(
            mergeMap(response => this.getProfileDetails(''))
        );
        // return this.http.post<Response>('profile/upload', formData);
    }

    /**
     * Delete file dependinng on the resourceType param
     * @param resourceType 202-profile/201-resume/203-video
     * @param resouceId resouceId from the profile details API
     */
    deleteFile(resourceType: number, resouceId: number): Observable<Response> {
        let httpOptions = {
            params: {
                resourceTypeId: resourceType.toString(),
                Id: resouceId.toString()
            }
        }
        return this.http.delete<Response>('profile/deletefile', httpOptions).pipe(
            flatMap(response => this.getProfileDetails(''))
        );
        // return this.http.delete<Response>('profile/deletefile', httpOptions);
    }

    /**
     * Share the feedback
     * @param rating 0-5 rating
     */
    shareFeedback(rating: number, comment?: string): Observable<Response> {
        return this.http.post<Response>('profile/sharefeedback', { rating: rating, comment: comment });
    }

}