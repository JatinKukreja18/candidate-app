import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NotificationsService, AuthenticationService, AnalyticsService } from '@app/core';

@Component({
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.scss']
})
export class CommonHeaderComponent implements OnInit {
  sideMenu = false;
  showHeader;
  notificationsCount: number = 0;
  @Input() pageTitle: string; // Input title for page
  @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  
  constructor(
    private notificationService: NotificationsService,
    private authService: AuthenticationService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    if (this.authService.getAccessToken()) {
      this.getNotificationCount();
    }
    this.notificationService.refreshNotificationCounts.subscribe(isRefresh => {
      if (isRefresh && this.authService.getAccessToken()) {
        this.getNotificationCount();
        this.notificationService.refreshNotificationCounts.next(false);
      }
    });
  }

  /**
   * Toggle the side menu
   */
  toggleSidebar() {
    this.sideMenu = !this.sideMenu;
    this.toggle.emit(this.sideMenu);
  }
  
  /**
   * Fetch the count of unread notification
   */
  getNotificationCount() {
    this.notificationService.getNotificationCount().subscribe(response => {
      if(response && response.code === 200 && response.data) this.notificationsCount = response.data['notificationCount'];
    });
  }

  /**
   * Open navigation page
   */
  openNavigationPage() {
    this.analyticsService.eventEmitter('DashBoardScreen', 'dashBoardNotificationIcon', 'dashBoardNotificationIcon');
  }

}
