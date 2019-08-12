import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeviewComponent } from './homeview/homeview.component';
import { AngularMaterialModule } from '../angular-material.module';
import { FormsModule } from '@angular/forms';
import { AuthModule } from '../auth/auth.module';
import { HomeRoutingModule } from './home.routing';

@NgModule({
  declarations: [HomeviewComponent],
  imports: [
    CommonModule,
    AngularMaterialModule,
    FormsModule,
    AuthModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
