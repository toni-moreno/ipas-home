import { Component, OnInit, Input } from '@angular/core';
import { AppCardService } from './appcard.service';

@Component({
  selector: 'app-card',
  templateUrl: './appcard.component.html',
  styleUrls: ['./appcard.component.css'],
  providers: [AppCardService],
})
export class AppCardComponent implements OnInit {
  @Input() serviceCard: ServiceElement;
  figureCard: any;

  constructor(private appCardService: AppCardService) { }

  ngOnInit() {
    this.figureCard = this.serviceCard;
    this.appCardService.pingService('/api/cfg/services/ping/' + this.serviceCard.ID)
      .subscribe(
      (data: StatusCard) => { this.figureCard.Result = data },
      (err) => console.log(err),
      () => console.log("DONE")
      )
    console.log(this.serviceCard)
  }
}