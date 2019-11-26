import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService, AnalyticsService, JobService, CommonService, ProfileService } from '@app/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationMessages, FeedbackMessages } from '@app/core/messages';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
    scheduleForm: FormGroup;
    notificationCurrentPageNumber: number = 1;
    notificationResponse: any;
    notifications: any[];
    loading = false;
    lastPageNumber = false;
    showConfirmInterviewModal = false;
    showConfirmationModal = false;
    cronofyResponse: any;
    selectedDateSlot: any;
    selectedTimeSlot: any;
    countryList: any = [];
    currentUser: any;
    submitted: boolean;
    validationMsgs: any;

    /**
     * Hostlistern to detect scroll
     * @param event 
     */
    @HostListener("document:scroll", ['$event'])
    onWindowScroll(event) {
        if (event && event.target && event.target.scrollTop && event.target.scrollHeight && !this.loading && event.target.scrollTop + event.target.clientHeight == event.target.scrollHeight) {
            if (this.notificationCurrentPageNumber && this.notificationResponse && this.notificationCurrentPageNumber < this.notificationResponse.totalPage){
                this.notificationCurrentPageNumber ++;
                this.getNotifications();
            } else {
                this.lastPageNumber = true;
                return;
            }
        }
    }

    constructor(
        private notificationService: NotificationsService,
        private message: NzMessageService,
        private router: Router,
        private analyticsService: AnalyticsService,
        private jobService: JobService,
        private commonService: CommonService,
        private formBuilder: FormBuilder,
        private profileService: ProfileService
    ) {
        this.validationMsgs = ValidationMessages;
    }

    ngOnInit() {  
        // this.toggleNotificationMenu();
        this.getNotifications();
        this.getCountryList();
        this.scheduleForm = this.formBuilder.group({
          countryPhoneCode: [''],
          mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)]],
        });
        this.getBasicProfileDetail();
    }

    /**
     * Get basic profile data from API
     */
    getBasicProfileDetail() {
        this.profileService.getProfileDetails('').subscribe((response) => {
            if (response && response.code === 200 && response.data) {
              this.currentUser = response.data;
              if (this.currentUser['basicInfo']) {
                this.scheduleForm.get('countryPhoneCode').setValue(parseInt(this.currentUser['basicInfo']['countryPhoneCode']));
                this.scheduleForm.get('mobile').setValue(this.currentUser['basicInfo']['mobile']);
              }
            }
        });
    }

    /**
     * Get the notifications page-wise
     */
    getNotifications() {
        this.loading = true;
        const loading = this.message.loading(FeedbackMessages.loading.NotificationsFetch, { nzDuration: 0 }).messageId;
        this.notificationService.getNotificationsList(this.notificationCurrentPageNumber).subscribe((response) => {
            this.loading = false;
            this.message.remove(loading);
            this.getBasicProfileDetail();
            if (response.code && response.code === 200) {
                this.notificationResponse = response.data;
                if (this.notifications) {
                    this.notifications = this.notifications.concat(response.data['details']);
                }
                else {
                    this.notifications = response.data['details'];
                }
            }
        }, (error) => {
            this.loading = false;
            this.message.remove(loading);
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
     * Go back to last url
     */
    goBack(){
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
     * Show/hide dropdown menu
     */
    toggleNotificationMenu(notificationId) {
        this.notifications.forEach((notification, index) =>{
            if (notification.id == notificationId) {
                if (this.notifications[index]['isOpen']) this.notifications[index]['isOpen'] = false;
                else this.notifications[index]['isOpen'] = true;
            } else {
                if (this.notifications[index]['isOpen']) this.notifications[index]['isOpen'] = false;
            }
        });
    }

    /**
     * Mark the notification as read
     * @param notificationId notification unique id
     */
    markNotificationAsRead(notificationId) {
        this.notificationService.markNotificationAsRead(notificationId).subscribe((response) => {
            if (response && response.code === 200) {
                let currentNotificationIdx;
                this.notifications.find((notification, index) =>{
                    if (notification.id == notificationId) {
                        currentNotificationIdx = index;
                    }
                    return notification.id == notificationId;
                });
                this.notifications[currentNotificationIdx]['isRead'] = true;
                this.analyticsService.eventEmitter('NotificationScreen', 'NotificationSelection', 'NotificationSelection');
                this.notificationService.refreshNotificationCounts.next(true);
            }
        })
    }

    /**
     * Mark all the notifiations as read
     */
    clearAllNotifications() {
        this.notificationService.clearAll().subscribe(response => {
            if (response && response.code === 200 && response.data) {
                this.analyticsService.eventEmitter('NotificationScreen', 'NotificationClearAll', 'NotificationClearAll');
                this.notificationCurrentPageNumber = 1;
                this.notificationResponse = response.data;
                this.notifications = response.data['details'];
            }
        });
    }

    /**
     * Mavigate to screen based on deep link screen id of a notification // 11- interview scheduled, 20-hired
     */
    navigateToPage(notification: any) {
        if (notification && notification.deeplinkScreen == 11) {
            if (notification.status < 3 ) {
                this.getInterviewDetail(notification.metadata);
                // this.router.navigate(['/notification/schedule'], {queryParams: {id: notification.metadata}});
            } else {
                // Show message already scheduled
                this.message.info(FeedbackMessages.info.InterviewAlreadyScheduled, {nzDuration: 1500});
            }
        } else if (notification && notification.deeplinkScreen == 26) {
            if (notification.status < 3) {
                this.getCronofySlots(notification['metadata']);
            } else {
                this.message.info(FeedbackMessages.info.InterviewAlreadyScheduled, {nzDuration: 1500});
            }
        } else if (notification && notification.deeplinkScreen == 14) {
            this.router.navigateByUrl('/assessments');
        } else if (notification && (notification.deeplinkScreen == 15 || notification.deeplinkScreen == 22)) {
            if (notification.deeplinkScreen == 22) {
                this.router.navigate(['/profile'], {queryParams: {active: 6}});
            } else {
                this.router.navigate(['/profile']);
            }
        } else if (notification && notification.deeplinkScreen == 17) {
            this.router.navigate(['/myjobs'], {queryParams: {tab: 1, id: notification.metadata, type: 1}});
        } else if (notification && notification.deeplinkScreen == 18) {
            // if (notification.status == 2) this.router.navigate(['/myjobs'], {queryParams: {tab: 2, id: notification.metadata, type: 1}});
            if (notification.status == 2) this.message.info(FeedbackMessages.info.JobIsAlreadyApplied, {nzDuration: 1500});
            else this.router.navigate(['/myjobs'], {queryParams: {tab: 1, id: notification.metadata, type: 1}});
        } else if (notification && notification.deeplinkScreen == 19) {
            this.router.navigate(['/myjobs'], {queryParams: {tab: 1}});
        } else if (notification && (notification.deeplinkScreen == 16 || notification.deeplinkScreen == 20)) {
            this.router.navigate(['/myjobs'], {queryParams: {tab: 4, type: 2}});
        } else if (notification && notification.deeplinkScreen == 21) {
            this.router.navigate(['/myjobs'], {queryParams: {tab: 5, id: notification.metadata, type: 2}});
        }
        this.markNotificationAsRead(notification.id);
    }

    /**
     * Close cronofy interview slots modal
     */
    cancelInterviewModal() {
        this.cronofyResponse = null;
        this.selectedDateSlot = null;
        this.selectedTimeSlot = null;
        this.showConfirmInterviewModal = false;
    }

    /**
     * Submit cronofy interview slots modal
     */
    confirmInterviewModal() {
        if (this.scheduleForm.invalid && this.cronofyResponse.interviewDetails && this.cronofyResponse.interviewDetails.InterviewTypeId == 3) {
            console.log(this.scheduleForm.controls);
            this.submitted = true;
            return;
        } else if (this.scheduleForm.invalid && this.scheduleForm.get('mobile').errors && (this.scheduleForm.get('mobile').errors.pattern || this.scheduleForm.get('mobile').errors.minlength) && this.cronofyResponse.interviewDetails && this.cronofyResponse.interviewDetails.InterviewTypeId != 3) {
            this.submitted = true;
            return;
        } else {
            this.showConfirmationModal = true;
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

    /**
     * Select date slot
     * @param dateSlot 
     * @param index 
     */
    selectDateSlot(dateSlot, index) {
        this.selectedDateSlot = dateSlot;
        this.cronofyResponse['available_periods'].forEach((elem, idx) => {
            this.cronofyResponse['available_periods'][idx]['active'] = false;
        })
        this.cronofyResponse['available_periods'][index]['active'] = true;
    }

    /**
     * Select time slot
     * @param timeSlot 
     * @param index 
     */
    selectTimeSlot(timeSlot, index) {
        this.selectedTimeSlot = timeSlot;
        this.selectedDateSlot['timeSlots'].forEach((elem, idx) => {
            this.selectedDateSlot['timeSlots'][idx]['active'] = false;
        });
        this.selectedDateSlot['timeSlots'][index]['active'] = true;
    }

    /**
     * Schedule Interview reuest
     */
    scheduleInterview() {
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

        console.log("request body: ", reqBody);
        const loading = this.message.loading(FeedbackMessages.loading.JobInterviewSchedule, { nzDuration: 0 }).messageId;
        this.jobService.scheduleInterview(reqBody).subscribe(response => {
            this.loading = false;
            this.message.remove(loading);
            if (response && (response.code === 200 || response.code === 0)) {
                this.message.success(FeedbackMessages.success.CronofyScheduled, {nzDuration: 1500});
                this.cancelConfirmationModal();
                this.notificationCurrentPageNumber = 1;
                this.showConfirmInterviewModal = false;
                this.cronofyResponse = null;
                this.selectedDateSlot = null;
                this.selectedTimeSlot = null;
                this.submitted = false;
                setTimeout(() => {
                    this.getNotifications();
                }, 1500)
            }
        }, (error) => {
            this.loading = false;
            this.message.remove(loading);
            this.submitted = false;
        });
    }

    /**
     * Cancel cronofy confirmation modal
     */
    cancelConfirmationModal() {
        this.showConfirmationModal = false;
    }
    
    /**
     * Handle submit on cronofy confirmation modal
     */
    submitConfirmationModal() {
        // this.showConfirmationModal = false;
        this.scheduleInterview();
    }

    /**
     * Create date and time slot from cronofy interview date
     * @param availablePeriodsArray 
     * @param interval 
     */
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
                //     slots.push(slot);
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