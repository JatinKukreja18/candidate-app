import { UserDataService } from '@app/core/services/userdata.service';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { debounce, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent  implements OnInit {

  url: String;
  users: any[];
  usersCpy: any[];
  validateForm: FormGroup;
  currentPageIndex = '1';
  currentPageSize = '2000';
  isLoading= false;
  search_control:FormControl;
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
      this.initializeSearchBox();
  }
  initializeSearchBox(){
    this.search_control = new FormControl("");
    this.search_control.valueChanges.pipe(debounceTime(500)).subscribe((res)=>{
      this.users = this.usersCpy.filter((el)=>{
        return (el['FullName']+"").toLocaleLowerCase().includes((res).toLocaleLowerCase()) || (el['EmailId']+"").toLocaleLowerCase().includes((res).toLocaleLowerCase()) || (el['InstructorFeedback']+"").toLocaleLowerCase().includes((res).toLocaleLowerCase()) || (el['skillString']+"").toLocaleLowerCase().includes((res).toLocaleLowerCase()) ;
      })
    })
  }
  change(value: boolean): void {
    console.log(value);
  }
  getPercent(val){
    return parseInt(val) * 10;
  }

  getUserList(){
    // this.isLoading = true;
    const options = '&pagenumber=' + this.currentPageIndex + '&pagesize=' + this.currentPageSize;
    this.userService.getAllUsers(options).subscribe(res => {
      this.users = res.map(v=>{
           v.visible = false;
           let arr = [];
          //  console.log("v['CandidateSkills'].length>",v['CandidateSkills'].length);
           if(v['CandidateSkills'].length>0){
             v['CandidateSkills'].map(el=>{
               arr.push(el['Skill']);
             })
            //  console.log("arrr",arr);
             v.skillString = arr.join("");
           }
           return v;
      });
      this.usersCpy = JSON.parse(JSON.stringify(this.users));
      // console.log(this.users);
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
      // this.getUserList();
    }
  }
  pageSizeChanged(size){
    // this.currentPageSize = size;
    this.currentPageIndex = '1';
    this.getUserList();
  }
  skillFunction(data){
    let tempArray = [];
    data.map((el)=>{
      tempArray.push(el['Skill']);
    });
    let tempStr = tempArray.join(',');
    if(tempStr){
      return tempStr.slice(0,10)+'...';
    }
    return '';
    
  }
}
