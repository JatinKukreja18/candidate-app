import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { ApiPrefixInterceptor, ApiTokenInterceptor, ApiErrorInterceptor } from './interceptors';
import { 
  CommonService,
  AuthenticationService,
  SearchJobService,
  LinkedInService,
  DashboardService,
  JobService,
  NotificationsService,
  ProfileService,
  AssessmentsService,
  VimeoService,
  AnalyticsService
} from './services';
import { AuthGaurd } from './gaurds/auth.gaurds';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    NgZorroAntdModule
  ],
  providers: [
    ApiPrefixInterceptor,
    CommonService,
    AuthenticationService,
    SearchJobService,
    LinkedInService,
    DashboardService,
    JobService,
    NotificationsService,
    AuthGaurd,
    ProfileService,
    AssessmentsService,
    VimeoService,
    AnalyticsService,
    // { provide: HTTP_INTERCEPTORS, useClass: ApiPrefixInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApiTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true  },
    
  ],
  exports: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(`${parentModule} is already been loaded. Import Core module in the AppModule only.`);
    }
  }
}
