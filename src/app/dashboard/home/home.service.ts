import { HttpService } from '../../core/http.service'
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

declare var _:any;

@Injectable()
export class HomeService {

    constructor(public httpAPI: HttpService) {
        console.log('Task Service created.', httpAPI);
    }

    getServices(url) {
        return this.httpAPI.get(url)
        .map((responseData) => {console.log(responseData); return responseData.json() })
    }
}