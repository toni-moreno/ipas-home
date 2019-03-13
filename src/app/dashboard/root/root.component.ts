import { Component, OnInit, OnDestroy } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css']
})
export class RootComponent implements OnInit, OnDestroy {
  public id: number;
  public backgroundColor: string;
  public version: any;
  public subscriber : Subscription;

  constructor(public settingService: SettingsService, private router :  Router) {
    this.subscriber = this.settingService.getVersion()
    .subscribe(
      (data) => {
        console.log(data);
        this.version = data},
      (err) => {
        console.log(err),
        this.router.navigate(['/login']);
      },
      () => console.log("DONE")
    );
    this.id = settingService.getSidebarImageIndex() + 1;
    this.backgroundColor = settingService.getSidebarColor();
  }

  ngOnInit() {
   
  }
  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}
