import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { flatMap } from 'rxjs/operators'
import { Response } from '@app/core/models';

@Injectable()
export class NotificationsService {

    public refreshNotificationCounts: BehaviorSubject<boolean>;

    constructor(private http: HttpClient){
        this.refreshNotificationCounts = new BehaviorSubject<boolean>(false);
    }

    /**
     * Make GET request to notfication/setting url
     * @param enable string value on/off
     */
    settings(enable?: boolean):Observable<Response> {
        let httpOptions = {
            params: {}
        }
        httpOptions.params['enable'] = enable.toString();
        return this.http.get<Response>('notification/setting', httpOptions);
    }

    /**
     * Get the count of unread notifications
     */
    getNotificationCount(): Observable<Response> {
        return this.http.post<Response>('notification/allcount', {});
    }

    /**
     * Get the notifications from the API
     * @param pageNum notification page number to be fetched.
     */
    getNotificationsList(pageNum?: number): Observable<Response> {
        let httpOptions = {
            params: {}
        }
        if (pageNum) httpOptions.params['pageNum'] = pageNum.toString();
        return this.http.get<Response>('notification/list', httpOptions);
    }

    /**
     * Mark a notitifcation as read
     * @param notificationId id of the notification to be marked as read
     */
    markNotificationAsRead(notificationId: string): Observable<Response> {
        return this.http.post<Response>('notification/markasread', {notificationID: notificationId});
    }

    /**
     * Clear all the notifications
     */
    clearAll(): Observable<Response> {
        return this.http.get<Response>('notification/clearall').pipe(
            flatMap(response => this.getNotificationsList(1))
        );;
    }
} 