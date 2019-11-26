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
  isLoading= false
  constructor(private userService: UserDataService,
    private router: Router,private fb: FormBuilder){

  }
  visible: boolean;


  ngOnInit(){
      this.isLoading = true;
      this.getUserList();
      this.validateForm = this.fb.group({
        comment: ['', [Validators.required]]
      });
  }
  change(value: boolean): void {
    console.log(value);
  }
  getPercent(val){
    return parseInt(val) * 10;
  }

  getUserList(){
    const options = '&pagenumber=' + this.currentPageIndex + '&pagesize=' + this.currentPageSize;
    this.userService.getAllUsers(options).subscribe(res => {
      this.users = res.map(v=>{
           v.visible = false;
           return v;
      });
      console.log(this.users);
      this.isLoading = false;
    });
  }

  submitForm(value,user): void {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    this.userService.editFeedback(value.comment, user.UserName).subscribe(res=>{
      console.log(res);
      this.resetForm();
      user.InstructorFeedback = value.comment;
      user.visible = false;
    }, err => {
        console.log(err);
        // user.InstructorFeedback = value.comment;

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
    if(e)    e.preventDefault();

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
