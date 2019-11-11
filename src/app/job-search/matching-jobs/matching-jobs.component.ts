import { Component, OnInit } from '@angular/core';
import { SearchJobService, AuthenticationService, AnalyticsService } from '@app/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-matching-jobs',
  templateUrl: './matching-jobs.component.html',
  styleUrls: ['./matching-jobs.component.scss']
})
export class MatchingJobsComponent implements OnInit {
  // Element reference to scroll to the respective element
  searchLocation: any;
  jobs: any;

  constructor(
    private searchJobService: SearchJobService,
    private authService: AuthenticationService,
    private router: Router,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.searchJobService.setSearchType(2);
    this.searchJobService.searchActivePage(1);
    this.searchJobService.setSearchLocation(null);
    this.searchJobService.setSelectedJob(null);
    // this.searchJobService.removeJobResultSession();
  }

  /**
   * Get the job details on selection of job from theresults list
   */
  onSelect() {
    this.searchJobService.setSearchType(2);
    this.router.navigateByUrl('/search/details');
  }

  /**
   * Update the job results in the maps element to show markers
   * @param value array of jobs object
   */
  onJobsFetch(value: any) {
    this.jobs = value;
  }

  /**
   * Go to the previous page
   */
  goBack(){
    let previousUrlsHistory = this.authService.routeHistory();
    if (previousUrlsHistory instanceof Array && previousUrlsHistory.length > 0) {
      this.router.navigate([previousUrlsHistory[previousUrlsHistory.length - 1]], {queryParamsHandling: 'preserve'});
    } else {
      window.history.back();
    }
  }

  /**
   * Edit profile handler
   */
  editProfileHandler() {
    this.analyticsService.eventEmitter('JobSearchScreen', 'matchingJobsEditProfile', 'matchingJobsEditProfile');
  }

}
