import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AssessmentsService, AnalyticsService } from '@app/core';
import { NzMessageService } from 'ng-zorro-antd';
import { FeedbackMessages } from '@app/core/messages';

@Component({
    selector: 'app-assessments',
    templateUrl: './assessments.component.html',
    styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit {
    myAssessmentsResponse: any;
    assessmentsList: any[];
    selectedAssessment: any;
    filterForm: FormGroup;
    currentPage: number = 1;
    loading = false;
    filterApplied = false;
    tabActive: {
        assessment: boolean,
        browseAll: boolean
    } = {
        assessment: true,
        browseAll: false
    }

    constructor(
        private assessmentService: AssessmentsService,
        private formBuilder: FormBuilder,
        private message: NzMessageService,
        private route: ActivatedRoute,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit(){
        document.querySelector(".filterBtn").addEventListener("click", () => {
            this.analyticsService.eventEmitter('MyAssessmentScreen', 'MyAssessmentFilter', 'MyAssessmentFilter');
            document.querySelector(".filterCont").classList.add("showFilter");
            document.querySelector(".filterBtn").classList.add("none");
            document.querySelector(".filterOverlay").classList.add("overlayShow");
        });
        document.querySelector(".crossFilter").addEventListener("click", () => {
            document.querySelector(".filterCont").classList.remove("showFilter");
            document.querySelector(".filterBtn").classList.remove("none");
            document.querySelector(".filterOverlay").classList.remove("overlayShow");
        });

        this.filterForm = this.formBuilder.group({
            FilterStatus: [null]
        })

        this.route.queryParamMap.subscribe(result => {
            if (result && result['params'] && result['params']['status']){
                this.filterForm.get('FilterStatus').setValue(result['params']['status']);
                this.filterApplied = true;
                this.getMyAssessments(result['params']['status'], 1);
            } else {
                this.getMyAssessments(null, this.currentPage);
            }
        });
    }

     /**
     * Hostlistern to detect scroll
     * @param event 
     */
    @HostListener("document:scroll", ['$event'])
    onWindowScroll(event) {
        if (this.tabActive.assessment && event && event.target && event.target.scrollTop && event.target.scrollHeight && !this.loading && event.target.scrollTop + event.target.clientHeight == event.target.scrollHeight) {
            if (this.currentPage < this.myAssessmentsResponse.totalPageCount) {
                this.currentPage ++;
                this.getMyAssessments(this.filterForm.value.FilterStatus, this.currentPage);
            }
        } else if (event && event.target && event.target.scrollLeft && event.target.scrollWidth && !this.loading && event.target.scrollWidth - event.target.scrollLeft == event.target.offsetWidth) {
            if (this.currentPage < this.myAssessmentsResponse.totalPageCount) {
                this.currentPage ++;
                this.getMyAssessments(this.filterForm.value.FilterStatus, this.currentPage);
            }
        }
    }

    /**
     * Get current users My Assessments
     */
    getMyAssessments(filterStatus?:number, pageNum?:number) {
        this.loading = true;
        const loading = this.message.loading(FeedbackMessages.loading.AssessmentsFetch, { nzDuration: 0 }).messageId;
        this.assessmentService.getMyAssessments(filterStatus, pageNum).subscribe((response) => {
            this.message.remove(loading);
            this.loading = false;
            // this.hideFilter();
            if(response.code && response.code === 200) {
                this.myAssessmentsResponse = response.data;
                if (response.data['results'] && response.data['results'] instanceof Array && response.data['results'].length > 0) {
                    if(this.assessmentsList) this.assessmentsList = this.assessmentsList.concat(response.data['results']);
                    else this.assessmentsList = response.data['results'];
                    this.selectedAssessment = this.assessmentsList[0];
                }
                if (filterStatus) {
                    this.filterApplied = true;
                    this.filterForm.get('FilterStatus').setValue(filterStatus);
                }
                else if (!filterStatus) this.filterApplied = false;
            }
        }, () => {
            this.message.remove(loading);
            this.loading = false;
        })
    }

    /**
     * Get all the Assessments
     */
    getAllAssessments() {
        this.loading = true;
        const loading = this.message.loading(FeedbackMessages.loading.AssessmentsFetch, { nzDuration: 0 }).messageId;
        this.assessmentService.getAllAssessments().subscribe((response) => {
            this.loading = false;
            this.message.remove(loading);
            if (response && response.code === 200 && response.data instanceof Array) {
                this.assessmentsList = response.data;
                this.selectedAssessment = this.assessmentsList[0];
            }
        }, () => {
            this.loading = false;
            this.message.remove(loading);
        });
    }

    /**
     * Select Assessment 
     * @param assessment Selected assesment object
     */
    selectAssessment(assessment: any) {
        if(!this.selectedAssessment || (this.selectedAssessment && this.selectedAssessment.assessmentId != assessment.assessmentId)) {
            this.selectedAssessment = assessment;
        }
    }

    /**
     * Schedule a test for assessment
     */
    scheduleTest() {
        if (!this.loading) {
            let reqBody = {
                "assessmentId": this.selectedAssessment['assessmentId'],
                "assessmentName": this.selectedAssessment['assessmentName'],
                "questionCount": parseInt(this.selectedAssessment['questionCount']),
                "duration": this.selectedAssessment['duration']
            }
            this.loading = true;
            const loading = this.message.loading(FeedbackMessages.loading.AssessmentSchedule, {nzDuration: 0}).messageId;
            this.assessmentService.scheduleTest(reqBody).subscribe(response => {
                this.loading = false;
                this.message.remove(loading);
                if (response && response.code === 200) {
                    this.analyticsService.eventEmitter('AssessmentFilterScreen', 'BrowseAllAssessmentStatus', 'BrowseAllAssessmentStatus');
                    this.message.success(response.message, {nzDuration: 1500});
                }
            }, () => {
                this.loading = false;
                this.message.remove(loading);
            });
        }
    }

    /**
     * Reset filters
     */
    resetFilter() {
        this.filterForm.get('FilterStatus').setValue(null);
        this.currentPage = 1;
        this.assessmentsList = [];
        this.selectedAssessment = null;
        this.analyticsService.eventEmitter('AssessmentFilterScreen', 'AssessmentFilterClearAll', 'AssessmentFilterClearAll');
        this.getMyAssessments(null, this.currentPage);
    }

    /**
     * Filter My assessment based on the 
     */
    applyFilter() {
        this.currentPage = 1;
        this.assessmentsList = [];
        this.selectedAssessment = null;
        this.filterApplied = true;
        this.analyticsService.eventEmitter('AssessmentFilterScreen', 'AssessmentFilterApply', 'AssessmentFilterApply');
        this.getMyAssessments(this.filterForm.value.FilterStatus, this.currentPage);
        this.hideFilter();
    }

    /**
     * Search results from list of all assessments
     * @param event 
     */
    searchResults(event) {
        let keyword = event.target ? event.target.value : '';
        let assessments = this.assessmentService.getLocalAssessments();
        this.analyticsService.eventEmitter('BrowseAllAssessmentScreen', 'BrowseAllAssessmentSearch', 'BrowseAllAssessmentSearch');
        if (assessments && assessments.length > 0) {
            this.assessmentsList = assessments.filter((elem, idx) => {
                if (elem.assessmentName) {
                    let keyMatchRegex = new RegExp(`(${keyword})`, 'i');
                    if (keyMatchRegex.test(elem.assessmentName)){
                        return elem;
                    }
                }
            })
        }
        let e = <KeyboardEvent> event;
        if (e.target['value'] && e.target['value']['length']>=10) {
            e.preventDefault();
        }

    }

    /**
     * Show tab based on the tabName. Switch between the My Assessments/Browse all
     * @param tabName Tab name changepassword/notifications
     */
    showTab(tabName: string) {
        for(let key in this.tabActive) {
            if (tabName == 'assessment' && !this.tabActive['assessment'] && !this.loading) {
                this.assessmentsList = [];
                this.selectedAssessment = null;
                this.currentPage = 1;
                this.getMyAssessments();
            } else if (tabName == 'browseAll' && !this.tabActive['browseAll'] && !this.loading){
                this.assessmentsList = [];
                this.selectedAssessment = null;
                this.currentPage = 1;
                this.getAllAssessments();
            }
            this.tabActive[key] = false;
            this.hideFilter();
        }
        this.tabActive[tabName] = true;
    }

    /**
     * Hide filter
     */
    hideFilter() {
        if (document.querySelector(".filterCont") && document.querySelector(".filterBtn") && document.querySelector(".filterOverlay")) {
            document.querySelector(".filterCont").classList.remove("showFilter");
            document.querySelector(".filterBtn").classList.remove("none");
            document.querySelector(".filterOverlay").classList.remove("overlayShow");
        }
    }

    onKeyDown(event) {
        let e = <KeyboardEvent> event;
        if (e.target['value'] && e.target['value']['length']>=10) {
          e.preventDefault();
        }
    }
}