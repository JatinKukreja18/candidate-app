import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';
import { DashboardLandingComponent } from './dashboard-landing/dashboard-landing.component';
import { ViewJobsComponent } from './view-jobs/view-jobs.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { NgZorroAntdModule, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import {NgxDocViewerModule} from 'ngx-doc-viewer';
import { MatProgressSpinnerModule } from '@angular/material';
import { CoverPageModule } from '@app/cover-page/cover-page.module';
@NgModule({
  declarations: [
    DashboardLandingComponent, ViewJobsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    MatProgressSpinnerModule,
    CoverPageModule
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
export class DashboardModule { }
