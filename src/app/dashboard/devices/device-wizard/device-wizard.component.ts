import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { EngineSNMPParams } from './device-wizard.data';
import { DeviceWizardService } from './device-wizard.service';
import { ProductService } from '../../products/product.service'
import { HomeService } from '../../home/home.service'
import { MatTableDataSource, MatTabGroup } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BlockUIService } from '../../../shared/blockui/blockui-service';

@Component({
  selector: 'device-wizard',
  templateUrl: './device-wizard.component.html',
  providers: [HomeService, DeviceWizardService, ProductService, BlockUIService],
  styleUrls: ['./device-wizard.component.css']
})

export class DeviceWizardComponent implements OnInit {

  @ViewChild('blocker', { read: ViewContainerRef }) container: ViewContainerRef;
  @ViewChild('product_selection') public product_selection: any;
  @ViewChild('config_selection') public config_selection: any;

  @Input() mode: boolean = true
  @Input() viewMode: string;
  @Input() editData: any;
  @Output() public finishedAction: EventEmitter<any> = new EventEmitter();

  //Table params
  selection = new SelectionModel<Element>(false, null);
  displayedColumns: string[] = ['select', 'ID', 'EngineID'];
  filteredServices: any = [];

  //Stepper params
  isLinear = false;

  //Debug info
  showDebug = false

  //Forms
  deviceFormGroup: any;
  platformFormGroup: any;

  //Forms available params
  bool_params = [true, false];

  //Provided data
  product_info: any = null;
  platformEngines: any;
  allPlatformEngines: any;
  productList: ProductList[]
  servicesList: any;

  //Save selector vars to do not bind into forms (reduce logic on edit+remove)
  selectedProduct = null;
  selectedEnvironment = null;
  selectedConfig = null;

  constructor(private _formBuilder: FormBuilder, public homeService: HomeService, public wizardService: DeviceWizardService, public productService: ProductService, public _blocker: BlockUIService) { }

  //Set core config vars as formarrays, it will be easier to go over them
  get product(): FormGroup { return this.deviceFormGroup.get('engine') as FormGroup; }

  reloadData() {
    //Retrive all Products:
    this.productService.getProducts('/api/rt/gitrepo/product')
      .subscribe(
        (data: ProductList[]) => { this.productList = data },
        (err) => console.log(err),
        () => console.log("DONE")
      )
    //Retrive all Platform Engines:
    this.wizardService.getPlatformEngines('/api/cfg/platformengines')
      .subscribe(
        (data) => { this.allPlatformEngines = data; console.log(this.allPlatformEngines) },
        (err) => console.log(err),
        () => console.log("DONE")
      )

    this.platformFormGroup = this._formBuilder.group({
      productid: ['', Validators.required],
      engine: new FormArray([])
    })
    //Check if editData is provided
    if (this.editData) {
      //Load ID
      this.deviceFormGroup = this._formBuilder.group({
        id: [this.editData.DeviceID, Validators.required],
      })

      //Start the steps --> Select product + config + platform + params
      this.retrieveProductInfo(this.editData.ProductID)
    } else {
      //Create initial deviceForm Form
      this.deviceFormGroup = this._formBuilder.group({
        id: ['', Validators.required]
        //productid: "",
      })
    }
  }

  ngOnInit() {
    this.reloadData();
  }

  /* *****************/
  /* PRODUCT SECTION  */
  /* *****************/

  //Generic function to add a engine on every step - 'gather',  'visual', 'alert'

  retrieveProductInfo(id: string) {
    this.removeProduct();
    this.productService.getProductByID('/api/rt/gitrepo/product/', id)
      .subscribe(
        (data) => {
          this.product_info = data
          let engines = data['gather'].map((element) => { console.log("ELEMENT:", element); return element.engine })
          this.selectProduct(id, engines)
          console.log(this.product_info.gather);
          //Reset tab index
        },
        (err) => console.log(err),
        () => console.log("DONE")
      )
  }

  selectProduct(product: string, engines: Array<any>) {
    if (product != 'external') {

      //ProductID:
      this.selectedProduct = product;
      this.platformFormGroup.setControl('productid', new FormControl(product), Validators.required)

      //Engines, initialize empty one
      this.deviceFormGroup.setControl('engine', this.loadEngineConfig(engines), Validators.required)

      //If edit, fill config + params

      if (this.editData) {

        this.product_selection.value = this.editData.ProductID

        //For each product engine
        for (let sengine of this.editData.Engines) {

          //Need the real engine index provided by the product
          let iengine = engines.findIndex(element => element === sengine.EngineID);

          //Needs the real config index provided by the product
          let iconfig = this.product_info.gather[iengine].config.findIndex(element => element.id === sengine.ConfigID);
          if (iconfig < 0) {
            this.editData.paramsLoaded = false;
          } else {
          this.selectedConfig = iconfig;
          console.log(iconfig, iengine, sengine.Params)

          for (let pengine of sengine.Params) {
            if (this.product_info.gather[iengine].config[iconfig].params.product_params) {
              this.product_info.gather[iengine].config[iconfig].params.product_params.map((element => { if (element['key'] === pengine.Key) element['value'] = pengine.Value }))
            }
            if (this.product_info.gather[iengine].config[iconfig].params.platform_params) {
              this.product_info.gather[iengine].config[iconfig].params.platform_params.map((element => { if (element['key'] === pengine.Key) element['value'] = pengine.Value }))
            }
            if (this.product_info.gather[iengine].config[iconfig].params.device_params) {
              this.product_info.gather[iengine].config[iconfig].params.device_params.map((element => { if (element['key'] === pengine.Key) element['value'] = pengine.Value }))
            }
          }

            //Load Config params
            this.loadEngineConfigParams(iengine, sengine.ConfigID, this.product_info.gather[iengine].config[iconfig].params, sengine.EngineID);
          }
        }

        //Need to add to platform for each engine!
        for (let eplatform of this.editData.Platform) {
          this.selectService(eplatform.platform, eplatform.name);
        }

      } else {
        this.deviceFormGroup.setControl('engine', this.loadEngineConfig(engines), Validators.required)
      }

      this.productService.getPlatformEngines('/api/cfg/productdbmap/' + product)
        .subscribe(
          (data) => {
            //Filter as available services only the assigned with the product. Maybe should retrieve data from it?
            if (data['GEngines']) {
              this.platformEngines = [];
              for (let el of this.allPlatformEngines) {
                for (let g of data['GEngines']) {
                  console.log("G", g);
                  if (g === el.ID) {
                    console.log(g, el.ID)
                    this.platformEngines.push(el);
                  }
                }
              }
            }
            console.log(this.platformEngines);
          },
          (err) => { console.log(err); this.platformFormGroup.setControl('tags', new FormArray([])) },
          () => console.log("DONE")
        )
    }
  }

  //Deletes an engine, it is required the step - 'gather', 'visual', 'alert' and the array index
  removeProduct() {
    this.product_info = null;
    this.selectedProduct = null;
    this.selectedConfig = null;
    this.deviceFormGroup.removeControl('engine')

    //Platform relations
    this.platformFormGroup.removeControl('tags')
    this.platformFormGroup.controls.productid.setValue('')
    this.platformFormGroup.controls.engine.setControl(new FormArray([]))
  }


  /* *****************/
  /* ENGINES SECTION */
  /* *****************/

  changeEngine(event) {
    //filterAvailableServices based on selected engine
    //engine is retrieved by event.tab.textLabel
    if (this.config_selection) {
      this.config_selection.value = this.selectedConfig;
    }

    //Need double filter --> First retrieve the ID available for platforms....
    this.filteredServices = new MatTableDataSource(this.platformEngines.filter((element) => event.tab.textLabel === element.EngineID))

  }

  loadEngineConfig(engines): AbstractControl {
    let engine: any = new FormArray([]);
    for (let ieng in engines) {
      let engineConfig = this._formBuilder.group({})
      engineConfig.addControl('name', new FormControl(engines[ieng]))
      engineConfig.addControl('config', new FormControl(""));
      engine.push(engineConfig)
    }
    return engine;
  }

  loadEngineServices(engines): AbstractControl {
    console.log(engines)
    let p = this.servicesList;
    p.map((element) => element.ID)
    return p;
  }

  loadEngineConfigParams(iengine: number, configname: string, params: any, enginename: string) {
    //Set config name:
    this.deviceFormGroup.controls.engine.controls[iengine].controls.config.setValue(configname)
    //Load params:
    this.deviceFormGroup.controls.engine.controls[iengine].addControl('params', params ? this.createParamsFromEngine(params, enginename) : null)
  }

  //Creates the specific param section in order to play with params (maybe a product can not have device params)
  createParamsFromEngine(params: any, enginename: string): AbstractControl {
    let pArray: FormArray = new FormArray([])
    console.log("PARAMS LOADED: ", params);
    //ensure it exists
    if (params['product_params']) {
      for (let i of params['product_params']) {
        let p = this._formBuilder.group({})
        for (let k in i) {
          p.addControl(k, new FormControl(i[k]))
        }
        p['param_disabled'] = true;
        pArray.push(p);
      }
    }
    //ensure it exists
    if (params['platform_params']) {
      for (let i of params['platform_params']) {
        let p = this._formBuilder.group({})
        for (let k in i) {
          p.addControl(k, new FormControl(i[k]))
        }
        p['param_disabled'] = true;
        pArray.push(p);
      }
    }
    //ensure it exists
    if (params['device_params']) {
      for (let i of params['device_params']) {
        let p: FormGroup = this._formBuilder.group({})
        for (let k in i) {
          p.addControl(k, new FormControl(i[k]))
        }
        p['param_disabled'] = false;
        pArray.push(p);
      }
    }

    return pArray;
  }


  /* **************************  */
  /* SERVICES SELECTION SECTION  */
  /* **************************  */

  selectService(event, engine) {
    this.selection.select(event);
    let n = this._formBuilder.group({
      'name': engine,
      'type': 'gather',
      'platform': new FormControl(event)
    })
    let t = this.platformFormGroup.controls.engine.controls.findIndex((element) => { return element.value.name === engine })
    if (t > -1) this.platformFormGroup.controls.engine.removeAt(t);
    //remove if the  engine already exist and push it again!
    this.platformFormGroup.controls.engine.push(n)
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.servicesList.filter = filterValue;
  }

  //Finish form STEP  

  submitForm() {
    switch (this.viewMode) {
      case 'edit':
        this.sendUpdateDeviceRequest();
        break;
      case 'delete':
        this.sendDeleteRequest();
        break;
      default:
        this.sendNewDeviceRequest();
        break;
    }
  }

  cancelForm() {
    this.finishedAction.emit('cancel')
  }

  sendNewDeviceRequest() {
    this._blocker.start(this.container, "Adding new device...");
    this.wizardService.newDevice(this.platformFormGroup.value, this.deviceFormGroup.value).subscribe(
      (data) => { console.log(data), this._blocker.stop(), this.finishedAction.emit(data) },
      (err) => { console.log("ERROR, ", err), this._blocker.stop() },
      () => { console.log("DONE") }
    )
  }

  sendUpdateDeviceRequest() {
    this._blocker.start(this.container, "Updating "+ this.platformFormGroup.value.productid + " from device...");
    this.wizardService.updateDevice(this.platformFormGroup.value, this.deviceFormGroup.value).subscribe(
      (data) => { console.log(data), this._blocker.stop(), this.finishedAction.emit(data) },
      (err) => { console.log("ERROR, ", err), this._blocker.stop() },
      () => { console.log("DONE") }
    )
  }

  sendDeleteRequest() {
    let t = confirm("Are you sure you want to delete product " + this.platformFormGroup.value.productid + " from " + this.deviceFormGroup.value.id + "?")
    if (t === true) {

      this._blocker.start(this.container, "Removing " + this.platformFormGroup.value.productid + " from device...");
      this.wizardService.deleteDevice(this.platformFormGroup.value, this.deviceFormGroup.value).subscribe(
        (data) => { console.log(data), this._blocker.stop(), this.finishedAction.emit(data) },
        (err) => { console.log("ERROR, ", err), this._blocker.stop() },
        () => { console.log("DONE") }
      )
    }
  }
}