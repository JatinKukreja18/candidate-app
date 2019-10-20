import { Component, OnInit, Input } from '@angular/core';

interface SocialLinks {
  site: string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-cover-page-header',
  templateUrl: './cover-page-header.component.html',
  styleUrls: ['./cover-page-header.component.scss']
})
export class CoverPageHeaderComponent implements OnInit {

  @Input() candidateName: string;
  @Input() role: string;
  @Input() companyName: string;
  @Input() socialLinks: SocialLinks;

  constructor() { }

  ngOnInit() {
    console.log(this);
  }

}
