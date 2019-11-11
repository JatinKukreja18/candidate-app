export interface TakeActionForm {
    status: number;
    referrenceId: string;
    bucketId:any;
}

export interface PreInterviewProcessFrom {
    preferredinterviewtype?: number;
    referrenceId?: string;
    date_slot1?: Date;
    slot1_from_time?: Date;
    slot1_to_time?: Date;
    date_slot2?: Date;
    slot2_from_time?: Date;
    slot2_to_time?: Date;
    introduction_video_id?: string;
    introduction_video_caption?: string;
}

export interface ScheduleInterviewForm {
    interviewId: string;
    scheduleDate: string;
    scheduleEndDate?: string;
    timeZone: string;
    candidatePhone?: string;
    countryPhoneCode?: string;
    candidatePasscode?: string;
}