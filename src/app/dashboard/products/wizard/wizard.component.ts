import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { EngineSNMPParams } from './wizard.data';
import { WizardService } from './wizard.service';
import { DialogParamsComponent } from '../../../shared/dialogparams/dialogparams.component'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import * as _ from 'yamljs';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  providers: [WizardService],
  styleUrls: ['./wizard.component.css']
})

export class WizardComponent implements OnInit {

  fileArray = {
    gather: [],
    visual: [],
    alert: []
  }

  isLinear : boolean = false;
  allowCustomParams  : boolean = false;
  showDebug : boolean = false
  productFormGroup: any;

  gather_engines: EngineElement[] = [
    { name: 'SNMP', type: 'snmpcollector' },
    { name: 'Telegraf', type: 'telegraf' },
    { name: 'External', type: 'external' }
  ];

  visual_engines: EngineElement[] = [
    { name: 'Grafana', type: 'grafana' },
  ];

  alert_engines: EngineElement[] = [
    { name: 'Resistor', type: 'resistor' }
  ];


  available_engines = [
    {'id': 'gather', 'desc': 'Gather', 'data': this.gather_engines},
    {'id': 'visual', 'desc': 'Visual', 'data': this.visual_engines},
    {'id': 'alert', 'desc': 'Alert', 'data': this.alert_engines},
  ]

  constructor(private _formBuilder: FormBuilder, public wizardService: WizardService, public dialog: MatDialog) { }

  //Set core config vars as formarrays, it will be easier to go over them

  get gather(): FormArray { return this.productFormGroup.get('gather') as FormArray; }
  get visual(): FormArray { return this.productFormGroup.get('visual') as FormArray; }
  get alert(): FormArray { return this.productFormGroup.get('alert') as FormArray; }

  ngOnInit() {
    //Initial Form
    this.productFormGroup = this._formBuilder.group({
      product: "",
      models: "",
      description: '',
      gather: new FormArray([]),
      visual: new FormArray([]),
      alert: new FormArray([])
    })
  }

  /* *****************/
  /* ENGINE SECTION  */
  /* *****************/

  //Generic function to add a engine on every step - 'gather',  'visual', 'alert'
  addEngine(step: string, engine: string) {
    if (engine != 'external') {
      if (!this.productFormGroup.controls[step].value.find((element) => { console.log(element); return element.engine === engine })) {
        this.fileArray[step].push({config: [[]]})
        switch (step) {
          case 'gather':
            this.gather.push(this.createEngineFormGroup(engine));
            break;
          case 'visual':
            this.visual.push(this.createEngineFormGroup(engine));
            break;
          case 'alert':
            this.alert.push(this.createEngineFormGroup(engine));
            break;
        }
      } else {
        alert('Engine ' + engine + ' is already defined on ' + step)
      }
    }
  }

  //Deletes an engine, it is required the step - 'gather', 'visual', 'alert' and the array index
  deleteEngine(step, i) {
    console.log(step, i);
    this.productFormGroup.controls[step].removeAt(i)
    this.fileArray[step].splice(i,1)
  }

  //Creates a form for each selected engine and creates an initialize the engine
  createEngineFormGroup(t: string): AbstractControl {
    console.log("T")
    return this._formBuilder.group({
      engine: [t, Validators.required],
      config: new FormArray([
        //initialize the engine with empty configuration
        this.createConfigFromEngine(t)
      ])
    });
  }

  //This is just called on the HTML part. This creates a new config for the selected engine
  addConfigEngine(step: string, iengine: number, engine: string) {
    this.productFormGroup.controls[step].controls[iengine].get('config').push(this.createConfigFromEngine(engine))
    this.fileArray[step][iengine].config.push([])

  }

  //Deletes a config engine based on step, i, and  p
  deleteConfigEngine(step: string, iengine: number, iconfig: number) {
    console.log(step, iengine, iconfig);
    this.productFormGroup.controls[step].controls[iengine].controls.config.removeAt(iconfig)
    this.fileArray[step][iengine].config.splice(iconfig,1)
  }

  /* *********************** */
  /* ENGINE CONFIG SECTION   */
  /* *********************** */

  //Creates a for for each configuration with params coming from the engine
  createConfigFromEngine(engine: string): AbstractControl {
    return this._formBuilder.group({
      name: ['', Validators.required],
      models: ['', Validators.required],
      description: ['', Validators.required],
      dir: ['', Validators.required],
      config: new FormArray([]),
      params: new FormGroup(
        {
          'product_params': this.createParamsFromEngine(engine, 'product_params'),
          'platform_params': this.createParamsFromEngine(engine, 'platform_params'),
          'device_params': this.createParamsFromEngine(engine, 'device_params')
        })
    });
  }

  //Creates the specific param section in order to play with params (maybe a product can not have device params)
  createParamsFromEngine(engine: string, sel_params: string): AbstractControl {
    let test = this._formBuilder.array([])
    let myArray = [] || {};
    if (engine === 'snmpcollector') {
     myArray = EngineSNMPParams
    } else {
      this.allowCustomParams = true;
      return new FormControl([]);
     }
    console.log(myArray);
    for (let i of myArray[sel_params]) {
      let p = this._formBuilder.group({})
      for (let k in i) {
        p.addControl(k, new FormControl(i[k]))
      }
      test.push(p);
    }
    return test
  }

  createNewProduct() {
    /*let yamlString = _.stringify(this.productFormGroup.value, 999)
    console.log(yamlString);
    this.wizardService.createNewProduct('http://localhost:4200', _.stringify(this.productFormGroup.value, 999, 2))
      .subscribe(
      data => console.log(data),
      err => console.error(err),
      () => console.log("OK, DONE")
      )
    */
    this.wizardService.uploadFiles('http://localhost:4200/api/rt/gitrepo/commitfile', this.productFormGroup.value, this.fileArray )
    .subscribe( 
      data => console.log(data),
      err => console.error(err),
      () => console.log("OK, DONE")
    )
  }

  /* ********************  */
  /* CONFIG FILES SECTION  */
  /* ********************  */

  addConfig(step: string, iengine: number, iconfig: number) {
    this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.config.push(
      this._formBuilder.group({
        source: [null, Validators.required],
        dest: ['', Validators.required],
      }))

    this.fileArray[step][iengine].config[iconfig].push([])
  }

  removeConfig(step: string, iengine: number, iconfig: number, ifile: number) {
    this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.config.removeAt(ifile)
    this.fileArray[step][iengine].config[iconfig].splice(ifile,1)
  }

  selectFile(event, step, iengine, iconfig, ifile) {
    this.fileArray[step][iengine].config[iconfig][ifile] = event.target.files
  }


  /* *********************  */
  /* CUSTOM PARAMS SECTION  */
  /* *********************  */

  openDialog(step: string, iengine: string, iconfig: string, sel_params: string): void {
    let dialogRef = this.dialog.open(DialogParamsComponent, {
      width: '500px',
      disableClose: true,
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed', result);
        console.log(this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.params)
        let p = this._formBuilder.group({})
        for (let o in result) {
          p.addControl(o, new FormControl(result[o]))
        }
        this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.params.controls[sel_params].push(p)
      }
    });
  }

}

