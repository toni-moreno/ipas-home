import { HttpService } from '../../core/http.service'
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class LoginService {

    constructor(public httpAPI: HttpService) {
        console.log('Task Service created.', httpAPI);
    }

    login(data) {
      console.log(data);
        return this.httpAPI.post('/login', data,null,true)
        .map((responseData) => {console.log(responseData); return responseData.json() })
    }
}