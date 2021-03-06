import { UserDataService } from './../../core/services/userdata.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule } from '@angular/material';
import { CoverPageLayoutComponent } from './cover-page-layout/cover-page-layout.component';
import { CoverPageHeaderComponent } from './cover-page-header/cover-page-header.component';
import { ComponentsModule } from '../../components/components.module';
import { ScoreComponent } from './score/score.component';
import { Routes, RouterModule } from '@angular/router';
import { ScoreReadOnlyComponent } from './export/score-read-only/score-read-only.component';

const routes: Routes = [
    { path: '', component: CoverPageLayoutComponent }
];
@NgModule({
    imports: [
        CommonModule,
        MatTooltipModule,
        ComponentsModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        CoverPageLayoutComponent,
        CoverPageHeaderComponent,
        ScoreComponent,
        ScoreReadOnlyComponent
    ],
    providers: [UserDataService],
    exports: [CoverPageLayoutComponent, CoverPageHeaderComponent]
})
export class CoverPageModule { }
