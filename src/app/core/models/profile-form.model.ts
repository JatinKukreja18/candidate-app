export interface ProfileForm {
    basicInfo?: {
      firstName: string;
      lastName?: string;
      dob?: Date;
      gender?: string;
      imageUrl?: string;
      mobile?: string;
      countryPhoneCode?: string
    };
    professionalInfo?: {
      designation?: string;
      expectedpay?: number;
      expectedPayUnitSymbol?: string;
      preferredLocation?: string;
      preferredJobTypeId?: number;
      lat?: number;
      lng?: number
    };
    videoLinkTypeId?: number;
    videoLink?: string;
    VideoLinkCaption?: string;
    socialLink?: {
        typeid: number;
        link: string;
      }[];
    visastatus?: {
        visastatusid: number;
        visastatusname: string;
        selected: boolean;
      }[];
    referenceList?: {
        candidateid?: number;
        name: string;
        mobilenumber?: string;
        countryPhoneCode?: string;
        emailid: string;
        capacity: number;
        jobId?: number;
        comment?: string;
    }[];
}