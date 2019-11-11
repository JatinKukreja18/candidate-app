import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificationComponent } from './notification.component';
import { ScheduleComponent } from './schedule/schedule.component';

const routes: Routes = [
    {
      path: '',
      component: NotificationComponent
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
  export class NotificationRoutingModule {
  }
