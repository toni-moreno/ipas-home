import { HttpClient } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

declare var _:any;

@Injectable()
export class WizardService {

    constructor(public httpAPI: HttpClient) {
        console.log('Task Service created.', httpAPI);
    }

    parseJSON(key,value) {
        if ( key == 'IndexAsValue' ) return ( value === "true" || value === true);
        return value;
    }

    createNewProduct(url: string, dev : any) {
     console.log(url, dev)
     return this.httpAPI.post(url,dev)
        .map((responseData) =>
            { console.log(responseData); return responseData}
        )
    };


    retrieveYAML(url: string) {
        console.log(url)
        return this.httpAPI.get(url, {'responseType': 'text'})
           .map((responseData) =>
           { console.log(responseData); return responseData}
           )
       };
}