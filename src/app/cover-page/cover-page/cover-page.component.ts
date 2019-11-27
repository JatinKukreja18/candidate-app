import { Component, OnInit, AfterViewChecked, AfterViewInit } from '@angular/core';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
// import FileSaver from 'file-saver';
import {Router, ActivatedRoute } from '@angular/router';
import { UserDataService } from '../../core/services/userdata.service';

@Component({
  selector: 'app-cover-page',
  templateUrl: './cover-page.component.html',
  styleUrls: ['./cover-page.component.scss']
})
export class CoverPageComponent implements OnInit, AfterViewInit {

  candidateData: any = {};
  companyName = 'Cognixia';
  zoomValue = 1.0;
  exporting = false;
  primarySkills: [];
  additionalSkills: [];
  isEditable = false;
  loading = true;
  constructor( private activatedRoute: ActivatedRoute,
                private userDataService: UserDataService,
                private router: Router ) {
  }
  arrBirds: string [];

  ngOnInit() {
    console.log('loading content for ' + this.activatedRoute.snapshot.params.id)
    // Get Data from API for current profile
    this.userDataService.getUserData(this.activatedRoute.snapshot.params.id).subscribe(res => {
      this.candidateData = res;
      console.log(res)
      // this.handleSkills(this.candidateData.CandidateSkills);
      this.loading = false;
    }, err => {
      console.log(err.message);
      // this.router.navigate(['pageNotFound']);
    });

  }

  zoomIt(v) {
    document.body.style.zoom = v;
    this.zoomValue = v;
  }

  ngAfterViewInit() {
    if (this.exporting) {
      // setTimeout(this.captureScreen.bind(this), 200);
      // this.captureScreen();
    }
  }

  // captureScreen() {
  //   const page = document.getElementById('cover-page');
  //   html2canvas(page, { y: 140, width: 1120, height: page.offsetHeight + 40}).then(canvas => {
  //     const contentDataURL = canvas.toDataURL('image/jpeg');
  //     const dataHeight = page.offsetHeight;
  //     const imgWidth = 210;
  //     const pageHeight = 300;
  //     const imgHeight = canvas.height * imgWidth / canvas.width;
  //     let heightLeft = imgHeight;
  //     // FileSaver.saveAs(contentDataURL, 'my-pdfimage.png');
  //     let doc = new jspdf('p', 'mm', 'a4');
  //     let position = 0;

  //     doc.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight);
  //     heightLeft -= pageHeight;

  //     while (heightLeft >= 0) {
  //       position = heightLeft - imgHeight;
  //       doc.addPage();
  //       doc.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight);
  //       heightLeft -= pageHeight;
  //     }
  //     doc.save( 'file.pdf');
  //     window.close();
  //   });
  // }

}
