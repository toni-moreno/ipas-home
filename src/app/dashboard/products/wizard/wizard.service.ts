import { HttpClient } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HttpService } from '../../../core/http.service'

declare var _: any;
import * as _yaml from 'yamljs';

@Injectable()
export class WizardService {

  constructor(public httpAPI: HttpService) {
    console.log('Task Service created.', httpAPI);
  }

  createNewProduct(url: string, dev: any) {
    console.log(url, dev)
    return this.httpAPI.post(url, dev)
      .map((responseData) => { console.log(responseData); return responseData.json() })
  };

  requestProduct(platform: any, product: any, step: any): any {
    //Jenkins URL
    const url = 'api/rt/jenkins/build/product/request'
    platform.productid = product['product']
    console.log("PLATFORM", platform)
    console.log("PRODUCT", product)

    //Prepare structure to be sent:
    let finalForm = { 'platform': platform, 'products': [product] }
    console.log("FinalForm", finalForm);

    //Create file form:
    var blob = new Blob([JSON.stringify(finalForm)], { type: 'application/octet-stream' });
    const formData: any = new FormData()

    formData.append('Msg', 'AUTOMATED|HOME|' + platform.productid + '|request|'+step);
    formData.append("CommitFile", blob);
    return this.httpAPI.postFile(url, formData)
      .map((responseData) => { console.log(responseData); return responseData.json() }
      )
  }


  modifyProduct(platform: any, product: any, step: any): any {
    //Jenkins URL
    const url = 'api/rt/jenkins/build/product/add'
    platform.productid = product['product']
    console.log("PLATFORM", platform)
    console.log("PRODUCT", product)

    //Prepare structure to be sent:
    let finalForm = { 'platform': platform, 'products': [product] }
    console.log("FinalForm", finalForm);

    //Create file form:
    var blob = new Blob([JSON.stringify(finalForm)], { type: 'application/octet-stream' });
    const formData: any = new FormData()

    formData.append('Msg', '|AUTOMATED|HOME|' + platform.productid + '|add|'+step);
    formData.append("CommitFile", blob);
    return this.httpAPI.postFile(url, formData)
      .map((responseData) => { console.log(responseData); return responseData.json() }
      )
  }


  uploadFiles(formGroup: any, files: any, removedFiles: any, step: any, action: any) {
    const url = '/api/rt/gitrepo/commitfile'
    //Set up arrays
    for (let iengine in formGroup[step]) {
      for (let iconfig in formGroup[step][iengine].config) {
        formGroup[step][iengine].config[iconfig].params.product_params.forEach(element => {
          if (element.type === "array" && element.value !== null && element.value !== 'null' && !Array.isArray(element.value)) {
            element.value = element.value.split(',')
          }
          return element
        });
        formGroup[step][iengine].config[iconfig].params.platform_params.forEach(element => {
          if (element.type === "array" && element.value !== null && element.value !== 'null' && !Array.isArray(element.value)) {
            element.value = element.value.split(',')
          }
          return element
        });
        formGroup[step][iengine].config[iconfig].params.device_params.forEach(element => {
          if (element.type === "array" && element.value !== null && element.value !== 'null' && !Array.isArray(element.value)) {
            element.value = element.value.split(',')
          }
          return element
        });
      }
    }

    
    const formData: any = new FormData();
    formData.append('Msg', 'AUTOMATED|HOME|' + formGroup.product + '|' + action + '|' + step);
    
    let rootDir = '/products/'
    let product = formGroup.product + '/'
    
    //Creates the commit file and check if some file must be renamed
    //All engines
    for (let i in files[step]) {
      //All config of iengine
      for (let j in files[step][i].config) {
        
        //All available configs...
        for (let p in files[step][i].config[j]) {
          if (!files[step][i].config[j][p].file) {
            //check if a file  has been removed...
            console.log("Empty file, skipping for file upload")
            continue
          }
          if (files[step][i].config[j][p].status === 'moved') {
            formData.append("CtrlDelete", rootDir + product + 'gather/'+files[step][i].config[j][p].old_name);
          }
          //Generate output dir: /products/<PRODUCT_NAME>/<DIR>/<SOURCE>
          let dir = formGroup[step][i].config[j].dir + '/'
          let source = formGroup[step][i].config[j].config[p].source
          formData.append("CommitFile", files[step][i].config[j][p].file[0], rootDir + product + dir + source);
        }
      }
    }

    //Creates the array of filenames that must be deleted
    for (let i in removedFiles[step]) {
      //All config of iengine
      for (let j in removedFiles[step][i].config) {  
        //All available configs...
        for (let p in removedFiles[step][i].config[j]) {
          formData.append("CtrlDelete", rootDir + product + step +'/'+removedFiles[step][i].config[j][p].name);
        }
      }
    }

    //Creates product YAML from formGroup:
    console.log(formGroup)
    let yamlString = _yaml.stringify(formGroup, 999,2)
    console.log(yamlString);
    var blob = new Blob([yamlString], { type: 'application/octet-stream' });
    formData.append("CommitFile", blob, rootDir + product + 'product.yaml');
    return this.httpAPI.post(url, formData)
  }

  retrieveYAML(url: string) {
    console.log(url)
    return this.httpAPI.get(url/*,{'responseType': 'text'}*/)
      .map((responseData) => { console.log(responseData); return responseData }
      )
  };

  getPlatformEnginesByID(id){
    const url= '/api/cfg/platformengines/'
    return this.httpAPI.get(url+id)
    .map((responseData) => { console.log(responseData); return responseData.json() }
    )
  }

  getPlatformEngines(url: string) {
    return this.httpAPI.get(url)
      .map((responseData) => { console.log(responseData); return responseData.json() }
      )
  }

}