import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService, JobService, ProfileService, AnalyticsService } from '@app/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationMessages, FeedbackMessages } from '@app/core/messages';

@Component({
  selector: 'app-smart-header',
  templateUrl: './smart-header.component.html',
  styleUrls: ['./smart-header.component.scss']
})
export class SmartHeaderComponent implements OnInit {
  
  construtor(){
    
  }

  ngOnInit(){
    
  }
}
