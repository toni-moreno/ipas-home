import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSidenav } from '@angular/material';
import { FormControl } from '@angular/forms';

export interface EngineElement {
  //actions: string;
  name: string;
  type: string;
}

const ELEMENT_DATA: EngineElement[] = [
  { name: 'SNMPCollector', type: 'Gather' },
  { name: 'Telegraf', type: 'Gather' },
  { name: 'Grafana', type: 'Visual' }
];

@Component({
  selector: 'engine-component',
  styleUrls: ['engine.component.css'],
  templateUrl: 'engine.component.html',
})
export class EngineComponent {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSidenav) left: MatSidenav;

  viewMode: string = 'list';
  name: string;
  type: string;

  displayedColumns: string[] = ['actions', 'name', 'type'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  constructor() {
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);
  }
  

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;    
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}