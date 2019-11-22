import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from '@app/core/models';
import {BehaviorSubject} from 'rxjs';
import * as SecureLS from 'secure-ls';

import { environment } from '../../../environments/environment';
const apiUrl = environment.apiUrl;

@Injectable()
export class CommonService {

    private ls: any;

    constructor(private http: HttpClient) {
        this.ls = new SecureLS({encodingType: 'Base64', isCompression: false});
    }

    /**
    * Get the list of countries from the local storage(if available) and make http request if not in localstorage
    */


    private techassessment = new BehaviorSubject<any>({});
    currentassmentstatus = this.techassessment.asObservable();



    changestatus(data:any)
    {
        this.techassessment.next(data);
    }


    getCountryList(): Observable<Response> {
        // const countries = JSON.parse(localStorage.getItem('countries'));
        const countries = this.ls.get('countries');
        if (countries) {
            return of(countries);
        } else {
            return this.http.get<Response>('../assets/country.json');
            // return this.http.get<Response>(apiUrl + environment.apiPaths.countries);
            // return this.http.get<Response>('/common/country').pipe(tap(response => {
            //     // localStorage.setItem('countries', JSON.stringify(res));
            //     this.ls.set('countries', response);
            // }));
        }
    }
    // getCountryList(): Observable<any>{
    //   return this.http.get(apiUrl + environment.apiPaths.countries);
    // }
    /**
     * Get the list of skills from the local storage(if available) and make http request if not in localstorage
     * @returns
     */
    getSkillsList(): Observable<Response> {
        // const skills = JSON.parse(localStorage.getItem('skills'));
        const skills = this.ls.get('skills');
        if (skills) {
            return of(skills);
        } else {
            return this.http.post<Response>('/common/skillsuggest', { "skills": ""}).pipe(tap(response => {
                // localStorage.setItem('skills', JSON.stringify(res));
                this.ls.set('skills', response);
            }));
        }
    }

    /**
     * Get the list of domains available for jobs
     * @returns observable response
     */
    getDomainList(): Observable<Response> {
        // const domains = JSON.parse(localStorage.getItem('domainlist'));
        const domains = this.ls.get('domainlist');
        if (domains) {
            return of(domains);
        } else {
            return this.http.get<Response>('/common/domainlist').pipe(tap(response => {
                // localStorage.setItem('domainlist', JSON.stringify(response));
                this.ls.set('domainlist', response);
            }));
        }
    }
}
