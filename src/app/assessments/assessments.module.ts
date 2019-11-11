import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { AssessmentsRoutingModule } from './assessments-routing.module';
import { AssessmentsComponent } from './assessments.component';

@NgModule({
    declarations: [
        AssessmentsComponent
    ],
    imports: [
      CommonModule,
      NgZorroAntdModule,
      AssessmentsRoutingModule,
      ReactiveFormsModule
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
    ],
})
export class AssessmentsModule { }