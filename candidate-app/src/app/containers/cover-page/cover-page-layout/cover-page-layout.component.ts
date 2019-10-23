import { Component, OnInit, AfterViewChecked, AfterViewInit } from '@angular/core';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import FileSaver from 'file-saver';
import domtoimage from 'dom-to-image';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cover-page-layout',
  templateUrl: './cover-page-layout.component.html',
  styleUrls: ['./cover-page-layout.component.scss']
})
export class CoverPageLayoutComponent implements OnInit, AfterViewInit {

  candidateData = {};
  companyName = 'Cognixia';
  exporting = false;

  constructor( private activatedRoute: ActivatedRoute ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (params && params.export) {
        this.exporting = true;
      }
    });

    this.candidateData = {
      name: 'John Willis',
      role: 'Software Developer',
      contact: '9988776655',
      email: 'johnwillis@abc.com',
      socialLinks: [
        {
          site: 'LinkedIn',
          link: '',
          icon: 'fa-linkedin-square'
        },
        {
          site: 'Github',
          link: '',
          icon: 'fa-github'
        },
        {
          site: 'Resume',
          link: '',
          icon: 'fa-id-card'
        },
      ],
      mainSkills: [
        {
          skill: 'java',
          rating: 7,
          iconPath: '../../../assets/images/java-logo.png',
          months: '22'
        },
        {
          skill: 'sql',
          rating: 5,
          iconPath: '../../../assets/images/sql-logo.png',
          months: '11'
        },
        {
          skill: 'java',
          rating: 4,
          iconPath: '../../../assets/images/java-logo.png',
          months: '4'
        },
        {
          skill: 'sql',
          rating: 9,
          iconPath: '../../../assets/images/sql-logo.png',
          months: '11'
        },
        {
          skill: 'java',
          rating: 6,
          iconPath: '../../../assets/images/java-logo.png',
          months: '5'
        }
      ],
      additionalSkills: [
        {
          skill: 'java',
          rating: 7,
          iconPath: '../../../assets/images/java-logo.png',
          months: '22'
        },
        {
          skill: 'sql',
          rating: 5,
          iconPath: '../../../assets/images/sql-logo.png',
          months: '11'
        },
        {
          skill: 'java',
          rating: 4,
          iconPath: '../../../assets/images/java-logo.png',
          months: '4'
        },
        {
          skill: 'sql',
          rating: 9,
          iconPath: '../../../assets/images/sql-logo.png',
          months: '11'
        },
        {
          skill: 'java',
          rating: 6,
          iconPath: '../../../assets/images/java-logo.png',
          months: '5'
        }
      ],
      trainings: [
        'Animation Design',
        'Information Architecture',
        'Interaction Design',
        'User Research',
        'Interaction Design',
        'User Research'
      ],
      feedback: 'John put a focus on Java where he completed an EMS application build out that highlighted her web service and SQL skills.',
      personalSummary: `As a Computer Science graduate I became comfortable with Object Oriented Programming
                        Concepts and programming languages such as Java and SQL. After undergoing the Jump
                        Program, I have been able to improve my expertise in those technologies and have become
                        proficient in Web Services, Spring Boot, React, MONGODB and Rabbit MQ. As a Computer
                        Science graduate I became comfortable with Object Oriented Programming Concepts and
                        programming languages such as Java and SQL. `,
      additionalProjects: [
        {
          name: 'Movie Theatre Seating',
          keyPoints: [
            'Java based project to display and set seating in a GUI application',
            'GUI was built of the Swing library'
          ]
        },
        {
          name: 'Food Ordering App',
          keyPoints: [
            'Java based project to display and set seating in a GUI application',
            'GUI was built of the Swing library'
          ]
        }
      ],
      educations: [
        {
          title: 'Lamar University',
          year: '2017',
          achievements: [
            {
              type: 'Major',
              name: 'Bachelor of Computer Science'
            },


          ]
        },
        {
          title: 'CDEC Institute',
          year: '2017',
          achievements: [
            {
              type: 'Certificate',
              name: 'Multimedia Sciences & Graphics'
            },
          ]
        }
      ]

    };

  }

  ngAfterViewInit() {
    if(this.exporting){
      setTimeout(this.captureScreen.bind(this), 200);
      //this.captureScreen();
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
      //FileSaver.saveAs(contentDataURL, 'my-pdfimage.png');
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
      doc.save( 'file.pdf');
      window.close();
    });

  }

}
