import { Component, ElementRef, ViewChild, Input, OnChanges, OnInit } from '@angular/core';
import { SearchJobService, AuthenticationService } from '@app/core';

@Component({
    selector: 'app-common-map',
    templateUrl: './common-map-element.component.html',
    styleUrls: ['./common-map-element.component.scss']
})
export class CommonMapComponent implements OnChanges, OnInit {
    @Input() jobs: any[];
    @ViewChild('map', {read: ElementRef}) mapElement: ElementRef; // Element refrence of the map element
    map: any;
    location: any = {};

    constructor(
        private searchJobService: SearchJobService,
        private authService: AuthenticationService
    ) {}

    ngOnInit() {
        this.initMapCentre();
        // this.initGoogleMap();
        this.showMarkers();
    }

    ngOnChanges() {
        this.showMarkers();
    }

    /**
    * Initialize the map
    */
    initMapCentre() {
        if (this.searchJobService.getSearchLocation()) {
            this.location = this.searchJobService.getSearchLocation() ? this.searchJobService.getSearchLocation() : {};
        }
        
        if (this.location && this.location['lat'] && this.location['lng']) {
            this.initGoogleMap();
        } else {
            this.authService.currentUserSubject.subscribe((currentUser) => {
                if (currentUser && currentUser.candidateProfile){
                  this.location.lng = currentUser.candidateProfile.lng ? currentUser.candidateProfile.lng : -34.397;
                  this.location.lat = currentUser.candidateProfile.lat ? currentUser.candidateProfile.lat : 150.644;
                  this.initGoogleMap();
                } else {
                  navigator.geolocation.getCurrentPosition((position) => {
                    this.location.lng = position.coords.longitude;
                    this.location.lat = position.coords.latitude;
                    this.initGoogleMap(); // Initialize the google map
                  }, () => {
                    console.log("Error while getting current location: ");
                  });
                }
            });
        }
    }

    /**
    * Initialize google map  and provides cordinates to marker
    */
    initGoogleMap() {
        this.map = new google.maps.Map(this.mapElement.nativeElement, {
            center: {lat: this.location.lat ? this.location.lat : -34.397, lng: this.location.lng ? this.location.lng : 150.644},
            zoom: 12,
            mapTypeControl: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            scaleControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });
        let marker = new google.maps.Marker({position: this.location, map: this.map});
    }

    /**
    * Show markers on the google map
    */
    showMarkers() {
        let loc = [
            {lat: 40.7127753, lng: -74.0059728},
            {lat: 40.7127953, lng: -74.0061728},
            {lat: 40.7128153, lng: -74.0065728}
        ]
        let markerIcon = {
            url: '/assets/images/ic-map-marker-green.svg',
            scaledSize: new google.maps.Size(61, 87),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(32,65),
            labelOrigin: new google.maps.Point(30,30)
        };
        // Loop over the Job results
        if (this.jobs && this.jobs instanceof Array) {
            this.jobs.forEach((elem, idx) => {
                if (elem.lat && elem.lng && elem.score) {
                  if (elem.score <= 30) markerIcon.url = '/assets/images/ic-map-marker-red.svg';
                  else if (elem.score <= 50 && elem.score > 30) markerIcon.url = '/assets/images/ic-map-marker-yellow.svg';
                  else if (elem.score <= 80 && elem.score > 50) markerIcon.url = '/assets/images/ic-map-marker-light-green.svg';
                  else if (elem.score >= 80) markerIcon.url = '/assets/images/ic-map-marker-green.svg';

                  let latLng = new google.maps.LatLng(elem.lat, elem.lng);
                  let marker = new google.maps.Marker({position: latLng,
                    map: this.map,
                    icon: markerIcon,
                    label: {
                      text: elem.score,
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "normal"
                    }
                  });
                }

                // START - This is for UAT only as we are not getting coordinates in the search results
                // if (loc[idx]) {
                //     let latLng = new google.maps.LatLng(loc[idx].lat, loc[idx].lng);
                //     let marker = new google.maps.Marker({
                //         position: latLng,
                //         map: this.map,
                //         icon: markerIcon,
                //         label: {
                //             text: "" + elem.score + "%",
                //             color: "#ffffff",
                //             fontSize: "14px",
                //             fontWeight: "normal"
                //         }
                //     });
                // }
                // END 
            });
        }
    }
}