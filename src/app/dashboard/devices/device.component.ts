import { Component, ViewChild, ViewContainerRef, } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSidenav } from '@angular/material';
import { FormControl } from '@angular/forms';
import { DeviceService } from './device.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogListComponent } from '../../shared/dialoglist/dialoglist.component'
import { DialogCopyComponent } from '../../shared/dialogcopy/dialogcopy.component'
import { ProductService } from '..//products/product.service'
import { DialogResultComponent } from 'app/shared/dialogresult/dialogresult.component';
import { BlockUIService } from '../../shared/blockui/blockui-service';

@Component({
  selector: 'device-component',
  styleUrls: ['device.component.css'],
  templateUrl: 'device.component.html',
  providers: [DeviceService, ProductService, BlockUIService],
})
export class DeviceComponent {

  @ViewChild('blocker', { read: ViewContainerRef }) container: ViewContainerRef;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSidenav) left: MatSidenav;

  viewMode: string = 'list';

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  listMode: Array<any> = [
    { id: 'all', desc: 'All', displayedColumns: ['actions', 'DeviceID', 'ProductID', 'PlatformID','LastAction', 'LastState'], selected: true },
    { id: 'byproduct', desc: 'By Product', data: '', displayedColumns: ['actions', 'PlatformID', 'DeviceID', 'LastState'], selected: false }
  ]

  selectedListMode: any;
  selProd: string = null

  mydata = {
    platform: null,
    devices: [{}]
  }

  editData: any;

  constructor(public deviceService: DeviceService, public productService: ProductService, public dialog: MatDialog, public _blocker: BlockUIService) {
    //Default, show all devices:
    this.selectedListMode = this.listMode[0];

    //Default, load  all devices
    this.retrieveAllDeviceList()
  }

  retrieveAllDeviceList(imode?) {
    //Reset params:
    this.selProd = null;
    //Ensure reset edit params
    this.editData = null;
    this.selectedListMode = this.listMode[imode || 0]

    //Retrieve all devices
    this.deviceService.getDeviceList('/api/cfg/platformdevices')
      .subscribe(
        (data: any) => {
          console.log(data);
          if (data) {
            this.dataSource = new MatTableDataSource(data)
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
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
  /* DIALOG SECTION  */
  /* *********************  */

  openDialog(imode): void {
    this.productService.getProducts('/api/rt/gitrepo/product')
      .subscribe(
        (data) => {
          let dialogRef = this.dialog.open(DialogListComponent, {
            width: '600px',
            disableClose: true,
            data: data,
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.dataSource = new MatTableDataSource([]);
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

  openResultDialog(data): void {
    this.deviceService.getDeviceConfigParams('/api/cfg/deviceconfigparams/bydevice/' + data.ProductID + '/' + data.DeviceID)
    .subscribe(
      (params) => {
        let pp = this.prepareEditData(params);
        console.log(params);
        let dialogRef = this.dialog.open(DialogResultComponent, {
          width: '600px',
          disableClose: true,
          data: {'data': data, 'params': pp},
        });
      },
      (err) => console.log(err),
      () => console.log("DONE")
    )
  }

  openCopyFromDialog(): void {
    this.deviceService.getDeviceList('/api/cfg/platformdevices')
      .subscribe(
        (data) => {
          let dialogRef = this.dialog.open(DialogCopyComponent, {
            width: '600px',
            disableClose: true,
            data: data,
          });
          dialogRef.afterClosed().subscribe(result => {
              console.log(result);
              this.editDevice(result,'copy');
            }
          );
        },
        (err) => console.log(err),
        () => console.log("DONE")
      )
  }


  copyFrom() {
    this.openCopyFromDialog();
  }

  prepareEditData(data) {
    let lengine = {};

    //Extract all engines, we don't need ProductID or DeviceID a

    if (data) {
      for (let engine of data) {
        lengine[engine.EngineID] = engine.EngineID
     }
    }

    //Initialize emtpy object in order to being filled by each engine
    //TODO: create a type...
    let engineArray = []
    for (let i in lengine) {
      let engineData = { Params: [] }
      for (let a of data) {
        if (a.EngineID === i) {
          engineData["EngineID"] = a.EngineID
          engineData["ConfigID"] = a.ConfigID
          engineData["Params"].push({ 'Key': a.Key, 'Value': a.Value })
        }
      }
      engineArray.push(engineData);
    }
    return engineArray;
  }

  editDevice(element, action?) {
    let devAction = action || 'edit'
    this.deviceService.getDeviceConfigParams('/api/cfg/deviceconfigparams/bydevice/' + element.ProductID + '/' + element.DeviceID)
      .subscribe(
        (data) => {
          console.log(data);
          let deviceData = {
            ProductID: element.ProductID,
            DeviceID: element.DeviceID,
            Engines: [],
            paramsLoaded : true,
            Platform: element.PlatformEngines
          };
          deviceData.Engines = this.prepareEditData(data);
          if (deviceData.Engines.length > 0 ) {
            deviceData.paramsLoaded = false;
          }
          this.editData = deviceData,
            this.viewMode = devAction
        },

        (err) => console.log(err),
        () => console.log("DONE")
      )
  }

  removeDevice(element) {
    this.editDevice(element, 'delete')
  }

  finishAction() {
    this.viewMode = 'list';
    this.retrieveAllDeviceList();
  }
}