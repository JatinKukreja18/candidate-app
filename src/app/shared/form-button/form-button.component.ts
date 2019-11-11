import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-form-button',
  templateUrl: './form-button.component.html',
  styleUrls: ['./form-button.component.scss']
})
export class FormButtonComponent implements OnInit {

  constructor() { }

  @Input() textButton: string;
  @Input() isDisabled: boolean;
  @Input() isSubmit: boolean;

  ngOnInit() {
  }

}
