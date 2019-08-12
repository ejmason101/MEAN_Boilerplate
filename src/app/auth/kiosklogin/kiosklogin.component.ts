import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-kiosklogin',
  templateUrl: './kiosklogin.component.html',
  styleUrls: ['./kiosklogin.component.css']
})
export class KioskloginComponent implements OnInit {

  isLoading = false;

  constructor() { }

  ngOnInit() {
  }

  onSubmitID() {
    console.log('onSubmitID()');
  }

}
