import { Component, OnInit } from '@angular/core';
import { HomeItems } from './home.data';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  
  myComponents : ServiceSection[];
  constructor() {
  }

  ngOnInit() {
    this.myComponents = HomeItems;
  }
}
