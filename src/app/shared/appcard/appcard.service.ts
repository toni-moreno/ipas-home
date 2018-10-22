import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Headers } from '@angular/http';
import { Injectable, } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AppCardService {

  defaultHttpOptions = {
    headers: new HttpHeaders({
      'Accept': 'text/html, application/xhtml+xml, */*',
      'Content-Type': 'application/x-www-form-urlencoded, application/json'
    }),
    responseType: 'text',
    observe: 'response' as 'body',
  };
  constructor(public httpAPI: HttpClient) { }

  getStatus(url: string, content_type: string = 'text') {
    console.log(url)
    // return an observable
    let options: any = this.defaultHttpOptions
    options.responseType = content_type;
    return this.httpAPI.get(url, options)
  };
}