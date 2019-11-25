import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthenticationService, ProfileService, FeedbackMessages, AnalyticsService } from '@app/core';
import { AuthService } from 'angularx-social-login';
import { NzMessageService } from 'ng-zorro-antd';
import { environment } from '@env/environment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-common-sidemenu',
  templateUrl: './common-sidemenu.component.html',
  styleUrls: ['./common-sidemenu.component.scss']
})
export class CommonSidemenuComponent implements OnInit {
  currentUserDetails: any;
  socialUserDetails: any;
    
  @Input() open: boolean;
  @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  isVisible: boolean;
  showShareAppModal = false;
  showLogoutConfirmationModal = false;
  rating: number = 0;
  comment: string = '';
  // shareLink: string;
  // sideMenu = false;
  shareLink: {
    facebook: string,
    twitter: string,
    linkedin: string,
    email: string
  } = {
    facebook: '',
    twitter: '',
    linkedin: '',
    email: ''
  }
  editProfileLink: Array<string>;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private socialAuthService: AuthService,
    private profileService: ProfileService,
    private message: NzMessageService,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit() {
    let title = 'ClickSource%20Candidate%20App'
    this.shareLink = {
      facebook: `https://facebook.com/sharer/sharer.php?u=${environment.shareappUrl}`,
      twitter: `https://twitter.com/intent/tweet/?text=${title}&url=${environment.shareappUrl}`,
      email: `mailto:?subject=${title}&body=${environment.shareappUrl}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${environment.shareappUrl}&summary=${title}&source=${environment.shareappUrl}` 
    }
    this.authService.currentUserSubject.subscribe((userDetails) => {
      if (userDetails) {
        if (userDetails.candidateProfile) this.currentUserDetails = userDetails.candidateProfile;
        else this.socialUserDetails = userDetails.socialProfileDetails;
      }
    });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event:NavigationEnd) => {
      if (event.url) {
        const id = event.url.split('/')[2];
        this.editProfileLink = [`profile/edit-change/${id}`];
      }
    });
  }

  /**
   * Get the User's details from the API
   */
  getUserDetails() {
    this.authService.getUserDetails().subscribe((response)=>{
      if (response.code && response.code === 200) {
        this.currentUserDetails = response.data;
      }
    });
  }

  /**
   * Show/hide Side menu
   */
  toggleSideMenu(page: number) {
    switch(page) {
      case 1: this.analyticsService.eventEmitter('DashBoardScreen', 'menuDashboard', 'menuDashboard');
        break;
      case 2: this.analyticsService.eventEmitter('DashBoardScreen', 'menuSearchJobs', 'menuSearchJobs');
        break;
      case 3: this.analyticsService.eventEmitter('DashBoardScreen', 'menuMatchingJobs', 'menuMatchingJobs');
        break;
      case 4: this.analyticsService.eventEmitter('DashBoardScreen', 'menuMyJobs', 'menuMyJobs');
        break;
      case 5: this.analyticsService.eventEmitter('DashBoardScreen', 'menuAssessments', 'menuAssessments');
        break;
      case 6: this.analyticsService.eventEmitter('DashBoardScreen', 'menuProfile', 'menuProfile');
        break;
      case 7: this.analyticsService.eventEmitter('DashBoardScreen', 'menuSettings', 'menuSettings');
        break;
      case 8: this.analyticsService.eventEmitter('DashBoardScreen', 'menuAboutUs', 'menuAboutUs');
        break;
    }
    this.toggle.emit(false);
  }

  /** 
   * Show Modal
  */
  showModal(): void {
    this.analyticsService.eventEmitter('DashBoardScreen', 'menuFeedback', 'menuFeedback');
    this.isVisible = true;
  }

  /**
   * Open Share app Modal
   */
  openShareModal(){
    this.analyticsService.eventEmitter('DashBoardScreen', 'menuShareApp', 'menuShareApp');
    this.showShareAppModal = true;
  }

  /**
   * Open Logout confirmation modal
   */
  openLogoutConfirmationModal() {
    this.showLogoutConfirmationModal = true;
  }

  /**
   * Make the API request to logout API and redirect to landing page if success
   */
  logout(){
    const loading = this.message.loading(FeedbackMessages.loading.Logout, {nzDuration: 0}).messageId;
    this.authService.logout().subscribe((response) => {
      this.message.remove(loading);
      if (response.code === 200) {
        this.socialAuthService.signOut().then((res) => {
        }).catch((error) => {
          console.log("Not logged in using social", error);
        });
        this.message.success(response.message, {nzDuration: 1500});
        this.analyticsService.eventEmitter('DashBoardScreen', 'menuLogout', 'menuLogout');
        this.router.navigateByUrl('/');
        window.location.reload();
      };
    }, (err) => {
      console.log("Error while logging out!");
      this.message.remove(loading);
    });
  }

  /** 
  * Close Modal
  */
  handleOk(): void {  
    this.profileService.shareFeedback(this.rating, this.comment).subscribe((response) => {
      if (response && response.code === 200) {
        this.isVisible = false;
        this.rating = 0;
        this.comment = "";
        this.analyticsService.eventEmitter('RateAppScreen', 'RateApp', 'RateApp');
        this.message.success(response.message, {nzDuration: 1500});
      }
    });
  }

  /**
   * Hide modal on click outside the modal
   */
  handleCancel() {
    this.isVisible = false;
    this.showShareAppModal = false;
  }

  /**
   * Handle cancel of logout confirmation modal
   */
  handleLogoutCancel() {
    this.showLogoutConfirmationModal = false;
  }

  /**
   * Handle confirm of logout confirmation modal
   */
  handleLogoutOk() {
    this.logout();
    this.showLogoutConfirmationModal = false;
  }

  /**
   * Update property on rating change
   * @param value Number value to be updated
   */
  onRateChange(value: number) {
    this.rating = value;
  }
}
