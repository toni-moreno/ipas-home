import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSidenav } from '@angular/material';
import { FormControl } from '@angular/forms';

const ELEMENT_DATA: DeviceList[] = [
  { id: 'BCN-PRO-DEVICE', host: 'bcn.prod.everis.com', tags: ['city=barcelona','enviroment=production'], products: [{'name':'OS Linux', 'deployed': true}, {'name': 'Weblogic AS', 'deployed': false}] },
  { id: 'MAD-PRO-DEVICE', host: 'mad.prod.everis.com', tags: ['city=madrid','enviroment=production'], products:[{'name':'OS Linux', 'deployed': true},{'name': 'Tomcat AS', 'deployed': false},{'name': 'MySQL', 'deployed': true}]},
  { id: 'ZGZ-DEV-DEVICE', host: 'zgz.dev.everis.int', tags: ['city=zaragoza','enviroment=development'], products:[{'name':'OS Windows', 'deployed': true},{'name': 'WebSphere AS', 'deployed': true}]}, 
];


interface DeviceElement {
  id: string,
  host: string,
  deployed: string, 
}


@Component({
  selector: 'device-component',
  styleUrls: ['device.component.css'],
  templateUrl: 'device.component.html',
})
export class DeviceComponent {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSidenav) left: MatSidenav;

  viewMode: string = 'list';

  displayedColumns: string[] = ['actions', 'id', 'host', 'tags', 'products'];
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