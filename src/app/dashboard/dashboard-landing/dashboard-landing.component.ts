import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DashboardService, CommonService, SearchJobService, JobService, AuthenticationService, AnalyticsService } from '@app/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { FeedbackMessages } from '@app/core/messages';
import { UserDataService } from './../../core/services/userdata.service';
@Component({
  selector: 'app-dashboard-landing',
  templateUrl: './dashboard-landing.component.html',
  styleUrls: ['./dashboard-landing.component.scss']
})
export class DashboardLandingComponent implements OnInit {
  
  isVisible = false;
  isVisibleresume = false;
  // Element refrence for the city dropdown and map element
  @ViewChild('city', { read: ElementRef }) searchCityInput:ElementRef;
  candidate: any;
  submitted = false;
  searchForm: FormGroup;
  skills: any = [];
  selectedAddress: any = {};
  showConfirmationModal = false;
  missingFields: string[];
  showPreInterviewModal = false;
  candidateData = {};
  loading = true;

  constructor(
    private dashboardService: DashboardService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private searchService: SearchJobService,
    private router: Router,
    private jobService: JobService,
    private message: NzMessageService,
    private authService: AuthenticationService,
    private analyticsService: AnalyticsService,
    private userDataService: UserDataService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      city: ['', [Validators.required]],
      skills: [null, [Validators.required]]
    });
    // this.getDashboardData(true);
    this.getSuggestedSkills(); // Get the Skills lists from API or from local(if exists)
    this.initGoogleMapPlaces(); // Initialize the Google places API with the city dropdown element
    this.getCandidateData(); // Get the candidate data to be populated into the cover page
  }

  /**
  * getter funtion for easy form controls
  * @return form control values
  */
  get f() {
    return this.searchForm.controls;
  }

  private getCandidateData() {
    this.userDataService.getUserData(this.activatedRoute.snapshot.params.id).subscribe(res => {
      this.candidateData = res;
      // this.handleSkills(this.candidateData.CandidateSkills);
      this.loading = false;
    }, err => {
      console.log(err.message);
      // this.router.navigate(['pageNotFound']);
    });
  }

  /**
   * Get the current user dashboard Data
   */
  getDashboardData(showLoading: boolean) {
    let loading;
    if (showLoading) loading = this.message.loading(FeedbackMessages.loading.DashboardDetailsFetch, {nzDuration: 0}).messageId;
    this.dashboardService.getCandidateDashboard().subscribe((response) => {
      if (showLoading) this.message.remove(loading);
      if (response.code && response.code === 200) {

        console.log('data response',response);
        
        this.candidate = response.data;
        setTimeout(() => {
          this.gotoSlide(0, false);
        }, 200);
      }
    }, () => {
      if (showLoading) this.message.remove(loading);
    });
  }

  /**
    * Initializes google map places for auto-complete city search
  */
  initGoogleMapPlaces() {
    const autocomplete = new google.maps.places.Autocomplete(this.searchCityInput.nativeElement, {
      types: ['(cities)']
    });
    //Event listener to monitor place changes in the input
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      //Emit the new address object for the updated place
      this.selectedAddress = this.getFormattedAddress(autocomplete.getPlace());
    });
  }

  /**
    * Gets the formatted address
    * @param place Google Autocomplete place object
    * @return location_obj An address object in human readable format
  */
  getFormattedAddress(place) {
    let location_obj: any = {};
    for (let i in place.address_components) {
      let item = place.address_components[i];
      
      location_obj['formatted_address'] = place.formatted_address;
      if(item['types'].indexOf("locality") > -1) {
        location_obj['locality'] = item['long_name']
      } else if (item['types'].indexOf("administrative_area_level_1") > -1) {
        location_obj['admin_area_l1'] = item['short_name']
      } else if (item['types'].indexOf("street_number") > -1) {
        location_obj['street_number'] = item['short_name']
      } else if (item['types'].indexOf("route") > -1) {
        location_obj['route'] = item['long_name']
      } else if (item['types'].indexOf("country") > -1) {
        location_obj['country'] = item['long_name']
      } else if (item['types'].indexOf("postal_code") > -1) {
        location_obj['postal_code'] = item['short_name']
      }
    }
    if (place.geometry.location) {
      location_obj.lat = place.geometry.location.lat();
      location_obj.lng = place.geometry.location.lng();
    }
    return location_obj;
  }

  /**
    * Fetch suggested skill for job search
    * @return skillset to be filled in slection box
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
   * Update the job status either applied/shortlist
   */
  updateJobStatus(jobReferenceId, isApplied) {
    let reqBody = {
      referrenceId: jobReferenceId,
      status: isApplied ? 18 : 1,
      bucketId:this.searchService.getSelectedJob().bucket_Id
    }
    const loading = this.message.loading(FeedbackMessages.loading.JobShortlist, {nzDuration: 0}).messageId;
    this.jobService.takeAction(reqBody).subscribe((response) => {
      this.message.remove(loading);
      if(response.code && response.code === 200 && response.data) {
        this.message.success(response.message, {nzDuration: 1500});
        if (this.candidate['matchJob'] && this.candidate['matchJob']['results'] instanceof Array) {
          let selectedMatchJob = this.candidate['matchJob']['results'].find((element) => {
            return element.referrenceId = response.data['referrenceId'];
          });
          if (selectedMatchJob) {
            selectedMatchJob.jobStatusId = response.data['status'];
            if (response.data['status'] == 18) {
              selectedMatchJob.isApplied = true;
              this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardMatchingJobsApply', 'dashBoardMatchingJobsApply');
            } else if (response.data['status'] == 1) {
              selectedMatchJob.isShortlisted = true;
              selectedMatchJob.isApplied = false;
              this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardMatchingJobsShortlist', 'dashBoardMatchingJobsShortlist');
            }
          }
        }
        this.getDashboardData(false);
      } else if (response.code && response.code === 710 && response.data && response.data['missingFields'] && response.data['missingFields'].length > 0) {
        this.missingFields = response.data['missingFields'];
        this.showConfirmationModal = true;
      }
    }, () => {
      this.message.remove(loading);
    });
  }

  /**
   * View the details of a job selected on the dashboard
   * @param selectedJob current job object
   */
  viewJobDetails(selectedJob: any) {
    this.searchService.setSelectedJob(selectedJob);
    this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardMatchingJobDetails', 'dashBoardMatchingJobDetails');
    this.router.navigateByUrl('dashboard/job');
  }

  /**
   * Show custom count of selected element more than 1
   * @param value String array of selected values
   */
  onMultiSelectChange(value) {
    const element = document.querySelector("nz-select .ant-select-selection--multiple .ant-select-selection__rendered ul");
    const scrollX = document.querySelector('nz-select .ant-select-selection--multiple .ant-select-selection__rendered ul input.ant-select-search__field')['offsetLeft'];
    this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardJobSearchInputBox', 'dashBoardJobSearchInputBox');
    setTimeout(() => {
      element.parentElement.scrollTo({left: scrollX, top: 0, behavior: 'smooth'});
    }, 200);
  }

  /** 
   * Set the current search parameters and redirect to results page
  */
  onSubmit() {
    if (this.searchForm.invalid || !this.selectedAddress.locality || !this.selectedAddress.lat || !this.selectedAddress.lng) {
      this.submitted = true;
      return;
    } else {
      let reqBody = {
        lat: this.selectedAddress.lat,
        lng: this.selectedAddress.lng,
        location: this.selectedAddress.locality,
        query: this.searchForm.value.skills.toString(),
        searchtype: 'Query',
        fullAddress: this.selectedAddress.formatted_address ? this.selectedAddress.formatted_address: ''
      }
      this.searchService.setSearchLocation(reqBody);
      this.submitted = false;
      this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardJobSearchIcon', 'dashBoardJobSearchIcon');
      this.router.navigate(['/search/results'], {queryParams: {page: 1}});
    }
  }

  /** 
   * Show Modal
  */
  showModal(): void {
    this.isVisible = true;
  }

  /** 
   * Close Modal
  */

 handleOkres():void
 {
  this.isVisibleresume = false;
 }
  handleOk(): void {
    console.log('data modal');
    this.isVisible = false;
    this.isVisibleresume = true;
  }

  /**
   * Automatically change the matching jobs slider after certain interval
   */
  startCarousel() {
    let index = 0;
    let dots = document.querySelectorAll('.dot');
    setInterval(() => {
      this.gotoSlide(index, true);
      if (index == dots.length - 1) {
        index = 0;
      } else {
        index ++;
      }
    }, 3000);
  }

  /**
   * Change slide of matching jobs
   * @param index 
   */
  gotoSlide(index: number, isScroll: boolean) {
    let slides = document.querySelectorAll('.matching-job-card');
    let dots = document.querySelectorAll('.dot');
    dots.forEach((elem, idx) => {
      if (idx == index) elem.classList.add('active');
      else elem.classList.remove('active');
    });
    // if (dots[index]) dots[index].classList.add('active');
    if (slides[index]) {
      let slideScrollY = 0, slideScrollX = slides[index]['clientWidth'];
      // slides[index].parentElement['scrollTo']({left: slideScrollX * index, top: slideScrollY, behavior: 'smooth'});
      if (isScroll) slides[index].scrollIntoView({behavior: 'auto', block: 'nearest', inline: 'center'});
    }
  }

  /**
   * Go to My Jobs and activate a tab
   */
  gotoMyJobs(tab: number) {
    switch(tab) {
      case 1: this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardMyJobsShortlisted', 'dashBoardMyJobsShortlisted');
        break;
      case 2: this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardMyJobsApplied', 'dashBoardMyJobsApplied');
        break;
      case 3: this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardMyJobsInterview', 'dashBoardMyJobsInterview');
        break;
      case 4: this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardMyJobsGoodToHire', 'dashBoardMyJobsGoodToHire');
        break;
    }
    this.router.navigate(['myjobs'], {queryParams: { tab: tab }});
  }

  /**
   * Toggle the skills dropdown on click of plus icon
   */
  toggleSkillsDropdown() {
    let skillsInput = document.querySelector('.blue-search-header .ant-select-selection');
    skillsInput['click']();
  }

  Searchus(data)
  {
    console.log('data',data);
    
  }

  /**
   * Redirect to profile page with section to highlight
   * @param profileSection numeric values 1-Basic, 2-Proffessional, 3-Resume, 4-Social, 5-Video
   */
  gotoProfile(profileSection: number) {
    this.router.navigate(['/profile'], {queryParams: {active: profileSection}});
  }

  /**
   * Cancel handler for confirmation popup
   */
  handleConfirmCancel() {
    this.showConfirmationModal = false;
  }

  /**
   * Ok handler for confirmation popup
   */
  handleConfirmOk() {
    this.router.navigate(['profile'], {queryParams: {fields: this.missingFields.toString()}});
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }

  showModal1()
  {
    this.isVisible = true;
  }
  /**
   * Cancel handler for pre-interview popup
   */
  handlePreInterviewCancel() {
    if (this.authService.preInterviewRedirectPage()) {
      this.router.navigate([this.authService.preInterviewRedirectPage().split('?')[0]]);
    }
    this.jobService.clearPreinterviewData();
    this.showPreInterviewModal = false;
  }

  /**
   * Ok handler for pre-interview popup
   */
  handlePreInterviewOk() {
    if (this.authService.preInterviewRedirectPage()) {
      this.router.navigate([this.authService.preInterviewRedirectPage().split('?')[0]]);
    }
    this.jobService.clearPreinterviewData();
    this.showPreInterviewModal = false;
    // this.router.navigate(['profile'], {queryParams: {fields: this.missingFields.toString()}});
  }

  /**
   * Handler for complete profile action
   */
  completeProfileNavigation() {
    this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardCompleteProfile', 'dashBoardCompleteProfile');
  }

  /**
   * Handler for View all My Jobs
   */
  viewAllJobsHandler() {
    this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardViewAllMyJobs', 'dashBoardViewAllMyJobs');
  }

  /**
   * Handler for View all Matching Jobs handler
   */
  viewAllMatchingJobsHandler() {
    this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardViewAllMatchingJobs', 'dashBoardViewAllMatchingJobs');
  }

  /**
   * Handler for View all Matching Jobs
   */
  viewAllAssessmentHandler() {
    this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardViewAllAssessments', 'dashBoardViewAllAssessments');
  }

  /**
   * Handler for My assessment navigation
   */
  gotoMyAssessmentsHandler(tab: number) {
    switch(tab) {
      case 1: this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardCompletedAssessments', 'dashBoardCompletedAssessments');
        break;
      case 2: this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardPendingAssessments', 'dashBoardPendingAssessments');
        break;
      case 3: this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardExpiringAssessments', 'dashBoardExpiringAssessments');
        break;
    }
  }

}
