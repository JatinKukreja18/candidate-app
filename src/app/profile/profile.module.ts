import { NgModule,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { ProfileLandingComponent } from './profile-landing/profile-landing.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from './../shared/shared.module';
import {NgxDocViewerModule} from 'ngx-doc-viewer';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { ProfileviewComponent } from './profileview/profileview.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component'
@NgModule({
  declarations: [ProfileLandingComponent, ProfileviewComponent, ProfileEditComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    SharedModule,
    NgxDocViewerModule,
    SelectDropDownModule
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
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]

})
export class ProfileModule { }
