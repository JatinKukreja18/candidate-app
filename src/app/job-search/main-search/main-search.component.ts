import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService, AuthenticationService, SearchJobService, AnalyticsService } from '@app/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 
@Component({
  selector: 'app-main-search',
  templateUrl: './main-search.component.html',
  styleUrls: ['./main-search.component.scss']
})
export class MainSearchComponent implements OnInit {
  // Element refrence for the city dropdown and map element
  @ViewChild('city', { read: ElementRef }) searchCityInput:ElementRef;
  @ViewChild('map', { read: ElementRef }) mapElement: ElementRef;
  submitted = false;
  searchForm: FormGroup;
  currentUserDetails: any;
  socialUserDetails: any;
  recent_active = false;
  skills:any = [];
  location: any = {};
  selectedAddress: any = {};
  markers = [
    {lng: 75.0512281, lat: 26.5044589}
  ]

  constructor(
    private router: Router,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private searchService: SearchJobService,
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
    // Initialize the 'searchForm' with validators
    this.searchForm = this.formBuilder.group({
      city: ['', [Validators.required]],
      skills: [null, [Validators.required]]
    });
    // Get activated route
    this.route.queryParamMap.subscribe(result => {
      if (result && result['params'] && result['params']['skills'] && result['params']['location']) {
        let searchQuery = this.searchService.getSearchLocation();
        if (searchQuery) {
          this.selectedAddress['lat'] = searchQuery['lat'];
          this.selectedAddress['lng'] = searchQuery['lng'];
          this.selectedAddress['locality'] = searchQuery['location'];
          this.selectedAddress['formatted_address'] = result['params']['location'];
        }
        this.searchForm.get('city').setValue(result['params']['location']);
        if (result['params']['skills'].indexOf(' OR ') > -1) this.searchForm.get('skills').setValue(result['params']['skills']['split'](' OR '));
        else if (result['params']['skills'].indexOf(',') > -1) this.searchForm.get('skills').setValue(result['params']['skills']['split'](','));
        else this.searchForm.get('skills').setValue(result['params']['skills']);
      }
    });
    this.initGoogleMapPlaces(); // Initialize the Google places API with the city dropdown element
    this.getSuggestedSkills(); // Get the Skills lists from API or from local(if exists)
    this.socialUserDetails = this.authService.getExternalRegisterUser(); // Get the user's details in case of social login
    // this.searchService.removeJobResultSession();
  }


  /**
  * getter funtion for easy form controls
  * @return form control values
  */
  get f() {
    return this.searchForm.controls;
  }

  /**
   * Find place from Geo Code
   */
  findPlaceFromCoords() {
    const geocoder = new google.maps.Geocoder;
    geocoder.geocode({location: {lat: 40.7127753, lng: -74.0059728}}, function(results, status) {
      console.log("Results",results);
      console.log("Status: ", status);
    });
  }

  /**
    * Initializes google map and place markers according to the results
  */
  initGoogleMap() {
    let map = new google.maps.Map(this.mapElement.nativeElement, {
      center: {lat: this.location.lat ? this.location.lat : -34.397, lng: this.location.lng ? this.location.lng : 150.644},
      zoom: 8,
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
    let marker = new google.maps.Marker({position: this.location, map: map});
  }

  /**
    * Initializes google map places for auto-complete city search
  */
  initGoogleMapPlaces() {
    const autocomplete = new google.maps.places.Autocomplete(this.searchCityInput.nativeElement, {
      types: ['(cities)']
    });
    //Event listener to monitor place changes in the input
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      //Emit the new address object for the updated place
      this.selectedAddress = this.getFormattedAddress(autocomplete.getPlace());
      // this.findPlaceFromCoords();
      this.analyticsService.eventEmitter('JobSearchScreen', 'SearchJobsChangeLocation', 'SearchJobsChangeLocation');
    });
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
      if(item['types'].indexOf("locality") > -1) {
        location_obj['locality'] = item['long_name']
      } else if (item['types'].indexOf("administrative_area_level_1") > -1) {
        location_obj['admin_area_l1'] = item['short_name']
      } else if (item['types'].indexOf("street_number") > -1) {
        location_obj['street_number'] = item['short_name']
      } else if (item['types'].indexOf("route") > -1) {
        location_obj['route'] = item['long_name']
      } else if (item['types'].indexOf("country") > -1) {
        location_obj['country'] = item['long_name']
      } else if (item['types'].indexOf("postal_code") > -1) {
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
    * Fetch suggested skill for job search
    * @return skillset to be filled in slection box
  */
  getSuggestedSkills(){
    this.commonService.getSkillsList().subscribe((response) => {
      if (response.code == 200) {
        if (response.data && response.data instanceof Array && response.data.length > 0) {
          this.skills = response.data.map((elem) => {
            // console.log('search jobs',this.skills,elem);
            return elem.values;
          });
        }
      }
    });
  }

  // //////////////////////////


  checksearch(data)
  {
    console.log('data',data);
    
  }




  /** 
   * Set the current search parameters and redirect to results page
  */
  onSubmit() {
    console.log("Selected Address: ", this.selectedAddress);
    if (this.searchForm.invalid || (!this.selectedAddress.locality && (!this.selectedAddress.lat || !this.selectedAddress.lng))) {
      this.submitted = true;
      return;
    } else {
      let reqBody = {
        lat: this.selectedAddress.lat ? this.selectedAddress.lat : 0,
        lng: this.selectedAddress.lng ? this.selectedAddress.lng : 0,
        location: this.selectedAddress.locality ? this.selectedAddress.locality : '',
        query: this.searchForm.value.skills.toString(),
        searchtype: 'Query',
        fullAddress: this.selectedAddress.formatted_address ? this.selectedAddress.formatted_address: ''
      }
      this.searchService.setSearchLocation(reqBody);
      this.submitted = false;
      this.analyticsService.eventEmitter('JobSearchScreen', 'SearchJob', 'SearchJob');
      this.router.navigate(['/search/results'], {queryParams: {page: 2}});
    }
  }

  /**
   * Toggle the skills dropdown on click of plus icon
   */
  toggleSkillsDropdown() {
    let skillsInput = document.querySelector('.search-bar .ant-select-selection');
    skillsInput['click']();
  }

  /**
   * Show custom count of selected element more than 1
   * @param value String array of selected values
   */
  onMultiSelectChange(value) {
    this.analyticsService.eventEmitter('JobSearchScreen', 'searchJobsAddSkills', 'searchJobsAddSkills');
    const element = document.querySelector("nz-select .ant-select-selection--multiple .ant-select-selection__rendered ul");
    const scrollX = document.querySelector('nz-select .ant-select-selection--multiple .ant-select-selection__rendered ul input.ant-select-search__field')['offsetLeft'];
    setTimeout(() => {
      element.parentElement.scrollTo({left: scrollX, top: 0, behavior: 'smooth'});
    }, 200);
  }

  /**
   * Goto matching jobs handler
   */
  gotoMatchingJobs() {
    this.analyticsService.eventEmitter('JobSearchScreen', 'searchJobsMatchingJobs', 'searchJobsMatchingJobs');
  }
}
