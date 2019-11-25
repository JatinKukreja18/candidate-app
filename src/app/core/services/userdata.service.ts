import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
// import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

const apiUrl = environment.apiUrl;
@Injectable()
export class UserDataService {

  private userSubject: BehaviorSubject<any> = new BehaviorSubject({});
  public userEmitter: Observable<any>;
  public userData = {};

   constructor( private httpService: HttpClient) { 
    this.userEmitter = this.userSubject.asObservable();
   }

   getUserData(id): Observable<any> {
    return this.httpService.get(apiUrl + environment.apiPaths.coverPage + id).pipe(tap(response => {
      console.log(response);
      this.userData = response;
      this.refreshUserData(response);
    }));
   }

   refreshUserData(userData) {
     this.userSubject.next(userData);
   }

   getAllUsers(options?:any):  Observable<any>{
     let params = '&pagenumber=1&pagesize=10';
     options ? params = options : params = params;
     console.log(params);

    //  return this.httpService.get(apiUrl + environment.apiPaths.allUsers + params);
     return this.httpService.get('../assets/user-list.json');
   }

   editFeedback(text,userid): Observable<any>{
     return this.httpService.post(apiUrl + environment.apiPaths.editFeedback + userid, text);
   }
}
// {
//     this.httpService.get('./assets/cp.json').subscribe(
//       data => {
//         console.log(data);

//         return data;

//       },
//       (err: HttpErrorResponse) => {
//         console.log (err.message);
//       }
//     );
//    }

