import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SidebarRegisterComponent, SidebarLoginComponent, AuthLandingComponent, AuthForgotPassComponent } from './index';


const routes: Routes = [
  {
    path: '',
    component: AuthLandingComponent
  },
  {
    path: 'forgotpassword',
    component: AuthForgotPassComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
