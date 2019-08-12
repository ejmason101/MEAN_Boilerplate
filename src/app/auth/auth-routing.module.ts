import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { KioskloginComponent } from './kiosklogin/kiosklogin.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'resetpassword', component: LoginComponent }, // Added redirect to login page if no uid is passed
  { path: 'resetpassword/:id', component: ResetpasswordComponent },
  { path: 'kioskLogin', component: KioskloginComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
