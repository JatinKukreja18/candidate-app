import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
// import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;
@Injectable()
export class UserDataService {

   constructor( private httpService: HttpClient) { }

   getUserData(id): Observable<any> {
    return this.httpService.get(apiUrl + environment.apiPaths.coverPage + id);
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

