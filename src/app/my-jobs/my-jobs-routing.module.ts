import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyJobsComponent } from './my-jobs/my-jobs.component';
import { ScheduleComponent } from  './schedule/schedule.component';


const routes: Routes = [
  {
    path: '',
    component: MyJobsComponent
  },
  {
    path: 'schedule',
    component: ScheduleComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyJobsRoutingModule { }
