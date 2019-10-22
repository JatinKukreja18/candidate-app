import { Component, OnInit } from '@angular/core';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import FileSaver from 'file-saver';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-cover-page-layout',
  templateUrl: './cover-page-layout.component.html',
  styleUrls: ['./cover-page-layout.component.scss']
})
export class CoverPageLayoutComponent implements OnInit {

  candidateData = {};
  companyName = 'Cognixia';
  exporting = false;

  constructor() { }

  ngOnInit() {
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

  captureScreen() {
    this.exporting = true;
    const page = document.getElementById('cover-page');
    html2canvas(page, { y:0, height: page.offsetHeight}).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/jpeg');
      var dataHeight = page.offsetHeight;
      var imgWidth = 210; 
      var pageHeight = 300;  
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var heightLeft = imgHeight;
      //FileSaver.saveAs(contentDataURL, 'my-pdfimage.png');
      var doc = new jspdf('p', 'mm', 'a4');
      var position = 0;

      doc.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight, );
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(contentDataURL, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      doc.save( 'file.pdf');
    });
    
    // html2canvas(data).then(canvas => {
      // Few necessary setting options
      // var imgWidth = 208;
      // var pageHeight = 500;
      // var imgHeight = canvas.height * imgWidth / canvas.width;
      // var heightLeft = imgHeight;
      
      //const contentDataURL = canvas.toDataURL('image/png');
      // FileSaver.saveAs(contentDataURL, 'my-pdfimage.png');
      // let pdf = new jspdf('p', 'px', [canvas.width , canvas.height]); // A4 size page of PDF
      // var position = 0; 
      // //pdf.addImage(contentDataURL, 'PNG', 0, position, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight())
      // //pdf.save('MYPdf.pdf'); // Generated PDF
      /*var dataHeight = data.offsetHeight;
      var imgWidth = 210; 
      var pageHeight = 295;  
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var heightLeft = imgHeight;

      var doc = new jspdf('p', 'mm');
      var position = 0;
      const contentDataURL = canvas.toDataURL('image/png');

      doc.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      doc.save( 'file.pdf');*/
   // }); 
    
    // domtoimage.toJpeg(data, { quality: 0.95, width:3000  })
    // .then(function (dataUrl) {
    //     var img = new Image();
    //     img.src = dataUrl;
    //     FileSaver.saveAs(dataUrl, 'my-pdfimage.jpeg');
        /* var doc = new jspdf('p', 'mm');
        var imgWidth = 210; 
      var pageHeight = 295; 
      var imgHeight = 3000 * imgWidth / 1500;
      var heightLeft = imgHeight;
        var position = 0;

      doc.addImage(dataUrl, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(dataUrl, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      doc.save( 'file.pdf'); */
      
    // })
    // .catch(function (error) {
    //     console.error('Oops, something went wrong!', error);
    // });
  }

}
