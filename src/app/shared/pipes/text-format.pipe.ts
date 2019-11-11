import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'format', 
    pure: false
})
export class TextFormatPipe implements PipeTransform {

    transform(value: string, []): string {
        if (value) {
            return value.replace(/_/g, ' ');
        } else {
            return '';
        }
    }

}