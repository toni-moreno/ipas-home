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
    platform.productid = product['product']

    //Prepare structure to be sent:
    let finalForm = { 'platform': platform, 'products': [product] }
    console.log("FinalForm",finalForm);

    //Create file form:
    var blob = new Blob([JSON.stringify(finalForm)], { type: 'application/octet-stream' });
    const formData: any = new FormData()

    formData.append('Msg', '|AUTOMATED|HOME|'+platform.productid+'|REQUEST|ALL');
    formData.append("CommitFile", blob);
    return this.httpAPI.postFile('/api/rt/jenkins/build/product/add', formData)
    .map((responseData) => { console.log(responseData); return responseData.json() }
    )
}


  requestNewProduct(formGroup: any) {
    const formData: any = new FormData();
    formData.append('Msg', '|AUTOMATED|HOME|' + formGroup.product + '|REQUEST|ALL');
    let rootDir = '/products/'
    let product = formGroup.product + '/'
    let yamlString = _yaml.stringify(formGroup, 999)
    console.log(yamlString);
    var blob = new Blob([yamlString], { type: 'application/octet-stream' });
    formData.append("CommitFile", blob, rootDir + product + 'product.yaml');
    return this.httpAPI.post('/api/rt/gitrepo/commitfile', formData)

  }



  uploadFiles(url, formGroup: any, files: any, step : any) {

    //Creates upload files:

    console.log("UPLOAD FILES: ",formGroup);
    console.log("UPLOAD FILES2 : ",files);

    const formData: any = new FormData();
    formData.append('Msg', '|AUTOMATED|HOME|' + formGroup.product + '|ADD' + '|' + step);

    //formData.append('Msg', '|AUTOMATED|HOME|' + formGroup.product + '|REQUEST|ALL');


    let rootDir = '/products/'
    let product = formGroup.product + '/'
    //All engines
    for (let i in files.gather) {
      //All config of iengine
      for (let j in files.gather[i].config) {
        //All available configs...
        for (let p in files.gather[i].config[j]) {
          //Generate output dir: /products/<PRODUCT_NAME>/<DIR>/<SOURCE>
          let dir = formGroup['gather'][i].config[j].dir + '/'
          let source = formGroup['gather'][i].config[j].config[p].source
          formData.append("CommitFile", files.gather[i].config[j][p][0], rootDir + product + dir + source);
        }
      }
    }

    console.log("formDATA", formData);

    //Creates product YAML from formGroup:
    console.log(formGroup)
    let yamlString = _yaml.stringify(formGroup, 999)
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

  getPlatformEngines(url: string) {
    return this.httpAPI.get(url)
      .map((responseData) => { console.log(responseData); return responseData.json() }
      )
  }

}