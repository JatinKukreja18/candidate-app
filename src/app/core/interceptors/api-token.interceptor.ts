import { Injectable } from '@angular/core';
import { HttpRequest, HttpEvent, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuthenticationService } from '../services/auth.service';

@Injectable()
export class ApiTokenInterceptor implements HttpInterceptor {

    constructor(public auth: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const headersConfig = {
            'Accept': 'application/json'
        };
        if (request.url.indexOf('upload') == -1) {
            headersConfig['Content-Type'] = 'application/json';
        }
        if (
            request.url.indexOf('register') == -1 && 
            request.url.indexOf('externalRegister') == -1 && 
            request.url.indexOf('login') == -1 && 
            request.url.indexOf('generateotp') == -1 && 
            request.url.indexOf('validateotp') == -1 && 
            request.url.indexOf('resetpassword') == -1 && 
            request.url.indexOf('externallogin') == -1 && 
            request.url.indexOf('country') == -1
        ) {
            const token = this.auth.getAccessToken();
            if (token && request.url.indexOf('vimeo') == -1) {
                headersConfig['Authorization'] = `bearer ${token}`;
            } else if (environment.vimeo) {
                headersConfig['Authorization'] = `bearer ${environment.vimeo.access_token}`;
            }
            request = request.clone({ setHeaders: headersConfig });
            return next.handle(request);
        } else {
            return next.handle(request);
        }
    }
}
