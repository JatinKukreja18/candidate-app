import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable()
export class LinkedInService {

    constructor(
        private http: HttpClient,
    ) {}
    
    /**
     * Construct and Return linkedin consent screen url
     */
    initLinkedInAuth() {
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${environment.linkedIn.client_id}&redirect_uri=${environment.linkedIn.redirect_uri}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
    }

    /**
     * Get the current linkedIn user AccessToken and other details i.e email, name
     * @param code code from consent screen redirect
     */
    getAccessToken(code: string) {
        let url = `linkedin`;
        let httpOptions = {
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: environment.linkedIn.redirect_uri,
                client_id: environment.linkedIn.client_id            
            }
        }
        return this.http.post(url, {}, httpOptions);
    }
}