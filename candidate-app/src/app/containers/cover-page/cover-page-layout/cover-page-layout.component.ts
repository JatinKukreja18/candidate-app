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
      
    };

  }

}
