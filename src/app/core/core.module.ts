import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XHRBackend, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { httpServiceFactory } from './http-service.factory';
import { DefaultRequestOptions } from './http.service';
import { LoaderService } from './loader/loader.service';
import { LoaderComponent } from './loader/loader.component';


@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
    LoaderComponent
  ],
  declarations: [
    LoaderComponent,
  ],
  providers: [
    LoaderService,
    {
      provide: HttpService,
      useFactory: httpServiceFactory,
      deps: [XHRBackend, RequestOptions, LoaderService, Router]
    }
  ]
})

export class CoreModule { }
