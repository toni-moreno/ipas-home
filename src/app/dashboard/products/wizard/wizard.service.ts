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

  newProduct(platform: any, product: any): any {
    const url = 'api/rt/jenkins/build/product/add'
    platform.productid = product['product']

    //Prepare structure to be sent:
    let finalForm = { 'platform': platform, 'products': [product] }
    console.log("FinalForm", finalForm);

    //Create file form:
    var blob = new Blob([JSON.stringify(finalForm)], { type: 'application/octet-stream' });
    const formData: any = new FormData()

    formData.append('Msg', '|AUTOMATED|HOME|' + platform.productid + '|REQUEST|ALL');
    formData.append("CommitFile", blob);
    return this.httpAPI.postFile(url, formData)
      .map((responseData) => { console.log(responseData); return responseData.json() }
      )
  }

  requestNewProduct(platform: any, product: any) {
    const url = '/api/rt/gitrepo/commitfile'
    for (let i of platform.engine) {
      product[i.type].push({ 'engine': i.name, 'config': [] });
    }
    const formData: any = new FormData();
    formData.append('Msg', '|AUTOMATED|HOME|' + product.product + '|REQUEST|ALL');
    let rootDir = '/products/'
    let productName = product.product + '/'
    let yamlString = _yaml.stringify(product, 999)
    console.log(yamlString);
    var blob = new Blob([yamlString], { type: 'application/octet-stream' });
    formData.append("CommitFile", blob, rootDir + productName + 'product.yaml');
    return this.httpAPI.post(url, formData)
  }

  uploadFiles(formGroup: any, files: any, step: any) {
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

    //Creates upload files:
    const formData: any = new FormData();
    formData.append('Msg', '|AUTOMATED|HOME|' + formGroup.product + '|ADD' + '|' + step);

    let rootDir = '/products/'
    let product = formGroup.product + '/'
    //All engines
    for (let i in files[step]) {
      //All config of iengine
      for (let j in files[step][i].config) {
        //All available configs...
        for (let p in files[step][i].config[j]) {
          if (!files[step][i].config[j][p][0]) {
            console.log("skipping for file upload")
            continue
          }
          //Generate output dir: /products/<PRODUCT_NAME>/<DIR>/<SOURCE>
          let dir = formGroup[step][i].config[j].dir + '/'
          let source = formGroup[step][i].config[j].config[p].source
          formData.append("CommitFile", files[step][i].config[j][p][0], rootDir + product + dir + source);
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