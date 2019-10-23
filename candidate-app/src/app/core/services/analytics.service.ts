import { Injectable } from '@angular/core';

declare let gtag: Function; // Declare ga as a function

@Injectable()
export class AnalyticsService {
    constructor() {}

    //create our event emitter to send our data to Google Analytics
    public eventEmitter(
        eventCategory: string,
        eventAction: string,
        eventLabel: string = null,
        eventValue: number = null) 
    {
        gtag('event', eventAction, {
            'event_category': eventCategory,
            'event_label': eventLabel,
            'value': eventValue
        });
    }
}