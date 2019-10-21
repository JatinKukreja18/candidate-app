import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntryComponent } from './components/entry/entry.component';


const routes: Routes = [
  { path: 'coverPage', loadChildren: () => import('./containers/cover-page/cover-page.module').then(mod => mod.CoverPageModule) },
  { path: '', component: EntryComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
