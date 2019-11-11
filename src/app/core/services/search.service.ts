import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Response, SearchJobForm, TakeActionForm } from '@app/core/models';

import * as SecureLS from 'secure-ls';

@Injectable()
export class SearchJobService {
    searchJobsReq: SearchJobForm;
    public refreshResults: BehaviorSubject<boolean>;
    private ls: any;
    
    constructor(private http: HttpClient) {
        this.refreshResults = new BehaviorSubject<boolean>(false); // Update the page name on the header.
        this.ls = new SecureLS({encodingType: 'Base64', isCompression: false});
        console.log('ls',this.ls.get('selectedJob'));
        
    }

    /**
     * Get logged in user recent search
     */
    getRecentSearch(): Observable<Response>{
        return this.http.post<Response>(`search/recent`, {});
    }

    /**
     * Search Jobs based on city and skills
     * @param reqBody Request body of type SearchJobForm
     */
    searchJobs(pageNum?: number): Observable<Response>{
        let httpOptions = {
            params: {
                pageNum: pageNum ? pageNum.toString() : '1' 
            }
        }
        return this.http.post<Response>(`search`, this.getSearchLocation(), httpOptions);
    }

    /**
     * Get matching jobs for current user
     * @param pageNum page number to fetch
     */
    getMatchingJobs(pageNum?: number): Observable<Response>{
        let httpOptions = {
            params: {
                pageNum: pageNum ? pageNum.toString() : '1' 
            }
        }
        return this.http.post<Response>('search/matchjob', {}, httpOptions);
    }

    /**
     * Take an action on a job. Used to apply - 18/shortlist - 1 a job.
     * @param reqBody Object of type TakeActionForm
     */
    takeAction(reqBody: TakeActionForm): Observable<Response> {
        return this.http.post<Response>('job/action', reqBody);
    }


    /**
     * Get the selected job details
     * @param jobStatus 0-shortlisted,applied/1-interview,goodToHire,rejected
     */
    getJobDetails(jobStatus: number): Observable<Response> {
        let selectedJob = this.getSelectedJob(); // Get the selected job from local storage
        console.log('selectedJob',selectedJob);
        
        let url = 'job/detail'
        
        if (selectedJob) {
            url += `?referrenceId=${selectedJob.referrenceId}&status=${jobStatus}&bucketid=${selectedJob.bucket_Id}`
        }
        return this.http.get<Response>(url);
    }

    /**
     * Set search job type
     * @param type 1-search jobs/ 2-matching Jobs
     */
    setSearchType(type: number) {
        // localStorage.setItem('searchType', type.toString());
        this.ls.set('searchType', type);
    }

    /**
     * Get Search type
     */
    getSearchType() {
        // return parseInt(localStorage.getItem('searchType'));
        return this.ls.get('searchType');
    }

    /**
     * Set the current search parameters for future usage in results page
     * @param reqBody object value with fields lat, long, location, skills
     */
    setSearchLocation(reqBody){
        // localStorage.setItem('currentSearch', JSON.stringify(reqBody));
        this.ls.set('currentSearch', reqBody);
    }

    /**
     * Get the search location from local storage
     */
    getSearchLocation(){
        // return JSON.parse(localStorage.getItem('currentSearch'));
        return this.ls.get('currentSearch');
    }

    /**
     * Set the search result in the local storage for future usage in results page
     * @param searchResult response object from the API
     */
    setSearchResults(searchResult) {
        // localStorage.setItem('results', JSON.stringify(searchResult));
        this.ls.set('results', searchResult);
    }

    /**
     * Get search results from the local storage
     */
    getSearchResults() {
        // return JSON.parse(localStorage.getItem('results'));
        return this.ls.get('results');
    }

    /**
     * Set selected job in the local storage to use in job details page
     * @param selectedJob 
     */
    setSelectedJob(selectedJob) {
        // localStorage.setItem('selectedJob', JSON.stringify(selectedJob));
        this.ls.set('selectedJob', selectedJob);
    }

    /**
     * Get selected Job from local storage
     */
    getSelectedJob() {
        // return JSON.parse(localStorage.getItem('selectedJob'));
        return this.ls.get('selectedJob');
    }

    /**
     * Set selected job details in the local storage to persist the details after reload and minimize the API call
     * @param jobDetails Job details object
     */
    setSelectedJobDetails(jobDetails) {
        // localStorage.setItem('selectedJobDetails', JSON.stringify(jobDetails));
        this.ls.set('selectedJobDetails', jobDetails);
    }

    /**
     * Get selected Job details from local storage
     */
    getSelectedJobDetails() {
        // return JSON.parse(localStorage.getItem('selectedJobDetails'));
        return this.ls.get('selectedJobDetails');
    }

    /**
     * Set/Get the current active page of search results
     * @param page number value 1-results page/2-details page
     */
    searchActivePage(page?: number) {
        if (page) this.ls.set('searchPage',page);
        else return this.ls.get('searchPage');
    }

    /**
     * Set/Get search results current page
     * @param pageNumber 
     */
    jobResultsCurrentPage(pageNumber?: number) {
        if (pageNumber) this.ls.set('currentJobSearchpage', pageNumber);
        else return this.ls.get('currentJobSearchpage');
    }

    /**
     * Clear the search results
     */
    removeJobResultSession() {
        this.ls.remove('currentJobSearchpage');
        this.ls.remove('results');
    }
}
