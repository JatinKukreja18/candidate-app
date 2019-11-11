import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService,SearchJobService, JobService, VimeoService, AnalyticsService } from '@app/core';
import { NzMessageService } from 'ng-zorro-antd';
import { FeedbackMessages } from '@app/core/messages';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit {
  // Element reference to scroll to the respective element
  @ViewChild('info', { read: ElementRef }) infoSection: ElementRef;
  @ViewChild('desc', { read: ElementRef }) descSection: ElementRef;
  @ViewChild('videos', { read: ElementRef }) videosSection: ElementRef;
  // @ViewChild('slot', { read: ElementRef }) slotSection: ElementRef;
  // @ViewChild('intro', { read: ElementRef }) introSection: ElementRef;
  @ViewChild('timeline', { read: ElementRef }) timelineSection: ElementRef;
  @ViewChild('jobContent', { read: ElementRef }) jobContent: ElementRef;
  radioValue: any;
  jobs: any;
  selectedJob: any;
  selectedJobDetails: any;
  searchLocation: any;
  resultSidebarTitle: string;
  currentSearchType: number;
  refreshResultList = false;
  showShareJobModal = false;
  showConfirmationModal = false;
  showPreInterviewModal = false;
  lastPage: any;
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
  loading = false;
  missingFields: string[];
  isEmbedVideo: boolean;
  constructor(
    private searchJobService: SearchJobService,
    private jobService: JobService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private authService: AuthenticationService,
    private vimeoService: VimeoService,
    private sanitizer: DomSanitizer,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.currentSearchType = this.searchJobService.getSearchType();
    this.searchJobService.searchActivePage(2);
    this.jobs = this.searchJobService.getSearchResults(); // Get the job search results from the search results page
    if (this.jobs && this.jobs.results) {
      this.resultSidebarTitle = `Top ${this.jobs.results.length} of ${this.jobs.totalResult} Matching Jobs`;
    }
    this.selectedJob = this.searchJobService.getSelectedJob(); // Get the selected Job form search result page
    // Get the search values like location, skills from the search jobs page to point the location on map on the Results page
    this.searchLocation = this.searchJobService.getSearchLocation();
    if (window.navigator) {
      if (this.vimeoService.getBrowserVersion() == 'Safari 12') this.isEmbedVideo = true;
      else this.isEmbedVideo = false;
    }
  }

  /**
   * Get the job detail of selected job
  */
  getJobDetails(){
    const loading = this.message.loading(FeedbackMessages.loading.JobDetailsFetch, { nzDuration: 0 }).messageId;
    this.searchJobService.getJobDetails(0).subscribe((response) => {
      if(response.code === 200) {
        this.selectedJobDetails = response.data;
        this.searchJobService.setSelectedJobDetails(this.selectedJobDetails);
        this.getVideoData();
        this.createShareLink();
        setTimeout(() => {
          let element = this.jobContent.nativeElement;
          element.scrollTo(0, 0);
          document.querySelectorAll(".scroll-to-header li.active").forEach((liElement) => {
            liElement.classList.remove("active");
          });
          document.querySelector('.scroll-to-header li').classList.add('active');
        });
        if(this.selectedJobDetails && this.selectedJobDetails.JobVideo instanceof Array && this.selectedJobDetails.JobVideo.length > 0){
          this.selectedJobDetails.JobVideo = this.selectedJobDetails.JobVideo.map((elem) => {
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
        if(this.route.snapshot.queryParams && this.route.snapshot.queryParams['video_uri']) {
          this.showPreInterviewModal = true;
        }
      }
      this.message.remove(loading);
    }, (error) => {
      this.message.remove(loading);
    });
  }

  /**
   * Get job details on select
   * @param selectedValue job object
   */
  onJobSelect(selectedValue) {
    if (!selectedValue) {
      this.selectedJobDetails = null;
    } else {
      this.getJobDetails();
    }
  }

  /**
   * Update status of a job to shortlist/applied
   * @param isApplied boolean value true if status to be is to apply
   * @param jobReferenceId  job reference Id 
   */
  takeAction(isApplied: boolean, jobReferenceId: number) {
    let reqBody = {
      referrenceId: jobReferenceId.toString(),
      status: isApplied ? 18 : 1,
      bucketId:this.searchJobService.getSelectedJob().bucket_Id

    }
    if (!this.loading) {
      this.loading = true;
      const loading = this.message.loading(FeedbackMessages.loading.JobShortlist, {nzDuration: 0}).messageId;
      this.searchJobService.takeAction(reqBody).subscribe((response) => {
        this.loading = false;
        this.message.remove(loading);
        if (response && response.code === 200 && response.data) {
          if (isApplied && this.selectedJob) {
            this.selectedJob.isShortlisted = false;
            this.selectedJob.isApplyed = true;
            this.analyticsService.eventEmitter('JobDetailsScreen', 'JobDetailsApply', 'JobDetailsApply');
            this.authService.preInterviewRedirectPage(this.router.url);
            this.showPreInterviewModal = true;
          } else if (!isApplied && this.selectedJob) {
            this.selectedJob.isShortlisted = true;
            this.message.success(response.message, {nzDuration: 1500});
            this.analyticsService.eventEmitter('JobDetailsScreen', 'JobDetailShortlist', 'JobDetailShortlist');
          }
          this.searchJobService.setSelectedJob(this.selectedJob);
          this.searchJobService.refreshResults.next(true);
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
   * Get the job details on selection of job from theresults list
   */
  onSelect() {
    this.selectedJob = this.searchJobService.getSelectedJob();
    this.selectedJobDetails = null;
    this.getJobDetails();
    // let element = this.jobContent.nativeElement;
    // element.scrollTo(0, 0);
    // document.querySelectorAll(".scroll-to-header li.active").forEach((liElement) => {
    //   liElement.classList.remove("active");
    // });
    // document.querySelector('.scroll-to-header li').classList.add('active')
    // element.classList.add("active");
  }

  /**
   * Go to the previous page
   */
  goBack(){
    // if (this.currentSearchType && this.currentSearchType == 1) {
    //   if(this.lastPage == 1) {
    //     this.router.navigate(['/dashboard'], {queryParamsHandling: 'preserve'});
    //   } else if (this.lastPage == 2) {
    //     this.router.navigate(['/search'], {queryParamsHandling: 'preserve'});
    //   }
    // } else if(this.currentSearchType && this.currentSearchType == 2){
    //   window.history.go(-2);
    // }
    let previousUrlsHistory = this.authService.routeHistory();
    if (previousUrlsHistory instanceof Array && previousUrlsHistory.length > 0) {
      this.router.navigate([previousUrlsHistory[previousUrlsHistory.length - 1]], {queryParamsHandling: 'preserve'});
    } else {
      window.history.back();
    }
  }

  /**
   * Last page 
   */
  goBackLastPage() {
    // window.history.back();
    let previousUrlsHistory = this.authService.searchPageRouteHistory();
    if (previousUrlsHistory instanceof Array && previousUrlsHistory.length > 0) {
      this.router.navigate([previousUrlsHistory[previousUrlsHistory.length - 2]], {queryParamsHandling: 'preserve'});
    } else {
      window.history.back();
    }
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
    switch(sectionName) {
      case 'info': element = this.infoSection.nativeElement;
        break;
      case 'desc': element = this.descSection.nativeElement;
        break;
      case 'videos': element = this.videosSection.nativeElement;
        break;
      // case 'slot': element = this.slotSection.nativeElement;
      //   break;
      // case 'intro': element = this.introSection.nativeElement;
      //   break;
      case 'timeline': element = this.timelineSection.nativeElement;
        break;
      default: element = this.infoSection.nativeElement;
        break;
    }
    event.currentTarget.classList.add("active");
    element.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  /**
   * Goto search page with the search values
   */
  editSearchPage() {
    let searchData = this.searchJobService.getSearchLocation();
    let location;
    let skills;
    if (searchData){
      location = searchData['location'];
      skills = searchData['query'];
      this.router.navigate(['search'], {queryParams: { skills: skills, location: location}});
    }
    // this.router.navigate(['search'], {queryParams: { skills: skills, location: location}});
  }

  /**
   * Toggle Share job modal
   */
  toggleShareJobModal() {
    if(this.showShareJobModal) this.showShareJobModal = false;
    else this.showShareJobModal = true;
  }

  /**
   * Create a sharable link for the job
   */
  createShareLink(){
    const title = this.selectedJobDetails.quickInfo.jobTitle;
    const id = this.selectedJobDetails.quickInfo.referrenceId;
    this.shareLink = {
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.selectedJobDetails.webUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${encodeURIComponent(this.selectedJobDetails.webUrl)}`,
      email: `mailto:?subject=${title}&body=${this.selectedJobDetails.webUrl}`,
      // linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(this.selectedJobDetails.webUrl)}&summary=${title}` 
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${this.selectedJobDetails.webUrl}&summary=${title}` 
    }
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
    this.showPreInterviewModal = false;
  }

  /**
   * Get video data based on video Id
   */
  getVideoData() {
    if (this.selectedJobDetails 
      && this.selectedJobDetails.preInterviewProcess 
      && this.selectedJobDetails.preInterviewProcess.introduction_video_id
    ) {
      this.vimeoService.getVideoDataById(this.selectedJobDetails.preInterviewProcess.introduction_video_id).subscribe(response => {
        if (response && response.files && response.files instanceof Array && response.files.length > 0) {
          let videoElement = document.createElement("video");
          videoElement.src = response.files[0]['link'];
          videoElement.controls = true;
          videoElement.autoplay = false;
          videoElement.style.width = "181px";
          videoElement.style.height = "107px";
          document.querySelector("#preInterviewDiv").appendChild(videoElement);
        }
      });
    }
  }
  
  /**
   * Hostlistern to detect scroll
   * @param event 
   */
  @HostListener("document:scroll", ['$event'])
  onWindowScroll(event) {
    document.querySelectorAll(".job-content .content-box").forEach((el, idx) => {
      var bounding = el.getBoundingClientRect();
      if (
          bounding.top >= 0 &&
          bounding.top <= (this.jobContent.nativeElement.innerHeight || this.jobContent.nativeElement.clientHeight)
      ) {
        let elemId = el.getAttribute("id");
        document.querySelector(".scroll-to-header li.active").classList.remove("active");
        switch(elemId) {
          case 'info': 
            document.querySelector("li[data-id='info']").classList.add("active");
            break;
          case 'desc':
            document.querySelector("li[data-id='desc']").classList.add("active");
            break;
          case 'videos':
            document.querySelector("li[data-id='videos']").classList.add("active");
            break;
          case 'timeline':
            document.querySelector("li[data-id='timeline']").classList.add("active");
            break;
        }
      }
    });
  }
}
