import { Component, OnInit, Input } from '@angular/core';
import { AppCardService } from './appcard.service';

@Component({
  selector: 'app-card',
  templateUrl: './appcard.component.html',
  styleUrls: ['./appcard.component.css'],
  providers: [AppCardService],
})
export class AppCardComponent implements OnInit {
  @Input() figurecard: ServiceElement;
  serviceCard: ServiceElement;

  constructor(public appCardService: AppCardService) { }

  ngOnInit() {
    console.log(this.figurecard);
    this.serviceCard = this.figurecard
    this.checkStatus()
  }


  checkStatus() {
    if (this.serviceCard.status.mode === 'ping') {
      this.appCardService.getStatus(this.serviceCard.status.url, this.serviceCard.status.content_type).subscribe(
        data => {
          //TODO: Do something with data?...
          this.serviceCard.status.result = this.validateStatus(this.serviceCard.status.valid_mode, data)
        },
        err => { 
          //TODO: error responses doesn't have the status code... 
          console.log("Error on request: ", err);
          this.serviceCard.status.result = "NOOK" 
        },
        () => console.log("OK")
      )
    }
  }

  validateStatus(valid_mode, data) {
    switch (valid_mode) {
      case 'status':
        if (data['status'] === this.serviceCard.status.valid_value) return "OK"
        else return "NOOK"
      case 'response':
        if (data['response'] !== null) return "OK"
        else return "NOOK"
    }
  }

}
