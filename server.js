/**
 * This file contains code for creating a node proxy-server to avoid the CORS error
 * This file contains code for encrypting password before sending it to the server.
 * This file contains code for linkedin login service
 */
const express = require('express'); // Used for creating web server
const request = require('request'); // Used to make HTTP request 
const path = require('path'); // Used to traverse through file system
const fs = require('fs'); // Used to read/write files in the file system
const https = require('https'); // Create HTTPs server
const http = require('http'); // Create HTTP server
const CryptLib = require('cryptlib'); // Used to encrypt/decrypt the password fields in the API 
const compression = require('compression'); // Compression library for compressing response sent from the server
const app = express();

// API URL
const API_URL = "https://apiredep.collabera.com/uatcandidateapi/api/v1/candidate";
// Linkedin URL
const LINKEDIN_CLIENT_SECRET = "utlrCHgF3mYzUo2k"//"QSY2MejplNQ3xxtW"

// Use the compression middleware to compress the response
app.use(compression());

/**
 * Add the deafult headers in the response
 */
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, token_type, access_token, refresh_token, expires_in, date');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, token_type, access_token, refresh_token, expires_in, date');

    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
      //respond with 200
      res.sendStatus(200);
    }
    else {
    //move on
      next();
    }
});

// Parse request body in JSON
app.use(express.json());

// LinkedIn Oauth Get user details 
app.use('/api/linkedin', (req, res) => {
    let client_secret = LINKEDIN_CLIENT_SECRET;
    let reqOptions = {
        method: req.method,
        uri: `https://www.linkedin.com/oauth/v2/accessToken`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        qs: req.query,
        formData: {},
        json: true
    };
    reqOptions.qs.client_secret = client_secret;
    if (req.headers && req.headers['authorization']) {
        reqOptions.headers['Authorization'] = req.headers['authorization'];
    }
    request(reqOptions, (err, response, body) => {
        if (body && body.access_token) {
            let reqProfileOptions = {
                method: 'GET',
                // uri: `https://api.linkedin.com/v1/people/~:(id,last-name,email-address,first-name,picture-url)`,
                uri: `https://api.linkedin.com/v2/me`,
                // uri: `https://api.linkedin.com/v2/people?projection=(id,firstName,lastName,emailAddress,pictureUrl)`,
                headers: {
                    'x-li-format': 'json',
                    'Authorization': `Bearer ${body.access_token}`
                }
            };
            request(reqProfileOptions, (profileErr, profileResponse, profileBody) => {
                let userProfile = JSON.parse(profileBody);
                let linkedInUserProfile = {};
                if (userProfile) {
                    if (userProfile.id) {
                        linkedInUserProfile.id = userProfile.id;
                    }
                    if (userProfile['firstName']) {
                        linkedInUserProfile.firstName = userProfile.firstName;
                    }
                    if (userProfile['lastName']) {
                        linkedInUserProfile.lastName = userProfile.lastName;
                    }
                    if (userProfile['emailAddress']) {
                        linkedInUserProfile.email = userProfile.emailAddress;
                    }
                    if (userProfile['pictureUrl']) {
                        linkedInUserProfile.photoUrl = userProfile.pictureUrl;
                    }
                    linkedInUserProfile.authToken = body.access_token;
                }
                res.status(response ? response.statusCode: 500).json(linkedInUserProfile);
            });
        } else {
            res.status(response ? response.statusCode: 500).json(body);
        }
    });
});

// Proxy service to avoid CORS issues
app.use('/api', (req, res) => {
    // Encrypt password if request body contains password fields
    if (req.body && req.body.password) {
        req.body.password = encryptPassword(req.body.password);
    }
    if (req.body && req.body.newPassword) {
        req.body.newPassword = encryptPassword(req.body.newPassword);
    }
    if (req.body && req.body.confirmPassword) {
        req.body.confirmPassword = encryptPassword(req.body.confirmPassword);
    }
    if (req.body && req.body.currentPassword) {
        req.body.currentPassword = encryptPassword(req.body.currentPassword);
    }
    

    let reqOptions = {
        method: req.method,
        url: `${API_URL}${req.url}`,
        headers: {
            'Content-Type': 'application/json'
        },
        qs: req.query,
        body: req.body,
        json: true
    };
    if (req.headers && req.headers['authorization']) {
        reqOptions.headers['Authorization'] = req.headers['authorization'];
    }
    let startTime = new Date().getTime(), endTime;
    request(reqOptions, (err, response, body) => {
        if (response && response.headers['content-length']){
            res.header('content-length', response.headers['content-length']);
        }
        if (response && response.headers['content-type']){
            res.header('content-type', response.headers['content-type']);
        }
        if (response && response.headers['token_type']){
            res.header('token_type', response.headers['token_type']);
        }
        if (response && response.headers['access_token']){
            res.header('access_token', response.headers['access_token']);
        }
        if (response && response.headers['refresh_token']){
            res.header('refresh_token', response.headers['refresh_token']);
        }
        if (response && response.headers['expires_in']){
            res.header('expires_in', response.headers['expires_in']);
        }
        if (response && response.headers['date']){
            res.header('date', response.headers['date']);
        }
        endTime = new Date().getTime();
        console.log(`Request to '${req.url}' handeled in ${(endTime - startTime)/1000}seconds`)
        res.status(response ? response.statusCode: 500).json(body);
    });
});

// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist'));

// For all GET requests, send back index.html
// so that PathLocationStrategy can be used
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

// Required certificate files
// let key = fs.readFileSync('ssl/private.key'); // Replace the file name with the private key file name
// let cert = fs.readFileSync( 'ssl/primary.crt' ); // Replace the file name with the primary key file name
// let ca = fs.readFileSync( 'ssl/intermediate.crt' ); // Replace the file with the intermediate certificate file name

// Create option for https server
// let options = {
//     key: key,
//     cert: cert,
//     ca: ca
// };

// // Start https server
// https.createServer(options, app).listen(443, () => {
//     console.log(`Server listening on port ... ${443}`);
// });

// Start http server
// http.createServer(app).listen(80, () => {
//     console.log(`Server listening on port ... ${80}`);
// });

// Start the server on already defined port or 3000
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening... ${process.env.PORT || 3000}`);
});

// Encrypt the password before sending to the server
const encryptPassword = (password) => {
	let plainText = password;
    iv = "6fcc45cc3a8a4764";
	key = CryptLib.getHashSha256('16ad55fd-598b-45d7-a371-a1e011ec1345', 32); //32 bytes = 256 bits
	cypherText = CryptLib.encrypt(plainText, key, iv);
    originalText = CryptLib.decrypt(cypherText, key, iv);
    return cypherText;
}	
