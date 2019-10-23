import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from './components/components.module';
import { AuthGuard } from './core/guards/auth.guard';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';


const routes: Routes = [
  { path: 'coverPage', loadChildren: () => import('./containers/cover-page/cover-page.module').then(mod => mod.CoverPageModule),
  canActivate: [AuthGuard] },
  { path: '', loadChildren: () => import('./containers/auth/auth.module').then(mod => mod.AuthModule) },
  { path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [
    ComponentsModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
