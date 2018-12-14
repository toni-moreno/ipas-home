import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { LoaderService, LoaderState } from './loader.service';


import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material';

@Component({
  selector: 'angular-loader',
  template: ``
})
export class LoaderComponent implements OnInit {

  show = false;
  message = "";
  type = "success";

  public myAlerts: Array<any> = [];

  private subscription: Subscription;
  public alertExpanded: any = false;

  public config = new MatSnackBarConfig();



  constructor(
    private loaderService: LoaderService, public snackBar: MatSnackBar
  ) { }


  addExtraClass: boolean = false;


  open(state, message) {
    let config = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    config.horizontalPosition = 'end';
    config.duration = 5000;
    config.extraClasses = ['dangeralert'];
    config.panelClass = ['dangeralert'];
    console.log("MESSAGE",state);
    this.snackBar.open(state['_body'], 'x', config);
  }

  ngOnInit() {
    this.subscription = this.loaderService.loaderState
      .subscribe((state: LoaderState) => {
        console.log("STATE", state);
        this.show = state.show;
        if (state.message) {
          this.message = state.message;
          this.type = state.type;
          this.myAlerts.push({ 'message': state.message, 'type': state.type });
          console.log(this.myAlerts);
          this.open(state.message, 'OK')
        }

      });
  }

  ExpandAlerts() {
    this.alertExpanded = !this.alertExpanded;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
