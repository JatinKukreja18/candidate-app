import { Component, OnInit, AfterViewChecked, AfterViewInit, Input } from '@angular/core';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
// import FileSaver from 'file-saver';
import {Router, ActivatedRoute } from '@angular/router';
import { UserDataService } from './../../core/services/userdata.service';

@Component({
  selector: 'app-cover-page-layout',
  templateUrl: './cover-page-layout.component.html',
  styleUrls: ['./cover-page-layout.component.scss']
})
export class CoverPageLayoutComponent implements OnInit, AfterViewInit {

  @Input() candidateData: any = {};
  @Input() primarySkills: [];
  @Input() additionalSkills: [];
  @Input() exporting;
  isEditable = false;
  constructor( private activatedRoute: ActivatedRoute,
                private userDataService: UserDataService,
                private router: Router ) {
  }

  ngOnInit() {
    console.log('loading content for ' + this.activatedRoute.snapshot.params.id)

    this.activatedRoute.params.subscribe(params => {
      if (params && params.export) {
        this.exporting = true;
      }
    });
  }
  ngOnChanges(){
    console.log(this.primarySkills);
  }
  ngAfterViewInit() {
    if (this.exporting) {
      setTimeout(this.captureScreen.bind(this), 5000);
    }
  }

  captureScreen() {
    const page = document.getElementById('cover-page');
    html2canvas(page, { y:0, height: page.offsetHeight}).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/jpeg');
      const dataHeight = page.offsetHeight;
      const imgWidth = 210;
      const pageHeight = 300;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      // FileSaver.saveAs(contentDataURL, 'my-pdfimage.png');
      let doc = new jspdf('p', 'mm', 'a4');
      let position = 0;

      doc.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight, );
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      // doc.save( 'file.pdf');
      doc.output("dataurlnewwindow");
      window.close();
    });
    // let doc = new jspdf('p', 'mm', 'a4');

    // doc.fromHTML(page);

  }

}
