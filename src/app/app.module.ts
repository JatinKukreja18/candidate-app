import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';
import { NgZorroAntdModule, NZ_I18N, en_US, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { SocialLoginModule, LoginOpt } from 'angularx-social-login';
import { AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider, LinkedInLoginProvider} from 'angularx-social-login';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SafePipe } from './shared/pipes/safe.pipe';
import { SmartProfileModule } from './smart-profile/smart-profile.module';
import { UserDataService } from './core/services/userdata.service';
const fbLoginOptions: LoginOpt = {
  scope: 'pages_messaging,pages_messaging_subscriptions,email,pages_show_list,manage_pages',
  return_scopes: true,
  enable_profile_selector: true
}; // https://developers.facebook.com/docs/reference/javascript/FB.login/v2.11

const googleLoginOptions: LoginOpt = {
  scope: 'profile email openid'
}; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig

const config = new AuthServiceConfig([
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

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    NgZorroAntdModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SocialLoginModule,
    SmartProfileModule
    // serviceworkerModule.register('ngsw-worker.js', { enabled: environment.production })
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
    UserDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
