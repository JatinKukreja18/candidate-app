import { UserDataService } from '@app/core/services/userdata.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import { NzIconModule,
          NzTableModule, NzPopoverModule,
          NzButtonModule, NzProgressModule,
          NzToolTipModule, NzDividerModule,
          NzFormModule, NzInputModule } from 'ng-zorro-antd';
import {  UserListComponent } from './users-list/user-list.component';
import { SmartHeaderComponent } from './smart-header/smart-header.component';
import { SmartProfileRoutingModule } from './smart-profile-routing.module';
// import {MatTableModule} from '@angular/material/table';
// import { MatPaginatorModule, MatTableModule } from '@angular/material';
// import { NzTableModule } from 'ng-zorro-antd/table';
// import { NzPopoverModule } from 'ng-zorro-antd/popover';
// import { NzButtonModule } from 'ng-zorro-antd/button';
// import { NzProgressModule } from 'ng-zorro-antd/progress';
// import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@NgModule({
  declarations: [
    UserListComponent,
    SmartHeaderComponent
  ],
  imports: [
    CommonModule,
    SmartProfileRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzPopoverModule,
    NzProgressModule,
    NzIconModule,
    NzToolTipModule,
    NzDividerModule,
    NzFormModule,
    NzInputModule
  ],
  providers: [
    // { provide: NZ_MESSAGE_CONFIG, useValue:
    //   {
    //     nzDuration: 1000,
    //     nzMaxStack: 1,
    //     nzPauseOnHover: true,
    //     nzAnimate: true
    //   }
    // },
     // UserDataService
  ]
})
export class SmartProfileModule { }
