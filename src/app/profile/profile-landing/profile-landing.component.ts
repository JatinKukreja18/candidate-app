import { UserDataService } from '@app/core/services/userdata.service';
import { Component, OnInit, ViewChild, ElementRef, HostListener, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationMessages, FeedbackMessages } from '@app/core/messages';
import { ProfileService, CommonService, VimeoService, AnalyticsService } from '@app/core';
import { ProfileForm } from '@app/core/models';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-landing',
  templateUrl: './profile-landing.component.html',
  styleUrls: ['./profile-landing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileLandingComponent implements OnInit {

  @ViewChild('firstName', { read: ElementRef }) firstNameField: ElementRef;
  @ViewChild('lastName', { read: ElementRef }) lastNameField: ElementRef;
  @ViewChild('gender', { read: ElementRef }) genderField: ElementRef;
  @ViewChild('preferredLocation', { read: ElementRef }) preferredLocationField: ElementRef;
  @ViewChild('city', { read: ElementRef }) searchCityInput: ElementRef;
  @ViewChild('videoLink', { read: ElementRef }) videoLinkField: ElementRef;
  @ViewChild('resume', { read: ElementRef }) resumeField: ElementRef;
  @ViewChild('expectedPayRate', { read: ElementRef }) expectedPayRateField: ElementRef;
  @ViewChild('designation', { read: ElementRef }) designationField: ElementRef;
  @ViewChild('linkedIn', { read: ElementRef }) linkedInField: ElementRef;
  profileForm: FormGroup;
  personalDetailsForm: FormGroup;
  professionalDetailsForm: FormGroup;
  resumeForm: FormGroup;
  socialForm: FormGroup;
  videoForm: FormGroup;
  referenceForm: FormGroup;
  primarySkillsForm: FormGroup;
  additionalSkillsForm: FormGroup;
  experiencesForm: FormGroup;
  additionalProjectsForm: FormGroup;
  educationForm: FormGroup;
  trainingsForm: FormGroup;
  validationMsgs: any;
  submitted = false;
  submitting = false;
  loading = false;
  date = null;
  videoLink: any;
  videoData: any;
  checked = false;
  profilePic = false;
  formData: FormData;
  profile: any;
  countryList: any = [];
  selectedAddress: any;
  primarySkillsList = [];
  additionalSkillsList = [];
  experiences = [];
  additionalProjectsList = [];
  educationsList = [];
  trainingsList = [];
  selectedFile: {
    profileImage: string,
    resumeName: string,
    videoname: string
  } = {
      profileImage: '',
      resumeName: '',
      videoname: ''
    }
  activeSection: {
    personal: boolean,
    professional: boolean,
    resume: boolean,
    social: boolean,
    video: boolean,
    reference: boolean,
    primarySkills: boolean,
    additionalSkills: boolean,
    primaryProjects: boolean,
    additionalProjects: boolean,
    educations: boolean,
    trainings: boolean
  } = {
      personal: false,
      professional: false,
      resume: false,
      social: false,
      video: false,
      reference: false,
      primarySkills: false,
      additionalSkills: false,
      primaryProjects: false,
      additionalProjects: false,
      educations: false,
      trainings: false
    }
  expandedComment: {
    one: boolean,
    two: boolean
  } = {
      one: false,
      two: false
    };
  missingFields: string[] = [];
  playVideoModal = false;
  deleteConfirmationModal = false;
  currentDeleteResourceType: number;
  formChangeSubscription: Subscription;
  videoFileName: string;
  isEmbedVideo: boolean;
  ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  editorStyle = {
    height: '80px'
  };
  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote'],
      /* [{ 'color': [] }, { 'background': [] }], */
      ['clean']
    ]
  };
  config = {
    displayKey: 'description', //if objects array passed which key to be displayed defaults to description
    search: true, //true/false for the search functionlity defaults to false,
    height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
    placeholder: 'Country Code', // text to be displayed when no item is selected defaults to Select,
    customComparator: () => { }, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
    moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder: 'Search', // label thats displayed in search input,
    searchOnKey: 'Name' // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
  }
  candidateId: string;

  constructor(
    private formBuilder: FormBuilder,
    private message: NzMessageService,
    private sanitizer: DomSanitizer,
    private profileService: ProfileService,
    private commonService: CommonService,
    private vimeoService: VimeoService,
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService,
    private activatedRoute: ActivatedRoute,
    private userDataService: UserDataService
  ) {
    this.validationMsgs = ValidationMessages;
  }

  

  dropdownOptions: any = [];

  dropdownOptions1: Array<any> = ['Africa', 'England', 'Russa', 'Bangladesh', 'ok', 'China', '', '', ''];


  ngOnInit() {

    this.getCountryList();
    // this.options.push({id: 34, ;
    if (window.navigator) {
      if (this.vimeoService.getBrowserVersion() == 'Safari 12') this.isEmbedVideo = true;
      else this.isEmbedVideo = false;
    }
    this.personalDetailsForm = this.formBuilder.group({
      firstName: ['', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(25)], updateOn: 'blur' }],
      lastName: ['', { validators: [Validators.maxLength(25)], updateOn: 'blur' }],
      countryPhoneCode: ['', { updateOn: 'blur' }],
      mobile: ['', { validators: [Validators.pattern(/^[0-9]{10}$/)], updateOn: 'blur' }],
      dob: [''],
      gender: [''],
    });

    this.professionalDetailsForm = this.formBuilder.group({
      designation: ['', { updateOn: 'blur' }],
      expectedpayrate: ['', { validators: [Validators.pattern(/^[0-9]{1,4}$/)], updateOn: 'blur' }],
      expectedAnnual: ['', { validators: [Validators.pattern(/^[0-9]{1,7}$/)], updateOn: 'blur' }],
      preferredLocation: ['', { validators: [Validators.required], updateOn: 'blur' }],
      visastatus: [0, { updateOn: 'blur' }],
      preferredJobTypeId: [0],
    });

    this.resumeForm = this.formBuilder.group({
      resume: ['', { updateOn: 'blur' }],
    });

    this.socialForm = this.formBuilder.group({
      linkedin: ['', { validators: [Validators.pattern(/(http(s)?:\/\/.)?(www\.)?\blinkedin\b/i)], updateOn: 'blur' }],
      github: ['', { validators: [Validators.pattern(/(http(s)?:\/\/.)?(www\.)?\bgithub\b/i)], updateOn: 'blur' }],
      stack: ['', { validators: [Validators.pattern(/(http(s)?:\/\/.)?(www\.)?\bstackoverflow\b/i)], updateOn: 'blur' }],
      others: ['', { updateOn: 'blur' }]
    });

    this.videoForm = this.formBuilder.group({
      uploadType: ['', { updateOn: 'blur' }],
      videoLink: ['', { validators: [Validators.pattern(/(http(s)?:\/\/.)?(www\.)?\byoutube\b/i)], updateOn: 'blur' }],
      uploadVideoLink: ['', { updateOn: 'blur' }],
      videoLinkTypeId: [0],
      VideoLinkCaption: ['', { updateOn: 'blur' }],
    });

    this.referenceForm = this.formBuilder.group({
      referenceList: this.formBuilder.group({
        one: this.formBuilder.group({
          name: ['', { validators: [Validators.minLength(2), Validators.maxLength(25)], updateOn: 'blur' }],
          emailid: ['', { validators: [Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)], updateOn: 'blur' }],
          capacity: [''],
          selectData: [''],
          countryPhoneCode: [''],
          mobilenumber: ['', { validators: [Validators.pattern(/^[0-9]{10}$/)] }]
        }),
        two: this.formBuilder.group({
          name: ['', { validators: [Validators.minLength(2), Validators.maxLength(25)], updateOn: 'blur' }],
          emailid: ['', { validators: [Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)], updateOn: 'blur' }],
          capacity: ['', { updateOn: 'blur' }],
          countryPhoneCode: ['', { updateOn: 'blur' }],
          mobilenumber: ['', { validators: [Validators.pattern(/^[0-9]{10}$/)], updateOn: 'blur' }]
        })
      })
    });

    this.primarySkillsForm = this.formBuilder.group({
      primarySkillId: [''],
      skillName: ['', { updateOn: 'blur' }],
      rating: ['', { validators: [Validators.pattern(/^(?:[1-9]|0[1-9]|10)$/)], updateOn: 'blur' }],
      experience: ['', { validators: [Validators.pattern(/^[0-9]*$/)], updateOn: 'blur' }],
    });

    this.additionalSkillsForm = this.formBuilder.group({
      additionalSkillId: [''],
      skillName: ['', { updateOn: 'blur' }],
      rating: ['', { validators: [Validators.pattern(/^(?:[1-9]|0[1-9]|10)$/)], updateOn: 'blur' }],
      experience: ['', { validators: [Validators.pattern(/^[0-9]*$/)], updateOn: 'blur' }],
    });

    this.experiencesForm = this.formBuilder.group({
      experienceId: [''],
      companyName: ['', { updateOn: 'blur' }],
      location: ['', { updateOn: 'blur' }],
      jobTitle: ['', { updateOn: 'blur' }],
      startDate: [''],
      endDate: [''],
      description: [''],
    });

    this.additionalProjectsForm = this.formBuilder.group({
      additionalProjectId: [''],
      name: ['', { updateOn: 'blur' }],
      role: ['', { updateOn: 'blur' }],
      year: ['', { validators: [Validators.pattern(/^[0-9]*$/)], updateOn: 'blur' }],
      description: [''],
    });

    this.educationForm = this.formBuilder.group({
      educationId: [''],
      degreeName: ['', { updateOn: 'blur' }],
      speciality: ['', { updateOn: 'blur' }],
      schoolName: ['', { updateOn: 'blur' }],
      startDate: [''],
      endDate: [''],
    });

    this.trainingsForm = this.formBuilder.group({
      trainingId: [''],
      training: [''],
    });

    this.profileForm = this.formBuilder.group({
      imageUrl: ['', { updateOn: 'blur' }],
      workpermit: ['', { updateOn: 'blur' }],
    });
    this.initGoogleMapPlaces();
    this.activatedRoute.params.subscribe((params) => {
      this.candidateId = params.id;
      this.getProfileDetails(this.candidateId);
    });


  }

  addPrimarySkill() {
    if (this.primarySkillsForm.invalid) {
      return;
    }
    const skill = {
      ID: this.primarySkillsForm.value.primarySkillId ? this.primarySkillsForm.value.primarySkillId : 0,
      Skill: this.primarySkillsForm.value.skillName,
      Proficiency: this.primarySkillsForm.value.rating,
      Experience: this.primarySkillsForm.value.experience,
    };
    // this.primarySkillsList.push(skill);
    this.primarySkillsList = [...this.primarySkillsList, skill];
    this.primarySkillsForm.reset();
  }

  addAdditionalSkill() {
    if (this.additionalSkillsForm.invalid) {
      return;
    }
    const skill = {
      ID: this.additionalSkillsForm.value.additionalSkillId ? this.additionalSkillsForm.value.additionalSkillId : 0,
      Skill: this.additionalSkillsForm.value.skillName,
      Proficiency: this.additionalSkillsForm.value.rating,
      Experience: this.additionalSkillsForm.value.experience,
    };
    // this.additionalSkillsList.push(skill);
    this.additionalSkillsList = [...this.additionalSkillsList, skill];
    this.additionalSkillsForm.reset();
  }

  addPrimaryProject() {
    if (this.experiencesForm.invalid) {
      return;
    }
    const project = {
      ID: this.experiencesForm.value.experienceId ? this.experiencesForm.value.experienceId : 0,
      Company_Name: this.experiencesForm.value.companyName,
      Location: this.experiencesForm.value.location,
      Job_Title: this.experiencesForm.value.jobTitle,
      Start_Date: this.experiencesForm.value.startDate,
      End_Date: this.experiencesForm.value.endDate,
      Job_Description: this.experiencesForm.value.description,
    };
    // this.primaryProjectsList.push(project);
    this.experiences = [...this.experiences, project];
    this.experiencesForm.reset();
  }

  addAdditionalProject() {
    if (this.additionalProjectsForm.invalid) {
      return;
    }
    const project = {
      ID: this.additionalProjectsForm.value.additionalProjectId ? this.additionalProjectsForm.value.additionalProjectId : 0,
      Project_Title: this.additionalProjectsForm.value.name,
      year: this.additionalProjectsForm.value.year,
      Project_Description: this.additionalProjectsForm.value.description,
    };
    console.log(this.additionalProjectsForm.value.description);
    // this.additionalProjectsList.push(project);
    this.additionalProjectsList = [...this.additionalProjectsList, project]; // need to update reference for nz-table to update
    this.additionalProjectsForm.reset();
  }

  addEducation() {
    if (this.educationForm.invalid) {
      return;
    }
    const education = {
      ID: this.educationForm.value.educationId ? this.educationForm.value.educationId : 0,
      Degree_Name: this.educationForm.value.degreeName,
      School_Name: this.educationForm.value.schoolName,
      Speciality_In: this.educationForm.value.speciality,
      Start_Date: this.educationForm.value.startDate,
      End_Date: this.educationForm.value.endDate,
    };
    this.educationsList = [...this.educationsList, education];
    this.educationForm.reset();
  }

  addTraining() {
    if (this.trainingsForm.invalid) {
      return;
    }
    const training = {
      ID: this.trainingsForm.value.trainingId ? this.trainingsForm.value.trainingId : 0,
      Training: this.trainingsForm.value.training,
    };
    this.trainingsList = [...this.trainingsList, training];
    this.trainingsForm.reset();
  }

  editSkill(type, data, index) {
    if (type === 'primary') {
      this.primarySkillsForm.get('skillName').setValue(data.Skill);
      this.primarySkillsForm.get('rating').setValue(data.Proficiency);
      this.primarySkillsForm.get('experience').setValue(data.Experience);

      this.primarySkillsList.splice(index, 1);
      this.primarySkillsList = [...this.primarySkillsList]; // need to update reference for nz-table to update
    } else if (type === 'additional') {
      this.additionalSkillsForm.get('skillName').setValue(data.Skill);
      this.additionalSkillsForm.get('rating').setValue(data.Proficiency);
      this.additionalSkillsForm.get('experience').setValue(data.Experience);

      this.additionalSkillsList.splice(index, 1);
      this.additionalSkillsList = [...this.additionalSkillsList]; // need to update reference for nz-table to update
    }
  }

  editTraining(data, index) {
    this.trainingsForm.get('training').setValue(data.Training);
    this.trainingsForm.get('trainingId').setValue(data.ID);
    console.log(data.ID);

    this.trainingsList.splice(index, 1);
    this.trainingsList = [...this.trainingsList]; // need to update reference for nz-table to update
  }

  editProject(type, data, index) {
    if (type === 'primary') {
      this.experiencesForm.get('companyName').setValue(data.Company_Name);
      this.experiencesForm.get('location').setValue(data.Location);
      this.experiencesForm.get('jobTitle').setValue(data.Job_Title);
      this.experiencesForm.get('startDate').setValue(data.Start_Date);
      this.experiencesForm.get('endDate').setValue(data.End_Date);
      this.experiencesForm.get('description').setValue(data.Job_Description);

      this.experiences.splice(index, 1);
      this.experiences = [...this.experiences]; // need to update reference for nz-table to update
    } else if (type === 'additional') {
      this.additionalProjectsForm.get('name').setValue(data.Project_Title);
      this.additionalProjectsForm.get('year').setValue(data.year);
      this.additionalProjectsForm.get('description').setValue(data.Project_Description);

      this.additionalProjectsList.splice(index, 1);
      this.additionalProjectsList = [...this.additionalProjectsList]; // need to update reference for nz-table to update
    }
  }

  editEducation(data, index) {
    this.educationForm.get('degreeName').setValue(data.Degree_Name);
    this.educationForm.get('schoolName').setValue(data.School_Name);
    this.educationForm.get('speciality').setValue(data.Speciality_In);
    this.educationForm.get('startDate').setValue(data.Start_Date);
    this.educationForm.get('endDate').setValue(data.End_Date);

    this.educationsList.splice(index, 1);
    this.educationsList = [...this.educationsList]; // need to update reference for nz-table to update
  }

  deleteProject(type, index) {
    if (type === 'primary') {
      this.experiences.splice(index, 1);
      this.experiences = [...this.experiences]; // need to update reference for nz-table to update
    } else if (type === 'additional') {
      this.additionalProjectsList.splice(index, 1);
      this.additionalProjectsList = [...this.additionalProjectsList]; // need to update reference for nz-table to update
    }
  }

  deleteSkill(type, index) {
    if (type === 'primary') {
      this.primarySkillsList.splice(index, 1);
      this.primarySkillsList = [...this.primarySkillsList]; // need to update reference for nz-table to update
    } else if (type === 'additional') {
      this.additionalSkillsList.splice(index, 1);
      this.additionalSkillsList = [...this.additionalSkillsList]; // need to update reference for nz-table to update
    }
  }

  deleteEducation(index) {
    this.educationsList.splice(index, 1);
    this.educationsList = [...this.educationsList]; // need to update reference for nz-table to update
  }

  deleteTraining(index) {
    this.trainingsList.splice(index, 1);
    this.trainingsList = [...this.trainingsList]; // need to update reference for nz-table to update
  }

  /**
   * Highlight section based on the query parameters
   */
  highlightSection() {
    this.route.queryParamMap.subscribe(result => {
      for (let i in this.activeSection) {
        this.activeSection[i] = false;
      }
      if (result && result['params']) {
        if (result['params']['active']) {
          switch (parseInt(result['params']['active'])) {
            case 1: this.activeSection.personal = true;
              this.firstNameField.nativeElement.focus();
              break;
            case 2: this.activeSection.professional = true;
              this.designationField.nativeElement.focus();
              break;
            case 3: this.activeSection.resume = true;
              break;
            case 4: this.activeSection.social = true;
              this.linkedInField.nativeElement.focus();
              break;
            case 5: this.activeSection.video = true;
              break;
            case 6: this.activeSection.reference = true;
              break;
            case 7: this.activeSection.primarySkills = true;
              break;
            case 8: this.activeSection.additionalSkills = true;
              break;
            case 9: this.activeSection.primaryProjects = true;
              break;
            case 10: this.activeSection.additionalProjects = true;
              break;
            case 11: this.activeSection.educations = true;
              break;
            case 12: this.activeSection.trainings = true;
              break;
            default: this.activeSection.personal = true;
              break;
          }
        } else {
          this.activeSection.personal = true;
        }
      } else {
        this.activeSection.personal = true;
      }
    });
  }

  /**
   * Highlight section on click of section
   * @param sectionNumber 
   */
  highlightSectionOnClick(sectionNumber: number) {

    // console.log("ok",sectionNumber);

    for (let key in this.activeSection) {
      this.activeSection[key] = false;
    }
    switch (sectionNumber) {
      case 1: this.activeSection.personal = true;
        // this.firstNameField.nativeElement.focus();
        break;
      case 2: this.activeSection.professional = true;
        // this.designationField.nativeElement.focus();
        break;
      case 3: this.activeSection.resume = true;
        console.log('ok', this.activeSection.resume);
        break;
      case 4: this.activeSection.social = true;
        // this.linkedInField.nativeElement.focus();
        break;
      case 5: this.activeSection.video = true;
        break;
      case 6: this.activeSection.reference = true;
        break;
      case 7: this.activeSection.primarySkills = true;
        break;
      case 8: this.activeSection.additionalSkills = true;
        break;
      case 9: this.activeSection.primaryProjects = true;
        break;
      case 10: this.activeSection.additionalProjects = true;
        break;
      case 11: this.activeSection.educations = true;
        break;
      case 12: this.activeSection.trainings = true;
        break;
      default: this.activeSection.personal = true;
        break;
    }
  }

  /**
   * Initialize the form with already existing values
   */
  initForm() {

    if (this.formChangeSubscription) {
      this.formChangeSubscription.unsubscribe();
    }
    // Pre-Populate the Personal Details form
    this.personalDetailsForm.get('firstName').setValue(this.profile.FirstName ? this.profile.FirstName : '');
    this.personalDetailsForm.get('lastName').setValue(this.profile.LastName ? this.profile.LastName : '');
    this.personalDetailsForm.get('countryPhoneCode').setValue(this.profile.countryPhoneCode ? parseInt(this.profile.countryPhoneCode) : '');
    this.personalDetailsForm.get('mobile').setValue(this.profile.MobileNumber ? this.profile.MobileNumber : '');
    this.personalDetailsForm.get('gender').setValue(this.profile.gender ? this.profile.basicInfo.gender : '');
    this.personalDetailsForm.get('dob').setValue(this.profile.dob ? new Date(this.profile.dob) : null);
    // this.profileForm.get('imageUrl').setValue(this.profile.basicInfo.imageUrl ? this.profile.basicInfo.imageUrl : '');

    // Pre-Populate the Professional Details form
    if (this.profile.professionalInfo) {
      this.professionalDetailsForm.get('designation').setValue(this.profile.professionalInfo.designation ? this.profile.professionalInfo.designation : '');
      this.professionalDetailsForm.get('preferredLocation').setValue(this.profile.professionalInfo.preferredLocation ? this.profile.professionalInfo.preferredLocation : '');
      this.professionalDetailsForm.get('preferredJobTypeId').setValue(this.profile.professionalInfo.preferredJobTypeId ? this.profile.professionalInfo.preferredJobTypeId.toString() : '0');

      if (this.profile.professionalInfo.preferredJobTypeId == '1') {
        this.professionalDetailsForm.get('expectedAnnual').setValue(this.profile.professionalInfo.expectedpay ? this.profile.professionalInfo.expectedpay : '');
      } else if (this.profile.professionalInfo.preferredJobTypeId == '2') {
        this.professionalDetailsForm.get('expectedpayrate').setValue(this.profile.professionalInfo.expectedpay ? this.profile.professionalInfo.expectedpay : '');
      }
      this.profile.visastatus.forEach((elem) => {
        if (elem.selected) {
          this.professionalDetailsForm.get('visastatus').setValue(elem.visastatusid);
        }
      });
    }

    if (this.profile.referenceList && this.profile.referenceList[0]) {
      this.referenceForm.get('referenceList').get('one').get('name').setValue(this.profile.referenceList[0]['name']);
      this.referenceForm.get('referenceList').get('one').get('emailid').setValue(this.profile.referenceList[0]['emailid']);
      this.referenceForm.get('referenceList').get('one').get('capacity').setValue(this.profile.referenceList[0]['capacity'] ? this.profile.referenceList[0]['capacity'] : 0);
      this.referenceForm.get('referenceList').get('one').get('countryPhoneCode').setValue(this.profile.referenceList[0]['countryPhoneCode'] ? parseInt(this.profile.referenceList[0]['countryPhoneCode'].phonecode) : '');
      this.referenceForm.get('referenceList').get('one').get('mobilenumber').setValue(this.profile.referenceList[0]['mobilenumber']);
    }

    if (this.profile.referenceList && this.profile.referenceList[1]) {
      this.referenceForm.get('referenceList').get('two').get('name').setValue(this.profile.referenceList[1]['name']);
      this.referenceForm.get('referenceList').get('two').get('emailid').setValue(this.profile.referenceList[1]['emailid']);
      this.referenceForm.get('referenceList').get('two').get('capacity').setValue(this.profile.referenceList[1]['capacity'] ? this.profile.referenceList[1]['capacity'] : 0);
      this.referenceForm.get('referenceList').get('two').get('countryPhoneCode').setValue(this.profile.referenceList[1]['countryPhoneCode'] ? parseInt(this.profile.referenceList[1]['countryPhoneCode']) : '');
      this.referenceForm.get('referenceList').get('two').get('mobilenumber').setValue(this.profile.referenceList[1]['mobilenumber']);
    }

    if (this.profile.CandidateSocialProfileDetails && this.profile.CandidateSocialProfileDetails.length > 0) {
      this.profile.CandidateSocialProfileDetails.forEach((element, idx) => {
        if (element['SocialSiteId'] === 3) this.socialForm.get('linkedin').setValue(element['ProfileLink']);
        if (element['SocialSiteId'] === 5) this.socialForm.get('github').setValue(element['ProfileLink']);
        if (element['SocialSiteId'] === 6) this.socialForm.get('stack').setValue(element['ProfileLink']);
        if (element['SocialSiteId'] === 7) this.socialForm.get('others').setValue(element['ProfileLink']);
      });
    }

    /*     this.videoForm.get('videoLinkTypeId').setValue(this.profile.videoLinkTypeId ? this.profile.videoLinkTypeId.toString() : '0');
    
        this.videoForm.get('VideoLinkCaption').setValue(this.profile.VideoLinkCaption ? this.profile.VideoLinkCaption : '');
        if (this.profile.videoLink && this.profile.videoLinkTypeId == 1) {
          this.videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.profile.videoLink);
          this.videoForm.get('videoLink').setValue(this.profile.videoLink);
        } else if (this.profile.videoLink && this.profile.videoLinkTypeId == 2) {
          let url = '';
          if (this.profile.mkl.indexOf('player.vimeo') === -1) {
            url = `https://player.vimeo.com/video/${this.profile.videoLink}?badge=0&autopause=0&player_id=0`;
            this.getVideoData(this.profile.videoLink);
          } else {
            url = this.profile.videoLink;
          }
          // this.videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.videoLink = url;
          this.videoForm.get('uploadVideoLink').setValue(this.profile.videoLink);
        } else {
          this.videoForm.get('uploadVideoLink').setValue(this.profile.videoLink);
        }
    
        this.formChangeSubscription = this.videoForm.valueChanges.subscribe(value => {
          this.saveFormToLocal();
        }); */

    this.trainingsList = this.profile.Trainings ? this.profile.Trainings : [];

    if (this.profile.CandidateSkills) {
      this.primarySkillsList = this.profile.CandidateSkills.filter(skill => skill.SkillType === 'Primary');
      this.additionalSkillsList = this.profile.CandidateSkills.filter(skill => skill.SkillType === 'Additional');
    }

    this.experiences = this.profile.CandidateExperienceDetails ? this.profile.CandidateExperienceDetails : [];

    this.additionalProjectsList = this.profile.ProjectDetails ? this.profile.ProjectDetails : [];
    console.log(this.additionalProjectsList)

    this.educationsList = this.profile.CandidateEducationDetails ? this.profile.CandidateEducationDetails : [];
  }

  /**
   * Return Sanaitized external url from youtube and vimeo
   */
  safeUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.videoData.files[0]['link']);
  }

  /**
   * Upload Profile and Resume
   * @param event JS click event
   * @param resourceType 201/202 depending on the profile/resume
   */
  fileChange(event, resourceType) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0 && fileList[0].size <= 2097152) {
      let file: File = fileList[0];
      let fileName = file.name;
      this.formData = new FormData();
      this.formData.append('resourceTypeId', resourceType);
      this.formData.append('', file);

      this.uploadFile(resourceType);
    } else {
      event.target.value = '';
    }
  }

  /**
   * Upload the file to the server using API created using 'fileChange()'
   */
  uploadFile(resourceType) {
    this.loading = true;
    const loading = this.message.loading(FeedbackMessages.loading.ProfileUploadFile, { nzDuration: 0 }).messageId;
    this.profileService.uploadFile(this.formData).subscribe((response) => {
      this.loading = false;
      this.message.remove(loading);
      if (response && response.code === 200 && response.data) {
        let localProfileData = this.profileService.localProfileDetails();
        console.log('localProfileData', localProfileData);

        if (localProfileData) {
          this.profile = this.profileService.localProfileDetails();
        }

        console.log(' this.profile', this.profile);

        this.profile.resumeUrl = response.data['resumeUrl'];

        console.log('localProfileData', this.profile.resumeUrl);


        this.profile.basicInfo.imageUrl = response.data['basicInfo']['imageUrl'];
        this.profile.resourceId = response.data['resourceId'];
        this.profile.resumeId = response.data['resumeId'];
        this.profile.videoLink = response.data['videoLink'];
        this.profile.VideoLinkCaption = response.data['VideoLinkCaption'];
        this.profile.videoLinkTypeId = response.data['videoLinkTypeId'];
        this.initForm();
      }
    }, () => {
      this.loading = false;
      this.message.remove(loading);
    });
  }

  /**
    * Initializes google map places for auto-complete city search
  */
  initGoogleMapPlaces() {
    try {
      const autocomplete = new google.maps.places.Autocomplete(this.searchCityInput.nativeElement);
      //Event listener to monitor place changes in the input
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        //Emit the new address object for the updated place
        this.selectedAddress = this.getFormattedAddress(autocomplete.getPlace());
        this.saveFormToLocal();
      });
    } catch (error) {
      this.message.info(FeedbackMessages.info.GoogleMapNotLoaded, { nzDuration: 1500 });
    }
  }

  /**
    * Gets the formatted address
    * @param place Google Autocomplete place object
    * @return location_obj An address object in human readable format
  */
  getFormattedAddress(place) {
    let location_obj: any = {};
    for (let i in place.address_components) {
      let item = place.address_components[i];
      location_obj['formatted_address'] = place.formatted_address;
      if (item['types'].indexOf('locality') > -1) {
        location_obj['locality'] = item['long_name']
      } else if (item['types'].indexOf('administrative_area_level_1') > -1) {
        location_obj['admin_area_l1'] = item['short_name']
      } else if (item['types'].indexOf('street_number') > -1) {
        location_obj['street_number'] = item['short_name']
      } else if (item['types'].indexOf('route') > -1) {
        location_obj['route'] = item['long_name']
      } else if (item['types'].indexOf('country') > -1) {
        location_obj['country'] = item['long_name']
      } else if (item['types'].indexOf('postal_code') > -1) {
        location_obj['postal_code'] = item['short_name']
      }
    }
    if (place.geometry.location) {
      location_obj.lat = place.geometry.location.lat();
      location_obj.lng = place.geometry.location.lng();
    }
    return location_obj;
  }

  /**
   * Get the list of country codes
   */

  getCountryList() {
    this.commonService.getCountryList().subscribe((response) => {
      if (response.code && response.code === 200) {
        console.log('response', response);
        // let countrylist = response
        this.countryList = response.data;
        this.countryList.forEach(data => {
          data.description = `${data.Name} ( + ${data.PhoneCode})`
          this.dropdownOptions.push(data)
        });
      }
    })
  }

  /**
   * Get user's profile data
   */
  getProfileDetails(candidateId) {
    this.loading = true;
    const loading = this.message.loading(FeedbackMessages.loading.ProfileFetch, { nzDuration: 0 }).messageId;
    /*     this.profileService.getProfileDetails().subscribe((response) => {
          this.message.remove(loading);
          this.loading = false;
          if (response && response.code === 200 && response.data) {
            this.profile = response.data;
            let localProfileDetails = this.profileService.localProfileDetails();
            if (localProfileDetails) {
              this.profile = localProfileDetails;
              // this.setVideoLinkToVimeoId();
              // this.highlightSection();
              // this.highlightMissingFields();
            }
            this.initForm();
            this.setVideoLinkToVimeoId();
          }
          this.highlightSection();
          this.highlightMissingFields();
        }, () => {
          this.message.remove(loading);
          this.loading = false;
        }) */
    this.profileService.getProfileDetails(candidateId).subscribe(candidateData => {

      this.profile = candidateData;
      this.message.remove(loading);
      this.initForm();
      this.highlightSection();
      this.highlightMissingFields();
      this.loading = false;

      /* } else {
        this.userDataService.getUserData(this.candidateId).subscribe(response => {
          this.profile = response;
        });
      } */

    });
  }

  /**
  * getter funtion for easy form controls
  * @return form control values
  */
  get f() {
    // console.log('-->',this.profileForm);

    if (this.profileForm) return this.profileForm.controls;

    console.log('=>', this.profileForm);

  }
  get pers() {
    if (this.personalDetailsForm) return this.personalDetailsForm.controls;
  }
  get prof() {
    if (this.professionalDetailsForm) return this.professionalDetailsForm.controls;
  }
  get res() {
    if (this.resumeForm) return this.resumeForm.controls;
  }
  get social() {
    if (this.socialForm) return this.socialForm.controls;
  }
  get video() {
    if (this.videoForm) return this.videoForm.controls;
  }
  get reference() {
    if (this.referenceForm) return this.referenceForm.controls;
  }
  get primarySkills() {
    if (this.primarySkillsForm) return this.primarySkillsForm.controls;
  }
  get additionalSkills() {
    if (this.additionalSkillsForm) return this.additionalSkillsForm.controls;
  }
  get primaryProjects() {
    if (this.experiencesForm) return this.experiencesForm.controls;
  }
  get additionalProjects() {
    if (this.additionalProjectsForm) return this.additionalProjectsForm.controls;
  }
  get educations() {
    if (this.educationForm) return this.educationForm.controls;
  }
  get trainings() {
    if (this.trainingsForm) return this.trainingsForm.controls;
  }

  log(value: string[]): void {
    console.log('value', value);
  }

  /**
   * Delete uploaded file from server
   * @param resourceType 202-profile/201-resume/203-video
   */
  deleteFile(resourceType: number) {
    if (!this.loading) {
      this.loading = true;
      const loading = this.message.loading(FeedbackMessages.loading.ProfileRemoveFile, { nzDuration: 0 }).messageId;
      let resourceId = 0;
      if (resourceType === 202) {
        resourceId = this.profile['resourceId'];
      } else if (resourceType === 201) {
        resourceId = this.profile['resumeId'];
      }
      this.profileService.deleteFile(resourceType, resourceId).subscribe((response) => {
        this.loading = false;
        this.message.remove(loading);
        if (response && response.code === 200 && response.data) {
          let localProfileData = this.profileService.localProfileDetails();
          if (localProfileData) {
            this.profile = this.profileService.localProfileDetails();
          }
          this.profile.resourceId = response.data['resourceId'];
          if (resourceType === 202) {
            this.profile.basicInfo.imageUrl = response.data['basicInfo']['imageUrl'];
          } else if (resourceType === 201) {
            this.profile.resumeUrl = response.data['resumeUrl'];
            this.profile.resumeId = response.data['resumeId'];
          } else if (resourceType === 203) {
            this.profile.videoLink = response.data['videoLink'];
            this.profile.VideoLinkCaption = response.data['VideoLinkCaption'];
            this.profile.videoLinkTypeId = response.data['videoLinkTypeId'];
            this.videoForm.get('videoLink').setValue(null);
            this.videoForm.get('VideoLinkCaption').setValue(null);
            this.videoForm.get('videoLinkTypeId').setValue(null);
            this.saveFormToLocal();
          }
          this.initForm();
          // this.setVideoLinkToVimeoId();
        }
      }, () => {
        this.loading = false;
        this.message.remove(loading);
      });
    }
  }


  selectionChanged(e, form) {
    console.log('e', e.value.phonecode);

    if (form === 'one') {
      this.personalDetailsForm.controls.countryPhoneCode.setValue(e.value.phonecode);
      console.log('1');

    }

    else if (form === 'two') {
      this.referenceForm.controls.referenceList.value.one.countryPhoneCode = e.value.phonecode;
      console.log('2', this.profileForm.controls.referenceList.value.one.countryPhoneCode);

    }
    else if (form === 'three') {
      this.referenceForm.controls.referenceList.value.two.countryPhoneCode = e.value.phonecode;
      console.log('3', this.profileForm.controls.referenceList.value.two.countryPhoneCode);
    }

  }
  /**
   * Save the current form in the memory
   */

  onedata: any;

  saveFormToLocal() {
    let reqBody: any = {
      'basicInfo': {
        'firstName': this.profileForm.value.firstName,
        'lastName': this.profileForm.value.lastName,
        'dob': this.profileForm.value.dob,
        'gender': this.profileForm.value.gender,
        'mobile': this.profileForm.value.mobile,
        'countryPhoneCode': this.profileForm.value.countryPhoneCode,
      },
      'professionalInfo': {
        'designation': this.profileForm.value.designation,
        'expectedpay': 0,
        'expectedPayUnitSymbol': '$',
        'preferredLocation': this.selectedAddress ? this.selectedAddress.formatted_address : this.profile.professionalInfo.preferredLocation,
        'preferredJobTypeId': this.profileForm.value.preferredJobTypeId,
        'lat': this.selectedAddress ? this.selectedAddress.lat : this.profile.professionalInfo.lat,
        'lng': this.selectedAddress ? this.selectedAddress.lng : this.profile.professionalInfo.lng,
      },
      'videoLinkTypeId': this.profileForm.value.videoLinkTypeId,
      'videoLink': this.profileForm.value.videoLink,
      'VideoLinkCaption': this.profileForm.value.VideoLinkCaption ? this.profileForm.value.VideoLinkCaption : '',
      'socialLink': [
        {
          link: this.profileForm.value.linkedin,
          typeid: 3
        },
        {
          link: this.profileForm.value.github,
          typeid: 5
        },
        {
          link: this.profileForm.value.stack,
          typeid: 6
        },
        {
          link: this.profileForm.value.others ? this.profileForm.value.others : '',
          typeid: 7
        }
      ],
      'visastatus': []
    }
    // Forming request body for 'Visa Status'
    if (this.profile && this.profile.visastatus instanceof Array) {
      this.profile.visastatus.forEach((elem) => {
        if (elem.visastatusid == this.profileForm.value.visastatus) {
          elem.selected = true;
        } else {
          elem.selected = false;
        }
        reqBody.visastatus.push(elem);
      });
    }
    // Forming request body for 'Preferred Job Type'
    if (reqBody.professionalInfo && reqBody.professionalInfo.preferredJobTypeId == 1) {
      reqBody.professionalInfo.expectedPayUnitSymbol = '$/pa';
      reqBody.professionalInfo.expectedpay = this.profileForm.value.expectedAnnual;
    } else if (reqBody.professionalInfo && reqBody.professionalInfo.preferredJobTypeId == 2) {
      reqBody.professionalInfo.expectedPayUnitSymbol = '$/hr';
      reqBody.professionalInfo.expectedpay = this.profileForm.value.expectedpayrate;
    } else if (reqBody.professionalInfo && reqBody.professionalInfo.preferredJobTypeId == 3) {
      reqBody.professionalInfo.expectedPayUnitSymbol = '$';
    }
    // Forming request body for 'Video Link Type Id'
    if (this.profileForm.value.videoLinkTypeId == 1) {
      reqBody.videoLink = this.profileForm.value.videoLink;
    } else if (this.profileForm.value.videoLinkTypeId == 2) {
      reqBody.videoLink = this.profileForm.value.uploadVideoLink;
    } else {
      reqBody.videoLink = null;
      reqBody.videoLinkTypeId = 0;
      reqBody.VideoLinkCaption = null;
    }

    // Forming request body for 'Reference List'
    if (this.profile && this.profile.referenceList instanceof Array && this.profile.referenceList.length > 0) {
      reqBody.referenceList = this.profile.referenceList;
      if (!this.profile.referenceList[0] || !this.profile.referenceList[0]['comment']) {
        if (this.profileForm.get('referenceList').get('one').value.name && this.profileForm.get('referenceList').get('one').value.emailid) {
          reqBody.referenceList[0] = this.profileForm.get('referenceList').get('one').value;
          reqBody.referenceList[0]['countryPhoneCode'] = this.profileForm.get('referenceList').get('one').value.countryPhoneCode.toString();

        }
        // reqBody.referenceList.push(this.profileForm.get('referenceList').get('one').value);
      }
      if (!this.profile.referenceList[1] || !this.profile.referenceList[1]['comment']) {
        if (this.profileForm.get('referenceList').get('two').value.name && this.profileForm.get('referenceList').get('two').value.emailid) {
          reqBody.referenceList[1] = this.profileForm.get('referenceList').get('two').value;
        }
      }
    } else if (this.profile && this.profile.referenceList instanceof Array && this.profile.referenceList.length == 0) {
      reqBody.referenceList = [];
      if (this.profileForm.get('referenceList').get('one').value.name) {
        reqBody.referenceList.push(this.profileForm.get('referenceList').get('one').value);
      }
      if (this.profileForm.get('referenceList').get('two').value.name) {
        reqBody.referenceList.push(this.profileForm.get('referenceList').get('two').value);
      }
    }

    reqBody.capacityList = this.profile.capacityList;
    reqBody.basicInfo.imageUrl = this.profile.basicInfo.imageUrl;
    reqBody.resumeUrl = this.profile.resumeUrl;
    reqBody.resourceId = this.profile.resourceId;
    reqBody.resumeId = this.profile.resumeId;
    this.profileService.localProfileDetails(reqBody);
  }

  /**
   * submit function for form to Update profile of a user
   * @return return null if inputs are invalid else submits form
   */
  onSubmit(isVideoUpdate: boolean, formName) {
    this.submitted = true;
    if (!this.loading) {
      let reqBody = {};
      if (formName === 'personalDetailsForm') {
        if (this.personalDetailsForm.invalid) {
          return;
        }
        reqBody = {
          'FirstName': this.personalDetailsForm.value.firstName,
          'LastName': this.personalDetailsForm.value.lastName,
          'DOB': this.personalDetailsForm.value.dob,
          'Gender': this.personalDetailsForm.value.gender,
          'MobileNumber': this.personalDetailsForm.value.mobile,
          'CountryCode': this.personalDetailsForm.value.countryPhoneCode,
        };
      } 
      /* else if (formName === 'professionalDetailsForm') {
        if (this.professionalDetailsForm.invalid) {
          return;
        }
        reqBody = {
          'designation': this.professionalDetailsForm.value.designation,
          'expectedpay': 0,
          'expectedPayUnitSymbol': '$',
          'preferredLocation': this.selectedAddress ? this.selectedAddress.formatted_address : this.profile.professionalInfo.preferredLocation,
          'preferredJobTypeId': this.professionalDetailsForm.value.preferredJobTypeId,
          'lat': this.selectedAddress ? this.selectedAddress.lat : this.profile.professionalInfo.lat,
          'lng': this.selectedAddress ? this.selectedAddress.lng : this.profile.professionalInfo.lng,
        };
        if (this.profile && this.profile.visastatus instanceof Array) {
          this.profile.visastatus.forEach((elem) => {
            if (elem.visastatusid === this.profileForm.value.visastatus) {
              elem.selected = true;
            } else {
              elem.selected = false;
            }
            reqBody['visastatus'].push(elem);
          });
        }
        if (reqBody['preferredJobTypeId'] == 1) {
          reqBody['expectedPayUnitSymbol'] = '$/pa';
          reqBody['professionalInfo'].expectedpay = this.professionalDetailsForm.value.expectedAnnual;
        } else if (reqBody['professionalInfo'] && reqBody['professionalInfo'].preferredJobTypeId === 2) {
          reqBody['professionalInfo'].expectedPayUnitSymbol = '$/hr';
          reqBody['professionalInfo'].expectedpay = this.professionalDetailsForm.value.expectedpayrate;
        } else if (reqBody['professionalInfo'] && reqBody['professionalInfo'].preferredJobTypeId === 3) {
          reqBody['professionalInfo'].expectedPayUnitSymbol = '$';
        }
      }  */
      else if (formName === 'videoForm') {
        if (this.videoForm.invalid) {
          return;
        }
        reqBody = {
          'videoLinkTypeId': this.videoForm.value.videoLinkTypeId,
          'videoLink': this.videoForm.value.videoLink,
          'VideoLinkCaption': this.videoForm.value.VideoLinkCaption ? this.videoForm.value.VideoLinkCaption : '',
        };
        if (this.profileForm.value.videoLinkTypeId === 1) {
          reqBody['videoLink'] = this.profileForm.value.videoLink;
        } else if (this.profileForm.value.videoLinkTypeId === 2) {
          reqBody['videoLink'] = this.profileForm.value.uploadVideoLink;
        }
      } else if (formName === 'socialForm') {
        if (this.socialForm.invalid) {
          return;
        }
        reqBody = {
          'socialLink': [
            {
              link: this.socialForm.value.linkedin,
              typeid: 3
            },
            {
              link: this.socialForm.value.github,
              typeid: 5
            },
            {
              link: this.socialForm.value.stack,
              typeid: 6
            },
            {
              link: this.socialForm.value.others ? this.socialForm.value.others : '',
              typeid: 7
            }
          ],
        };
      } 
      /* else if (formName === 'referenceForm') {
        if (this.referenceForm.invalid ||
          (this.referenceForm.get('referenceList').get('one').value.emailid && this.referenceForm.get('referenceList').get('two').value.emailid &&
            this.referenceForm.get('referenceList').get('one').value.emailid == this.referenceForm.get('referenceList').get('two').value.emailid) ||
          (this.referenceForm.get('referenceList').get('one').value.mobilenumber && this.referenceForm.get('referenceList').get('two').value.mobilenumber &&
            this.referenceForm.get('referenceList').get('one').value.mobilenumber == this.referenceForm.get('referenceList').get('two').value.mobilenumber)
        ) {
          return;
        }
        reqBody = {
          'referenceList': []
        };
        if (this.profile && this.profile.referenceList instanceof Array && this.profile.referenceList.length > 0) {
          reqBody['referenceList'] = this.profile.referenceList;

          if (!this.profile.referenceList[0] || !this.profile.referenceList[0]['comment']) {
            if (this.referenceForm.get('referenceList').get('one').value.name && this.referenceForm.get('referenceList').get('one').value.emailid) {
              reqBody['referenceList'][0] = this.referenceForm.get('referenceList').get('one').value;
            }
            // reqBody.referenceList.push(this.profileForm.get('referenceList').get('one').value);
          }
          if (!this.profile.referenceList[1] || !this.profile.referenceList[1]['comment']) {
            if (this.referenceForm.get('referenceList').get('two').value.name && this.referenceForm.get('referenceList').get('two').value.emailid) {
              reqBody['referenceList'][1] = this.profileForm.get('referenceList').get('two').value;
            }
          }
        } else if (this.profile && this.profile.referenceList instanceof Array && this.profile.referenceList.length == 0) {
          reqBody['referenceList'] = [];
          if (this.referenceForm.get('referenceList').get('one').value.name) {
            reqBody['referenceList'].push(this.profileForm.get('referenceList').get('one').value);
          }
          if (this.referenceForm.get('referenceList').get('two').value.name) {
            reqBody['referenceList'].push(this.profileForm.get('referenceList').get('two').value);
          }
        }
      }  */
      else if (formName === 'primarySkillsForm') {

        reqBody = this.primarySkillsList;

      } else if (formName === 'additionalSkillsForm') {

        reqBody = this.additionalSkillsList;
        
      } else if (formName === 'experiencesForm') {

        reqBody = this.experiences;

      } else if (formName === 'additionalProjectsForm') {

        reqBody = this.additionalProjectsList ;

      } else if (formName === 'educationForm') {

        reqBody = this.educationsList;

      } else if (formName === 'trainingsForm') {

        reqBody = this.trainingsList;

      }
      this.loading = true;
      const loading = this.message.loading(FeedbackMessages.loading.ProfileUpdate, { nzDuration: 0 }).messageId;
      this.profileService.updateProfileDetails(formName, reqBody, 'Misha_Arora247').subscribe((response) => {
        this.loading = false;
        this.message.remove(loading);
        // this.analyticsService.eventEmitter('MyProfileScreen', 'ProfileSubmit', 'ProfileSubmit');
        this.message.success(isVideoUpdate ? FeedbackMessages.success.VideoUploaded : FeedbackMessages.success.ProfileUpdated, { nzDuration: 1500 });
        /* this.profile = response;
        this.initForm();
        this.highlightSection(); */
        this.profileService.refreshProfileData(this.profile);
      }, (error) => {
        this.loading = false;
        this.message.remove(loading);
      });
    }
  }


  /**
   * Get vimeo video upload form Vimeo API to upload the video file.
   */
  prepareVideoUpload() {
    // let videoCaption = this.profileForm.value.VideoLinkCaption ? this.profileForm.value.VideoLinkCaption : ''
    if (!this.loading) {
      this.loading = true;
      const loading = this.message.loading(FeedbackMessages.loading.VideoUploadPrepare, { nzDuration: 0 }).messageId;
      this.vimeoService.createNewVideo('profile').subscribe((response) => {
        this.loading = false;
        this.message.remove(loading);
        if (response) {
          let vimeoUploadDiv = document.createElement('div');
          vimeoUploadDiv.className = 'vimeo-video';
          vimeoUploadDiv.innerHTML = response['upload']['form'];
          vimeoUploadDiv.querySelector('label').innerText = 'Upload Video';
          vimeoUploadDiv.querySelector('input[type=\'submit\']').nodeValue = 'Upload';
          vimeoUploadDiv.querySelector('input[type=\'file\']').setAttribute('accept', 'video/mp4,video/x-m4v,video/*');
          document.querySelector('#video').appendChild(vimeoUploadDiv);
          document.querySelector('#video input[type="file"]').addEventListener('change', (event) => {
            if (event && event.target && event.target['files'] && event.target['files'][0]) {
              if (event.target['files'][0]['size'] > 100000000) {
                let alertWindow = confirm('Please select file less than 100MB.');
                if (alertWindow === true) event.target['files'] = null;
                else event.target['files'] = null;
              } else {
                if (document.querySelector('.filename-text')) {
                  document.querySelector('.filename-text').remove();
                }
                let fileName = document.createElement('p');
                fileName.className = 'filename-text';
                fileName.innerText = event.target['files'][0]['name'];
                vimeoUploadDiv.appendChild(fileName);
              }

            }
          });
          document.querySelector('#video .vimeo-video form').addEventListener('submit', (event) => {
            let selectedFile = document.querySelector('#video .filename-text');
            if (!selectedFile) {
              event.preventDefault();
            }
          });
        }
      }, () => {
        this.loading = false;
        this.message.remove(loading);
      });
    }
  }

  /**
   * On change method for radio input of Video Profile
   * @param value Selected radio value
   */
  onChange(value) {
    const youtubeUrlRegex = /(http(s)?:\/\/.)?(www\.)?\byoutube\b/i;
    setTimeout(() => {
      if (document.querySelector('.vimeo-video')) document.querySelector('.vimeo-video').remove();
      if (value == 2 && this.profile && (!this.profile.videoLink || youtubeUrlRegex.test(this.profile.videoLink)) && !this.loading) {
        this.prepareVideoUpload();
      }
    }, 500);
  }

  /**
   * Set profile form videoLink field to vimeo video id
   */
  setVideoLinkToVimeoId() {
    this.route.queryParamMap.subscribe(params => {
      let videoUrl = params.get('video_uri');
      let videoCaption = params.get('videoCaption');
      if (videoUrl) {
        this.profileForm.get('videoLinkTypeId').setValue(2);
        this.profileForm.get('uploadVideoLink').setValue(videoUrl.split('/')[2]);
        this.profileForm.get('VideoLinkCaption').setValue(videoCaption ? videoCaption : '');
        this.onSubmit(true, 'videoForm');
      }
    });
  }

  /**
   * Check if url is youtube url
   */
  testYoutubeUrl = (url) => {
    const youtubeUrlRegex = /(http(s)?:\/\/.)?(www\.)?\byoutube\b/i;
    return youtubeUrlRegex.test(url);
  }

  /**
   * Disable future dates
   */
  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    let todayDate = new Date().getTime() - 86400000;
    return current.getTime() > todayDate;
  }

  /**
   * Expand/Collapse comment section
   * @param referenceNumber number of reference section 1-reference one/2-reference two
   * @param isExpand true-expand/false-collapse
   */
  toggleComment(referenceNumber: number, isExpand: boolean) {
    if (referenceNumber == 1 && isExpand) {
      this.expandedComment.one = true;
    } else if (referenceNumber == 1 && !isExpand) {
      this.expandedComment.one = false;
    }
    if (referenceNumber == 2 && isExpand) {
      this.expandedComment.two = true;
    } else if (referenceNumber == 2 && !isExpand) {
      this.expandedComment.two = false;
    }
  }

  /**
   * Highlight Missing fields on profile page
   */
  highlightMissingFields() {
    this.route.queryParamMap.subscribe(result => {
      let fields: string[] = result.get('fields') ? result.get('fields').split(',') : [];
      let fieldsString = result.get('fields') ? result.get('fields') : '';
      if (fields && fields.length > 0) {
        this.missingFields = fields;
        let sectionOneRegex = new RegExp('(GENDER|LAST_NAME)', 'i');
        let sectionTwoRegex = new RegExp('(DESIRED_DESIGNATION|PREFERRED_LOCATION|EXPECTED_PAY_RATE|ANNUAL_SALARY|EMPLOYMENT_TYPE)', 'i');
        let sectionThreeRegex = new RegExp('(RESUME)', 'i');
        let sectionFourRegex = new RegExp('(SOCIAL_LINKS)', 'i');
        let sectionFiveRegex = new RegExp('(VIDEO_LINK)', 'i');

        if (sectionOneRegex.test(fieldsString)) {
          this.highlightSectionOnClick(1);
        } else if (sectionTwoRegex.test(fieldsString)) {
          this.highlightSectionOnClick(2);
        } else if (sectionThreeRegex.test(fieldsString)) {
          this.highlightSectionOnClick(3);
        } else if (sectionFourRegex.test(fieldsString)) {
          this.highlightSectionOnClick(4);
        } else if (sectionFiveRegex.test(fieldsString)) {
          this.highlightSectionOnClick(5);
        }
      }
    });
  }

  /**
   * Event handler for 'TAB' key
   * @param event 
   */
  @HostListener('keyup.tab', ['$event'])
  tabEvent(event: KeyboardEvent) {
    let activeSection = document.activeElement.closest('.profile-card');
    if (activeSection.id == 'personal') {
      this.highlightSectionOnClick(1);
    } else if (activeSection.id == 'professional') {
      this.highlightSectionOnClick(2);
    } else if (activeSection.id == 'resume') {
      this.highlightSectionOnClick(3);
    } else if (activeSection.id == 'social') {
      this.highlightSectionOnClick(4);
    } else if (activeSection.id == 'video') {
      this.highlightSectionOnClick(5);
    } else if (activeSection.id == 'references') {
      this.highlightSectionOnClick(6);
    } else if (activeSection.id == 'primarySkills') {
      this.highlightSectionOnClick(7);
    } else if (activeSection.id == 'additionalSkills') {
      this.highlightSectionOnClick(8);
    } else if (activeSection.id == 'primaryProjects') {
      this.highlightSectionOnClick(9);
    } else if (activeSection.id == 'additionalProjects') {
      this.highlightSectionOnClick(10);
    }
  }

  /**
   * Event handler for 'SHIFT' + 'TAB' key
   * @param event 
   */
  @HostListener('keyup.shift.tab', ['$event'])
  tabAndShiftEvent(event: KeyboardEvent) {
    let activeSection = document.activeElement.closest('.profile-card');
    if (activeSection.id == 'personal') {
      this.highlightSectionOnClick(1);
    } else if (activeSection.id == 'professional') {
      this.highlightSectionOnClick(2);
    } else if (activeSection.id == 'resume') {
      this.highlightSectionOnClick(3);
    } else if (activeSection.id == 'social') {
      this.highlightSectionOnClick(4);
    } else if (activeSection.id == 'video') {
      this.highlightSectionOnClick(5);
    } else if (activeSection.id == 'references') {
      this.highlightSectionOnClick(6);
    } else if (activeSection.id == 'primarySkills') {
      this.highlightSectionOnClick(7);
    } else if (activeSection.id == 'additionalSkills') {
      this.highlightSectionOnClick(8);
    } else if (activeSection.id == 'primaryProjects') {
      this.highlightSectionOnClick(9);
    } else if (activeSection.id == 'additionalProjects') {
      this.highlightSectionOnClick(10);
    }
  }

  /**
   * Get vimeo video meta data using video id
   */
  getVideoData(videoId) {
    this.vimeoService.getVideoDataById(videoId).subscribe((response) => {
      if (response && response['pictures']) {
        this.videoData = response;
      }
      if (response && response.files && response.files instanceof Array && response.files.length > 0 && response['embed'] && response['embed']['html']) {
        if (this.isEmbedVideo) {
          if (document.querySelector('#iframeBody .flex iframe')) {
            document.querySelector('#iframeBody .flex iframe').remove();
          }
          document.querySelector('#iframeBody .flex').innerHTML = response['embed']['html'];
          document.querySelector('#iframeBody .flex iframe')['style']['width'] = '500px';
          document.querySelector('#iframeBody .flex iframe')['style']['height'] = '250px';
          document.querySelector('#iframeBody .flex iframe')['style']['background'] = '#404040';
        } else {
          if (document.querySelector('#iframeBody .flex video')) {
            document.querySelector('#iframeBody .flex video').remove();
          }
          let videoElement = document.createElement('video');
          videoElement.src = response.files[0]['link'];
          videoElement.controls = true;
          videoElement.autoplay = false;
          videoElement.style.width = '500px';
          videoElement.style.height = '250px';
          videoElement.style.background = '#404040';
          // document.querySelector("#iframeBody .flex").appendChild(videoElement);
        }
      }
    });
  }

  /**
   * Open Video modal 
   */
  openPlayVideoModal() {
    this.playVideoModal = true;
  }

  /**
   * Cancel video modal
   */
  handlePlayVideoModalCancel() {
    this.playVideoModal = false;
    if (document.querySelector('#iframeBody .flex video')) {
      document.querySelector('#iframeBody .flex video')['pause']();
    }
    if (document.querySelector('#iframeBody .flex iframe')) {
      document.querySelector('#iframeBody .flex iframe')['src'] = document.querySelector('#iframeBody .flex iframe')['src'];
    }
  }

  /**
   * Handle video modal ok
   */
  handlePlayVideoModalOk() {
    this.playVideoModal = false;
  }

  /**
   * Open delete confirmation modal
   */
  openDeleteResourceConfirmationModal(resourceType: number) {
    this.currentDeleteResourceType = resourceType;
    this.deleteConfirmationModal = true;
  }

  /**
   * Cancel video modal
   */
  handleDeleteResourceModalCancel() {
    this.deleteConfirmationModal = false;
  }

  /**
   * Handle video modal ok
   */
  handleDeleteResourceModalOk() {
    this.deleteConfirmationModal = false;
    this.deleteFile(this.currentDeleteResourceType);
  }

  countrycodeFilter = (input, option) => {
    // console.log("input", input);
    // console.log("option", option.template);
  }

  // Download the resume file
  downloadResume() {
    let a = document.createElement('a');
    fetch(this.profile.resumeUrl)
      .then(res => res.blob()) // Gets the response and returns it as a blob
      .then(blob => {
        let objectURL = URL.createObjectURL(blob);
        a.href = objectURL;
        a.download = this.profile.resumeName;
        a.click();
      });
  }

}
