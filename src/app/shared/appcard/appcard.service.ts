import { HttpService } from '../../core/http.service'
import { Headers } from '@angular/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AppCardService {

  constructor(public httpAPI: HttpService) { }

  pingService(url: string) {
    console.log(url)
    // return an observable
    return this.httpAPI.get(url)
    .map((responseData) => {console.log(responseData); return responseData.json() })    
  };
}