import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
// import 'rxjs/add/operator/map';

@Injectable()
export class UserDataService {

   constructor( private httpService: HttpClient) { }

   getUserData(): Observable<any> {
    return this.httpService.get('./assets/cp.json');
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

