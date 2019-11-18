import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { AuthenticationService, SearchJobService, NotificationsService } from '@app/core';
// import { SwUpdate } from '@angular/service-worker';

// declare ga as a function to set and sent the events
// declare let ga: Function;
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  sideMenu = false;
  showHeader = true;
  currentActivePage: string = '';
  fixPageHeight = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private searchJobService: SearchJobService,
    private notificationService: NotificationsService,
    // private swUpdate: SwUpdate
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.authService.getAccessToken()) {
          this.showHeader = true;
          if (event.url == '/' || event.url == '/forgotpassword') {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.showHeader = false;
        }
        this.notificationService.refreshNotificationCounts.next(true);
      }
      if (event instanceof NavigationEnd) {
        this.sideMenu = false;
        this.toggleHeader(event.url);
        this.updateHeaderTitle(event.url);
        this.clearSearchJobSession(event.url);
        this.updatePageheight(event.url);
        this.updateRouteHistory(event.url);
        this.updateSearchPageRouteHistory(event.url);
        gtag('config', 'UA-134869289-1', {
          'page_title' : event.urlAfterRedirects.split('/')[1],
          'page_path': event.urlAfterRedirects.split('?')[0]
        });
      }
    });
    // this.swUpdate.available.subscribe(event => {
    //   this.swUpdate.checkForUpdate();
    //   this.swUpdate.activateUpdate().then(() => {
    //     document.location.reload();
    //   });
    // });
  }

  /**
   * Update header page title
   * @param url current page url
   */
  updateHeaderTitle(url: string) {
    let currentUrlSegments = url.split('/');
    let currentUrl = currentUrlSegments[currentUrlSegments.length - 1];
    if (currentUrl.includes('?')) {
      currentUrl = currentUrl.split('?')[0];
    }
    switch(currentUrl) {
      case 'search': this.currentActivePage = 'Search Jobs';
        break;
      case 'dashboard': this.currentActivePage = 'Dashboard';
        break;
      case 'aboutus': this.currentActivePage = 'About Us';
        break;
      case 'faq': this.currentActivePage = 'FAQ';
        break;
      case 'results': this.currentActivePage = 'Search Results';
        break;
      case 'settings': this.currentActivePage = 'Settings';
        break;
      case 'profile': this.currentActivePage = 'My Profile';
        break;
      case 'assessments': this.currentActivePage = 'Assessments';
        break;
      case 'myjobs': this.currentActivePage = 'My Jobs';
        break;
      default: this.currentActivePage = '';
        break;
    }
  }

  /**
   * Toggle header based on the url
   * @param currentUrl current active url
   */
  toggleHeader(currentUrl: string) {
    let showHeaderRegex = new RegExp('(dashboard|profile|settings|aboutus|assessments|myjobs|search)', 'i');
    let hideHeaderRegex = new RegExp('(forgotpassword|search/results|search/details|notification|dashboard/job|search/matching|myjobs/schedule|job/preinterview|/smartprofile)', 'i');
    if (currentUrl && showHeaderRegex.test(currentUrl)) {
      this.showHeader = true;
    }
    if (currentUrl && hideHeaderRegex.test(currentUrl)) {
      this.showHeader = false;
    }
  }

  /**
   * Toggle Side menu
   */
  toggleSidemenu() {
    this.sideMenu = !this.sideMenu;
  }

  /**
   * Clear search results
   * @param currentUrl
   */
  clearSearchJobSession(currentUrl) {
    let clearSessionRegex = new RegExp('(search/details|job/preinterview|schedule)', 'i');
    if (currentUrl && !clearSessionRegex.test(currentUrl)) {
      this.searchJobService.removeJobResultSession();
    }
  }

  /**
   * Update the page height
   * @param currentUrl
   */
  updatePageheight(currentUrl) {
    let clearSessionRegex = new RegExp('(myjobs|search/details)', 'i');
    if (currentUrl && clearSessionRegex.test(currentUrl)) {
      document.querySelector(".page-content").classList.add('fix-height');
    } else {
      document.querySelector(".page-content").classList.remove('fix-height');
    }
  }

  /**
   * Create/Update navigation history without query params
   * @param currentUrl current route url
   */
  updateRouteHistory(currentUrl: string) {
    let routeHistory: string[] = this.authService.routeHistory() ? this.authService.routeHistory() : [];
    if (routeHistory[routeHistory.length - 1] != currentUrl.split('?')[0]) {
      let notUsedRoutes = new RegExp('(search/results|search/details|search/matching|job/preinterview)', 'i');
      if (!notUsedRoutes.test(currentUrl)) {
        routeHistory.push(currentUrl.split('?')[0]);
      }
    }
    this.authService.routeHistory(routeHistory);
  }

  /**
   * Create/Update navigation history only for Search pages without query params
   * @param currentUrl current route url
   */
  updateSearchPageRouteHistory(currentUrl: string) {
    let routeHistory: string[] = this.authService.searchPageRouteHistory() ? this.authService.searchPageRouteHistory() : [];
    if (routeHistory[routeHistory.length - 1] != currentUrl.split('?')[0]) {
      let usedRoutes = new RegExp('(search/results|search/details|search/matching|dashboard/job)', 'i');
      if (usedRoutes.test(currentUrl)) {
        routeHistory.push(currentUrl.split('?')[0]);
      }
    }
    this.authService.searchPageRouteHistory(routeHistory);
  }

}
