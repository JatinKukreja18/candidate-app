import { Output, EventEmitter, Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SearchJobService, CommonService, AnalyticsService } from '@app/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationMessages, FeedbackMessages } from '@app/core/messages';

@Component({
  selector: 'app-results-sidebar',
  templateUrl: './results-sidebar.component.html',
  styleUrls: ['./results-sidebar.component.scss']
})
export class ResultsSidebarComponent implements OnInit, OnDestroy {
  @Output() fetched: EventEmitter<any> = new EventEmitter<any>(null);
  @Output() selected: EventEmitter<boolean> = new EventEmitter<any>(); // Emit event with boolean value
  @Output() onScroll: EventEmitter<boolean> = new EventEmitter<boolean>(); // Emit event with boolean value
  selectedJob: any;
  jobsResponse: any = {};
  loading = false;
  currentPage: number = 1;
  currentSearchType: number;
  searchPage: number;
  filterForm: FormGroup;
  searchReqBody: any;
  currentSearchQuery: any;
  skills: any[] = [];
  domains: any[] = [];
  validationMsgs: any;
  filterApplied = false;
  domainPreviousValue: any = [];

  constructor(
    private router: Router,
    private searchJobService: SearchJobService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private message: NzMessageService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.validationMsgs = ValidationMessages;
    this.selectedJob = this.searchJobService.getSelectedJob();
    this.getDomainsList();
    this.currentSearchType = this.searchJobService.getSearchType();
    this.currentPage = this.searchJobService.jobResultsCurrentPage() ? this.searchJobService.jobResultsCurrentPage() : 1;
    this.searchPage = this.searchJobService.searchActivePage();
    if (this.searchPage != 2 && this.currentSearchType === 1) {
      this.getJobResults(false);
    } else if (this.searchPage != 2 && this.currentSearchType === 2) {
      this.getMatchingJobs(true);
    } else if (this.searchPage == 2) {
      this.jobsResponse = this.searchJobService.getSearchResults();
      // this.updatePreSelectedJob();
      this.fetched.emit(this.jobsResponse);
    }
    this.filterForm = this.formBuilder.group({
      query: [null],
      payrate: ['', [Validators.pattern(/^[0-9]{1,7}$/)]],
      domain: [null],
      employmentType: [null],
      maxPayRate: ['', [Validators.min(100), Validators.pattern(/^[0-9]{1,4}$/)]],
      minPayRate: ['', [Validators.min(100), Validators.pattern(/^[0-9]{1,4}$/)]]
    });
    this.currentSearchQuery = this.searchJobService.getSearchLocation();
    if (this.currentSearchQuery){
      if (this.currentSearchQuery['domain'] && this.currentSearchQuery['domain'] instanceof Array  && this.currentSearchQuery['domain'].length > 0) {
        this.filterForm.get('domain').setValue(this.currentSearchQuery['domain']);
        this.filterApplied = true;
      }
      if (this.currentSearchQuery['payrate']) {
        if (this.currentSearchQuery['payrate'].indexOf('-') > 0) {
          this.filterForm.get('minPayRate').setValue(this.currentSearchQuery['payrate'].split('-')[0]);
          this.filterForm.get('maxPayRate').setValue(this.currentSearchQuery['payrate'].split('-')[1]);
        } else {
          this.filterForm.get('payrate').setValue(this.currentSearchQuery['payrate']);
        }
        this.filterApplied = true;
      }
      if (this.currentSearchQuery['employmentType'] && this.currentSearchQuery['employmentType'] instanceof Array && this.currentSearchQuery['employmentType'].length > 0) {
        this.filterForm.get('employmentType').setValue(this.currentSearchQuery['employmentType'][0]);
        this.filterApplied = true;
      }
    }
    this.searchJobService.refreshResults.subscribe(isRefresh => {
      if (isRefresh) {
        this.selectedJob = this.searchJobService.getSelectedJob();
        if (this.jobsResponse && this.jobsResponse.results && this.jobsResponse.results instanceof Array && this.jobsResponse.results.length > 0){
          let selectedJobIdx = null;
          this.jobsResponse.results.forEach((element, idx) => {
            if (element.referrenceId == this.selectedJob.referrenceId) {
              element = this.selectedJob;
              selectedJobIdx = idx;
            }
          });
          this.jobsResponse.results[selectedJobIdx] = this.selectedJob;
        }
      }
    });
  }

  ngOnDestroy() {
    // this.searchJobService.setSearchResults(null);
  }

  /**
   * Get the suggested skills list for the results filter
   */
  getSuggestedSkills(){
    this.commonService.getSkillsList().subscribe((response) => {
      if (response.code == 200) {
        if (response.data && response.data instanceof Array && response.data.length > 0) {
          this.skills = response.data.map((elem) => {
            return elem.values;
          });
        }
      }
    });
  }

  /**
   * Get Domain suggestions list for result filter
   */
  getDomainsList() {
    this.commonService.getDomainList().subscribe(response => {
      if (response && response.code === 200 && response.data instanceof Array && response.data.length > 0) {
        this.domains = response.data.map(elem => {
          return elem.name;
        });
      }
    });
  }

  /**
   * Hostlistern to detect scroll
   * @param event 
   */
  @HostListener("document:scroll", ['$event'])
  onWindowScroll(event) {
    if (event && event.target && event.target.scrollTop && event.target.scrollHeight && !this.loading && event.target.scrollTop + event.target.clientHeight == event.target.scrollHeight) {
      if (this.jobsResponse && this.currentPage < this.jobsResponse.totalPageCount) {
        this.currentPage ++;
        this.searchJobService.jobResultsCurrentPage(this.currentPage);
        if (this.currentSearchType === 1) {
          this.getJobResults(false);
        } else if (this.currentSearchType === 2) {
          this.getMatchingJobs(false);
        }
      }
    }
  }

  /**
   * Hostlistern to detect scroll
   * @param event 
   */
  @HostListener("document:scroll", ['$event'])
  onHorizontalScroll(event) {
    if (event && event.target && event.target.scrollLeft && event.target.scrollWidth && !this.loading && event.target.scrollWidth - event.target.scrollLeft == event.target.offsetWidth) {
      if (this.jobsResponse && this.currentPage < this.jobsResponse.totalPageCount) {
        this.currentPage ++;
        this.searchJobService.jobResultsCurrentPage(this.currentPage);
        if (this.currentSearchType === 1) {
          this.getJobResults(false);
        } else if (this.currentSearchType === 2) {
          this.getMatchingJobs(false);
        }
      }
    }
  }

  /**
    * Get the job results form the API and Show markers on the Map on success
  */
  getJobResults(isFilter: boolean){
    this.loading = true;
    const loading = this.message.loading(FeedbackMessages.loading.JobsFetch, {nzDuration: 0}).messageId;
    this.searchJobService.searchJobs(this.currentPage).subscribe((response) => {
      this.loading = false;
      this.message.remove(loading);
      // this.hideFilters();
      if (response.code === 200 && response.data) {
        if (this.jobsResponse && this.jobsResponse.results && !isFilter) {
          this.jobsResponse.results = this.jobsResponse.results.concat(response.data['results']);
          // this.hideFilters();
        } else {
          this.jobsResponse = response.data;
          // this.jobsResponse.payRateUnitSymbol = response.data['payRateUnitSymbol'];
          // this.jobsResponse.totalPageCount = response.data['totalPageCount'];
          // this.jobsResponse.totalResult = response.data['totalResult'];
          // this.jobsResponse.results = response.data['results'];
          // this.hideFilters();
        }
        this.fetched.emit(this.jobsResponse);
        this.searchJobService.setSearchResults(this.jobsResponse);
        this.updatePreSelectedJob();
      } else if (response.code === 404){
        this.jobsResponse = null;
        this.fetched.emit(null);
      }
    }, (err) => {
      this.loading = false;
      this.message.remove(loading);
    });
  }

  /**
   * Get matching jobs
   */
  getMatchingJobs(isNew: boolean) {
    this.loading = true;
    const loading = this.message.loading(FeedbackMessages.loading.JobsFetch, {nzDuration: 0}).messageId;
    this.searchJobService.getMatchingJobs(this.currentPage).subscribe((response) => {
      this.loading = false;
      this.message.remove(loading);
      if (response && response.code === 200) {
        if (this.jobsResponse && this.jobsResponse['results'] && !isNew) {
          this.jobsResponse.results = this.jobsResponse.results.concat(response.data['results']);
        } else {
          this.jobsResponse = response.data;
        }
        this.fetched.emit(this.jobsResponse);
        this.searchJobService.setSearchResults(this.jobsResponse);
        this.updatePreSelectedJob();
        // this.resultSidebarTitle = `Top ${this.jobsResponse.results.length} of ${this.jobsResponse.totalResult} Matching Jobs`;
      }
    }, () =>{
      this.loading = false;
      this.message.remove(loading);
    });
  }

  /**
    * activates the selected job
    * @param event emits action based on the triggered event
    * @param newValue takes selected job as input
  */
  listClick(event, newValue) {
    if (!this.selectedJob || (this.selectedJob && this.selectedJob.referrenceId != newValue.referrenceId)) {
      this.selectedJob = newValue;
      this.analyticsService.eventEmitter('JobSearchScreen', 'jobListDetails', 'jobListDetails');
      this.searchJobService.setSelectedJob(newValue);
      event.target.classList.add('active');
      this.selected.emit(newValue);
    }
    // this.router.navigateByUrl('/search/details');
  }

  /**
   * Reset filters
   */
  resetFilter() {
    this.filterForm.get('domain').setValue(null);
    this.filterForm.get('payrate').setValue('');
    this.filterForm.get('employmentType').setValue(null);
    this.filterForm.get('minPayRate').setValue('');
    this.filterForm.get('maxPayRate').setValue('');
    this.searchReqBody = this.searchJobService.getSearchLocation();
    if (this.searchReqBody) {
      this.searchReqBody['searchtype'] = 'Query';
      delete this.searchReqBody['payrate'];
      delete this.searchReqBody['domain'];
      delete this.searchReqBody['employmentType'];
      delete this.searchReqBody['sortby'];
    }
    this.searchJobService.setSearchLocation(this.searchReqBody);
    this.currentPage = 1;
    this.searchJobService.jobResultsCurrentPage(this.currentPage);
    this.getJobResults(true);
    this.filterApplied = false;
    this.onMultiSelectChange(null);
    let countElemExist = document.querySelector('#selectedCount');
    if(countElemExist) countElemExist.remove();
  }

  /**
   * Filter jobs based on skills and pay rate
   */
  applyFilter(sortBy?: number) {
    if (this.filterForm.invalid) {
      return;
    } else {
      this.searchReqBody = this.searchJobService.getSearchLocation();
      if (this.searchReqBody) {
        if (this.filterForm.value.domain && this.filterForm.value.domain.length < this.domains.length) this.searchReqBody['domain'] = this.filterForm.value.domain;
        else if (this.filterForm.value.domain && this.filterForm.value.domain.length == this.domains.length) delete this.searchReqBody['domain']
        if (this.filterForm.value.employmentType) {
          this.searchReqBody['employmentType'] = [this.filterForm.value.employmentType];
          if (this.filterForm.value.employmentType == 'Full Time') {
            if (this.filterForm.value.payrate) this.searchReqBody['payrate'] = this.filterForm.value.payrate.toString();
          } else if (this.filterForm.value.employmentType == 'Contract') {
            if (this.filterForm.value.minPayRate && this.filterForm.value.maxPayRate) this.searchReqBody['payrate'] = `${this.filterForm.value.minPayRate.toString()}-${this.filterForm.value.maxPayRate.toString()}`;
          }
        }
        if (sortBy != null && sortBy != undefined) this.searchReqBody['sortby'] = sortBy;
        this.searchReqBody['searchtype'] = 'filter';
        this.searchJobService.setSearchLocation(this.searchReqBody);
        this.currentPage = 1;
        this.searchJobService.jobResultsCurrentPage(this.currentPage);
        this.analyticsService.eventEmitter('JobSearchScreen', 'addFilters', 'addFilters');
        this.getJobResults(true);
        this.hideFilters();
        this.filterApplied = true;
      }
    }
  }

  /**
   * Show filters
   */
  showFilters() {
    document.querySelector(".filterCont").classList.add("showFilter");
    document.querySelector(".filterBtn").classList.add("none");
    document.querySelector(".filterOverlay").classList.add("overlayShow");
  }

  /**
   * Hide filters
   */
  hideFilters() {
    if (document.querySelector(".filterCont")) document.querySelector(".filterCont").classList.remove("showFilter");
    if (document.querySelector(".filterBtn")) document.querySelector(".filterBtn").classList.remove("none");
    if (document.querySelector(".filterOverlay")) document.querySelector(".filterOverlay").classList.remove("overlayShow");
  }

  /**
   * Toggle the skills dropdown on click of plus icon
   */
  toggleSkillsDropdown() {
    let skillsInput = document.querySelector('#domain .ant-select-selection');
    skillsInput['click']();
  }
  
  /**
   * Show custom count of selected element more than 1
   * @param value String array of selected values
   */
  onMultiSelectChange(value) {
    let countElemExist = document.querySelector('#selectedCount');
    if (!countElemExist && value && value.length > 1) {
      const countElem = document.createElement("span");
      countElem.id = "selectedCount";
      countElem['innerText'] = '+ ' + (value.length -1).toString();
      countElem.addEventListener('mouseenter', (event) => {
        countElem.title = this.filterForm.value.domain;
      })
      document.querySelector("#domain ul").append(countElem);
    } else if ( countElemExist && value && value.length > 1) {
      countElemExist['innerText'] = '+ ' + (value.length -1).toString();
    } else if (countElemExist && value && value.length <= 1) {
      countElemExist.remove();
    }
  }

  /**
   * Update the selected job value after refreshing the list
   */
  updatePreSelectedJob() {
    if (this.jobsResponse && this.jobsResponse['results'] instanceof Array && this.selectedJob) {
      const selectedJob = this.jobsResponse.results.find(element => {
        return element['referrenceId'] == this.selectedJob['referrenceId'];
      });
      if (selectedJob) {
        this.selectedJob = selectedJob;
        this.searchJobService.setSelectedJob(selectedJob);
      }
    }
  }

  onKeyDown(event, maxlength, maxValue) {
    let e = <KeyboardEvent> event;
    if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      // Allow: Ctrl+C
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
      // Allow: Ctrl+V
      (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      // Allow: Ctrl+X
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }

    if (e.target['value'] && e.target['value']['length']>=maxlength) {
      e.preventDefault();
    }

    if (maxValue && e.target['value'] >= maxValue) {
      e.preventDefault();
    }

    // if (minValue && e.target['value'] <= minValue) {
    //   e.preventDefault();
    // }
  }

  selectAllDomain(event) {
    if (event.target.checked) {
      this.filterForm.get("domain").setValue(this.domains);
    } else {
      this.filterForm.get("domain").setValue([]);
    }
  }
 
}
