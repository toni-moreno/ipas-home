import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomeItems } from './home.data';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HomeService } from './home.service';
import { Subscription } from 'rxjs/Subscription'

@Component({
  selector: 'app-home',
  providers: [HomeService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, OnDestroy {

  private subscriber: Subscription;

  myComponents: ServiceElement[];
  constructor(public homeService: HomeService) {
  }

  ngOnInit() {
    //Retrieve all available services
    this.subscriber = this.homeService.getServices('/api/cfg/services/')
      .subscribe(
      (data: ServiceElement[]) => { this.myComponents = data; console.log(data) },
      (err) => { console.error(err) },
      () => console.log("DONE")
      )
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}
