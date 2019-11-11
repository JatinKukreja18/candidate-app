import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { mergeMap, tap, flatMap } from 'rxjs/operators'; 
import { Response, ProfileForm } from '@app/core/models';
import { AuthenticationService } from '@app/core/services/auth.service';
import * as SecureLS from 'secure-ls';

@Injectable()
export class ProfileService {
    private ls:any;

    constructor(private http: HttpClient, private authService: AuthenticationService) {
        this.ls = new SecureLS({encodingType: 'Base64', isCompression: false});
    }

    /**
     * Get current user profile details
     */
    getProfileDetails():Observable<Response>{
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
    }

    /**
     * Update the value of the profile details
     * @param reqBody Profile Form
     */
    updateProfileDetails(reqBody: ProfileForm):Observable<Response>{
        return this.http.post<Response>('profile/create', reqBody).pipe(
            tap(response => {
                this.ls.remove('profile');
            }),
            flatMap(response => this.getProfileDetails())
        );
    }

    /**
     * Save profile data offline in local storage
     * @param reqBody Profile Form type
     */
    localProfileDetails(reqBody?: ProfileForm){
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
    uploadFile(formData):Observable<Response> {
        return this.http.post<Response>('profile/upload', formData).pipe(
            mergeMap(response => this.getProfileDetails())
        );
        // return this.http.post<Response>('profile/upload', formData);
    }

    /**
     * Delete file dependinng on the resourceType param
     * @param resourceType 202-profile/201-resume/203-video
     * @param resouceId resouceId from the profile details API
     */
    deleteFile(resourceType: number, resouceId: number):Observable<Response> {
        let httpOptions = {
            params: {
                resourceTypeId: resourceType.toString(),
                Id: resouceId.toString()
            }
        }
        return this.http.delete<Response>('profile/deletefile', httpOptions).pipe(
            flatMap(response => this.getProfileDetails())
        );
        // return this.http.delete<Response>('profile/deletefile', httpOptions);
    }

    /**
     * Share the feedback
     * @param rating 0-5 rating
     */
    shareFeedback(rating:number, comment?: string): Observable<Response> {
        return this.http.post<Response>('profile/sharefeedback', {rating: rating, comment: comment});
    }
    
}