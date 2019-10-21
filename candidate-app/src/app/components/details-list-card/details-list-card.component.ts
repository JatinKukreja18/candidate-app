import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-details-list-card',
  templateUrl: './details-list-card.component.html',
  styleUrls: ['./details-list-card.component.scss']
})
export class DetailsListCardComponent implements OnInit {

  @Input() title = '';
  @Input() items = [];
  isEdit: boolean = false;
  constructor() { }

  ngOnInit() {
  }
  activateEdit(){
    this.isEdit = !this.isEdit;
  }
}
