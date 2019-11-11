import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGaurd } from '@app/core';
import { PreInterviewComponent } from '@app/shared';

const routes: Routes = [
  {
    path: '',
    loadChildren: './auth/auth.module#AuthModule'
  },
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    // canActivate: [AuthGaurd]
  },
  {
    path: 'profile',
    loadChildren: './profile/profile.module#ProfileModule',
    canActivate: [AuthGaurd]
  },
  {
    path: 'search',
    loadChildren: './job-search/job-search.module#JobSearchModule',
    canActivate: [AuthGaurd]
  },
  {
    path: 'myjobs',
    loadChildren: './my-jobs/my-jobs.module#MyJobsModule',
    canActivate: [AuthGaurd]
  },
  {
    path: 'company',
    loadChildren: './company/company.module#CompanyModule',
    canActivate: [AuthGaurd]
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule',
    canActivate: [AuthGaurd]
  },
  {
    path: 'notification',
    loadChildren: './notification/notification.module#NotificationModule',
    canActivate: [AuthGaurd]
  },
  {
    path: 'assessments',
    loadChildren: './assessments/assessments.module#AssessmentsModule',
    canActivate: [AuthGaurd]
  },
  {
    path: 'coverPage/:id',
    loadChildren: './cover-page/cover-page.module#CoverPageModule'
  },
  {
    path: 'job/preinterview',
    component: PreInterviewComponent
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
