import { HttpClient } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class ProductService {

    constructor(public httpAPI: HttpClient) {
        console.log('Task Service created.', httpAPI);
    }

    getProducts(url) {
        return this.httpAPI.get(url)
    }

    getProductByID(url,id) {
        return this.httpAPI.get(url+id)
    }

    getPlatformEngines(url) {
        return this.httpAPI.get(url)
    }


}