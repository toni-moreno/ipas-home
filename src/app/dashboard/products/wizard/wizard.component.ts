import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ProductSample } from '../product.data';
import { WizardService } from './wizard.service';

import * as _ from 'yamljs';



export interface Engine {
  name: string;
  type: string;
}

export const EngineSNMPParams = {
  product_params:
    [
      {
        key: "PRODUCT_DEVICE_PORT",
        agent_key: "Port",
        type: "integer",
        description: 'The network port where the agent will use to do SNMP connections',
        value: 161
      },
      {
        key: "PRODUCT_SYSTEMOID",
        agent_key: "SystemOIDs",
        description: 'Set OID to get like MIB-2::System Info for non MIB-2 based devices',
        type: "array",
        value: null
      },
      {
        key: "PRODUCT_MAX_REPETITION",
        agent_key: "MaxRepetitions",
        description: 'Set The MaxRepetitions parameter for BULKWALK SNMP queries',
        type: "integer",
        value: 50
      },
      {
        key: "PRODUCT_MEAS_GROUPS",
        agent_key: "MeasurementGroups",
        description: 'An array of Measurement Group IDs',
        type: "array",
        value: ["Juniper_template"]
      },
      {
        key: "PRODUCT_MEAS_FILTERS",
        agent_key: "MeasurementFilters",
        description: 'An array of Measurement Filters IDs',
        type: "array",
        value: ["jnxOperating_Temp",
          "jnxOperating_RouterEngine_Juniper_CPU",
          "jnxOperating_Interface_Juniper"]
      },
      {
        key: "PRODUCT_DEVICE_TAGNAME",
        agent_key: "DeviceTagName",
        description: 'Tag name the agent will send to the output db (default : "device"), could be any of the other more explicit tagname depending on the device type, context, by example (router,switch,firewall,dns..etc)',
        type: "string",
        value: "device"
      },
      {
        key: "PRODUCT_DEVICE_TAGVALUE",
        agent_key: "DeviceTagValue",
        description: "Could be one of these: \n        -id: will send as device tag the configured ID for this measurement \n        -host: will send as device tag data configured in the Host configuration (name or IP)",
        type: "string",
        value: "id"
      },
      {
        key: "PRODUCT_DISABLEBULK",
        agent_key: "DisableBulk",
        description: "Iftruethebulkfeaturewon'tbeused",
        type: "boolean",
        value: true
      },
      {
        key: "PRODUCT_CONCURRENTGATHER",
        agent_key: "ConcurrentGather",
        description: 'Open a new SNMP Connection foreach measurement and send concurrent queries over the device',
        type: "boolean",
        value: true
      }
    ],
  platform_params:
    [
      {
        key: "PLATFORM_INFLUXSERVER",
        agent_key: "OutDB",
        description: 'InfluxDB server ID to send data to',
        type: "string",
        value: "default"
      },
      {
        key: "PLATFORM_LOGLEVEL",
        agent_key: "LogLevel",
        description: 'Enable use select verbosity of the device log',
        type: "string",
        value: "info"
      },
      {
        key: "PLATFORM_GATHER_FREQ",
        agent_key: "Freq",
        description: 'Frequency of polling in seconds (default 30 sec if not set)',
        type: "string",
        value: 60
      },
      {
        key: "PLATFORM_TIMEOUT",
        agent_key: "Timeout",
        description: "Timeout for each SNMP query",
        type: "integer",
        value: 20
      },
      {
        key: "PLATFORM_RETRIES",
        agent_key: "Retries",
        description: 'Sets the number of retries to attempt within Timeout',
        type: "integer",
        value: 5
      },
      {
        key: "PLATFORM_UPDATE_FILTER_PREQ",
        agent_key: "UpdateFltFreq",
        description: 'Number pof complete polls that agent will wait before perform snmp table index/filter updates. The final update time will be Freq*FilterUpdate (in seconds) Default 60 (1h elapsed time)',
        type: "integer",
        value: 60
      },
      {
        key: "PLATFORM_SNMPDEBUG",
        agent_key: "SnmpDebug",
        description: 'If this option is set all snmp low level protocol queries with detailed info on this device will be written on a file with name "snmpdebug_XXXXXX.log"',
        type: "boolean",
        value: false
      },
      {
        key: "PLATFORM_EXTRATAG_KEYS",
        agent_key: "ExtraTags",
        description: 'Device ExtraTag keys',
        type: "string",
        value: null
      }
    ],
  device_params:
    [
      {
        key: "DEVICE_ID",
        agent_key: "ID",
        description: 'TextStringthatuniquelyidentifythedevice,shouldbeuniqueintheconfigdb,itcanbehostname,serialnumberoranyothertextid',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_HOST",
        agent_key: "Host",
        description: 'TextStringthatuniquelyidentifythedevice,shouldbeuniqueintheconfigdb,itcanbehostname,serialnumberoranyothertextid',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_PORT",
        agent_key: "Port",
        description: 'Overwritedefaultdeviceport',
        type: "integer",
        value: null
      },
      {
        key: "DEVICE_ACTIVE",
        agent_key: "Active",
        description: 'Letdevicebegingatheringprocessonagentbootprocess',
        type: "boolean",
        value: true
      },
      {
        key: "DEVICE_SNMPVERSION",
        agent_key: "SnmpVersion",
        description: 'SNMPversion.Valuesaccepted: [1,2c,3]',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_COMMUNITY",
        agent_key: "Community",
        description: 'SNMPversion1/2ccommunity',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3SECLEVEL",
        agent_key: "V3SecLevel",
        description: 'Definethelevelofsecurityneededfortheconnectionvalidvaluesare(onlyforsnmpv3)NoAuthNoPrivAuthNoPrivAuthPriv',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3AUTHUSER",
        agent_key: "V3AuthUser",
        description: 'Theusernamethatwillestablishthesnmpquery(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3AUTHPASS",
        agent_key: "V3AuthPass",
        description: 'Theauthenticationpassword(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3AUTHPROT",
        agent_key: "V3AuthProt",
        description: 'TheAuthenticationProtocolvaluesshouldbeanyof(snmpv3only)-MD5-SHA',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3PRIVPASS",
        agent_key: "V3PrivPass",
        description: 'Privacypassword(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3PRIVPROT",
        agent_key: "V3PrivProt",
        description: 'PrivacyProtocolvaluesshouldbeanyof["DES","AES"](snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3CONTEXTENGINE",
        agent_key: "V3ContextEngineID",
        description: 'SNMPV3ContextEngineIDinScopedPDU(equivalenttothenet-snmp-Eparamenter)(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3CONTEXTNAME",
        agent_key: "V3ContextName",
        description: 'SNMPV3ContextEngineIDinScopedPDU(equivalenttothenet-snmp-Eparamenter)(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_EXTRATAG_VALUES",
        agent_key: null,
        description: 'DeviceExtraTagValues',
        type: "string",
        value: null
      }
    ]
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
  providers: [WizardService],
  styleUrls: ['./wizard.component.css']
})

export class WizardComponent implements OnInit {
  isLinear = false;
  productFormGroup: any;

  gather_engines: Engine[] = [
    { name: 'SNMP', type: 'snmpcollector' },
    { name: 'Telegraf', type: 'telegraf' },
    { name: 'SQLCollector', type: 'sqlcollector' },
    { name: 'External', type: 'external' }
  ];

  visual_engines: Engine[] = [
    { name: 'Grafana', type: 'grafana' },
    { name: 'Kibana', type: 'kibana' }
  ];

  alert_engines: Engine[] = [
    { name: 'Resistor', type: 'resistor' }
  ];

  constructor(private _formBuilder: FormBuilder, public wizardService: WizardService) { }

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

  //Generic function to add a engine on every step - 'gather',  'visual', 'alert'
  addEngine(step: string, engine: string) {
    console.log("STEPPP", step);
    console.log("STEPPP", engine);
    //console.log(this.productFormGroup.controls[step].value.length);
    if (engine != 'external') {
      if (!this.productFormGroup.controls[step].value.find((element) => { console.log(element); return element.engine === engine })) {
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
  }

  //Deletes a config engine based on step, i, and  p
  deleteConfigEngine(step: string, iengine: number, iconfig: number) {
    console.log(step, iengine, iconfig);
    this.productFormGroup.controls[step].controls[iengine].controls.config.removeAt(iconfig)
  }

  //Creates a for for each configuration with params coming from the engine
  createConfigFromEngine(engine: string): AbstractControl {
    return this._formBuilder.group({
      name: ['', Validators.required],
      models: ['', Validators.required],
      description: ['', Validators.required],
      dir: ['', Validators.required],
      config: [''],
      params: new FormGroup(
        {
          'product_params': this.createParamsFromEngine(engine, 'product_params'),
          'platform_params': this.createParamsFromEngine(engine, 'platform_params')
          //'device_params': this.createParamsFromEngine(engine, 'device_params')
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


  testYAML() {
    let nativeObject = _.parse('hola: e');
    console.log("NATIVE", nativeObject);

    this.wizardService.retrieveYAML('https://gist.githubusercontent.com/chriscowley/8598119/raw/8f671464f914320281e5e75bb8dcbe11285d21e6/nfs.example.lan.yml').subscribe(
      data => {
        let nativeObject = _.parse(data);
        console.log(nativeObject);
      },
      err => console.error(err),
      () => console.log("DON")
    )
  }

  createNewProduct() {
    let yamlString = _.stringify(this.productFormGroup.value, 999)
    console.log(yamlString);
    this.wizardService.createNewProduct('http://localhost:4200', _.stringify(this.productFormGroup.value, 999, 2))
      .subscribe(
      data => console.log(data),
      err => console.error(err),
      () => console.log("OK, DONE")
      )
  }


}

