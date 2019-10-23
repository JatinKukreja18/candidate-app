import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule, MatButtonModule, MatIconModule } from '@angular/material';
import { CoverPageLayoutComponent } from './cover-page-layout/cover-page-layout.component';
import { CoverPageHeaderComponent } from './cover-page-header/cover-page-header.component';
import { ComponentsModule } from 'src/app/components/components.module';
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
        RouterModule.forChild(routes)
    ],
    declarations: [
        CoverPageLayoutComponent,
        CoverPageHeaderComponent,
        ScoreComponent,
        ScoreReadOnlyComponent
    ],
    providers: [],
    exports: [CoverPageLayoutComponent, CoverPageHeaderComponent]
})
export class CoverPageModule { }
