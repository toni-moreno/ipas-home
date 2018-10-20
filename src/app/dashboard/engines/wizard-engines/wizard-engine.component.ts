import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


export interface Engine {
  name: string;
  type: string;
}

export interface ProductProperties {
  gather: string; 
  visual: string;
  alert: string;
}

/**
 * @title Stepper overview
 */
@Component({
  selector: 'app-engine-wizard',
  templateUrl: './wizard-engine.component.html',
  styleUrls: ['./wizard-engine.component.css']
})

export class WizardEngineComponent implements OnInit {
  isLinear = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  engines: Engine[] = [
    {name: 'SNMP', type: 'snmpcollector'},
    {name: 'Telegraf', type: 'telegraf'},
    {name: 'SQLCollector', type: 'sqlcollector'}
  ];

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      name: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      engine: ['', Validators.required],
      skip: ['false', Validators.required]
    });
  }

  
}

