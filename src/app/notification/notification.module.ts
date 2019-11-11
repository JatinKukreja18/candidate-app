import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { SharedModule } from '@app/shared';
import { NotificationRoutingModule } from './notification-routing.module';
import { NotificationComponent } from './notification.component';
import { ScheduleComponent } from './schedule/schedule.component';

@NgModule({
    declarations: [
        NotificationComponent,
        ScheduleComponent
    ],
    imports: [
      CommonModule,
      NgZorroAntdModule,
      NotificationRoutingModule,
      ReactiveFormsModule,
      SharedModule
    ],
    exports: [],
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
export class NotificationModule { }