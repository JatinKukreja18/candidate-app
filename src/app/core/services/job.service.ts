import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Response, TakeActionForm, PreInterviewProcessFrom, ScheduleInterviewForm } from '@app/core/models';

import * as SecureLS from 'secure-ls';

@Injectable()
export class JobService {
    public startPreInterviewProcess: BehaviorSubject<boolean>;
    private ls: any;

    constructor(private http: HttpClient) {
        this.startPreInterviewProcess = new BehaviorSubject<boolean>(false);
        this.ls = new SecureLS({encodingType: 'Base64', isCompression: false});
    }

    /**
     * Take an action on a job. Used to apply - 18/shortlist - 1 a job.
     * @param reqBody Object of type TakeActionForm
     */
    takeAction(reqBody: TakeActionForm): Observable<Response> {
        return this.http.post<Response>('job/action', reqBody);
    }

    /**
     * Update interview slot and introduction video
     * @param reqBody 
     */
    preInterviewProcess(reqBody: PreInterviewProcessFrom): Observable<Response> {
        return this.http.post<Response>('/job/preinterviewprocess', reqBody);
    }

    /**
     * Get shortlisted/Applied Jobs
     * @param status 1-Shortlisted/18-Applied
     */
    getMyJobs(status: number, pageNumber?: number): Observable<Response> {
        let httpOptions = {
            params: {
                status: status.toString(),
                pageNum: pageNumber.toString()
            }
        }
        return this.http.get<Response>('job/mydetail', httpOptions);
    }

    /**
     * Get good to hire jobs lists of current user
     */
    getGoodToHireJobs(): Observable<Response> {
        return this.http.get<Response>('interview/goodtohire');
    }

    /**
     * Get good to hire jobs lists of current user
     */
    getRejectedJobs(): Observable<Response> {
        return this.http.get<Response>('interview/rejected');
    }

    /**
     * Get the jobs for interview of current user
     */
    getinterviewsList(): Observable<Response> {
        return this.http.get<Response>('interview/list');
    }

    /**
     * Get an interview detail
     * @param interviewId Interview Id of a job
     */
    getInterviewDetail(interviewId: string): Observable<Response> {
        let httpOptions = {
            params: {
                interviewId: interviewId.toString()
            }
        }
        return this.http.get<Response>('interview/detail', httpOptions);
    }

    /**
     * Schedule Interview 
     * @param reqBody 
     */
    scheduleInterview(reqBody: ScheduleInterviewForm): Observable<Response> {
        return this.http.post<Response>('/interview/schedule', reqBody);
    }

    /**
     * Set/get My jobs active tab
     * @param tab 
     */
    myJobsActiveTab(tab?: number) {
        if(tab) this.ls.set('tab', tab);
        else return this.ls.get('tab');
    }

    /**
     * Set/Get slots' date and time for pre interview process
     */
    preInterviewData(data?: any) {
        if(data) this.ls.set('preinterview', data);
        else return this.ls.get('preinterview');
    }

    /**
     * Remove slots' date and time for pre interview process
     */
    clearPreinterviewData() {
        this.ls.remove('preinterview');
    }
    
    /**
     * Set/Get the job list of my jobs page
     * @param jobList 
     */
    myJobsResultList(jobList?: any) {
        if (jobList) {
            this.ls.set('myjobslist', jobList);
        } else {
            return this.ls.get('myjobslist');
        }
    }

    /**
     *  Check availabity of slots of interview
     */
    checkCronofyAvailability(interviewId: string): Observable<any> {
        return this.http.post(`/cronofy/checkCronofyAvailability?InterviewId=${interviewId}`, {})
    }

}