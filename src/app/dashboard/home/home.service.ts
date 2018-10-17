import { HttpClient } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

declare var _:any;

@Injectable()
export class HomeService {

    constructor(public httpAPI: HttpClient) {
        console.log('Task Service created.', httpAPI);
    }

    parseJSON(key,value) {
        if ( key == 'IndexAsValue' ) return ( value === "true" || value === true);
        return value;
    }

    getStatus(url: string) {
      console.log(url)
        // return an observable
        return this.httpAPI.get(url)
        .map((responseData) =>
            responseData
        )
    };
}