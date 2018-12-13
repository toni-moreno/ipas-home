import { HttpClient } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HttpService } from '../../core/http.service'

declare var _: any;

@Injectable()
export class DeviceService {

    constructor(private httpAPI: HttpService) {
        console.log('Task Service created.', httpAPI);
    }

    getDeviceList(url) {
      return this.httpAPI.get(url)
      .map((responseData) => {console.log(responseData); return responseData.json() })
    }

    getDeviceListByProduct(url) {
      return this.httpAPI.get(url)
      .map((responseData) => {console.log(responseData); return responseData.json() }
      )
    }

    removeDevice(data) {
        //Create file form:
        var blob = new Blob([JSON.stringify(data)], { type: 'application/octet-stream' });
        const formData: any = new FormData()
        formData.append('Msg', 'MyCustomMessage');
        formData.append("CommitFile", blob);
        return this.httpAPI.postFile('/api/rt/jenkins/build/device/delete', formData)
    }
}