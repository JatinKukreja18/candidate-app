import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EntryComponent } from './components/entry/entry.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { IconsProviderModule } from './icons-provider.module';
import { NgZorroAntdModule, NZ_I18N, en_US, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { LinkedInService } from './core/services/linkedin.service';
import { AnalyticsService } from './core/services/analytics.service';
import { AuthenticationService } from './core/services/auth.service';
import { AuthService, AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { environment } from '../environments/environment';
import { CommonService } from './core/services/common.service';

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(environment.googleClientId)
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider(environment.facebookClientId)
  }
]);

export function provideConfig() {
  return config;
}

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    EntryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    NgZorroAntdModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    { provide: AuthServiceConfig, useFactory: provideConfig},
    { provide: NZ_MESSAGE_CONFIG, useValue:
      {
        nzDuration: 1000,
        nzMaxStack: 1,
        nzPauseOnHover: true,
        nzAnimate: true
      }
    },
    AnalyticsService,
    AuthenticationService,
    LinkedInService,
    AuthService,
    CommonService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
