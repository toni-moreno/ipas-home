import { HttpClient } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HttpService } from '../../core/http.service'

@Injectable()
export class ProductService {

    constructor(public httpAPI: HttpService) {
        console.log('Task Service created.', httpAPI);
    }

    getProducts(url) {
        return this.httpAPI.get(url)
        .map((responseData) => {console.log(responseData); return responseData.json() })
    }

    getProductByID(url,id) {
        return this.httpAPI.get(url+id)
        .map((responseData) => {console.log(responseData); return responseData.json() })
    }

    getPlatformEngines(url) {
        return this.httpAPI.get(url)
        .map((responseData) => {console.log(responseData); return responseData.json() })
    }


}