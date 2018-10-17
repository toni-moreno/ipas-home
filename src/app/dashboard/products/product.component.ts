import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSidenav } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ProductSample }  from './product.data';


const ELEMENT_DATA: ProductElement[] = [
  { name: 'Cisco Catalyst', engine: 'SNMPCollector', gather: false, visual: true, alert: false },
  { name: 'Cisco Nexus', engine: 'SNMPCollector', gather: true, visual: true, alert: false },
  { name: 'Juniper', engine: 'SNMPCollector', gather: false, visual: true, alert: false },
  { name: 'Weblogic', engine: 'DomainHealth', gather: true, visual: false, alert: false },
  { name: 'OS Linux', engine: 'Telegraf', gather: true, visual: true, alert: true },
  { name: 'OS Windows', engine: 'Telegraf', gather: false, visual: false, alert: true }
];

/**
 * @title Table with filtering
 */
@Component({
  selector: 'product-component',
  styleUrls: ['product.component.css'],
  templateUrl: 'product.component.html',
})
export class ProductComponent {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSidenav) left: MatSidenav;

  viewMode: string = 'list';
  name: string;
  engine: string;
  gather: boolean;
  visual: boolean;
  alert: boolean;

  productSample = ProductSample;

  displayedColumns: string[] = ['actions', 'name', 'engine', 'gather', 'visual', 'alert'];
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