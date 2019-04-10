import { Component, OnInit, Inject, Input, Output, EventEmitter, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { EngineSNMPParams } from './wizard.data';
import { WizardService } from './wizard.service';
import { DialogParamsComponent } from '../../../shared/dialogparams/dialogparams.component'
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BlockUIService } from '../../../shared/blockui/blockui-service';

import { Observable } from 'rxjs'

import * as _ from 'yamljs';
import * as _lodash from 'lodash';

export interface ExampleTab {
  label: string;
  content: string;
}

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  providers: [WizardService, BlockUIService],
  styleUrls: ['./wizard.component.css']
})

export class WizardComponent implements OnInit {

  @ViewChild('blocker', { read: ViewContainerRef }) container: ViewContainerRef;

  @Input() mode: boolean = true
  @Input() editData: any;
  @Input() stepInfo: any = {
    'productStatus': {
      hasDB: false,
      hasG: false,
      hasV: false,
      hasA: false
    },
    'productData': null,
    'step': null
  }

  @Output() public finishedAction: EventEmitter<any> = new EventEmitter();

  selection = new SelectionModel<Element>(true, []);

  finished: boolean = false;

  lengine = null;

  fileArray = {
    gather: [],
    visual: [],
    alert: []
  }

  fileRemovedArray = {
    gather: [],
    visual: [],
    alert: []
  }

  asyncTabs: Observable<ExampleTab[]>;
  prefTabs: any;


  isLinear: boolean = false;
  allowCustomParams: boolean = false;
  showDebug: boolean = false
  productFormGroup: any;
  platformFormGroup: any;
  platformEngines: any

  gather_engines: EngineElement[] = [
    { name: 'SNMP', type: 'snmpcollector' },
    { name: 'Telegraf', type: 'telegraf' }
  ];

  visual_engines: EngineElement[] = [
    { name: 'Grafana', type: 'grafana' },
  ];

  alert_engines: EngineElement[] = [
    { name: 'Resistor', type: 'resistor' }
  ];

  bool_params = [true, false]
  constructor(private _formBuilder: FormBuilder, public wizardService: WizardService, public dialog: MatDialog, public _blocker: BlockUIService) {
    //Retrive all Platform Engines to have all my devices
  }

  //Set core config vars as formarrays, it will be easier to go over them

  get gather(): FormArray { return this.productFormGroup.get('gather') as FormArray; }
  get visual(): FormArray { return this.productFormGroup.get('visual') as FormArray; }
  get alert(): FormArray { return this.productFormGroup.get('alert') as FormArray; }


  ngOnInit() {

    //Need to retrieve all available services...   

    this.platformFormGroup = this._formBuilder.group({
      productid: "",
      engine: new FormArray([]),
    })

    //Initial Form
    this.productFormGroup = this._formBuilder.group({
      product: this.stepInfo.productData ? this.stepInfo.productData.product : "",
      models: this.stepInfo.productData ? this.stepInfo.productData.models : "",
      description: this.stepInfo.productData ? this.stepInfo.productData.description : ''
    })


    //Load data!
    switch (this.stepInfo.step) {
      case 'gather':
        this.lengine = { 'id': 'gather', 'desc': 'Gather', 'data': this.gather_engines };
        //Creates the gather formArray...
        this.productFormGroup.setControl('gather', new FormArray([]))
        this.loadPlatformParams('g_engines', 'gather');

        //For each engine available, add it!
        for (let i of this.stepInfo.productData.gather) {
          //let test = this.platformEngines.filter((element => element.ID === i)).map((element) => element.EngineID)
          this.addEngine('gather', i.engine)
        }
        this.finished = true;
        break;
      case 'visual':
        this.lengine = { 'id': 'visual', 'desc': 'Visual', 'data': this.visual_engines };
        this.productFormGroup.setControl('visual', new FormArray([]))
        for (let i of this.stepInfo.productData.visual) {
          //let test = this.platformEngines.filter((element => element.ID === i)).map((element) => element.EngineID)
          this.addEngine('visual', i.engine)
        }
        break;
      case 'alert':
        this.lengine = { 'id': 'alert', 'desc': 'Alert', 'data': this.alert_engines };
        this.productFormGroup.setControl('alert', new FormArray([]))
        for (let i of this.stepInfo.productData.alert) {
          //let test = this.platformEngines.filter((element => element.ID === i)).map((element) => element.EngineID)
          this.addEngine('alert', i.engine)
        }
        break;
      default:
        //Request resources case
        this.productFormGroup.setControl('gather', new FormArray([]))
        this.productFormGroup.setControl('visual', new FormArray([]))
        this.productFormGroup.setControl('alert', new FormArray([]))
        break
    }

    //check if its an edit by property mode
    if (this.mode === true) {
      //Load core params:
      this.productFormGroup.controls.product.setValue(this.editData.product)
      this.productFormGroup.models = this.editData.models
    }

  }

  loadPlatformParams(tengines, step) {
    for (let i of this.stepInfo.productStatus[tengines]) {
      //retrieve data from each engine:
      this.wizardService.getPlatformEnginesByID(i)
        .subscribe(
          (data) => {
            let n = this._formBuilder.group({
              'name': data.EngineID,
              'type': step,
              'platform': new FormControl(data)
            })
            this.platformFormGroup.controls.engine.push(n)
          },
          (err) => console.log(err),
          () => console.log("DONE")
        )
    }
  }

  /* *****************/
  /* PLATFORM SECTION  */
  /* *****************/

  addPlatformEngine(step, engine) {
    if (!this.platformFormGroup.controls.engine.value.find((element) => { console.log("ELEMENTTT", element); return element.name === engine })) {
      let t = this._formBuilder.group({
        name: engine,
        type: step
      })
      this.platformFormGroup.controls.engine.push(t)
    }
  }

  deletePlatformEngine(step, iengine) {
    this.platformFormGroup.controls.engine.removeAt(iengine)
  }

  /* *****************/
  /* ENGINE SECTION  */
  /* *****************/

  //Generic function to add a engine on every step - 'gather',  'visual', 'alert'
  addEngine(step: string, engine: string) {
    if (engine != 'external') {
      if (!this.productFormGroup.controls[step].value.find((element) => { console.log(element); return element.engine === engine })) {
        this.fileArray[step].push({ config: [] })
        this.fileRemovedArray[step].push({ config: [] })
        switch (step) {
          case 'gather':
            this.gather.push(this.createEngineFormGroup(engine, step));
            break;
          case 'visual':
            this.visual.push(this.createEngineFormGroup(engine, step));
            break;
          case 'alert':
            this.alert.push(this.createEngineFormGroup(engine, step));
            break;
        }
      }
    }
  }

  //Deletes an engine, it is required the step - 'gather', 'visual', 'alert' and the array index
  deleteEngine(step, i) {
    console.log(step, i);
    this.productFormGroup.controls[step].removeAt(i)
    this.fileArray[step].splice(i, 1)
  }

  //Creates a form for each selected engine and creates an initialize the engine
  createEngineFormGroup(engine_name: string, step: string): AbstractControl {

    //Find if it already exist and extract if there are already cofigs on it!
    let iengine = this.stepInfo.productData[step].findIndex((element) => { return element.engine === engine_name })

    let configs = [];

    //Check if it exist
    if (iengine > -1) {
      if (this.stepInfo.productData[step][iengine].config.length > 0) {
        //Initialize emtpy file arrays

        //Go over all config to load as forms
        for (let kk in this.stepInfo.productData[step][iengine].config) {
          this.fileRemovedArray[step][iengine].config.push([])
          this.fileArray[step][iengine].config.push([])
          configs.push(this.createConfigFromEngine(engine_name, step, this.stepInfo.productData[step][iengine].config[kk]))

          //Load fileArray with existent files
          for (let pp of this.stepInfo.productData[step][iengine].config[kk].config) {
            this.fileArray[step][iengine].config[kk].push({ file: null, type: 'old', name: pp.source, old_name : null, status: 'ok' })
          }
        }
      } else {
        //It doens't exist any configuration on this product, creating a new one
        configs.push(this.createConfigFromEngine(engine_name, step))
      }
    }
    return this._formBuilder.group({
      engine: [engine_name, Validators.required],
      config: new FormArray(configs)
    });
  }

  //This is just called on the HTML part. This creates a new config for the selected engine
  addConfigEngine(step: string, iengine: number, engine: string) {
    this.productFormGroup.controls[step].controls[iengine].get('config').push(this.createConfigFromEngine(engine, step))
    this.fileArray[step][iengine].config.push([])
  }

  //Deletes a config engine based on step, i, and  p
  deleteConfigEngine(step: string, iengine: number, iconfig: number) {
    console.log(step, iengine, iconfig);

    this.productFormGroup.controls[step].controls[iengine].controls.config.removeAt(iconfig)
    //Need to delte all upload files... so needs to move all!

    for (let ifile in this.fileArray[step][iengine].config[iconfig]) {
      if (this.fileArray[step][iengine].config[iconfig][ifile].type === 'old') {
        this.fileArray[step][iengine].config[iconfig][ifile].status = 'removed';
        //If has been changed, recover its original name:
        if (this.fileArray[step][iengine].config[iconfig][ifile].old_name) {
          this.fileArray[step][iengine].config[iconfig][ifile].name = this.fileArray[step][iengine].config[iconfig][ifile].old_name;
        }
        this.fileArray[step][iengine].config[iconfig][ifile].file = null;
        this.fileRemovedArray[step][iengine].config[iconfig].push(this.fileArray[step][iengine].config[iconfig][ifile]);
      }
    }
    this.fileArray[step][iengine].config.splice(iconfig, 1)
  }

  loadconfigFiles(config): AbstractControl {
    let file_config = new FormArray([]);
    //Go over all configs
    for (let i of config.config) {
      file_config.push(this._formBuilder.group({
        source: [i.source, Validators.required],
        dest: [i.dest, Validators.required],
      }))
    }
    return file_config
  }

  /* *********************** */
  /* ENGINE CONFIG SECTION   */
  /* *********************** */

  //Creates a for for each configuration with params coming from the engine
  createConfigFromEngine(engine: string, step: string, config?: any): AbstractControl {

    //Add logic to  load data in order it exists

    return this._formBuilder.group({
      id: [config ? config.id : '', Validators.required],
      label: [config ? config.label : '', Validators.required],
      models: [config ? config.models : '', Validators.required],
      description: [config ? config.description : '', Validators.required],
      dir: [step, Validators.required],
      config: config ? this.loadconfigFiles(config) : new FormArray([]),
      params: new FormGroup(
        {
          'product_params': this.createParamsFromEngine(engine, 'product_params', config ? config.params : null),
          'platform_params': this.createParamsFromEngine(engine, 'platform_params', config ? config.params : null),
          'device_params': this.createParamsFromEngine(engine, 'device_params', config ? config.params : null)
        })
    });
  }

  //Creates the specific param section in order to play with params (maybe a product can not have device params)
  createParamsFromEngine(engine: string, sel_params: string, loaded_params?): AbstractControl {
    let paramArray = this._formBuilder.array([])
    let tempArray = [] || {};

    if (engine === 'snmpcollector') {
      tempArray = EngineSNMPParams
    } else if (engine === 'telegraf') {
      this.allowCustomParams = true;
    }
    if (loaded_params) {
      tempArray = loaded_params;
    }

    if (tempArray[sel_params]) {
      for (let param of tempArray[sel_params]) {
        let tempParam = this._formBuilder.group({})
        for (let entry in param) {
          tempParam.addControl(entry, new FormControl(param[entry]))
        }
        paramArray.push(tempParam);
      }
    }
    return paramArray
  }

  /* ********************  */
  /* CONFIG FILES SECTION  */
  /* ********************  */

  addConfig(step: string, iengine: number, iconfig: number) {
    this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.config.push(
      this._formBuilder.group({
        source: [null, Validators.required],
        dest: [''],
      }))

    this.fileArray[step][iengine].config[iconfig].push({file: null, type: 'new', name: null, old_name : null, status: 'ok' })
  }

  removeConfig(step: string, iengine: number, iconfig: number, ifile: number) {
    //Ensure that on final product.yml the entry won't exist
    //this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.config.controls[ifile].result = 'removed'
    this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.config.removeAt(ifile)
    //Check logic depending on type and status
    if (this.fileArray[step][iengine].config[iconfig][ifile].type === 'old') {
      this.fileArray[step][iengine].config[iconfig][ifile].status = 'removed';
      //If has been changed, recover its original name:
      if (this.fileArray[step][iengine].config[iconfig][ifile].old_name) {
        this.fileArray[step][iengine].config[iconfig][ifile].name = this.fileArray[step][iengine].config[iconfig][ifile].old_name;
      }
      this.fileArray[step][iengine].config[iconfig][ifile].file = null;
      this.fileRemovedArray[step][iengine].config[iconfig].push(this.fileArray[step][iengine].config[iconfig][ifile]);
    }
    this.fileArray[step][iengine].config[iconfig].splice(ifile, 1)
  }

  selectFile(event, step, iengine, iconfig, ifile) {
    if (event.target.files.length > 0) {
      if (this.fileArray[step][iengine].config[iconfig][ifile].type === 'old') {
        this.fileArray[step][iengine].config[iconfig][ifile].file = event.target.files
        console.log("Changing old filename for the new one...")
        this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.config.controls[ifile].controls.source.setValue(event.target.files[0].name)
        this.fileArray[step][iengine].config[iconfig][ifile].type = 'old';
        if (!this.fileArray[step][iengine].config[iconfig][ifile].old_name) {
          this.fileArray[step][iengine].config[iconfig][ifile].old_name = this.fileArray[step][iengine].config[iconfig][ifile].name
        }
        this.fileArray[step][iengine].config[iconfig][ifile].status = 'moved';
        this.fileArray[step][iengine].config[iconfig][ifile].name = event.target.files[0].name;
      } else {
        this.fileArray[step][iengine].config[iconfig][ifile].file = event.target.files
        this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.config.controls[ifile].controls.source.setValue(event.target.files[0].name)
        this.fileArray[step][iengine].config[iconfig][ifile].name = event.target.files[0].name;
      }
    } else {
      this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.config.controls[ifile].controls.source.setValue('')
    }
  }


  /* *********************  */
  /* CUSTOM PARAMS SECTION  */
  /* *********************  */

  openDialog(step: string, iengine: string, iconfig: string, sel_params: string, pdata?: any, idata?: number): void {

    console.log("PARAMS", step, iengine, iconfig, sel_params, pdata, idata)
    let dialogRef = this.dialog.open(DialogParamsComponent, {
      width: '500px',
      disableClose: true,
      data: pdata ? pdata : {},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('The dialog was closed', result);
        console.log(this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.params)
        let p = this._formBuilder.group({})
        for (let o in result) {
          p.addControl(o, new FormControl(result[o]))
        }
        if (idata) {
          this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.params.controls[sel_params].controls.splice(idata, 1, p)
        } else {
          this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.params.controls[sel_params].push(p)
        }

      }
    });
  }

  removeParameter(step: string, iengine: string, iconfig: string, sel_params: string, pdata?: any, idata?: number) {
    //Removing paramter from controls
    this.productFormGroup.controls[step].controls[iengine].controls.config.controls[iconfig].controls.params.controls[sel_params].removeAt(idata)
  }

  /* *********************** */
  /* FINISH ACTIONS SECTION  */
  /* *********************** */

  requestNewProduct() {
    this.stepInfo.productData = this.productFormGroup.value

    //Map all platformengines into product yaml

    console.log(this.stepInfo.productData)
    this._blocker.start(this.container, "Sending request for new product...");
    this.wizardService.uploadRequestFiles(this.platformFormGroup.value, this.productFormGroup.value)
      .subscribe(
        data => {
          console.log(data),
            this.wizardService.requestProduct(this.platformFormGroup.value, this.productFormGroup.value, 'all')
              .subscribe(
                data => {
                  console.log(data)
                },
                err => console.log(err),
                () => console.log("DONE")
              )
          this.finishedAction.emit(data)
        },
        err => console.error(err),
        () => console.log("OK, DONE")
      )
  }

  modifyProduct() {
    //Merge data from productFormGroup from product:
    this.stepInfo.productData[this.stepInfo.step] = this.productFormGroup.value[this.stepInfo.step]

    this._blocker.start(this.container, "Modify product...");

    //Upload files to GIT
    this.wizardService.uploadFiles(this.stepInfo.productData, this.fileArray, this.fileRemovedArray, this.stepInfo.step, 'add')
      .subscribe(
        data => {
          //If success, send request to jenkins
          console.log(data),
            this.wizardService.modifyProduct(this.platformFormGroup.value, this.productFormGroup.value, this.stepInfo.step)
              .subscribe(
                data => {
                  console.log(data)
                },
                err => console.log(err),
                () => console.log("DONE")
              )
          this.finishedAction.emit(data)
        },
        err => console.error(err),
        () => console.log("OK, DONE")
      )
  }
}

