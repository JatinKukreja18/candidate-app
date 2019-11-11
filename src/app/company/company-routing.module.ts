import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutusComponent } from './about-us/about-us.component';
import { FaqComponent } from './faq/faq.component';

const routes: Routes = [
  {
    path: 'aboutus',
    component: AboutusComponent
  },
  {
    path: 'faq',
    component: FaqComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
