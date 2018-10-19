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
  serviceCard : ServiceElement; 

  constructor(public appCardService: AppCardService) { }

  ngOnInit() {
    console.log(this.figurecard);
    this.serviceCard = this.figurecard
    this.checkStatus()
  }


  checkStatus() { 
    if (this.serviceCard.status.mode === 'ping') {
      this.appCardService.getStatus(this.serviceCard.status.url).subscribe(
        data => {
            if (this.serviceCard.status.valid === null) { 
              this.serviceCard.status.result = "OK"
            }
        },
        err => {console.log(err); this.serviceCard.status.result = "NOOK"},
        ()=> console.log("OK")   
      ) 
    }
    if (this.serviceCard.status.mode === 'authping') {
        console.log("IN")
        this.appCardService.getStatus(this.serviceCard.status.url).subscribe(
          data => {
              if (this.serviceCard.status.valid === null) { 
                this.serviceCard.status.resultt = "OK"
              }
          },
          err => {console.log(err)},
          ()=> console.log("OK")   
        ) 
    }
  }

  
  
 /*   checkStatus(t : any, i: any) { 
      let p=this.myComponents[i]['content'][t].status
      console.log(p);
      if (p.mode === 'ping') {
        this.myservice.getStatus(this.myComponents[i]['content'][t].status.url).subscribe(
          data => {
              if (p.valid === null) { 
                this.myComponents[i]['content'][t].status.result = "OK"
                console.log(this.myComponents[i]['content'][t].status);
              }
          },
          err => {console.log(err); this.myComponents[i]['content'][t].status.result = "NOOK"},
          ()=> console.log("OK")   
        ) 
      }
      if (p.mode === 'authping') {
          console.log("IN")
          this.myservice.getStatus(this.myComponents[i]['content'][t].status.url).subscribe(
            data => {
                if (p.valid === null) { 
                console.log("PEPE",this.myComponents[i]['content'][t])
                this.myComponents[i]['content'][t].status.result = "OK"
                console.log(this.myComponents[i]['content'][t].status);
                }
            },
            err => {console.log(err)},
            ()=> console.log("OK")   
          ) 
      }
    }

    */
}
