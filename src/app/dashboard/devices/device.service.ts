import { HttpClient } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

declare var _: any;

@Injectable()
export class DeviceService {

    constructor(public httpAPI: HttpClient) {
        console.log('Task Service created.', httpAPI);
    }

    getDeviceList(url) {
      return this.httpAPI.get(url)
      .map((responseData) => {console.log(responseData); return responseData }
      )
    }

    getDeviceListByProduct(url) {
      return this.httpAPI.get(url)
      .map((responseData) => {console.log(responseData); return responseData }
      )
    }

    removeDevice(url) {
      return this.httpAPI.delete(url)
      .map((responseData) => {console.log(responseData); return responseData }
      )
    }

    createNewProduct(url: string, dev: any) {
        console.log(url, dev)
        return this.httpAPI.post(url, dev)
            .map((responseData) => { console.log(responseData); return responseData }
            )
    };

}