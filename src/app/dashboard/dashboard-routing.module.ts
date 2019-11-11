import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardLandingComponent  } from './dashboard-landing/dashboard-landing.component';
import { ViewJobsComponent } from './view-jobs/view-jobs.component';


const routes: Routes = [
  {
    path: '',
    component: DashboardLandingComponent,
    children: [
      { path: 'coverPage/:id', loadChildren: '../cover-page/cover-page.module#CoverPageModule'}
    ]
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
