import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

/**
 * Prefixes all request with `environment.baseUrl`
 */
@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!/^(http|https):/i.test(request.url)) {
            if (/(\bcommon\b|\baccount\b|\blinkedin\b)/i.test(request.url)) {
                request = request.clone({url: `${environment.baseUrl}${request.url}`});
            } else {
                request = request.clone({url: `${environment.apiUrl}${request.url}`}); 
            }
            
        }
        return next.handle(request);
    }
}
