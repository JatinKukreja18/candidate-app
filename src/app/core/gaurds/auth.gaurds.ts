import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGaurd implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    canActivate(route: ActivatedRouteSnapshot) {
        const currentUser = this.authenticationService.loggedInUserValue;
        if (currentUser) {
            return true;
        }

        this.router.navigateByUrl('/');
        return false;
    }
}
