import { HttpClient } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HttpService } from '../../../core/http.service'

declare var _: any;

@Injectable()
export class DeviceWizardService {

    constructor(public httpAPI: HttpService) {
        console.log('Task Service created.', httpAPI);
    }

    newDevice(platform: any, device: any): any {
        //Generate EXTRATAGS:
        let dev = JSON.parse(JSON.stringify(device))

        for (let ie in dev.engine) {
          //Make an split for each "array" type
          dev.engine[ie].params.forEach(element => {
            if (element.type === "array" && element.value !== null && element.value !== 'null' && !Array.isArray(element.value)) {
                element.value = element.value.split(',')
            }
          });
        }

        //Prepare structure to be sent:
        let finalForm = { 'platform': platform, 'devices': [dev] }
        console.log(finalForm);

        //Create file form:
        var blob = new Blob([JSON.stringify(finalForm)], { type: 'application/octet-stream' });
        const formData: any = new FormData()

        formData.append('Msg', 'MyCustomMessage');
        formData.append("CommitFile", blob);
        return this.httpAPI.postFile('/api/rt/jenkins/build/device/add', formData)
        .map((responseData) => { console.log(responseData); return responseData.json() }
        )
    }

    updateDevice(platform: any, device: any): any {
      //Generate EXTRATAGS:
      let dev = JSON.parse(JSON.stringify(device))

      for (let ie in dev.engine) {
        //Make an split for each "array" type
        dev.engine[ie].params.forEach(element => {
          if (element.type === "array" && element.value !== null && element.value !== 'null' && !Array.isArray(element.value)) {
              element.value = element.value.split(',')
          }
        });
      }

      //Prepare structure to be sent:
      let finalForm = { 'platform': platform, 'devices': [dev] }
      console.log(finalForm);

      //Create file form:
      var blob = new Blob([JSON.stringify(finalForm)], { type: 'application/octet-stream' });
      const formData: any = new FormData()

      formData.append('Msg', 'MyCustomMessage');
      formData.append("CommitFile", blob);
      return this.httpAPI.postFile('/api/rt/jenkins/build/device/update', formData)
      .map((responseData) => { console.log(responseData); return responseData.json() }
      )
  }

    deleteDevice(platform: any, device: any): any {

      //Generate EXTRATAGS:
      let dev = JSON.parse(JSON.stringify(device))

      for (let ie in dev.engine) {

        //Ensure split for each "array" type
        dev.engine[ie].params.forEach(element => {
          if (element.type === "array" && element.value !== null && element.value !== 'null' && !Array.isArray(element.value)) {
              element.value = element.value.split(',')
          }
        });
      }

      //Prepare structure to be sent:
      let finalForm = { 'platform': platform, 'devices': [dev] }
      console.log(finalForm);

      //Create file form:
      var blob = new Blob([JSON.stringify(finalForm)], { type: 'application/octet-stream' });
      const formData: any = new FormData()

      formData.append('Msg', 'MyCustomMessage');
      formData.append("CommitFile", blob);
      return this.httpAPI.postFile('/api/rt/jenkins/build/device/delete', formData)
      .map((responseData) => { console.log(responseData); return responseData.json() }
      )
  }

    getPlatformEngines(url: string) {
        return this.httpAPI.get(url)
            .map((responseData) => { console.log(responseData); return responseData.json() }
        )
    }
}