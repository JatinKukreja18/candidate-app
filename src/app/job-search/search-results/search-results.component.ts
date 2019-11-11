/// <reference types="@types/googlemaps" />
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchJobService, AuthenticationService, AnalyticsService } from '@app/core';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  skills: any[] = [];
  location: any;
  jobs: any;
  lastPage: any ;
  constructor(
    private searchJobService: SearchJobService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.location = this.searchJobService.getSearchLocation();
    this.searchJobService.setSelectedJob(null);
    this.searchJobService.setSearchType(1);
    this.searchJobService.searchActivePage(1);
    this.route.queryParamMap.subscribe(result => {
      if (result && result['params']) {
        if (result['params']['page']) {
          if (result['params']['page'] == 1) {
            this.lastPage = 1;
          } else if (result['params']['page'] == 2) {
            this.lastPage = 2;
          }
        }
      }
    });
  }

  /**
   * Update the job results in the maps element to show markers
   * @param value array of jobs object
   */
  onJobsFetch(value: any) {
    this.jobs = value;
  }

  /**
   * Assign the selected job
   * @param selectedJob 
   */
  onSelect(selectedJob) {
    // this.searchJobService.setSearchType(1);
    this.router.navigate(['/search/details'], {queryParams: {page: this.lastPage}});
  }

  /**
   * Goto search page with the search values
   */
  editSearchPage() {
    let searchData = this.searchJobService.getSearchLocation();
    let location;
    let skills;
    if (searchData){
      location = searchData['fullAddress'];
      skills = searchData['query'];
      this.analyticsService.eventEmitter('JobSearchScreen', 'editJobSearch', 'editJobSearch');
      this.router.navigate(['search'], {queryParams: { skills: skills, location: location}});
    }
  }

  /**
   * Go back to previous page
   */
  goBack(){
    let previousUrlsHistory = this.authService.routeHistory();
    if (previousUrlsHistory instanceof Array && previousUrlsHistory.length > 0) {
      this.router.navigate([previousUrlsHistory[previousUrlsHistory.length - 1]], {queryParamsHandling: 'preserve'});
    } else {
      window.history.back();
    }
  }
}
