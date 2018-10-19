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


/*const ELEMENT_DATA: PeriodicElement[] = [
  { : 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];
*/

/**
 * @title Table with filtering
 */
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