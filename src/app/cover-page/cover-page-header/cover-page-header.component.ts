import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
  @Input() candidateId: number = null;
  @Input() role: string;
  @Input() companyName: string;
  @Input() socialLinks;
  @Input() mobile: string;
  @Input() email: string;
  exportLink = '';

  constructor( private router: Router,private activatedRoute: ActivatedRoute,) { }

  ngOnInit() {
    // console.log(this.activatedRoute)
    // console.log(this.router)
    this.exportLink = this.router.url;

  }
  ngOnChanges(){
    let a;
    if(this.socialLinks){
      a = this.socialLinks.map( function(item, index){
        switch (item.SocialSiteId) {
          case 3:
                item.icon = 'assets/icons/linkedin.svg';
                item.site = 'Linkedin';
                break;
          case 2:
              item.icon = 'assets/icons/github.svg';
              item.site = 'Github';
              break;
          default:

            break;
        }
        return item;
      });
    }
    console.log(a);
  }
}
