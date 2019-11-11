import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from '@app/core/models';

@Injectable()
export class DashboardService {
    
    constructor(
        private http: HttpClient
    ) {}

    /**
     * Get current user dashboard
     */
    getCandidateDashboard(): Observable<Response> {
        return this.http.get<Response>('CandidateDashboard');
    }


}