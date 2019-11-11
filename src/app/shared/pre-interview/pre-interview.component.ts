import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AuthenticationService, SearchJobService, JobService, VimeoService, AnalyticsService } from '@app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { FeedbackMessages } from '@app/core/messages';
import { DomSanitizer } from '@angular/platform-browser';

const Redirect_URI = "job/preinterview";

@Component({
    selector: 'app-pre-inteview',
    templateUrl: './pre-interview.component.html',
    styleUrls: ['./pre-interview.component.scss']
})
export class PreInterviewComponent implements OnInit, OnDestroy{
    @Input() isApplied: boolean;
    @Output() success: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
    selectedJobDetails: any;
    loading = false;
    videoUploaded = false;
    videoData: any;
    uploadVideoDiv: any;
    videoURI: string;
    isEmbedVideo: boolean;
    slots: {
        "preferredinterviewtype": number,
        "referrenceId": string,
        "date_slot1": Date,
        "slot1_from_time": Date,
        "slot1_to_time": Date,
        "date_slot2": Date,
        "slot2_from_time": Date,
        "slot2_to_time": Date
    } = {
        "preferredinterviewtype": 1,
        "referrenceId": '0',
        "date_slot1": null,
        "slot1_from_time": null,
        "slot1_to_time": null,
        "date_slot2": null,
        "slot2_from_time": null,
        "slot2_to_time": null
    }

    constructor(
        private searchService: SearchJobService,
        private vimeoService: VimeoService,
        private route: ActivatedRoute,
        private router: Router,
        private jobService: JobService,
        private message: NzMessageService,
        private authService: AuthenticationService,
        private modalService: NzModalService,
        private sanitizer: DomSanitizer,
        private analyticsService: AnalyticsService
    ) {}

    ngOnInit() {
        // this.preInterviewProcess();
        if (window.navigator) {
            if (this.vimeoService.getBrowserVersion() == 'Safari 12') this.isEmbedVideo = true;
            else this.isEmbedVideo = false;
        }
        let cachedData = this.jobService.preInterviewData();
        if (cachedData){
            this.slots = cachedData;
            this.slots.date_slot1 = cachedData.date_slot1 ? new Date(cachedData.date_slot1) : null;
            this.slots.date_slot2 = cachedData.date_slot2 ? new Date(cachedData.date_slot2) : null;
            this.slots.slot1_to_time = cachedData.slot1_to_time ? new Date(cachedData.slot1_to_time) : null;
            this.slots.slot2_to_time = cachedData.slot2_to_time ? new Date(cachedData.slot2_to_time) : null;
            this.slots.slot1_from_time = cachedData.slot1_from_time ? new Date(cachedData.slot1_from_time) : null;
            this.slots.slot2_from_time = cachedData.slot2_from_time ? new Date(cachedData.slot2_from_time) : null;
            if (cachedData.introduction_video_id) {
                this.vimeoService.getVideoDataById(parseInt(cachedData.introduction_video_id)).subscribe((response) => {
                    if (response && response['pictures']){
                      this.videoData = response;
                    }
                    if (response && response['files'] && response['files'] instanceof Array && response['files'].length > 0){
                        if (this.isEmbedVideo) {
                            if (document.querySelector("#iframeBody iframe")) {
                                document.querySelector("#iframeBody iframe").remove();
                            }
                            document.querySelector("#iframeBody").innerHTML = response['embed']['html'];
                            document.querySelector("#iframeBody iframe")['style']['background'] = "#404040";
                            document.querySelector("#iframeBody iframe")['style']['width'] = "250px";
                            document.querySelector("#iframeBody iframe")['style']['height'] = "150px";
                        } else {
                            if (document.querySelector("#iframeBody video")) {
                                document.querySelector("#iframeBody video").remove();
                            }
                            let videoElement = document.createElement('video');
                            videoElement.src = response['files'][0]['link'];
                            videoElement.controls = true;
                            videoElement.autoplay = false;
                            videoElement.style.width = "250px";
                            videoElement.style.height = "150px";
                            videoElement.style.background = "#404040";
                            videoElement.setAttribute("allow", "fullscreen");
                            videoElement.setAttribute("allowfullscreen", "true");
                            document.querySelector("#iframeBody").appendChild(videoElement);
                        }
                    }
                });
            }
        }
        this.route.queryParamMap.subscribe(params => {
            this.videoURI = params.get('video_uri');
            if (this.videoURI) {
                this.videoUploaded = true;
                this.vimeoService.getVideoDataById(parseInt(this.videoURI.split('/')[2])).subscribe((response) => {
                    if (response && response['pictures']){
                      this.videoData = response;
                    }
                    if (response && response['files'] && response['files'] instanceof Array && response['files'].length > 0){
                        if (this.isEmbedVideo) {
                            if (document.querySelector("#iframeBody iframe")) {
                                document.querySelector("#iframeBody iframe").remove();
                            }
                            document.querySelector("#iframeBody").innerHTML = response['embed']['html'];
                            document.querySelector("#iframeBody iframe")['style']['background'] = "#404040";
                            document.querySelector("#iframeBody iframe")['style']['width'] = "180px";
                            document.querySelector("#iframeBody iframe")['style']['height'] = "107px";
                        } else {
                            if (document.querySelector("#iframeBody video")) {
                                document.querySelector("#iframeBody video").remove();
                            }
                            let uploadDivElement = document.createElement('video');
                            uploadDivElement.src = response['files'][0]['link'];
                            uploadDivElement.controls = true;
                            uploadDivElement.autoplay = false;
                            uploadDivElement.style.width = "250px";
                            uploadDivElement.setAttribute("allow", "fullscreen");
                            uploadDivElement.setAttribute("allowfullscreen", "true");
                            document.querySelector("#iframeBody").appendChild(uploadDivElement);
                        }
                    }
                });
            }
        });
    }

    ngOnDestroy() {
        this.jobService.clearPreinterviewData();
    }

    /**
     * On time change for time picker
     * @param value Date object emitted on selection
     * @param fieldNumber 1 for slot-1 from time / 2 for slot-1 to time / 3 for slot-2 from time / 4 for slot-2 to time
     */
    onChange(value: Date, fieldNumber: number) {
        switch(fieldNumber) {
            case 1: this.slots.slot1_from_time = value;
                break;
            case 2: this.slots.slot1_to_time = value;
                break;
            case 3: this.slots.slot2_from_time = value;
                break;
            case 4: this.slots.slot2_to_time = value;
                break;
        }
    }

    /**
     * On value change of date picker
     * @param value Date object emitted on selection
     * @param slotNumber 1 for slot-1 / 2 for slot-2
     */
    onChangeDate(value, slotNumber: number) {
        if(slotNumber === 1) {
            this.slots.date_slot1 = value
            if (this.slots.date_slot1 instanceof Date) {
                let currentHour = new Date().getHours();
                if (this.isToday(this.slots.date_slot1)) {
                    this.slots.slot1_from_time = new Date(this.slots.date_slot1.setHours(currentHour + 1, 0, 0, 0));
                    this.slots.slot1_to_time = new Date(new Date(this.slots.slot1_from_time).setHours(18, 0, 0 ,0));
                    // this.slots.slot1_to_time = new Date(this.slots.slot1_from_time.getTime() + 3600 * 1000);
                } else {
                    this.slots.slot1_from_time = new Date(this.slots.date_slot1.setHours(8, 0, 0, 0));
                    this.slots.slot1_to_time = new Date(new Date(this.slots.slot1_from_time).setHours(18, 0, 0, 0));
                    // this.slots.slot1_to_time = new Date(this.slots.slot1_from_time.getTime() + 3600 * 1000);
                }
            } else {
                this.slots.slot1_from_time = null;
                this.slots.slot1_to_time = null;
            }
        } else {
            this.slots.date_slot2 = value;
            if (this.slots.date_slot2 instanceof Date) {
                if (this.isToday(this.slots.date_slot2)) {
                    let currentHour = new Date().getHours();
                    this.slots.slot2_from_time = new Date(this.slots.date_slot2.setHours(currentHour + 1, 0, 0, 0));
                    this.slots.slot2_to_time = new Date(new Date(this.slots.slot2_from_time).setHours(18, 0 ,0, 0));
                    // this.slots.slot2_to_time = new Date(this.slots.slot2_from_time.getTime() + 3600 * 1000);
                } else {
                    this.slots.slot2_from_time = new Date(this.slots.date_slot2.setHours(8, 0, 0, 0));
                    this.slots.slot2_to_time = new Date(new Date(this.slots.slot2_from_time).setHours(18, 0, 0, 0));
                    // this.slots.slot2_to_time = new Date(this.slots.slot2_from_time.getTime() + 3600 * 1000);
                }
            } else {
                this.slots.slot2_from_time = null;
                this.slots.slot2_to_time = null;
            }
        }
    }

    /**
     * Disable dates for slot 1
     */
    disabledDateSlot1 = (current: Date) => {
        let time = current.getTime();
        let currentHours = current.getHours();
        if (this.isToday(current) && currentHours < 17) {
            return time <= new Date(new Date().setHours(0,0,0,0)).getTime();
        } else {
            return time <= new Date().getTime();
        };
    }

    /**
     * Disable dates for slot 2
     */
    disabledDateSlot2 = (current: Date) => {
        let time = current.getTime();
        let currentHours = current.getHours();
        if (this.slots.date_slot1) {
            return time <= (new Date(this.slots.date_slot1).getTime());
        } else if (this.isToday(current) && currentHours < 17) {
            return time <= new Date(new Date().setHours(0,0,0,0)).getTime();
        } else {
            return time <= new Date().getTime();
        };
    }

    /**
     * Disable hours for slot 1 from time
     */
    disabledFromTimeSlot1 = (): number[] => {
        let disabledHours = [0,1,2,3,4,5,6,7,21,22,23];
        if (this.isToday(this.slots.date_slot1)) {
            let currentHour = new Date().getHours();
            for(let i = 7; i <= currentHour; i++) {
                if (disabledHours.indexOf(i) === -1) {
                    disabledHours.push(i);
                }
            }
            
        }
        return disabledHours;
    }

    /**
     * Disable hours for slot 1 to time
     */
    disabledToTimeSlot1 = ():number[] => {
        let disabledHours = []
        if (this.slots && this.slots.slot1_from_time) {
            let fromTimeHours = this.slots.slot1_from_time.getHours();
            let hoursList = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
            disabledHours = hoursList.filter((elem) => {
                if (elem < fromTimeHours) return elem;
            });
        }  
        disabledHours.push(21,22,23);
        return disabledHours;   
    }

    /**
     * Disable hours for slot 2 from time
     */
    disabledFromTimeSlot2 = (): number[] => {
        let disabledHours = [0,1,2,3,4,5,6,7,21,22,23];
        if (this.isToday(this.slots.date_slot2)) {
            let currentHour = new Date().getHours();
            for(let i = 7; i <= currentHour; i++) {
                if (disabledHours.indexOf(i) === -1) {
                    disabledHours.push(i);
                }
            }
            
        }
        return disabledHours;
    }

    /**
     * Disable hours for slot 2 to time
     */
    disabledToTimeSlot2 = ():number[] => {
        let disabledHours = []
        if (this.slots && this.slots.slot2_from_time) {
            let fromTimeHours = this.slots.slot2_from_time.getHours();
            let hoursList = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
            disabledHours = hoursList.filter((elem) => {
                if (elem < fromTimeHours) return elem;
            });
        }
        disabledHours.push(21,22,23);
        return disabledHours;     
    }

    /**
    * Get vimeo video upload form Vimeo API to upload the video file.
    */
    prepareVideoUpload(){
        this.uploadVideoDiv = document.querySelector('.vimeo-video');
        if (!this.uploadVideoDiv && !this.loading) {
            this.loading = true;
            const loading = this.message.loading(FeedbackMessages.loading.VideoUploadPrepare, { nzDuration: 0 }).messageId;
            this.jobService.preInterviewData(this.slots);
            let redirectUrl = this.authService.preInterviewRedirectPage() ? this.authService.preInterviewRedirectPage() : '';
            this.vimeoService.createNewVideo(redirectUrl).subscribe((response) => {
                this.message.remove(loading);
                this.loading = false;
                if (response) {
                    let vimeoUploadDiv = document.createElement("div");
                    vimeoUploadDiv.className = "vimeo-video";
                    vimeoUploadDiv.innerHTML = response['upload']['form'];
                    vimeoUploadDiv.querySelector("label").innerText = "Choose Video";
                    vimeoUploadDiv.querySelector("input[type='submit']").nodeValue = 'Upload';
                    vimeoUploadDiv.querySelector("input[type='file']").setAttribute("accept", "video/mp4,video/x-m4v,video/*");
                    document.querySelector('#video').appendChild(vimeoUploadDiv);
                    document.querySelector('#video input[type="file"]').addEventListener('change', (event) => {
                        if (event && event.target && event.target['files'] && event.target['files'][0]) {
                          if (document.querySelector(".filename-text")) {
                            document.querySelector(".filename-text").remove();
                          }
                          let fileName = document.createElement("p");
                          fileName.className = "filename-text";
                          fileName.innerText = event.target['files'][0]['name'];
                          vimeoUploadDiv.appendChild(fileName);
                        }
                    });
                    document.querySelector("#video form").addEventListener('submit', (event) => {
                        let selectedFile = document.querySelector("#video .filename-text");
                        if (!selectedFile) {
                            event.preventDefault();
                        }
                    });
                }
            }, (err) => {
                this.loading = false;
                this.message.remove(loading);
            });
        } 
    }

    /**
     * Set the video Id to the PreInterview Process API
     */
    preInterviewProcess() {
        const loading = this.message.loading(FeedbackMessages.loading.InterviewChooseSlot, { nzDuration: 0 }).messageId;
        this.selectedJobDetails = this.searchService.getSelectedJobDetails();
        this.slots.referrenceId = this.selectedJobDetails.quickInfo ? this.selectedJobDetails.quickInfo.referrenceId.toString() : '0';
        let reqBody = this.slots;
        if (this.videoURI) {
            reqBody['introduction_video_id'] = this.videoURI.split('/')[2];
            reqBody['introduction_video_caption'] = "Intro Video";
        }
        this.jobService.preInterviewProcess(reqBody).subscribe((response) => {
            if (response && response.code === 200){
                this.analyticsService.eventEmitter('PreInterviewProcessScreen', 'PreInterviewProcessSubmit', 'PreInterviewProcessSubmit');
                if (this.isApplied) {
                    this.message.success(FeedbackMessages.success.JobApplied, {nzDuration: 1500});
                } else {
                    this.message.success(FeedbackMessages.success.InterviewScheduled, {nzDuration: 1500});
                }
                this.jobService.clearPreinterviewData();
                this.videoData = null;
                this.success.emit(true);
                this.goBack();
                // let redirectUrl = this.authService.preInterviewRedirectPage() ? this.authService.preInterviewRedirectPage() : '';
            }
            this.message.remove(loading);
        }, () => {
            this.message.remove(loading);
        });
    }

    /**
     * Go to previous route
     */
    goBack() {
        this.slots = {
            "preferredinterviewtype": 1,
            "referrenceId": '0',
            "date_slot1": null,
            "slot1_from_time": null,
            "slot1_to_time": null,
            "date_slot2": null,
            "slot2_from_time": null,
            "slot2_to_time": null
        }
    }

    /**
     * Clear Pre-Interview data and emit cancel event
     */
    skip() {
        this.goBack();
        this.cancel.emit(true);
    }

    /**
     * Return Sanaitized external url from youtube and vimeo
    */
    safeUrl(url: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    /**
     * Check if date is today
     * @param inputDate Date type value to be compared
     */
    isToday(inputDate: Date): boolean {
        let currentDate = new Date();
        if (inputDate) {
            return (currentDate.getDate() == inputDate.getDate() &&
                currentDate.getMonth() == inputDate.getMonth() && 
                currentDate.getFullYear() == inputDate.getFullYear()
            )
        } else {
            return false;
        }
        
    }
}
