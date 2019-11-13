import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardLandingComponent  } from './dashboard-landing/dashboard-landing.component';
import { ViewJobsComponent } from './view-jobs/view-jobs.component';


const routes: Routes = [
  {
    path: ':id',
    component: DashboardLandingComponent,
    /* children: [
      { path: ':id', loadChildren: '../cover-page/cover-page.module#CoverPageModule'}
    ] */
  },
  {
    path: 'job',
    component: ViewJobsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
