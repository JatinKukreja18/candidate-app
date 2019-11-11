import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-details-list-card',
  templateUrl: './details-list-card.component.html',
  styleUrls: ['./details-list-card.component.scss']
})
export class DetailsListCardComponent implements OnInit {

  @Input() title = '';
  @Input() items = [];
  @Input('is-editable') isEditable: boolean;
  isEdit: boolean = false;
  constructor() { }

  ngOnInit() {
  }
  activateEdit(){
    document.body.style.zoom = '1.0';
    this.isEdit = !this.isEdit;
    setTimeout(() => {
      const a :any = document.querySelector('.editing');
      document.scrollingElement.scrollTop = a.offsetTop;
    }, 0);
  }
}
