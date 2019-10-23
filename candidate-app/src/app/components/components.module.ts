import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material';
import { DetailsListCardComponent } from './details-list-card/details-list-card.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';


@NgModule({
  declarations: [
    DetailsListCardComponent,
    PageNotFoundComponent
  ],
  imports: [
    CommonModule,
    MatCardModule
  ],
  exports: [
    DetailsListCardComponent
  ]
})
export class ComponentsModule { }
