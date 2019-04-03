import { Component, OnInit, Inject, Input, Output, EventEmitter, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { EngineSNMPParams } from './wizard.data';
import { WizardService } from './wizard.service';
import { DialogParamsComponent } from '../../../shared/dialogparams/dialogparams.component'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource, MatTabGroup } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BlockUIService } from '../../../shared/blockui/blockui-service';


import * as _ from 'yamljs';
import * as _lodash from 'lodash';

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

  lengine = null;

  fileArray = {
    gather: [],
    visual: [],
    alert: []
  }

  isLinear: boolean = false;
  allowCustomParams: boolean = false;
  showDebug: boolean = false
  productFormGroup: any;
  platformFormGroup: any;
  displayedColumns: string[] = ['select', 'ID', 'EngineID'];
  public servicesList: any;

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

  platformEngines: any;

  filteredServices: any = [];



  constructor(private _formBuilder: FormBuilder, public wizardService: WizardService, public dialog: MatDialog, public _blocker: BlockUIService) {
    //Retrive all Platform Engines to have all my devices

  }

  //Set core config vars as formarrays, it will be easier to go over them

  get gather(): FormArray { return this.productFormGroup.get('gather') as FormArray; }
  get visual(): FormArray { return this.productFormGroup.get('visual') as FormArray; }
  get alert(): FormArray { return this.productFormGroup.get('alert') as FormArray; }


  ngOnInit() {
    console.log(this.stepInfo.step)
    console.log("STEPINFOOO",this.stepInfo);

    //Need to retrieve all available services...   

    this.platformFormGroup = this._formBuilder.group({
      productid: "",
      tags: [],
      engine: new FormArray([]),
    })

    //Initial Form
    this.productFormGroup = this._formBuilder.group({
      product: this.stepInfo.productData ? this.stepInfo.productData.product : "",
      models: this.stepInfo.productData ? this.stepInfo.productData.models : "",
      description: this.stepInfo.productData ? this.stepInfo.productData.description : ''
    })

    console.log("EDIT DATA:", this.editData);

    this.wizardService.getPlatformEngines('/api/cfg/platformengines')
      .subscribe(
        (data) => {
        this.platformEngines = data
          switch (this.stepInfo.step) {
            case 'gather':
              this.lengine = { 'id': 'gather', 'desc': 'Gather', 'data': this.gather_engines };
              this.productFormGroup.setControl('gather', new FormArray([]))
              for (let i of this.stepInfo.productStatus.g_engines) {
                let test = this.platformEngines.filter((element => element.ID === i)).map((element) => element.EngineID)
                this.addEngine('gather', test[0])
              }
              break;
            case 'visual':
              this.lengine = { 'id': 'visual', 'desc': 'Visual', 'data': this.visual_engines };
              this.productFormGroup.setControl('visual', new FormArray([]))
              for (let i of this.stepInfo.productStatus.v_engines) {
                let test = this.platformEngines.filter((element => element.ID === i)).map((element) => element.EngineID)
                this.addEngine('visual', test[0])
              }
              break;
            case 'alert':
              this.lengine = { 'id': 'alert', 'desc': 'Alert', 'data': this.alert_engines };
              this.productFormGroup.setControl('alert', new FormArray([]))
              for (let i of this.stepInfo.productStatus.a_engines) {
                let test = this.platformEngines.filter((element => element.ID === i)).map((element) => element.EngineID)
                this.addEngine('alert', test[0])
              }
            default:
              this.productFormGroup.setControl('gather', new FormArray([]))
              this.productFormGroup.setControl('visual', new FormArray([]))
              this.productFormGroup.setControl('alert', new FormArray([]))
              break
          }

          console.log(this.lengine)
          console.log(this.stepInfo.productData);
        },
        (err) => console.log(err),
        () => console.log("DONE")
      )



    //check if its an edit by property mode
    if (this.mode === true) {
      console.log("EDIT")
      console.log("DATA")
      //Load core params:
      this.productFormGroup.controls.product.setValue(this.editData.product)
      this.productFormGroup.models = this.editData.models
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
        this.fileArray[step].push({ config: [[]] })
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
  createEngineFormGroup(t: string): AbstractControl {
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
    this.fileArray[step][iengine].config.splice(iconfig, 1)
  }


  changeEngine(event) {
    //filterAvailableServices based on selected engine
    //engine is retrieved by event.tab.textLabel
    this.filteredServices = new MatTableDataSource(this.platformEngines.filter((element) => event.tab.textLabel === element.EngineID))
  }


  /* *********************** */
  /* ENGINE CONFIG SECTION   */
  /* *********************** */

  //Creates a for for each configuration with params coming from the engine
  createConfigFromEngine(engine: string): AbstractControl {
    return this._formBuilder.group({
      id: ['', Validators.required],
      label: ['', Validators.required],
      models: ['', Validators.required],
      description: ['', Validators.required],
      dir: ['gather', Validators.required],
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
      return new FormArray([]);
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

  requestNewProduct() {
    this.stepInfo.productData = this.productFormGroup.value
    console.log(this.stepInfo.productData)
    this._blocker.start(this.container, "Sending request for new product...");
    this.wizardService.requestNewProduct(this.stepInfo.productData)
    .subscribe(
      data => {
        console.log(data),
          this.wizardService.newProduct(this.platformFormGroup.value, this.productFormGroup.value)
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

  createNewConfigForProduct() {
    //Merge data from productFormGroup from product:
    if (this.stepInfo.productData) {
      this.stepInfo.productData[this.stepInfo.step] = this.productFormGroup.value[this.stepInfo.step]
    } else {
      this.stepInfo.productData = this.productFormGroup.value
    }
    console.log(this.stepInfo.productData)
    this._blocker.start(this.container, "Sending request for new product...");

    //Upload files to GIT
    console.log("INFOOO:",this.stepInfo.productData, this.fileArray, this.stepInfo.step)
    console.log("TTTTTT", this.stepInfo.step)
    this.wizardService.uploadFiles('/api/rt/gitrepo/commitfile', this.stepInfo.productData, this.fileArray, this.stepInfo.step)
      .subscribe(
        data => {
          //If success, send request to jenkins
          console.log(data),
            this.wizardService.newProduct(this.platformFormGroup.value, this.productFormGroup.value)
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
    this.fileArray[step][iengine].config[iconfig].splice(ifile, 1)
  }

  selectFile(event, step, iengine, iconfig, ifile) {
    this.fileArray[step][iengine].config[iconfig][ifile] = event.target.files
  }


  /* **************************  */
  /* SERVICES SELECTION SECTION  */
  /* **************************  */


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.filteredServices.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.filteredServices.data.forEach(row => this.selection.select(row));
  }


  selectService(event, engine) {

    this.selection.toggle(event)
    console.log(this.platformFormGroup.controls.engine.controls);
    let n = this._formBuilder.group({
      'name': engine,
      'type': 'gather',
      'platform': new FormControl(event)
    })
    let t = this.platformFormGroup.controls.engine.controls.findIndex((element) => { console.log(element.value.name, engine, element.value.name === engine); return element.value.platform.ID === event.ID })
    if (t > -1) this.platformFormGroup.controls.engine.removeAt(t);
    //remove if the  engine already exist and push it again!
    if (this.selection.isSelected(event)) this.platformFormGroup.controls.engine.push(n)
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.servicesList.filter = filterValue;
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

