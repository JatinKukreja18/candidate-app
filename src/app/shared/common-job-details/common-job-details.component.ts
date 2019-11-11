import { Component, ElementRef, ViewChild, Input, OnChanges, OnInit } from '@angular/core';
import { SearchJobService } from '@app/core';

@Component({
    selector: 'app-common-job-details',
    templateUrl: './common-job-details.component.html',
    styleUrls: ['./common-job-details.component.scss']
})
export class CommonJobDetailsComponent implements OnInit, OnChanges {
    @Input() selectedJob: any;
    @ViewChild('info', { read: ElementRef }) infoSection: ElementRef;
    @ViewChild('desc', { read: ElementRef }) descSection: ElementRef;
    @ViewChild('videos', { read: ElementRef }) videosSection: ElementRef;
    @ViewChild('slot', { read: ElementRef }) slotSection: ElementRef;
    @ViewChild('intro', { read: ElementRef }) introSection: ElementRef;
    selectedJobDetails: any;
    constructor(private searchJobService: SearchJobService) {}

    ngOnInit() {
        this.getJobDetails();
    }

    ngOnChanges() {
        this.searchJobService.setSelectedJob(this.selectedJob);
        this.getJobDetails();
    }

    getJobDetails(){
        this.searchJobService.getJobDetails(0).subscribe((response) => {
            if(response.code === 200) {
                this.selectedJobDetails = response.data;
                this.searchJobService.setSelectedJobDetails(this.selectedJobDetails);
            }
        });
    }
}