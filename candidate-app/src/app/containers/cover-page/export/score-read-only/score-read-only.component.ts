import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-score-read-only',
  templateUrl: './score-read-only.component.html',
  styleUrls: ['./score-read-only.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('rotatedState', [

      state('rotated', style({ transform: 'rotate({{rotDeg}}deg)' })
        , { params: { rotDeg: 0 } }
      ),
      transition('rotated => default', animate('200ms ease-out')),
      transition('default => rotated', animate('200ms ease-in'))
    ])

  ]
})
export class ScoreReadOnlyComponent implements OnInit {

  @Input() rating = 0;
  @Input() months = '0';
  @Input() iconPath = '';
  @Input() skill = '';
  state = 'default';
  fixRrotation = 0;
  rotation = 0;
  restRotation = 0;
  constructor() {

  }

  ngOnInit() {
    setTimeout(this.changeState.bind(this), 200);
  }
  flip(){
    return this.rotation<this.restRotation;
  }


  changeState() {
    this.fixRrotation = 0;
    this.rotation = Number(this.rating) / 10 * 360;
    this.restRotation = 360 - this.rotation;
    // this.rating=7;
    // let deg=this.rating/10*180;
    // this.fillrotation=deg;
    // this.fix_rotation=deg*2;
    this.state = (this.state === 'default') ? 'rotated' : 'default';
  }

}
