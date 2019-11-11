import { Directive, ElementRef, HostListener, Input,OnInit,Renderer2 } from '@angular/core';


@Directive({
   selector: 'input[app-phone-field]'
})
export class PhoneNumberDirective implements OnInit {
//   @Input('app-numeric-field') maxLength: string;

  constructor(private elementRef: ElementRef,private _renderer: Renderer2) {}

  ngOnInit(): void {
    //  this._renderer.setElementAttribute(this.elementRef.nativeElement, 'maxlength', this.maxLength);
  }

  @HostListener('keydown', ['$event']) onKeyDown(event) {
     let e = <KeyboardEvent> event;
        if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
           // Allow: Ctrl+A
           (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
           // Allow: Ctrl+C
           (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
           // Allow: Ctrl+V
           (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
           // Allow: Ctrl+X
           (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
           // Allow: home, end, left, right
           (e.keyCode >= 35 && e.keyCode <= 39)) {
           // let it happen, don't do anything
         return;
        }
         // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
           e.preventDefault();
        }

        if (e.target['value'] && e.target['value']['length']>=10) {
            e.preventDefault();
        }
    }
}