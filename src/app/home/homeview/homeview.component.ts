import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { User } from '../../../assets/interfaces';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-homeview',
  templateUrl: './homeview.component.html',
  styleUrls: ['./homeview.component.css']
})
export class HomeviewComponent implements OnInit, OnDestroy {

  public userLevel = 'default';
  public userIsAuthenticated = false;
  public user: User;
  public authStatusSub: Subscription;

  constructor(private authService: AuthService) {
    console.log('Homeview constructor running');
  }

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userLevel = this.authService.getUserLevel();
    this.user = this.authService.getLocalUserVar();

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuth => {
          console.log('isAuth: ' + isAuth);
          this.userIsAuthenticated = isAuth;
          this.userLevel = this.authService.getUserLevel();
    });

    /*********************



    **********************/




}

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }




}
