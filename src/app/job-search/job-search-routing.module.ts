import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchResultsComponent } from './search-results/search-results.component';
import { MainSearchComponent } from './main-search/main-search.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { MatchingJobsComponent } from './matching-jobs/matching-jobs.component';

const routes: Routes = [
  {
    path: '',
    component: MainSearchComponent
  },
  {
    path: 'results',
    component: SearchResultsComponent
  },
  {
    path: 'details',
    component: JobDetailsComponent
  },
  {
    path: 'matching',
    component: MatchingJobsComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobSearchRoutingModule { }
