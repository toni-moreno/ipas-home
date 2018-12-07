import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSidenav } from '@angular/material';
import { FormControl } from '@angular/forms';
import { DeviceService } from './device.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogListComponent } from '../../shared/dialoglist/dialoglist.component'
import { ProductService } from '..//products/product.service'

@Component({
  selector: 'device-component',
  styleUrls: ['device.component.css'],
  templateUrl: 'device.component.html',
  providers: [DeviceService, ProductService],
})
export class DeviceComponent {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSidenav) left: MatSidenav;

  viewMode: string = 'list';

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  listMode: Array<any> = [
    { id: 'all', desc: 'All', displayedColumns: ['actions', 'ProductID', 'DeviceID', 'LastState'], selected: true },
    { id: 'byproduct', desc: 'By Product', data: '', displayedColumns: ['actions', 'DeviceID', 'LastState'], selected: false }
  ]

  selectedListMode: any;
  selProd: string = null

  constructor(public deviceService: DeviceService, public productService: ProductService, public dialog: MatDialog) {
    //Default, show all devices:
    this.selectedListMode = this.listMode[0];

    //Default, load  all devices
    this.retrieveAllDeviceList()
  }

  retrieveAllDeviceList(imode?) {
    //Reset params:
    this.selProd = null;
    this.selectedListMode = this.listMode[imode || 0]

    //Retrieve all devices
    this.deviceService.getDeviceList('/api/cfg/platformdevices')
      .subscribe(
        (data: any) => {
          console.log(data);
          this.dataSource = new MatTableDataSource(data)
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        (err) => console.log(err),
        () => console.log("DONE")
      )
  }

  retrieveAllDeviceListByProduct(product, imode) {
    this.selectedListMode = this.listMode[imode]
    this.deviceService.getDeviceListByProduct('/api/cfg/platformdevices/byproduct/' + product)
      .subscribe(
        (data: any) => {
          console.log(data);
          this.dataSource = new MatTableDataSource(data)
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        (err) => console.log(err),
        () => console.log("DONE")
      )
  }

  changeView(event, data) {
    switch (event.id) {
      case 'all':
        this.retrieveAllDeviceList(data);
        break;
      case 'byproduct':
        this.openDialog(data);
        break;
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  /* *********************  */
  /* CUSTOM PARAMS SECTION  */
  /* *********************  */

  openDialog(imode): void {
    this.productService.getProducts('/api/rt/gitrepo/product')
      .subscribe(
        (data) => {
          let dialogRef = this.dialog.open(DialogListComponent, {
            width: '500px',
            disableClose: true,
            data: data,
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.dataSource = new MatTableDataSource([]);
              console.log(result)
              this.selProd = result
              this.retrieveAllDeviceListByProduct(result, imode);
            }
          }
          );
        },
        (err) => console.log(err),
        () => console.log("DONE")
      )
  }


  removeDevice(element) {
    let t = confirm("Are you sure you  want to remove  product " + element.ProductID + " from  " + element.DeviceID + "?")
    if (t === true) {
      console.log("removing element", element)
      this.deviceService.removeDevice('/api/cfg/platformdevices/' + element.ProductID + '/' + element.DeviceID)
    }

  }
}