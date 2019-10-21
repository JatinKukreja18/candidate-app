import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material';
import { CoverPageLayoutComponent } from './cover-page-layout/cover-page-layout.component';
import { CoverPageHeaderComponent } from './cover-page-header/cover-page-header.component';
import { ComponentsModule } from 'src/app/components/components/components.module';
import { ScoreComponent } from './score/score.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    { path: '', component: CoverPageLayoutComponent }
];
@NgModule({
    imports: [
        CommonModule,
        MatTooltipModule,
        ComponentsModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        CoverPageLayoutComponent,
        CoverPageHeaderComponent,
        ScoreComponent
    ],
    providers: [],
    exports: [CoverPageLayoutComponent, CoverPageHeaderComponent]
})
export class CoverPageModule { }
