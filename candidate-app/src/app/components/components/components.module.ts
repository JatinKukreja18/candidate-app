import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material';
import { DetailsListCardComponent } from '../details-list-card/details-list-card.component';


@NgModule({
  declarations: [
    DetailsListCardComponent
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
