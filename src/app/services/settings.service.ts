import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SettingsService {
  public sidebarImageIndex = 0;
  public sidebarImageIndexUpdate: EventEmitter<number> = new EventEmitter();
  public sidebarFilter = '#fff';
  public sidebarFilterUpdate: EventEmitter<string> = new EventEmitter();
  public sidebarColor = '#003F87';
  public sidebarColorUpdate: EventEmitter<string> = new EventEmitter();

  constructor(public httpAPI: HttpClient) {
    console.log('Task Service created.', httpAPI);
}

  getVersion() {
    return this.httpAPI.get('/api/rt/agent/info/version/')
  }
  
  getSidebarImageIndex(): number {
    return this.sidebarImageIndex;
  }
  setSidebarImageIndex(id) {
    this.sidebarImageIndex = id;
    this.sidebarImageIndexUpdate.emit(this.sidebarImageIndex);
  }
  getSidebarFilter(): string {
    return this.sidebarFilter;
  }
  setSidebarFilter(color: string) {
    this.sidebarFilter = color;
    this.sidebarFilterUpdate.emit(this.sidebarFilter);
  }
  getSidebarColor(): string {
    return this.sidebarColor;
  }
  setSidebarColor(color: string) {
    this.sidebarColor = color;
    this.sidebarColorUpdate.emit(this.sidebarColor);
  }
}
