import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-figurecard',
  templateUrl: './figurecard.component.html',
  styleUrls: ['./figurecard.component.css']
})
export class FigurecardComponent implements OnInit {
  @Input() headerIcon: string;
  @Input() status: string;
  @Input() title: string;
  @Input() description: string;
  @Input() footerIcon: string;
  @Input() footContent: string;
  @Input() linearColor: string;
  constructor() { }

  ngOnInit() {
    
  }

}
