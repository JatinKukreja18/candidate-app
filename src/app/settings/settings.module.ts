import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';

@NgModule({
    declarations: [
        SettingsComponent
    ],
    imports: [
      CommonModule,
      NgZorroAntdModule,
      SettingsRoutingModule,
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
      ]
})
export class SettingsModule { }