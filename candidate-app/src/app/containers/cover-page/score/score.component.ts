import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
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
export class ScoreComponent implements OnInit {
  @Input() rating = '7';
  @Input() months = '22';
  @Input() iconPath = '';

  state = 'default';
  fillRotation = 0;
  fixRotation = 0;

  constructor() { }

  ngOnInit() {
    setTimeout(this.changeState.bind(this), 200);
  }

  changeState() {
    const degree = Number(this.rating) / 10 * 180;
    this.fillRotation = degree;
    this.fixRotation = degree * 2;
    this.state = (this.state === 'default') ? 'rotated' : 'default';
  }
}
