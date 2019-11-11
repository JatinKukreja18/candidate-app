import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchJobService, JobService, AuthenticationService, VimeoService, AnalyticsService } from '@app/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd';
import { FeedbackMessages } from '@app/core/messages';

@Component({
  selector: 'app-view-jobs',
  templateUrl: './view-jobs.component.html',
  styleUrls: ['./view-jobs.component.scss']
})
export class ViewJobsComponent implements OnInit {
  // Element reference to scroll to the respective element
  @ViewChild('info', { read: ElementRef }) infoSection: ElementRef;
  @ViewChild('desc', { read: ElementRef }) descSection: ElementRef;
  @ViewChild('videos', { read: ElementRef }) videosSection: ElementRef;
  @ViewChild('timeline', { read: ElementRef }) timelineSection: ElementRef;
  match: any = 80;
  radioValue: any;
  jobs: any;
  selectedJob: any;
  selectedJobDetails: any;
  searchLocation: any;
  missingFields: string[];
  showShareJobModal = false;
  showConfirmationModal = false;
  showPreInterviewModal = false;
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
  isEmbedVideo: boolean;

  constructor(
    private searchJobService: SearchJobService,
    private jobService: JobService,
    private authService: AuthenticationService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private vimeoService: VimeoService,
    private sanitizer: DomSanitizer,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    if (window.navigator) {
      if (this.vimeoService.getBrowserVersion() == 'Safari 12') this.isEmbedVideo = true;
      else this.isEmbedVideo = false;
    }
    this.selectedJob = this.searchJobService.getSelectedJob();
    this.route.queryParamMap.subscribe(result => {
      if (result && result['params'] && result['params']['id']) {
        let selectedJob = { referrenceId: result['params']['id'] };
        this.searchJobService.setSelectedJob(selectedJob);
        this.getJobDetails();
      } else {
        this.getJobDetails();
      }
      if (result['params']['video_uri']) {
        this.showPreInterviewModal = true;
      }
    });
  }

  /**
   * Get the job detail of selected job
   */
  getJobDetails(){
    const loading = this.message.loading(FeedbackMessages.loading.JobDetailsFetch, { nzDuration: 0 }).messageId;
    this.searchJobService.getJobDetails(0).subscribe((response) => {
      this.message.remove(loading);
      if(response.code === 200 && response.data) {
        this.selectedJobDetails = response.data;
        this.searchJobService.setSelectedJobDetails(this.selectedJobDetails);
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
        this.createShareLink();
        this.getVideoData();
      }
    }, () => {
      this.message.remove(loading);
    });
  }

  /**
   * Update status of a job to shortlist/applied
   * @param isApplied boolean value true if status to be is to apply
   * @param jobReferenceId  job reference Id 
   */
  takeAction(isApplied: boolean, jobReferenceId) {
    let reqBody = {
      referrenceId: jobReferenceId,
      status: isApplied ? 18 : 1,
      bucketId:this.searchJobService.getSelectedJob().bucket_Id

    }
    const loading = this.message.loading(FeedbackMessages.loading.JobShortlist, { nzDuration: 0 }).messageId;
    this.searchJobService.takeAction(reqBody).subscribe((response) => {
      this.message.remove(loading);
      if (response && response.code === 200 && response.data) {
        if (isApplied) {
          this.authService.preInterviewRedirectPage(this.router.url);
          this.showPreInterviewModal = true;
          this.selectedJob['isApplyed'] = true;
          this.analyticsService.eventEmitter('JobDetailsScreen', 'JobDetailsApply', 'JobDetailsApply');
          // this.router.navigateByUrl('/job/preinterview');
          // this.jobService.startPreInterviewProcess.next(true);
        } else {
          this.selectedJob['isShortlisted'] = true;
          this.selectedJob['isApplyed'] = false;
          this.analyticsService.eventEmitter('JobDetailsScreen', 'JobDetailShortlist', 'JobDetailShortlist');
        }
        this.getJobDetails();
      } else if (response.code && response.code === 710 && response.data && response.data['missingFields'] && response.data['missingFields'].length > 0) {
        this.missingFields = response.data['missingFields'];
        this.showConfirmationModal = true;
      }
    }, () => {
      this.message.remove(loading);
    });
  }

  /**
   * Go to the previous page
   */
  goBack(){
    this.router.navigate(['dashboard']);
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
      case 'timeline': element = this.timelineSection.nativeElement;
        break;
      default: element = this.infoSection.nativeElement;
        break;
    }
    event.currentTarget.classList.add("active");
    element.scrollIntoView({behavior: 'smooth', block: 'start'});
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
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(this.selectedJobDetails.webUrl)}&summary=${title}&source=${encodeURIComponent(this.selectedJobDetails.webUrl)}` 
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
      // this.router.navigate([this.authService.preInterviewRedirectPage().split('?')[0]]);
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
    this.getJobDetails();
    this.showPreInterviewModal = false;
    // this.router.navigate(['profile'], {queryParams: {fields: this.missingFields.toString()}});
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
          // videoElement.style.height = "127px";
          document.querySelector("#preInterviewDiv").appendChild(videoElement);
        }
      });
    }
  }

}
