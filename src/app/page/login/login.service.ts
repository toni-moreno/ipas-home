import { HttpClient } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class LoginService {

    constructor(public httpAPI: HttpClient) {
        console.log('Task Service created.', httpAPI);
    }

    login(data) {
      console.log(data);
        return this.httpAPI.post('/login', data)
    }
}