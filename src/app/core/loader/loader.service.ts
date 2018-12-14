import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export interface LoaderState {
	show: boolean;
	message: any;
	type: any;
}

@Injectable()
export class LoaderService {

	private loaderSubject = new Subject<LoaderState>();
	loaderState = this.loaderSubject.asObservable();

	constructor() { }

	show(message?: any, type?: string) {
		console.log(message);
		console.log(type);
		this.loaderSubject.next(<LoaderState>{ show: true, message: message, type: type });
	}

	hide() {
		this.loaderSubject.next(<LoaderState>{ show: false });
	}
}
