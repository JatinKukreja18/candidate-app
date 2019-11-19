import { SafePipe } from './../shared/pipes/safe.pipe';
import { CoverPageComponent } from './cover-page/cover-page.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule } from '@angular/material';
import { CoverPageLayoutComponent } from './cover-page-layout/cover-page-layout.component';
import { CoverPageHeaderComponent } from './cover-page-header/cover-page-header.component';
import { ScoreComponent } from './score/score.component';
import { Routes, RouterModule } from '@angular/router';
import { ScoreReadOnlyComponent } from './export/score-read-only/score-read-only.component';
import { SharedModule } from '@app/shared';
import { UserDataService } from '@app/core/services/userdata.service';
import { NgZorroAntdModule } from 'ng-zorro-antd';

const routes: Routes = [
    { path: '', component: CoverPageComponent }
];
@NgModule({
    imports: [
        CommonModule,
        MatTooltipModule,
        SharedModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NgZorroAntdModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        CoverPageLayoutComponent,
        CoverPageHeaderComponent,
        ScoreComponent,
        ScoreReadOnlyComponent,
        CoverPageComponent,
        SafePipe
    ],
    providers: [UserDataService],
    exports: [CoverPageLayoutComponent, CoverPageHeaderComponent, CoverPageComponent]
})
export class CoverPageModule { }
