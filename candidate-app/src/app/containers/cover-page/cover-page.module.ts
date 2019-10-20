import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material';
import { CoverPageLayoutComponent } from './cover-page-layout/cover-page-layout.component';
import { CoverPageHeaderComponent } from './cover-page-header/cover-page-header.component';

@NgModule({
    imports: [
        CommonModule,
        MatTooltipModule
    ],
    declarations: [CoverPageLayoutComponent, CoverPageHeaderComponent],
    providers: [],
    exports: [CoverPageLayoutComponent, CoverPageHeaderComponent]
})
export class CoverPageModule { }
