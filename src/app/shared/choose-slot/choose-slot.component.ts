import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { JobService } from '@app/core';
import { Router } from '@angular/router';
import { AuthenticationService,SearchJobService, VimeoService, AnalyticsService } from '@app/core';
@Component({
  selector: 'app-choose-slot',
  templateUrl: './choose-slot.component.html',
  styleUrls: ['./choose-slot.component.scss']
})
export class ChooseSlotComponent implements OnInit {
    slots: {
        "preferredinterviewtype": number,
        "referrenceId": number,
        "date_slot1": Date,
        "slot1_from_time": Date,
        "slot1_to_time": Date,
        "date_slot2": Date,
        "slot2_from_time": Date,
        "slot2_to_time": Date
    } = {
        "preferredinterviewtype": 1,
        "referrenceId": 0,
        "date_slot1": null,
        "slot1_from_time": null,
        "slot1_to_time": null,
        "date_slot2": null,
        "slot2_from_time": null,
        "slot2_to_time": null
    }

    @Input() referrenceId: number;
    @Output() selected: EventEmitter<any> = new EventEmitter<any>(); // Emit event with boolean value
    
    constructor(
        private jobService: JobService,
        private router: Router,
        private SearchJobService:SearchJobService
    ) {}

    ngOnInit() {
        if (this.referrenceId) this.slots.referrenceId = this.referrenceId;
        // Code for making pre request interview process api when user has applied.
        // this.jobService.startPreInterviewProcess.subscribe(isApplied => {
        //     if (isApplied) {
        //         console.log("Setting Interview: ", isApplied);
        //         this.onSubmit();
        //     }
        // });
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
        } else {
            this.slots.date_slot2 = value;
        }
    }

    /**
     * Disable dates for slot 1
     */
    disabledDateSlot1 = (current: Date) => {
        let time = current.getTime()
        return time <= new Date().getTime();
    }

    /**
     * Disable dates for slot 2
     */
    disabledDateSlot2 = (current: Date) => {
        let time = current.getTime()
        return time <= (new Date(this.slots.date_slot1).getTime() + 86400000);
    }

    /**
     * Disable hours for slot 1 from time
     */
    disabledFromTimeSlot1 = (): number[] => {
        return [0,1,2,3,4,5,6,7,8,21,22,23]
    }

    /**
     * Disable hours for slot 1 to time
     */
    disabledToTimeSlot1 = ():number[] => {
        let fromTimeHours = this.slots.slot1_from_time.getHours();
        let hoursList = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
        let disabledHours = hoursList.filter((elem) => {
            if (elem < fromTimeHours) return elem;
        });
        disabledHours.push(21,22,23);
        return disabledHours;       
    }

    /**
     * Disable hours for slot 2 from time
     */
    disabledFromTimeSlot2 = (): number[] => {
        return [0,1,2,3,4,5,6,7,8,21,22,23]
    }

    /**
     * Disable hours for slot 2 to time
     */
    disabledToTimeSlot2 = ():number[] => {
        let fromTimeHours = this.slots.slot2_from_time.getHours();
        let hoursList = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
        let disabledHours = hoursList.filter((elem) => {
            if (elem < fromTimeHours) return elem;
        });
        disabledHours.push(21,22,23);
        return disabledHours;       
    }

    /**
     * Emit value on selection
     */
    onSubmit() {
        // this.selected.emit(this.slots)
        let reqBody: any = {};
        if (this.slots.preferredinterviewtype == 1) {
            reqBody['referrenceId'] = this.slots.referrenceId;
            reqBody['preferredinterviewtype'] = this.slots.preferredinterviewtype;
            this.jobService.preInterviewProcess(reqBody).subscribe((response) => {
                if (response && response.code === 200) {
                    this.jobService.startPreInterviewProcess.next(false);
                }
            })
        } else if (this.slots.preferredinterviewtype == 2) {
            reqBody = this.slots;
            this.jobService.preInterviewProcess(reqBody).subscribe((response) => {
                if (response && response.code === 200) {
                    this.jobService.startPreInterviewProcess.next(false);
                }
            })
        } else {
            let reqBody = {
                referrenceId: this.slots.referrenceId.toString(),
                status: 18,
                bucketId:this.SearchJobService.getSelectedJob().bucket_Id

            }
            this.jobService.takeAction(reqBody).subscribe((response) => {
                if (response && response.code === 200) {
                } else if (response.code && response.code === 710 && response.data && response.data['missingFields'] && response.data['missingFields'].length > 0) {
                    this.router.navigate(['profile'], {queryParams: {fields: response.data['missingFields'].toString()}});
                }
            });
        }
        
    }

}