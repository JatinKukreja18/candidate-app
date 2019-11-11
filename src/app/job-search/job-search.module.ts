import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainSearchComponent } from './main-search/main-search.component';
import { RecentSearchComponent } from './recent-search/recent-search.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SharedModule } from '@app/shared/shared.module';
import { JobDetailsComponent } from './job-details/job-details.component';
import { JobSearchRoutingModule } from './job-search-routing.module';
import { NgZorroAntdModule, NZ_I18N, en_US, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatchingJobsComponent } from './matching-jobs/matching-jobs.component';

@NgModule({
  declarations: [
    MainSearchComponent,
    RecentSearchComponent,
    SearchResultsComponent,
    JobDetailsComponent,
    MatchingJobsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    JobSearchRoutingModule,
    NgZorroAntdModule
  ],
  exports: [RecentSearchComponent ],
  providers: [
    { provide: NZ_MESSAGE_CONFIG, useValue: 
      { 
        nzDuration: 1000,
        nzMaxStack: 1,
        nzPauseOnHover: true,
        nzAnimate: true 
      }
    }
  ]
})
export class JobSearchModule { }
