// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://appst.cliksource.com/jumpprofessionalapi/api/',
  baseUrl: 'http://localhost:3000/api/',
  linkedIn: {
    // client_id: '78ej629w24jy78',//'812vd5s74cgill',//'813xpyf905ktdg',
    client_id:'773mjs6jtxkp5n',
    // client_secret: 'QSY2MejplNQ3xxtW',//'TBHUn69i6xMcSA55',
    // redirect_uri: 'http://localhost:4200'
    redirect_uri: 'https://collabera.herokuapp.com'
  },
  // f7a379507defb935a5253b40819d0ee5
  // googleClientId: "920246035724-2lo6qnhhaes0alqc9ighpe3sktfanjtk.apps.googleusercontent.com",// Google login client ID
  // googleClientId: "241434463847-n5d23rg2c3u5435dlqel8qvmn6jhi1b3.apps.googleusercontent.com",// Google login client ID
  googleClientId:"479262220525-623bdrvr04c5fib1mv8736mjj96go1jc.apps.googleusercontent.com",//ringku
  // facebookClientId: "2587087704712261",// facebook login app id
  facebookClientId: "2533064300260275",// facebook login app id rinku
  websiteUrl: 'http://localhost:4200/',
  vimeo: {
    access_token: '52e07bfd53f8588d9322ab89787009b2'
  },
  shareappUrl: 'http%3A%2F%2Fcollabera.herokuapp.com',
  apiPaths: {
    // coverPage: '../assets/cp_video.json',
    // allUsers: '../assets/user-list.json'
    login: 'registration/login',
    logout: 'Account/Logout',
    register: 'registration/registerrequest',
    validateOtp :'registration/validateregotp',
    countries: 'common/countrylist',
    allUsers: 'candidatelist/getcandidatelist?',
    coverPage: 'candidatecoverpage/fetchcoverpage?id=',
    viewProfile: 'candidateview/getviewprofile/',
    editFeedback: 'CandidateEditPage/UpdateInstructorFeedback?id=',
    editAdditionalProjects: 'candidateeditpage/editprojectdetails/',
    editEducations: 'candidateeditpage/editeducationdetails/',
    editExperiences: 'candidateeditpage/editexperiencedetails/',
    editTrainings: 'candidateeditpage/edittrainingdetails/',
    editSkills: 'candidateeditpage/EditCandidateSkills/',
    editPersonalDetails: 'candidateeditpage/EditCandidateProfileDetails/',
    editSocialDetails: 'candidateeditpage/EditSocialDetails/',
    searchSkill: 'common/skillList?searchText=',
    editSummary: 'candidateeditpage/EditProfessionalSummary/',
    forAllReadyRegister:'registration/RegisterSMUser'
  }
  // baseUrl: 'https://apiredep.collabera.com/uatcandidateapi/api/v1/candidate/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
