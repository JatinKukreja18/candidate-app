import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cover-page-layout',
  templateUrl: './cover-page-layout.component.html',
  styleUrls: ['./cover-page-layout.component.scss']
})
export class CoverPageLayoutComponent implements OnInit {

  candidateData = {};
  companyName = 'Cognixia';

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
        },
        {
          skill: 'sql',
          rating: 2,
          iconPath: '../../../assets/images/sql-logo.png',
          months: '3'
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
        },
        {
          skill: 'sql',
          rating: 2,
          iconPath: '../../../assets/images/sql-logo.png',
          months: '3'
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

}
