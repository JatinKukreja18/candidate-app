import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule ,FormsModule } from '@angular/forms';
import { AuthRightSidebarComponent } from './auth-right-sidebar/auth-right-sidebar.component';
import { AuthLeftSectionComponent } from './auth-left-section/auth-left-section.component';
import { FormButtonComponent } from './form-button/form-button.component';
import { CommonHeaderComponent } from './common-header/common-header.component';
import { CommonSidemenuComponent } from './common-sidemenu/common-sidemenu.component';
import { ChooseSlotComponent } from './choose-slot/choose-slot.component';
import { UploadVideoComponent } from './upload-intro-video/upload-intro-video.component';
import { CommonMapComponent } from './common-map-element/common-map-element.component';
import { CommonJobDetailsComponent } from './common-job-details/common-job-details.component';
import { PreInterviewComponent } from './pre-interview/pre-interview.component';
import { RouterModule } from '@angular/router';
import { TimePipe, TextFormatPipe } from './pipes';
import { PhoneNumberDirective } from './directives';
import { ResultsSidebarComponent } from './results-sidebar/results-sidebar.component';
import { NgZorroAntdModule, NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { IconDefinition } from '@ant-design/icons-angular';
import { StarOutline } from '@ant-design/icons-angular/icons';
import { DetailsListCardComponent } from './details-list-card/details-list-card.component';
import { MatCardModule } from '@angular/material';

const icons: IconDefinition[] = [ StarOutline ];


@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        FormsModule,
        MatCardModule
    ],
    declarations: [
        AuthRightSidebarComponent,
        AuthLeftSectionComponent,
        FormButtonComponent,
        CommonHeaderComponent,
        CommonSidemenuComponent,
        UploadVideoComponent,
        CommonMapComponent,
        CommonJobDetailsComponent,
        TimePipe,
        TextFormatPipe,
        ResultsSidebarComponent,
        ChooseSlotComponent,
        PreInterviewComponent,
        PhoneNumberDirective,
        DetailsListCardComponent
    ],
    exports: [
        AuthRightSidebarComponent,
        AuthLeftSectionComponent,
        FormButtonComponent,
        CommonHeaderComponent,
        CommonSidemenuComponent,
        ResultsSidebarComponent,
        UploadVideoComponent,
        CommonMapComponent,
        CommonJobDetailsComponent,
        TimePipe,
        TextFormatPipe,
        ChooseSlotComponent,
        PreInterviewComponent,
        PhoneNumberDirective,
        DetailsListCardComponent
    ],
    providers: [
        { provide: NZ_ICON_DEFAULT_TWOTONE_COLOR, useValue: '#00ff00' }, // If not provided, Ant Design's official blue would be used
        { provide: NZ_ICONS, useValue: icons },
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
export class SharedModule {}
