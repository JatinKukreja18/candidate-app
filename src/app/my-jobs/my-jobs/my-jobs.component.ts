import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  SearchJobService,
  JobService,
  AuthenticationService,
  VimeoService,
  AnalyticsService,
  ProfileService,
  CommonService
} from '@app/core';
import {
  DomSanitizer
} from '@angular/platform-browser';
import {
  NzMessageService
} from 'ng-zorro-antd';
import {
  environment
} from '@env/environment';
import {
  FeedbackMessages
} from '@app/core/messages';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-my-jobs',
  templateUrl: './my-jobs.component.html',
  styleUrls: ['./my-jobs.component.scss']
})
export class MyJobsComponent implements OnInit {
  // Element reference to scroll to the respective element
  @ViewChild('info', {
    read: ElementRef
  }) infoSection: ElementRef;
  @ViewChild('desc', {
    read: ElementRef
  }) descSection: ElementRef;
  @ViewChild('videos', {
    read: ElementRef
  }) videosSection: ElementRef;
  @ViewChild('slot', {
    read: ElementRef
  }) slotSection: ElementRef;
  @ViewChild('intro', {
    read: ElementRef
  }) introSection: ElementRef;
  @ViewChild('timeline', {
    read: ElementRef
  }) timelineSection: ElementRef;
  @ViewChild('jobContent', {
    read: ElementRef
  }) jobContent: ElementRef;
  match: any = 80;
  loading = false;
  radioValue: any;
  jobs: any[];
  currentSelectedJob: any;
  selectedJobDetails: any;
  searchLocation: any;
  refreshResultList = false;
  showShareJobModal = false;
  actionData: {
    type: string,
    id: string
  } = {
    type: '0',
    id: ''
  }
  activeTab: {
    shortlisted: boolean,
    applied: boolean,
    interview: boolean,
    goodToHire: boolean,
    rejected: boolean,
  } = {
    shortlisted: false,
    applied: false,
    interview: false,
    goodToHire: false,
    rejected: false
  }
  shareLink: {
    facebook: string,
    twitter: string,
    linkedin: string,
    email: string
  } = {
    facebook: '',
    twitter: '',
    linkedin: '',
    email: ''
  }
  loadMore = true;
  pageNumber: number = 1;
  showConfirmationModal = false;
  missingFields: string[];
  showPreInterviewModal = false;
  isEmbedVideo: boolean;
  preInterviewIsApplied: boolean;

  showConfirmInterviewModal = false;
  showCronofyConfirmationModal = false;
  cronofyResponse: any;
  selectedDateSlot: any;
  selectedTimeSlot: any;
  scheduleForm: FormGroup;
  currentUser: any;
  countryList: any;
  submitted: boolean = false;

  constructor(
    private searchJobService: SearchJobService,
    private jobService: JobService,
    private sanitizer: DomSanitizer,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private router: Router,
    private vimeoService: VimeoService,
    private analyticsService: AnalyticsService,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    // Get activated route

    // console.log('bucketid',this.searchJobService.getSelectedJob().bucket_Id);
    

    this.route.queryParamMap.subscribe(result => {
      if (result && result['params']) {
        if (result['params']['tab'] && !result['params']['video_uri']) {
          switch (result['params']['tab']) {
            case '1':
              this.showTabs('shortlisted');
              break;
            case '2':
              this.showTabs('applied');
              break;
            case '3':
              this.showTabs('interview');
              break;
            case '4':
              this.showTabs('goodToHire');
              break;
            case '5':
              this.showTabs('rejected');
              break;
            default:
              this.showTabs('shortlisted');
              break;
          }
        } else if (result['params']['tab'] && result['params']['video_uri']) {
          for (let key in this.activeTab) {
            this.activeTab[key] = false;
          }
          switch (result['params']['tab']) {
            case '1':
              this.activeTab.shortlisted = true;
              break;
            case '2':
              this.activeTab.applied = true;
              break;
            case '3':
              this.activeTab.interview = true;
              break;
            case '4':
              this.activeTab.goodToHire = true;
              break;
            case '5':
              this.activeTab.rejected = true;
              break;
            default:
              this.activeTab.shortlisted = true;
              break;
          }
          if (this.jobService.myJobsResultList()) {
            this.jobs = this.jobService.myJobsResultList();
            this.currentSelectedJob = this.searchJobService.getSelectedJob();
            this.selectedJobDetails = this.searchJobService.getSelectedJobDetails();
            this.showPreInterviewModal = true;
          }
        } else {
          this.showTabs('shortlisted');
        }
        this.actionData.type = result['params']['type'] ? result['params']['type'] : '0';
        this.actionData.id = result['params']['id'] ? result['params']['id'] : '0';
      }
      // else if (this.jobService.myJobsActiveTab()){
      //   switch(this.jobService.myJobsActiveTab()) {
      //     case '1': this.showTabs('shortlisted');
      //       break;
      //     case '2': this.showTabs('applied');
      //       break;
      //     case '3': this.showTabs('interview');
      //       break;
      //     case '4': this.showTabs('goodToHire');
      //       break;
      //     case '5': this.showTabs('rejected');
      //       break;
      //     default: this.showTabs('shortlisted');
      //       break;
      //   } 
      // }
    });
    if (window.navigator) {
      if (this.vimeoService.getBrowserVersion() == 'Safari 12') this.isEmbedVideo = true;
      else this.isEmbedVideo = false;
    }

    this.scheduleForm = this.formBuilder.group({
      countryPhoneCode: [''],
      mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)]],
    });
    this.getCountryList();
    this.getBasicProfileDetail();
  }

  /**
   * getter funtion for easy form controls
   * @return form control values
   */
  get f() {
    return this.scheduleForm.controls;
  }

  getBasicProfileDetail() {
    this.profileService.getProfileDetails('').subscribe((response) => {
        if (response && response.code === 200 && response.data) {
          console.log('profile/detail',response);
          this.currentUser = response.data;
          if (this.currentUser['basicInfo']) {
            this.scheduleForm.get('countryPhoneCode').setValue(parseInt(this.currentUser['basicInfo']['countryPhoneCode']));
            this.scheduleForm.get('mobile').setValue(this.currentUser['basicInfo']['mobile']);
          }
        }
    });
  }

  /**
    * Get the list of country codes
    */
   getCountryList() {
    this.commonService.getCountryList().subscribe((response) => {
        if (response.code && response.code === 200 ) {
            this.countryList = response.data;
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
      if (this.activeTab.shortlisted && this.loadMore) {
        this.getMyJobs(1, this.pageNumber, true);
      } else if (this.activeTab.applied && this.loadMore) {
        this.getMyJobs(18, this.pageNumber, true);
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
      if (this.activeTab.shortlisted && this.loadMore) {
        this.getMyJobs(1, this.pageNumber, true);
      } else if (this.activeTab.applied && this.loadMore) {
        this.getMyJobs(18, this.pageNumber, true);
      }
    }
  }

  /**
   * Select job initially depending on query params available
   */
  selectJobInit() {
    if (this.jobs && this.jobs.length > 0 && this.actionData && this.actionData['type'] == '1' && this.actionData['id']) {
      this.currentSelectedJob = this.jobs.find((element) => {
        return element['referrenceId'] == this.actionData['id'];
      })
    } else if (this.jobs && this.jobs.length > 0 && this.actionData && this.actionData['type'] == '2') {
      if (this.actionData['id']) {
        this.currentSelectedJob = this.jobs.find((element) => {
          return element['interviewId'] == this.actionData['id'];
        })
      } else {
        this.currentSelectedJob = this.jobs[0];
      }
    }
    if (this.currentSelectedJob) {
      const selectedJobDOM = document.getElementById(`${this.currentSelectedJob.referrenceId.toString()}`);
      this.searchJobService.setSelectedJob(this.currentSelectedJob);
      this.getJobDetails(true);
    } else {
      if (this.jobs && this.jobs.length > 0) {
        this.currentSelectedJob = this.jobs[0];
        this.searchJobService.setSelectedJob(this.currentSelectedJob);
        this.getJobDetails(false);
      }
    }
  }

  /**
   * Get current user's myjobs based on status
   * @param status 1-shortlisted/18-applied
   */
  getMyJobs(status: number, pageNum: number, isScrolled: boolean) {
    const loading = this.message.loading(FeedbackMessages.loading.MyJobsFetch, {
      nzDuration: 0
    }).messageId;
    this.loading = true;
    this.jobService.getMyJobs(status, pageNum).subscribe((response) => {
      this.message.remove(loading);
      this.loading = false;
      if (response && response.code === 200 && response.data instanceof Array) {

        console.log('job/mydetail',response);

        if (response.data.length > 0) {
          if (isScrolled) {
            this.jobs = this.jobs.concat(response.data);
          } else {
            this.jobs = response.data;
          }
          if (response.data.length == 15) {
            this.loadMore = true;
            this.pageNumber++;
          } else this.loadMore = false;
        } else {
          this.loadMore = false;
        }
        this.selectJobInit();
        this.jobService.myJobsResultList(this.jobs);
      }
    }, () => {
      this.loading = false;
      this.message.remove(loading);
    });
  }

  /**
   * Get interviews list of current user
   */


  getInterviewJobs() {
    this.loading = true;
    const loading = this.message.loading(FeedbackMessages.loading.InterviewJobsFetch, {
      nzDuration: 0
    }).messageId;
    this.jobService.getinterviewsList().subscribe((response) => {
      this.message.remove(loading);
      this.loading = false;
      if (response && response.code === 200 && response.data instanceof Array && response.data.length > 0) {
        console.log('myjobinterview',response);

        this.jobs = response.data;
        this.selectJobInit();
      }
      this.jobService.myJobsResultList(this.jobs);
    }, () => {
      this.loading = false;
      this.message.remove(loading);
    });
  }

  /**
   * Get good to hire jobs of current user
   */
  getGoodToHireJobs() {
    this.loading = true;
    const loading = this.message.loading(FeedbackMessages.loading.HireJobsFetch, {
      nzDuration: 0
    }).messageId;
    this.jobService.getGoodToHireJobs().subscribe((response) => {
      this.message.remove(loading);
      this.loading = false;
      if (response && response.code === 200 && response.data instanceof Array && response.data.length > 0) {
        console.log('myjobhire',response);

        this.jobs = response.data;
        this.selectJobInit();
      }
      this.jobService.myJobsResultList(this.jobs);
    }, () => {
      this.loading = false;
      this.message.remove(loading);
    });
  }

  /**
   * Get the rejected jobs of current user
   */
  getRejectedJobs() {
    this.loading = true;
    const loading = this.message.loading(FeedbackMessages.loading.RejectedJobsFetch, {
      nzDuration: 0
    }).messageId;
    this.jobService.getRejectedJobs().subscribe((response) => {
      this.message.remove(loading);
      this.loading = false;
      if (response && response.code === 200 && response.data instanceof Array && response.data.length > 0) {
        console.log('myrejected',response);

        this.jobs = response.data;
        this.selectJobInit();
      }
      this.jobService.myJobsResultList(this.jobs);
    }, () => {
      this.loading = false;
      this.message.remove(loading);
    });
  }

  /**
   * Get the job detail of selected job
   */
  getJobDetails(showLoading: boolean) {
    let status = 0;
    if (this.activeTab.shortlisted) status = this.currentSelectedJob['jobStatusId'];
    else if (this.activeTab.interview || this.activeTab.goodToHire || this.activeTab.rejected || this.activeTab.applied) status = 1;
    if (!this.loading) {
      this.loading = true;
      let loading;
      if (showLoading) {
        loading = this.message.loading(FeedbackMessages.loading.JobDetailsFetch, {
          nzDuration: 0
        }).messageId;
      }
      this.searchJobService.getJobDetails(status).subscribe((response) => {
        if (showLoading) this.message.remove(loading);
        this.loading = false;
        if (response.code === 200 && response.data) {
          console.log('job/detail',response);

          this.selectedJobDetails = response.data;
          if (this.selectedJobDetails && this.selectedJobDetails.JobVideo instanceof Array && this.selectedJobDetails.JobVideo.length > 0) {
            this.selectedJobDetails.JobVideo = this.selectedJobDetails.JobVideo.map((elem) => {
              if (document.querySelector("#videos .row")) {
                document.querySelector("#videos .row").innerHTML = null;
              }
              if (elem.url && elem.venderId == 2) {
                this.vimeoService.getVideoDataById(elem.url).subscribe(response => {
                  if (response && response.files && response.files instanceof Array && response.files.length > 0 && response['embed'] && response['embed']['html']) {
                    elem.url = this.sanitizer.bypassSecurityTrustResourceUrl(response.files[0]['link'])
                    let vidClipDiv = document.createElement('div');
                    let vidColDiv = document.createElement("div");
                    vidClipDiv.classList.add('vid-clip');
                    vidColDiv.classList.add("video-col");
                    if (this.isEmbedVideo) {
                      vidClipDiv.innerHTML = response['embed']['html'];
                      vidClipDiv.querySelector("iframe").style.width = "180px";
                      vidClipDiv.querySelector("iframe").style.height = "107px";
                      vidClipDiv.querySelector("iframe").style.background = "#404040";
                      vidColDiv.appendChild(vidClipDiv);
                    } else {
                      let videoElement = document.createElement("video");
                      videoElement.src = response.files[0]['link'];
                      videoElement.controls = true;
                      videoElement.autoplay = false;
                      videoElement.style.width = "180px";
                      videoElement.style.height = "107px";
                      videoElement.style.background = "#404040";
                      vidColDiv.appendChild(videoElement);
                    }
                    document.querySelector("#videos .row").appendChild(vidColDiv);
                  }
                });
              } else if (elem.url && elem.venderId == 1) {
                let vidClipDiv = document.createElement('div');
                let vidColDiv = document.createElement("div");
                let videoElement = document.createElement("video");
                vidClipDiv.classList.add('vid-clip');
                vidColDiv.classList.add("video-col");
                videoElement.src = elem.url;
                videoElement.controls = true;
                videoElement.autoplay = false;
                videoElement.style.width = "180px";
                videoElement.style.height = "107px";
                videoElement.style.background = "#404040";
                vidColDiv.appendChild(videoElement);
                document.querySelector("#videos .row").appendChild(vidColDiv);
              }
              return elem;
            });
          }
          if (this.selectedJobDetails && this.selectedJobDetails.preInterviewProcess) {
            this.jobService.preInterviewData(this.selectedJobDetails.preInterviewProcess);
          } else {
            this.jobService.clearPreinterviewData();
          }
          this.searchJobService.setSelectedJobDetails(this.selectedJobDetails);
          this.createShareLink();
          this.getVideoData();
          setTimeout(() => {
            let element = this.jobContent.nativeElement;
            element.scrollTo(0, 0);
            document.querySelectorAll(".scroll-to-header li.active").forEach((liElement) => {
              liElement.classList.remove("active");
            });
            document.querySelector('.scroll-to-header li').classList.add('active');
          }, 200);
        }
      }, () => {
        this.loading = false;
        if (showLoading) this.message.remove(loading);
      });
    }
  }

  /**
   * Select a job to view job details
   * @param job 
   */
  selectJob(job: any) {
    if (!this.currentSelectedJob || (this.currentSelectedJob && this.currentSelectedJob.referrenceId != job.referrenceId)) {
      this.currentSelectedJob = job;
      this.selectedJobDetails = null;
      this.searchJobService.setSelectedJob(job);
      this.getJobDetails(true);
    }
  }

  /**
   * Start interview by opening new window with zoom meeting id
   */
  startInterview(zoomId: number | string, interviewDate: Date) {
    let today = new Date().setHours(0, 0, 0, 0),
      interviewStartDate = new Date(interviewDate).setHours(0, 0, 0, 0);
      console.log('current date',today);
      
    if (interviewStartDate == today) {
      if (zoomId) {
        let url = `https://zoom.us/j/${zoomId}`
        let interviewWindow = window.open(url, 'Meeting', 'height=700,width=500');
      }
    } else {
      this.message.info(FeedbackMessages.info.InterviewDateNotToday, {
        nzDuration: 1500
      });
    }
  }

  /**
   * Go to the previous page
   */
  goBack() {
    window.history.back();
  }

  /**
   * Scroll to the selected section in the Job details header
   * @param sectionName Name of the section to scroll to.
   */
  gotoSection(sectionName: string, event) {
    let element;
    document.querySelectorAll(".scroll-to-header li.active").forEach((liElement) => {
      liElement.classList.remove("active");
    });
    // console.log("Header: ", header);
    switch (sectionName) {
      case 'info':
        element = this.infoSection.nativeElement;
        break;
      case 'desc':
        element = this.descSection.nativeElement;
        break;
      case 'videos':
        element = this.videosSection.nativeElement;
        break;
      case 'slot':
        element = this.slotSection.nativeElement;
        break;
      case 'intro':
        element = this.introSection.nativeElement;
        break;
      case 'timeline':
        element = this.timelineSection.nativeElement;
        break;
      default:
        element = this.infoSection.nativeElement;
        break;
    }
    event.currentTarget.classList.add("active");
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  /**
   * Show tab based on the tab name
   * @param tabName 
   */
  showTabs(tabName: string) {
    if (!this.loading) {
      this.pageNumber = 1;
      if (tabName == 'shortlisted' && !this.activeTab.shortlisted) {
        this.jobs = [];
        this.currentSelectedJob = null;
        this.selectedJobDetails = null;
        this.preInterviewIsApplied = true;
        this.analyticsService.eventEmitter('MyJobsScreen', 'MyJobsScreen', 'MyJobsScreen');
        this.router.navigate(
          [], {
            relativeTo: this.route,
            queryParams: {
              tab: 1
            },
            queryParamsHandling: "merge",
            replaceUrl: true
          });
        this.getMyJobs(1, 1, false);
      } else if (tabName == 'applied' && !this.activeTab.applied) {
        this.jobs = [];
        this.currentSelectedJob = null;
        this.selectedJobDetails = null;
        this.preInterviewIsApplied = false;
        this.router.navigate(
          [], {
            relativeTo: this.route,
            queryParams: {
              tab: 2
            },
            queryParamsHandling: "merge",
            replaceUrl: true
          });
        this.getMyJobs(18, 1, false);
      } else if (tabName == 'interview' && !this.activeTab.interview) {
        this.jobs = [];
        this.currentSelectedJob = null;
        this.selectedJobDetails = null;
        this.router.navigate(
          [], {
            relativeTo: this.route,
            queryParams: {
              tab: 3
            },
            queryParamsHandling: "merge",
            replaceUrl: true
          });
        this.getInterviewJobs();
      } else if (tabName == 'goodToHire' && !this.activeTab.goodToHire) {
        this.jobs = [];
        this.currentSelectedJob = null;
        this.selectedJobDetails = null;
        this.jobService.myJobsActiveTab(4);
        this.router.navigate(
          [], {
            relativeTo: this.route,
            queryParams: {
              tab: 4
            },
            queryParamsHandling: "merge",
            replaceUrl: true
          });
        this.getGoodToHireJobs();
      } else if (tabName == 'rejected' && !this.activeTab.rejected) {
        this.jobs = [];
        this.currentSelectedJob = null;
        this.selectedJobDetails = null;
        this.router.navigate(
          [], {
            relativeTo: this.route,
            queryParams: {
              tab: 5
            },
            queryParamsHandling: "merge",
            replaceUrl: true
          });
        this.getRejectedJobs();
      }
      for (let key in this.activeTab) {
        this.activeTab[key] = false;
      }
      this.activeTab[tabName] = true;
    }
  }

  /**
   * Update status of a job to shortlist/applied
   * @param isApplied boolean value true if status to be is to apply
   * @param jobReferenceId  job reference Id 
   */
  takeAction(isApplied: boolean, jobReferenceId: number) {
    if (!this.loading) {
      let reqBody = {
        referrenceId: jobReferenceId.toString(),
        status: isApplied ? 18 : 1,
        bucketId:this.searchJobService.getSelectedJob().bucket_Id
      }
      this.loading = true;
      const loading = this.message.loading(FeedbackMessages.loading.JobShortlist, {
        nzDuration: 0
      }).messageId;
      this.searchJobService.takeAction(reqBody).subscribe((response) => {
        this.loading = false;
        this.message.remove(loading);
        this.message.success('You have successfully applied for the job');
        // return;
        if (response && response.code === 200 && response.data) {
          console.log('job/action',response);
          this.refreshResultList = true;
          if (isApplied && this.currentSelectedJob) {
            this.currentSelectedJob.isApplyed = true;
            this.analyticsService.eventEmitter('MyJobsScreen', 'MyJobsApply', 'MyJobsApply');
            this.openPreInterviewModal()
 
          } else if (!isApplied && this.currentSelectedJob) {
            this.currentSelectedJob.isShortlisted = true;
            this.message.success(response.message, {      
              nzDuration: 1500
            });
          }
          this.searchJobService.refreshResults.next(true);
          this.searchJobService.setSelectedJob(this.currentSelectedJob);
        } else if (response.code && response.code === 710 && response.data && response.data['missingFields'] && response.data['missingFields'].length > 0) {
          this.missingFields = response.data['missingFields'];
          this.showConfirmationModal = true;
        }
      }, () => {
        this.loading = false;
        this.message.remove(loading);
      });
    }
  }

  /**
   * Toggle Share job modal
   */
  toggleShareJobModal() {
    if (this.showShareJobModal) this.showShareJobModal = false;
    else this.showShareJobModal = true;
  }

  /**
   * Create a sharable link for the job
   */
  createShareLink() {
    const title = this.selectedJobDetails.quickInfo.jobTitle;
    const id = this.selectedJobDetails.quickInfo.referrenceId;
    this.shareLink = {
      facebook: `https://facebook.com/sharer/sharer.php?u=${this.selectedJobDetails.webUrl}`,
      twitter: `https://twitter.com/intent/tweet/?text=${title}&url=${this.selectedJobDetails.webUrl}`,
      email: `mailto:?subject=${title}&body=${this.selectedJobDetails.webUrl}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${this.selectedJobDetails.webUrl}&summary=${title}&source=${environment.websiteUrl}`
    }
  }

  /**
   * Redirect to schedule interview page
   * @param currentSelectedJob 
   */
  scheduleInterview(currentSelectedJob) {
    // this.router.navigate(['/myjobs/schedule'], {
    //   queryParams: {
    //     id: currentSelectedJob.interviewId
    //   }
    // });
    this.getInterviewDetail(currentSelectedJob.interviewId);
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
    this.router.navigate(['profile'], {
      queryParams: {
        fields: this.missingFields.toString()
      }
    });
  }

  /**
   * Open Pre-Interview Modal
   */
  
  openPreInterviewModal() {
    this.authService.preInterviewRedirectPage(this.router.url);
    this.showPreInterviewModal = true;
    if (this.selectedJobDetails.preInterviewProcess) {
      this.jobService.preInterviewData(this.selectedJobDetails.preInterviewProcess);
    }
  }

  /**
   * Cancel handler for pre-interview popup
   */
  handlePreInterviewCancel() {
    let redirectPage = this.authService.preInterviewRedirectPage();
    if (redirectPage) {
      if (new RegExp('(video_uri)').test(redirectPage)) {
        this.router.navigateByUrl(redirectPage.split('video_uri')[0]);
      } else {
        this.router.navigateByUrl(redirectPage);
      }
    } else {
      this.router.navigateByUrl(this.router.url.split('video_uri')[0]);
    }
    this.jobService.clearPreinterviewData();
    this.getJobDetails(false);
    this.showPreInterviewModal = false;
  }

  /**
   * Ok handler for pre-interview popup
   */
  handlePreInterviewOk() {
    let redirectPage = this.authService.preInterviewRedirectPage();
    if (redirectPage) {
      if (new RegExp('(video_uri)').test(redirectPage)) {
        this.router.navigateByUrl(redirectPage.split('video_uri')[0]);
      } else {
        this.router.navigateByUrl(redirectPage);
      }
    } else {
      this.router.navigateByUrl(this.router.url.split('video_uri')[0]);
    }
    this.jobService.clearPreinterviewData();
    this.getJobDetails(false);
    this.showPreInterviewModal = false;
  }

  /**
   * Get video data based on video Id
   */
  getVideoData() {
    if (this.selectedJobDetails &&
      this.selectedJobDetails.preInterviewProcess &&
      this.selectedJobDetails.preInterviewProcess.introduction_video_id
    ) {
      this.vimeoService.getVideoDataById(this.selectedJobDetails.preInterviewProcess.introduction_video_id).subscribe(response => {
        if (response && response.files && response.files instanceof Array && response.files.length > 0 && response['embed'] && response['embed']['html']) {
          if (this.isEmbedVideo) {
            if (document.querySelector("#preInterviewDiv iframe")) {
              document.querySelector("#preInterviewDiv iframe").remove();
            }
            document.querySelector("#preInterviewDiv").innerHTML = response['embed']['html'];
            document.querySelector("#preInterviewDiv iframe")['style']['background'] = "#404040";
            document.querySelector("#preInterviewDiv iframe")['style']['width'] = "180px";
            document.querySelector("#preInterviewDiv iframe")['style']['height'] = "107px";
          } else {
            if (document.querySelector("#preInterviewDiv video")) {
              document.querySelector("#preInterviewDiv video").remove();
            }
            let videoElement = document.createElement("video");
            videoElement.src = response.files[0]['link'];
            videoElement.controls = true;
            videoElement.autoplay = false;
            videoElement.style.width = "180px";
            videoElement.style.height = "107px";
            videoElement.style.background = "#404040";
            document.querySelector("#preInterviewDiv").appendChild(videoElement);
          }
        }
      });
    }
  }

  /**
   * Hostlistern to detect scroll
   * @param event 
   */
  @HostListener("document:scroll", ['$event'])
  onJobDetailsScroll(event) {
    document.querySelectorAll(".job-content .content-box").forEach((el, idx) => {
      var bounding = el.getBoundingClientRect();
      if (
        bounding.top >= 0 &&
        bounding.top <= (this.jobContent.nativeElement.innerHeight || this.jobContent.nativeElement.clientHeight)
      ) {
        let elemId = el.getAttribute("id");
        document.querySelector(".scroll-to-header li.active").classList.remove("active");
        switch (elemId) {
          case 'info':
            document.querySelector("li[data-id='info']").classList.add("active");
            break;
          case 'desc':
            document.querySelector("li[data-id='desc']").classList.add("active");
            break;
          case 'videos':
            document.querySelector("li[data-id='videos']").classList.add("active");
            break;
          case 'slot':
            document.querySelector("li[data-id='slot']").classList.add("active");
            break;
          case 'record':
            document.querySelector("li[data-id='intro']").classList.add("active");
            break;
          case 'timeline':
            document.querySelector("li[data-id='timeline']").classList.add("active");
            break;
        }
      }
    });
  }

  showCronofyScheduleInterviewModal(interviewId) {
    this.showConfirmInterviewModal = true;
    this.getCronofySlots(interviewId);
  }

  cancelInterviewModal() {
    this.cronofyResponse = null;
    this.selectedDateSlot = null;
    this.selectedTimeSlot = null;
    this.showConfirmInterviewModal = false;
  }

  confirmInterviewModal() {
    if (this.scheduleForm.invalid && this.cronofyResponse.interviewDetails && this.cronofyResponse.interviewDetails.InterviewTypeId == 3) {
      this.submitted = true;
      return;
    } else if (this.scheduleForm.invalid && this.scheduleForm.get('mobile').errors && (this.scheduleForm.get('mobile').errors.pattern || this.scheduleForm.get('mobile').errors.minlength) && this.cronofyResponse.interviewDetails && this.cronofyResponse.interviewDetails.InterviewTypeId != 3) {
        this.submitted = true;
        return;
    } else {
        this.showCronofyConfirmationModal = true;
    }
  }

  /**
   * Get cronofy slots for notification with deeplinkscreen 26
   * @param interviewId 
   */
  getCronofySlots(interviewId: string) {
    const loading = this.message.loading(FeedbackMessages.loading.NotificationsFetch).messageId;
    this.jobService.checkCronofyAvailability(interviewId).subscribe((response) => {
        this.message.remove(loading);
        if (response && response.code === 200 && response.data) {
            this.cronofyResponse = response.data;
            if (this.cronofyResponse['required_duration'] && this.cronofyResponse['required_duration']['minutes'] >= 60) {
                this.cronofyResponse['required_duration']['Hours'] = Math.floor(this.cronofyResponse['required_duration']['minutes']/60);
                this.cronofyResponse['required_duration']['Minutes'] = this.cronofyResponse['required_duration']['minutes'] % 60;
            } else {
                this.cronofyResponse['required_duration']['Minutes'] = this.cronofyResponse['required_duration']['minutes'];
            }
            this.createDateAndTimeSlots(this.cronofyResponse['available_periods'], this.cronofyResponse['required_duration']['minutes']);
            this.showConfirmInterviewModal = true;
        }
    }, (err) => {
        this.message.remove(loading);
        console.log("Error: ", err);
    });
  }

  /**
   * Get Time Slots between two dates 
   * @param startDate start date 
   * @param endDate end date
   * @param interval time slot interval in minutes
   */
  getTimeSlots(startDate, endDate, interval) {
    let slots = {}, initStartDate = new Date(startDate);
    slots['currentDateSlots'] = [];
    slots['nextDateSlots'] = [];
    console.log("Start Date: ", new Date(startDate));
    console.log("End Date: ", new Date(endDate));
    if (startDate && endDate && interval) {
        while (new Date(startDate).getTime() <= new Date(endDate).getTime()) {
            console.log("Start Date & end Date: ", new Date(startDate), new Date(endDate))
            let slot = {};
            slot['startDate'] = new Date(startDate);
            slot['endDate'] = new Date(new Date(startDate).setMinutes(new Date(startDate).getMinutes() + interval));
            if (slot['startDate'].getDate() > new Date(initStartDate).getDate()) {
                let tempSlotStartDate = new Date(slot['startDate']);
                let tempSlotEndDate = new Date(slot['endDate']);
                let tempSlot = {}
                tempSlot['startDate'] = new Date(tempSlotStartDate.getFullYear(), tempSlotStartDate.getMonth(), tempSlotStartDate.getDate(), tempSlotStartDate.getHours(), tempSlotStartDate.getMinutes());
                tempSlot['endDate'] = new Date(tempSlotEndDate.getFullYear(), tempSlotEndDate.getMonth(), tempSlotEndDate.getDate(), tempSlotEndDate.getHours(), tempSlotEndDate.getMinutes());
                slots['nextDateSlots'].push(tempSlot);
            } else {
                slots['currentDateSlots'].push(slot);
                
            }
            startDate = slot['endDate'];
        }
    }
    console.log("SLOTS: ", slots);
    return slots;
  }

  selectDateSlot(dateSlot, index) {
    this.selectedDateSlot = dateSlot;
    this.cronofyResponse['available_periods'].forEach((elem, idx) => {
      this.cronofyResponse['available_periods'][idx]['active'] = false;
    })
    this.cronofyResponse['available_periods'][index]['active'] = true;
  }

  selectTimeSlot(timeSlot, index) {
    this.selectedTimeSlot = timeSlot;
    this.selectedDateSlot['timeSlots'].forEach((elem, idx) => {
      this.selectedDateSlot['timeSlots'][idx]['active'] = false;
    });
    this.selectedDateSlot['timeSlots'][index]['active'] = true;
  }


  scheduleCronofyInterview() {
    let reqBody = {
      "interviewId": this.cronofyResponse['interviewDetails']['interviewId'],
      "scheduleDate": new Date(this.selectedTimeSlot['startDate']).toISOString(),
      "scheduleEndDate": new Date(this.selectedTimeSlot['endDate']).toISOString(),
      "timeZone": this.cronofyResponse['interviewDetails']['timeZone']
    }
    reqBody['scheduleEndDate'] = new Date(new Date(this.selectedTimeSlot['startDate']).getTime() + this.cronofyResponse['required_duration']['minutes'] * 60 * 1000).toISOString();
    if (this.scheduleForm.get('mobile').value) {
        reqBody['candidatePhone'] = this.scheduleForm.get('mobile').value.toString();
    }
    
    if (this.scheduleForm.get('countryPhoneCode').value) {
        reqBody['countryPhoneCode'] = this.scheduleForm.get('countryPhoneCode').value.toString();
    }
    const loading = this.message.loading(FeedbackMessages.loading.JobInterviewSchedule, {
      nzDuration: 0
    }).messageId;
    this.jobService.scheduleInterview(reqBody).subscribe(response => {
      this.loading = false;
      this.message.remove(loading);
      if (response && (response.code === 200 || response.code === 0)) {
        this.message.success(FeedbackMessages.success.CronofyScheduled, {
          nzDuration: 1500
        });
        this.cancelConfirmationModal();
        this.showCronofyConfirmationModal = false;
        this.showConfirmInterviewModal = false;
        this.cronofyResponse = null;
        this.selectedDateSlot = null;
        this.selectedTimeSlot = null;
      }
    }, () => {
      this.loading = false;
      this.message.remove(loading);
    });
  }


  cancelConfirmationModal() {
    this.showCronofyConfirmationModal = false;
  }

  submitConfirmationModal() {
    // this.showConfirmationModal = false;
    this.scheduleCronofyInterview();
  }

  createDateAndTimeSlots(availablePeriodsArray, interval) {
    let allSlots: any[] = [], uniqueDatesValue: {start: Date, timeSlots: any[]}[] = [];
    if (availablePeriodsArray && availablePeriodsArray instanceof Array) {
      availablePeriodsArray.forEach((entry, idx) => {
          let currentSlots = this.createTimeSlots(entry['start'], entry['end'], interval)
          allSlots = allSlots.concat(currentSlots);
      });
    }
    allSlots.sort(function (slot1, slot2) {
      var slot = new Date(slot1.startDate);
      var nextSlot = new Date(slot2.startDate);
  
      if (slot < nextSlot) {
          return -1;
      } else if (slot == nextSlot) {
          return 0;
      } else {
          return 1;
      }
    });
    allSlots.forEach((entry, idx)=> {
      let startDate = new Date(entry['startDate']);
      let dateAlreadyExists = uniqueDatesValue.find((dateObj, dateObjIdx) => {
        if (
          startDate.getFullYear() == dateObj.start.getFullYear() &&
          startDate.getMonth() == dateObj.start.getMonth() &&
          startDate.getDate() == dateObj.start.getDate()
        ) {
            return true;
        }
      });
      if (dateAlreadyExists) {
        dateAlreadyExists.timeSlots.push(entry);
      } else {
        let newDateObj: {start: Date, timeSlots: any[]} = {
            start: new Date(entry['startDate']),
            timeSlots: [entry]
        };
        uniqueDatesValue.push(newDateObj);
      }
    });
    this.cronofyResponse['available_periods'] = uniqueDatesValue;
  }

  /**
   * Get Time Slots between two dates 
   * @param startDate start date 
   * @param endDate end date
   * @param interval time slot interval in minutes
   */
  createTimeSlots(startDate, endDate, interval) {
    let slots = [];
    if (startDate && endDate && interval) {
        while (new Date(startDate).getTime() < new Date(endDate).getTime()) {
            let slot = {};
            if (new Date(startDate).getTime() < new Date(endDate).getTime() - interval * 60 * 1000){
                
                slot['startDate'] = new Date(startDate);
                slot['endDate'] = new Date(new Date(startDate).setMinutes(new Date(startDate).getMinutes() + 30));
            } else {
                slot['startDate'] = new Date(new Date(endDate).getTime() - interval * 60 * 1000);
                slot['endDate'] = new Date(endDate);
            }
            // if (new Date(startDate).getTime() > new Date().getTime()) {
            //   slots.push(slot);
            // }
            slots.push(slot);
            startDate = slot['endDate'];
        }
    }
    return slots;
  }

  /**
   * Get current interview details
   * @param interviewId Interview Id
   */
  getInterviewDetail(interviewId: string) {
    const loading = this.message.loading(FeedbackMessages.loading.JobInterviewDetailFetch, { nzDuration: 0 }).messageId;
    this.jobService.getInterviewDetail(interviewId).subscribe(response => {
        this.message.remove(loading);
        if (response && response.code === 200 && response.data) {
            // this.interviewDetail = response.data;
            this.cronofyResponse = {};
            this.cronofyResponse['required_duration'] = {};
            this.cronofyResponse.interviewDetails = response.data;
            if (response.data['duration']) {
                let duration = response.data['duration'].toString().split('.');
                if (duration instanceof Array && duration.length == 1) {
                    this.cronofyResponse['required_duration']['minutes'] = parseInt(duration[0]) * 60;
                } else if(duration instanceof Array && duration.length > 1)  {
                    this.cronofyResponse['required_duration']['minutes'] = parseInt(duration[0]) * 60 + Math.round(parseInt(duration[1].substring(0,2)) / 10 ) * 10;
                }
            }
            if (this.cronofyResponse['required_duration'] && this.cronofyResponse['required_duration']['minutes'] >= 60) {
                this.cronofyResponse['required_duration']['Hours'] = Math.floor(this.cronofyResponse['required_duration']['minutes']/60);
                this.cronofyResponse['required_duration']['Minutes'] = this.cronofyResponse['required_duration']['minutes'] % 60;
            } else {
                this.cronofyResponse['required_duration']['Minutes'] = this.cronofyResponse['required_duration']['minutes'];
            }
            this.cronofyResponse.available_periods = []
            let availablePeriodsArray = [];
            if (response.data['slot2'] && response.data['isSlot2AvailableAllDay']) {
                let slot2Obj = {};
                slot2Obj['start'] = new Date(response.data['slot2']);
                slot2Obj['end'] = new Date(slot2Obj['start'].getTime() + 10 * 60 * 60 * 1000);
                availablePeriodsArray.push(slot2Obj);
            } else if (response.data['slot2'] && !response.data['isSlot2AvailableAllDay']) {
                let slot2Obj = {};
                slot2Obj['start'] = new Date(response.data['slot2']);
                slot2Obj['end'] = new Date(slot2Obj['start'].getTime() + this.cronofyResponse['required_duration']['minutes'] * 60 * 1000);
                availablePeriodsArray.push(slot2Obj);
            }

            if (response.data['slot1'] && response.data['isSlot1AvailableAllDay']) {
                let slot1Obj = {};
                slot1Obj['start'] = new Date(response.data['slot1']);
                slot1Obj['end'] = new Date(slot1Obj['start'].getTime() + 10 * 60 * 60 * 1000);
                availablePeriodsArray.push(slot1Obj);
            } else if (response.data['slot1'] && !response.data['isSlot1AvailableAllDay']) {
                let slot1Obj = {};
                slot1Obj['start'] = new Date(response.data['slot1']);
                slot1Obj['end'] = new Date(slot1Obj['start'].getTime() + this.cronofyResponse['required_duration']['minutes'] * 60 * 1000);
                availablePeriodsArray.push(slot1Obj);
            }
            this.createDateAndTimeSlots(availablePeriodsArray, this.cronofyResponse['required_duration']['minutes']);
            this.showConfirmInterviewModal = true;
        }
    }, () => {
        this.message.remove(loading);
    });
  }

}
