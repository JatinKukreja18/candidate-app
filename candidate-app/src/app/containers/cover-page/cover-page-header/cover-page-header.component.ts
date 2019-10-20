import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

interface SocialLinks {
  site: string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-cover-page-header',
  templateUrl: './cover-page-header.component.html',
  styleUrls: ['./cover-page-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CoverPageHeaderComponent implements OnInit {

  @Input() candidateName: string;
  @Input() role: string;
  @Input() companyName: string;
  @Input() socialLinks: SocialLinks;
  @Input() mobile: string;
  @Input() email: string;

  constructor() { }

  ngOnInit() {
  }

}
