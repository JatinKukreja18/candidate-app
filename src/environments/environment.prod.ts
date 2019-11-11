export const environment = {
  production: true,
  // URL of the API Server
  apiUrl: 'https://apiredep.collabera.com/uatcandidateapi/api/v1/candidate/',
  // URL of the server application is hosted on for proxy. Please add '/api' at the end
  baseUrl: 'https://collabera.herokuapp.com/api/',
  linkedIn: {
    client_id: '78ej629w24jy78',//'812vd5s74cgill',
    redirect_uri: 'https://collabera.herokuapp.com'// Replace with the URL of server application is hosted on
  },
  googleClientId: "920246035724-2lo6qnhhaes0alqc9ighpe3sktfanjtk.apps.googleusercontent.com",// Google login client ID
  facebookClientId: "239142750000978",// facebook login app id
  websiteUrl: 'https://collabera.herokuapp.com/',// Replace with the URL of server application is hosted on
  vimeo: {
    access_token: '52e07bfd53f8588d9322ab89787009b2'
  },
  shareappUrl: 'http%3A%2F%2Fcollabera.herokuapp.com', // URL encoded URL of server application is hosted on
  apiPaths: {
    coverPage: 'https://appst.cliksource.com/jumpprofessionalapi/api/candidatecoverpage/fetchcoverpage/'
  }
};
