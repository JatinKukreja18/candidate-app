import { Component, OnInit } from '@angular/core';
import { SearchJobService } from '@app/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recent-search',
  templateUrl: './recent-search.component.html',
  styleUrls: ['./recent-search.component.scss']
})
export class RecentSearchComponent implements OnInit {
  recentSearches: any = [];

  constructor(
    private searchJobService: SearchJobService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getRecentSearches();
  }

  /**
    * Get the recent searches from the API
  */
  getRecentSearches() {
    this.searchJobService.getRecentSearch().subscribe((response) => {
      if (response.code === 200) {
        this.recentSearches = response.data;
      }
    });
  }

  /**
   * Re-search jobs from the recent search list
   * @param selectedEntry Recent search entry from the list
   */
  searchJobs(selectedEntry){
    let reqBody = {
      lat: selectedEntry.latitude,
      lng: selectedEntry.longitude,
      location: selectedEntry.location,
      query: selectedEntry.jobTitle,
      searchtype: 'Query'
    }
    this.searchJobService.setSearchLocation(reqBody);
    this.router.navigate(['/search/results'], {queryParams: {page: 2}});
  }
}
