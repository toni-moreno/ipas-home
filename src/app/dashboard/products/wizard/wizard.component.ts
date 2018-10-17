import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ProductSample }  from '../product.data';


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
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})

export class WizardComponent implements OnInit {
  isLinear = false;
  firstFormGroup: any;
  secondFormGroup: FormGroup;
  thirdFormGroup : FormGroup;

  gather_engines: Engine[] = [
    {name: 'SNMP', type: 'snmpcollector'},/*
    {name: 'Telegraf', type: 'telegraf'},
    {name: 'SQLCollector', type: 'sqlcollector'}*/
  ];

  visual_engines: Engine[] = [
    {name: 'Grafana', type: 'grafana'},
    {name: 'Kibana', type: 'kibana'}
  ];

  alert_engines: Engine[] = [
    {name: 'Resistor', type: 'resistor'}
  ];


  constructor(private _formBuilder: FormBuilder) { }

  get gather(): FormArray { return this.firstFormGroup.get('gather') as FormArray; }
  get visual(): FormArray { return this.firstFormGroup.get('visual') as FormArray; }
  get alert(): FormArray { return this.firstFormGroup.get('alert') as FormArray; }
  

  ngOnInit() {
    //Config intern
    this.thirdFormGroup = this._formBuilder.group({
      name: ['snmpcollector', Validators.required],
      models: ['XXXX-XXXX', Validators.required],
      description: ['', Validators.required],
      dir: ['gather', Validators.required],
      config: ['']
    });

    //Config
    this.secondFormGroup = this._formBuilder.group({
      engine: ['snmpcollector', Validators.required],
      config: new FormArray ([
        this.thirdFormGroup
       ])
    });
    //Gather
    this.firstFormGroup = this._formBuilder.group({
      product: "snmp_cisco_catalyst",
      models: "XXX,XXX,XXX,XXX",
      description: 'My Long Description'
      
    })

    this.firstFormGroup.value = ProductSample 

    console.log(this.firstFormGroup.value);
  }  

  addEngine(step : string, i : string) {
    console.log(step,i);
    console.log(this.firstFormGroup.controls[step])
    if (!this.firstFormGroup.controls[step]) {

      console.log("CREATING NEW - ", step, i)
    this.firstFormGroup.addControl(step,new FormArray ([
      this.createEngineFormGroup(i)
     ]))
    } else {
      if (!this.firstFormGroup.controls[step].get(i)){
      console.log("ADDING NEW - ", step, i)
      this.gather.push(this.createEngineFormGroup(i));
      } else {
        console.log("ALREADY EXIST!")
      }
    }  

    //this.gather.push(this.secondFormGroup); 
    console.log("AFTER:", this.firstFormGroup.value);
    console.log(this.gather.value);
    console.log(this.firstFormGroup)
  }



  addConfigEngine(step : string, i : string) {
    console.log(step,i);
    console.log(this.firstFormGroup.controls[step][i])
    if (!this.firstFormGroup.controls[step][i]) {
      console.log("CREATING NEW - ", step, i)
      console.log(this.firstFormGroup.controls[step])

      this.firstFormGroup.controls[step].controls[i].get('config').push(this.createConfigFromEngine(i);)

      /*this.firstFormGroup.controls[step].controls[i].addControl(step,new FormArray ([
        this.createConfigFromEngine(i)
       ]))*/
    } else {
      console.log("ADDING NEW - ", step, i)
      this.gather.push(this.createConfigFromEngine(i));
    }
  }


  createEngineFormGroup (t : string) : AbstractControl {
    return this._formBuilder.group({
      engine: [t, Validators.required],
      config: new FormArray ([
        this.createConfigFromEngine('s')
       ])
    });
  }


  deleteConfigEngine(step, i, p) {
    console.log(step, i, p);
    this.firstFormGroup.controls[step].controls[i].controls.config.removeAt(p)
    //this.firstFormGroup.controls[step].controls[i].controls.config.controls.removeAt(p)
  }




  createConfigFromEngine (t : string) : AbstractControl {
    return this._formBuilder.group({
      name: ['myconfig', Validators.required],
      models: ['XXXX-XXXX', Validators.required],
      description: ['', Validators.required],
      dir: ['gather', Validators.required],
      config: ['']
    });
  }



}

