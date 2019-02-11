import { Component, OnInit, Output, EventEmitter, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { EngineSNMPParams } from './device-wizard.data';
import { DeviceWizardService } from './device-wizard.service';
import { ProductService } from '../../products/product.service'
import { HomeService } from '../../home/home.service'
import { MatTableDataSource, MatTabGroup } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BlockUIService } from '../../../shared/blockui/blockui-service';


export const mySuperServices = [
  {
    ID: 'snmpcollector-WAN',
    Description: 'my Service 1',
    Service: 'snmpcollector'
  },
  {
    ID: 'snmpcollector-SAN',
    Description: 'my Service 1',
    Service: 'san'
  },
  {
    ID: 'snmpcollector-SAN',
    Description: 'my Service 1',
    Service: 'snmpcollector'
  }
]

export const mySuperMap: any = {

  id: 'a10',
  database: 'snmp_metrics',
  tags: 'tag1,tag2,tag3,tag4',
}


@Component({
  selector: 'device-wizard',
  templateUrl: './device-wizard.component.html',
  providers: [HomeService, DeviceWizardService, ProductService, BlockUIService],
  styleUrls: ['./device-wizard.component.css']
})

export class DeviceWizardComponent implements OnInit {

  @ViewChild('blocker', { read: ViewContainerRef }) container: ViewContainerRef;
  @Input() mode: boolean = true
  @Input() editData: any;
  @Output() public finishedAction: EventEmitter<any> = new EventEmitter();

  selection = new SelectionModel<Element>(false, []);
  isLinear: boolean = false;
  allowCustomParams: boolean = false;
  showDebug: boolean = false
  deviceFormGroup: any;
  platformFormGroup: any;
  product_info: any = null;
  filteredServices: any = [];
  mapDBInfo: any = null;
  dbMapList: any = null;
  platformEngines: any;
  gEngines: any;

  //Section 1:
  selectedProduct = null;
  selectedEnvironment = null;

  bool_params = [true, false];

  constructor(private _formBuilder: FormBuilder, public homeService: HomeService, public wizardService: DeviceWizardService, public productService: ProductService, public _blocker: BlockUIService) { }


  //Set core config vars as formarrays, it will be easier to go over them
  get product(): FormGroup { return this.deviceFormGroup.get('engine') as FormGroup; }

  public productList: ProductList[]
  public servicesList: any;

  displayedColumns: string[] = ['select', 'ID', 'EngineID'];

  ngOnInit() {
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
        (data) => { this.platformEngines = data; console.log(this.platformEngines) },
        (err) => console.log(err),
        () => console.log("DONE")
      )

    //Create initial deviceForm Form
    this.deviceFormGroup = this._formBuilder.group({
      id: ['',Validators.required] ,
      //productid: "",
    })

    this.platformFormGroup = this._formBuilder.group({
      productid: "",
      engine: new FormArray([])
    })
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
      this.platformFormGroup.setControl('productid', new FormControl(product))
      //Engines:
      this.deviceFormGroup.setControl('engine', this.loadEngineConfig(engines))


      this.productService.getPlatformEngines('/api/cfg/productdbmap/' + product)
        .subscribe(
          (data) => {
            //Add as a Form... on Tags?
            let tags_array = new FormArray([]);
            for (let k of data['ProductTags'].split(',')) {
              let tags = this._formBuilder.group({})
              tags.addControl('key', new FormControl(k))
              tags.addControl('value', new FormControl(''))
              tags_array.push(tags);
            }
            //Filter as available services only the assigned with the product. Maybe should retrieve data from it?
            if (data['GEngines']) {
              this.platformEngines = this.platformEngines.filter(element => {
              for (let g of  data['GEngines']) {
                if (g === element.ID) { 
                  console.log(g, element.ID)
                  return element
                }
              }
            });
            }
            //console.log(_lodash.filter(this.platformEngines, {'ID': data['GEngines']}))
            console.log(this.platformEngines);
            this.platformFormGroup.setControl('tags', tags_array);
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

    //Need double filter --> First retrieve the ID available for platforms....

    this.filteredServices = new MatTableDataSource(this.platformEngines.filter((element) =>  event.tab.textLabel === element.EngineID))
  }

  loadEngineConfig(engines): AbstractControl {
    let engine: any = new FormArray([]);
    for (let ieng in engines) {
      let engineConfig = this._formBuilder.group({})
      engineConfig.addControl('name', new FormControl(engines[ieng]))
      engineConfig.addControl('config', new FormControl(''));
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

  loadEngineConfigParams(iengine: number, configname: string, params: any) {
    //Set config name:
    this.deviceFormGroup.controls.engine.controls[iengine].controls.config.setValue(configname)
    //Load params:
    this.deviceFormGroup.controls.engine.controls[iengine].addControl('params', this.createParamsFromEngine(params))
  }

  //Creates the specific param section in order to play with params (maybe a product can not have device params)
  createParamsFromEngine(params: any): AbstractControl {
    let test = new FormArray([])
    console.log("PARAMS LOADED: ", params);
    for (let i of params['product_params']) {
      let p = this._formBuilder.group({})
      for (let k in i) {
        p.addControl(k, new FormControl(i[k]))
      }
      p['param_disabled'] = true;
      test.push(p);
    }
    for (let i of params['platform_params']) {
      let p = this._formBuilder.group({})
      for (let k in i) {
        p.addControl(k, new FormControl(i[k]))
      }
      p['param_disabled'] = true;
      test.push(p);
    }
    for (let i of params['device_params']) {
      let p = this._formBuilder.group({})
      for (let k in i) {
        p.addControl(k, new FormControl(i[k]))
      }
      p['param_disabled'] = false;
      test.push(p);
    }

    return test
  }


  /* **************************  */
  /* SERVICES SELECTION SECTION  */
  /* **************************  */

  selectService(event, engine) {
    this.selection.toggle(event)
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

  //FINISH 

  sendNewDeviceRequest() {
    this._blocker.start(this.container, "Adding new device...");
    this.wizardService.newDevice(this.platformFormGroup.value, this.deviceFormGroup.value).subscribe(
      (data) => { console.log(data),this._blocker.stop(), this.finishedAction.emit(data)},
      (err) => { console.log("ERROR, ", err), this._blocker.stop() },
      () => { console.log("DONE") }
    )

  }

}