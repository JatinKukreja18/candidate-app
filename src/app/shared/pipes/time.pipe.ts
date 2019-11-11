import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'timeago',
    pure: false
  })
export class TimePipe implements PipeTransform {
  transform(value: Date, []): string {
    var result: string;
    // current time
    let now = new Date().getTime();
    let currentDate = new Date(value)
    // time since message was sent in seconds
    let delta = (now - currentDate.getTime()) / 1000;
    // format string
    if (delta < 10) {
      result = 'now';
    } else if (delta < 60) { // sent in last minute
      result = Math.floor(delta) + ' seconds ago';
    } else if (delta < 3600) { // sent in last hour
      result = Math.floor(delta / 60) + ' minutes ago';
    } else if (delta < 86400) { // sent on last day
      result = Math.floor(delta / 3600) + ' hours ago';
    } else if (delta < 604800) { // sent more than one day ago
      result = Math.floor(delta / 86400) + ' days ago';
    } else {
      const monthNames = ["January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
      result = `${currentDate.getDate()} ${monthNames[currentDate.getMonth()].substring(0,3)}, ${currentDate.getFullYear()}`;
    }
    return result;
  }
}