import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService, JobService, ProfileService, AnalyticsService } from '@app/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationMessages, FeedbackMessages } from '@app/core/messages';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  scheduleForm: FormGroup;
  validationMsgs: any;
  interviewDetail: any;
  countryList: any = [];
  currentUser: any;
  submitted = false;
  loading = false;
  showSlotConfirmationModal: boolean = false;
  selectedTimeSlot: any;
  selectedDateSlot: {
    firstHalf: any[],
    secondHalf: any[]
  } = {
    firstHalf: [],
    secondHalf: []
  }

  constructor( 
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private profileService: ProfileService,
    private message: NzMessageService,
    private analyticsService: AnalyticsService
  ) { 
    this.validationMsgs = ValidationMessages;
  }

  ngOnInit() {
    this.getCountryList();
    this.scheduleForm = this.formBuilder.group({
      countryPhoneCode: [''],
      mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)]],
      interviewSlot: ['', Validators.required],
    });
    this.profileService.getProfileDetails('').subscribe((response) => {
      if (response && response.code === 200 && response.data) {
        this.currentUser = response.data;
        if (this.currentUser['basicInfo']){
          this.scheduleForm.get('countryPhoneCode').setValue(parseInt(this.currentUser['basicInfo']['countryPhoneCode']));
          this.scheduleForm.get('mobile').setValue(this.currentUser['basicInfo']['mobile']);
        }
      }
    });
    this.route.queryParamMap.subscribe(result => {
      if (result && result['params'] && result['params']['id']) {
        this.getInterviewDetail(result['params']['id']);
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
   * Get current interview details
   * @param interviewId Interview Id
   */
  getInterviewDetail(interviewId: string) {
    const loading = this.message.loading(FeedbackMessages.loading.JobInterviewDetailFetch, { nzDuration: 0 }).messageId;
    this.jobService.getInterviewDetail(interviewId).subscribe(response => {
      this.message.remove(loading);
      if (response && response.code === 200 && response.data) {
        this.interviewDetail = response.data;
      }
    }, () => {
      this.message.remove(loading);
    });
  }

  /**
   * Go to the previous page
   */
  goBack(){
    this.analyticsService.eventEmitter('ScheduleInterviewScreen', 'ScheduleInterviewCancel', 'ScheduleInterviewCancel');
    window.history.back();
  }

  /**
  * getter funtion for easy form controls
  * @return form control values
  */
  get f() {
    return this.scheduleForm.controls;
  }

  /**
   * Select interview slot 1 
   * @param $event 
   */
  selectInterviewSlot1(event, value) {
    if (event && event.target && event.target.checked) {
      console.log("Slot 1 selected: ", value);
      if (this.interviewDetail.isSlot1AvailableAllDay) {
        this.initSelectedDate();
        this.createFirstAndSecondHalfSlots(value);
        if (this.selectedDateSlot.firstHalf.length > 0 || this.selectedDateSlot.firstHalf.length > 0) {
          this.showSlotConfirmationModal = true;
        }
      }
      console.log("Selected Date Slot: ", this.selectedDateSlot);
    }
    this.analyticsService.eventEmitter('ScheduleInterviewScreen', 'ScheduleInterviewSlot1', 'ScheduleInterviewSlot1');
  }

  /**
   * Select interview slot 2 
   * @param $event 
   */
  selectInterviewSlot2(event, value) {
    if (event && event.target && event.target.checked) {
      console.log("Slot 1 selected: ", value);
      if (this.interviewDetail.isSlot2AvailableAllDay) {
        this.initSelectedDate();
        this.createFirstAndSecondHalfSlots(value);
        if (this.selectedDateSlot.firstHalf.length > 0 || this.selectedDateSlot.firstHalf.length > 0) {
          this.showSlotConfirmationModal = true;
        }
      }
      console.log("Selected Date Slot: ", this.selectedDateSlot);
    }
    this.analyticsService.eventEmitter('ScheduleInterviewScreen', 'ScheduleInterviewSlot2', 'ScheduleInterviewSlot2');
  }

  /**
   * Schedule Interview
   */
  onSubmit() {
    this.submitted = true;
    if(this.scheduleForm.invalid) {
      return;
    } else {
      if (!this.loading) {
        let reqBody = {
          "interviewId": this.interviewDetail.interviewId,
          "scheduleDate": this.scheduleForm.value.interviewSlot,
          "timeZone": this.interviewDetail.timeZone,
          "candidatePhone": this.scheduleForm.value.mobile.toString(),
          "countryPhoneCode": this.interviewDetail.clientPhoneCode,
        }
        if (this.selectedTimeSlot && this.selectedTimeSlot.startDate instanceof Date) {
          reqBody['scheduleDate'] = this.selectedTimeSlot.startDate.toISOString();
        }
        console.log("Request Body: ", reqBody);
        this.loading = true;
        const loading = this.message.loading(FeedbackMessages.loading.JobInterviewSchedule, { nzDuration: 0 }).messageId;
        this.jobService.scheduleInterview(reqBody).subscribe(response => {
          this.loading = false;
          this.message.remove(loading);
          if (response && response.code === 200) {
            this.message.success(response.message, {nzDuration: 1500});
            this.analyticsService.eventEmitter('ScheduleInterviewScreen', 'ScheduleInterviewSubmit', 'ScheduleInterviewSubmit');
            window.history.back();
          }
        }, () => {
          this.loading = false;
          this.message.remove(loading);
        });
      }
    }
  }

  /**
   * Get Time Slots between two dates 
   * @param startDate start date 
   * @param endDate end date
   * @param interval time slot interval in minutes
   */
  createTimeSlots(startDate, endDate, interval): any[] {
    let slots = [];
    if (startDate && endDate && interval) {
        while (new Date(startDate).getTime() < new Date(endDate).getTime()) {
            let slot = {};
            if (new Date(startDate).getTime() < new Date(endDate).getTime() - interval * 60 * 1000){
                slot['startDate'] = new Date(startDate);
                slot['endDate'] = new Date(new Date(startDate).setMinutes(new Date(startDate).getMinutes() + 30));
            } else {
                slot['startDate'] = new Date(new Date(endDate).getTime() - interval * 60 * 1000);
                slot['endDate'] = endDate;
            }
            slots.push(slot);
            startDate = slot['endDate'];
        }
    }
    return slots;
  }

  /**
   * Divide date slots into first and second half
   * @param selectedDate 
   */
  createFirstAndSecondHalfSlots(selectedDate) {
    let currentHour = new Date().getHours();
    let currentMinutes = new Date().getMinutes();
    let firstHalfStartTime = new Date(selectedDate).setHours(8, 0);
    let firstHalfEndTime = new Date(selectedDate).setHours(13, 0);
    let secondHalfStartTime = new Date(selectedDate).setHours(13, 0);
    let secondHalfEndTime = new Date(selectedDate).setHours(18, 0);
    if (new Date().getDate() == new Date(selectedDate).getDate()) {
      if (currentHour >= 8 && currentHour < 12) {
        if (currentMinutes < 25) {
          firstHalfStartTime = new Date(selectedDate).setHours(currentHour, 30);
          firstHalfEndTime = new Date(selectedDate).setHours(13, 0);
        } else if (currentMinutes < 55){
          firstHalfStartTime = new Date(selectedDate).setHours(currentHour + 1 , 0);
          firstHalfEndTime = new Date(selectedDate).setHours(13, 0);
        }
      } else if (currentHour == 12) {
        if (currentMinutes < 25) {
          firstHalfStartTime = new Date(selectedDate).setHours(currentHour, 30);
          firstHalfEndTime = new Date(selectedDate).setHours(13, 0);
        }
      } else if (currentHour > 12 && currentHour < 17) {
        if (currentMinutes < 25) {
          secondHalfStartTime = new Date(selectedDate).setHours(currentHour, 30);
          secondHalfEndTime = new Date(selectedDate).setHours(18, 0);
        } else if (currentMinutes < 55){
          secondHalfStartTime = new Date(selectedDate).setHours(currentHour + 1 , 0);
          secondHalfEndTime = new Date(selectedDate).setHours(18, 0);
        }
      } else if (currentHour == 17) {
        if (currentMinutes < 25) {
          secondHalfStartTime = new Date(selectedDate).setHours(currentHour, 30);
          secondHalfEndTime = new Date(selectedDate).setHours(18, 0);
        }
      } else if (currentHour >= 18) {
        firstHalfStartTime = null;
        firstHalfEndTime = null;
        secondHalfStartTime = null;
        secondHalfEndTime = null;
      }
    }
    if (firstHalfStartTime && firstHalfEndTime) {
      this.selectedDateSlot.firstHalf = this.createTimeSlots(firstHalfStartTime, firstHalfEndTime, 30);
    }
    if (secondHalfStartTime && secondHalfEndTime) {
      this.selectedDateSlot.secondHalf = this.createTimeSlots(secondHalfStartTime, secondHalfEndTime, 30);
    }
  }

  /**
   * Close interview slot modal and set selectedTimeSlot to null
   */
  cancelInterviewModal() {
    this.selectedTimeSlot = null;
    this.showSlotConfirmationModal = false;
  }

  /**
   * close interview slot modal
   */
  confirmInterviewModal() {
    this.showSlotConfirmationModal = false;
  }

  /**
   * Select time slot for All day interview
   * @param timeSlot current selected time slot
   * @param half 'First Half' or 'Second Half' of the day
   * @param index index of the selected time slot
   */
  selectTimeSlot(timeSlot, half, index) {
    this.selectedTimeSlot = timeSlot;
    this.selectedDateSlot['firstHalf'].forEach((elem, idx) => {
        this.selectedDateSlot['firstHalf'][idx]['active'] = false;
    });
    this.selectedDateSlot['secondHalf'].forEach((elem, idx) => {
      this.selectedDateSlot['secondHalf'][idx]['active'] = false;
    });
    this.selectedDateSlot[half][index]['active'] = true;
  }

  /**
   * Initialize the date slots
   */
  initSelectedDate() {
    this.selectedDateSlot.firstHalf = [];
    this.selectedDateSlot.secondHalf = [];
  }

}
