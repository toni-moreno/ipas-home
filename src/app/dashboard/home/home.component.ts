import { Component, OnInit } from '@angular/core';
import { HomeItems } from './home.data';
import { HomeService } from './home.service'
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  providers: [HomeService],
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  
  myComponents : ServiceSection[];
  constructor(public myservice: HomeService) {
  }

  ngOnInit() {
    this.myComponents = HomeItems;
  }
}
