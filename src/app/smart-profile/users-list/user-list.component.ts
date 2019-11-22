import { UserDataService } from '@app/core/services/userdata.service';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent  implements OnInit {

  url: String;
  users: [];
  validateForm: FormGroup;
  currentPageIndex = '1';
  currentPageSize = '10';
  constructor(private userService: UserDataService,
    private router: Router,private fb: FormBuilder){

  }
  visible: boolean;

  clickMe(): void {
    this.visible = false;
  }

  change(value: boolean): void {
    console.log(value);
  }
  ngOnInit(){
      this.getUserList();
      this.validateForm = this.fb.group({
        comment: ['', [Validators.required]]
      });
  }
  getPercent(val){
    return parseInt(val) * 10;
  }

  getUserList(){
    const options = '&pagenumber=' + this.currentPageIndex + '&pagesize=' + this.currentPageSize;
    this.userService.getAllUsers(options).subscribe(res => {
      this.users = res;
    });
  }

  submitForm(value,user): void {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    console.log(this);
    this.userService.editFeedback(value.comment, user.CandidateId).subscribe(res=>{
      console.log(res);
      this.resetForm();
      user.InstructorFeedback = value.comment;
    }, err => {
        console.log(err);        user.InstructorFeedback = value.comment;

    });

  }

  getCaptcha(e: MouseEvent): void {
    e.preventDefault();
  }
  // hidePopover(e){
  //   console.log(this);
  //   console.log(e);
  // }
  resetForm(e?: MouseEvent): void {
    e.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
      this.validateForm.controls[key].updateValueAndValidity();
    }
  }



  // table operations
  pageChanged(index){
    if(index != 0){
      this.currentPageIndex = index;
      this.getUserList();
    }
  }
  pageSizeChanged(size){
    this.currentPageSize = size;
    this.getUserList();
  }
}
