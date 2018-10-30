import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Headers } from '@angular/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AppCardService {

  constructor(public httpAPI: HttpClient) { }

  pingService(url: string) {
    console.log(url)
    // return an observable
    return this.httpAPI.get(url)
  };
}