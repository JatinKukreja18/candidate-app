import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { NgZorroAntdModule, NZ_I18N, en_US, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { MyJobsComponent } from './my-jobs/my-jobs.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { MyJobsRoutingModule } from './my-jobs-routing.module';

@NgModule({
  declarations: [
    MyJobsComponent,
    ScheduleComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MyJobsRoutingModule,
    NgZorroAntdModule,
    ReactiveFormsModule,
    FormsModule
  ],
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
export class MyJobsModule { }
