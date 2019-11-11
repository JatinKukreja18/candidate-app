import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { CompanyRoutingModule } from './company-routing.module';
import { AboutusComponent } from './about-us/about-us.component';
import { FaqComponent } from './faq/faq.component';

@NgModule({
    declarations: [
        AboutusComponent,
        FaqComponent
    ],
    imports: [
      CommonModule,
      NgZorroAntdModule,
      CompanyRoutingModule
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
export class CompanyModule { }