import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileLandingComponent  } from './profile-landing/profile-landing.component';
import { ProfileviewComponent  } from './profileview/profileview.component';
import {ProfileEditComponent} from './profile-edit/profile-edit.component'

const routes: Routes = [
  {
    path: 'edit',
    component: ProfileLandingComponent
  },
  {
    path: 'view',
    component: ProfileviewComponent
  }
  // {
  //   path: 'edit',
  //   component: ProfileEditComponent
  // },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
