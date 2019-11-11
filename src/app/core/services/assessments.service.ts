import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from '@app/core/models';

import * as SecureLS from 'secure-ls';

interface ScheduleTestForm {
    assessmentId: string,
    assessmentName: string,
    questionCount: number,
    duration: string
}

@Injectable()
export class AssessmentsService {
    private ls: any;

    constructor(private http: HttpClient) {
        this.ls = new SecureLS({encodingType: 'Base64', isCompression: false});
    }

    /**
     * Get the list of user's Assessments
     */
    getMyAssessments(filterStatus?: number, pageNumber?: number):Observable<Response> {
        let httpOptions = {
            params: {}
        }
        if(filterStatus) httpOptions['params']['FilterStatus'] = filterStatus;
        if(pageNumber) httpOptions['params']['pageNum'] = pageNumber ? pageNumber : 1;
        return this.http.get<Response>('assessment/myAssessment', httpOptions);
    }

    /**
     * Get all assessments
     */
    getAllAssessments():Observable<Response> {
        return this.http.get<Response>('assessment/list').pipe(tap((response) => {
            if (response && response.code === 200) {
                // localStorage.setItem('assessments', JSON.stringify(response.data));
                this.ls.set('assessments', response.data);
            }
        }));
    }

    /**
     * Return the loaclly saved assessments for search
     */
    getLocalAssessments() {
        // return JSON.parse(localStorage.getItem('assessments'));
        return this.ls.get('assessments');
    }

    /**
     * Schedule a test
     * @param reqBody ScheduleTestForm Type
     */
    scheduleTest(reqBody: ScheduleTestForm):Observable<Response> {
        return this.http.post<Response>('assessment/schedule', reqBody);
    }
}