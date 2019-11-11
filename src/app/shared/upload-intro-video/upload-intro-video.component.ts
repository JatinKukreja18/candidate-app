import { Component, OnInit, Input } from '@angular/core';
import { SearchJobService, JobService, VimeoService } from '@app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { FeedbackMessages } from '@app/core/messages'

@Component({
  selector: 'app-upload-intro',
  templateUrl: './upload-intro-video.component.html',
  styleUrls: ['./upload-intro-video.component.scss']
})
export class UploadVideoComponent implements OnInit {
    @Input() referrenceId: number;
    @Input() redirectUri: string;
    @Input() videoId: string;
    @Input() preferredinterviewtype: number;
    loading = false;

    constructor(
        private searchService: SearchJobService,
        private vimeoService: VimeoService,
        private route: ActivatedRoute,
        private router: Router,
        private jobService: JobService,
        private message: NzMessageService
    ) {}

    ngOnInit() {
        this.preInterviewProcess();
    }

    /**
    * Get vimeo video upload form Vimeo API to upload the video file.
    */
    prepareVideoUpload(){
        const uploadVideoDiv = document.querySelector('.vimeo-video');
        if (!uploadVideoDiv && !this.loading) {
            this.loading = true;
            const loading = this.message.loading(FeedbackMessages.loading.ProfileUploadFile, { nzDuration: 0 }).messageId;
            this.vimeoService.createNewVideo(this.redirectUri).subscribe((response) => {
                this.message.remove(loading);
                this.loading = false;
                if (response) {
                    let vimeoUploadDiv = document.createElement("div");
                    vimeoUploadDiv.className = "vimeo-video";
                    vimeoUploadDiv.innerHTML = response['upload']['form'];
                    vimeoUploadDiv.querySelector("label").innerText = "Choose Video";
                    vimeoUploadDiv.querySelector("input[type='submit']").nodeValue = 'Upload';
                    document.querySelector('#video').appendChild(vimeoUploadDiv);
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
        this.route.queryParamMap.subscribe(params => {
            let videoUrl = params.get('video_uri');
            if (videoUrl) {
                const loading = this.message.loading(FeedbackMessages.loading.InterviewChooseSlot, { nzDuration: 0 }).messageId;
                let reqBody = {
                    "referrenceId": this.searchService.getSelectedJob() ? this.searchService.getSelectedJob()['referrenceId'] : '',
                    "preferredinterviewtype": this.preferredinterviewtype ? this.preferredinterviewtype : 1,
                    "introduction_video_id": videoUrl.split('/')[2],
                    "introduction_video_caption": "Intro video"
                }
                this.jobService.preInterviewProcess(reqBody).subscribe((response) => {
                    if (response && response.code === 200){
                        this.message.success(response.message, {nzDuration: 1500})
                        this.router.navigateByUrl(this.redirectUri);
                    }
                    this.message.remove(loading);
                }, () => {
                    this.message.remove(loading);
                })
            }
        }); 
    }

    

}