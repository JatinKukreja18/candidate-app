import { Injectable } from '@angular/core';
import { 
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, retry, catchError } from 'rxjs/operators';
import { ApiMessages } from '@app/core/messages';
import { NzMessageService } from 'ng-zorro-antd';
import { AuthenticationService } from '../services/auth.service';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
    messages: any;
    constructor(
        private messageService: NzMessageService,
        private authService: AuthenticationService,
        private router: Router
    ) {
        this.messages = ApiMessages;
    }
    
    intercept(request: HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                tap((response: HttpResponse<any>) => {
                    if(response && response.body && response.body.code !== 200 && response.body.code !== 0 && response.body.code !== 710 && response.body.code !== 708 && !request.url.includes('vimeo') && !request.url.includes('detail') && !request.url.includes('linkedin') && !request.url.includes('notification') && !request.url.includes('schedule/interview')) {
                        if(response && response.body && response.body.message){
                            if(response.body.message){
                                this.messageService.info(response.body.message, { nzDuration: 1500 });
                            }
                        }
                    } else if (response && response.body && response.body.code !== 200 && response.body.code !== 0 && response.body.code !== 710 && response.body.code !== 708 && !request.url.includes('vimeo') && !request.url.includes('detail') && !request.url.includes('linkedin') && !request.url.includes('notification') && !request.url.includes('schedule/interview')) {
                        this.messageService.success(response.body.message, { nzDuration: 1500 });
                    }
                }),
                catchError((error: HttpErrorResponse) => {
                    let errorMessage = '';
                    if (error.error instanceof ErrorEvent) {
                      // client-side error
                      errorMessage = `Error: ${error.error.message}`;
                      this.messageService.error(error.error.message, { nzDuration: 1500 })
                    } else {
                        // server-side error
                        for(let key in this.messages) {
                            if (parseInt(key) == error.status) {
                                errorMessage = this.messages[key];
                            }
                        }
                        if (error.status === 401) {
                            this.authService.clearLocalStorage();
                            this.router.navigateByUrl('/');
                        }
                        // if (errorMessage === '') errorMessage = 'Something went wrong. Please try again.';
                        // if (errorMessage === '') errorMessage = '';
                        if(errorMessage){
                            this.messageService.error(errorMessage, { nzDuration: 1500 })
                        }
                    }                    
                    return throwError(errorMessage);
                })
            )
    }
}