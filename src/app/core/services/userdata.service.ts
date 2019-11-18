import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
// import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';

@Injectable()
export class UserDataService {

   constructor( private httpService: HttpClient) { }

   getUserData(id): Observable<any> {
    return this.httpService.get(environment.apiPaths.coverPage);
   }

   getAllUsers():  Observable<any>{
     return this.httpService.get(environment.apiPaths.allUsers);
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

