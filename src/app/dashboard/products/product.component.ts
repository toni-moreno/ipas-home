import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSidenav } from '@angular/material';
import { ProductService } from './product.service';
import { DialogStepsComponent } from '../../shared/dialogstep/dialogsteps.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'product-component',
  providers: [ProductService],
  styleUrls: ['product.component.css'],
  templateUrl: 'product.component.html',
})
export class ProductComponent {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSidenav) left: MatSidenav;

  viewMode: string = 'list';
  mode: boolean = false;
  editData: any;
  stepInfo: any = {
    'productStatus': {
      hasDB: false,
      hasG: false,
      hasV: false,
      hasA: false
    },
    'productData': null,
    'step': null
  };

  displayedColumns: string[] = ['actions', 'name', 'hasDB', 'hasG', 'g_engines', 'hasV', 'v_engines', 'hasA', 'a_engines'];
  dataSource: MatTableDataSource<ProductList> = new MatTableDataSource();

  constructor(public productService: ProductService, public dialog: MatDialog) {
    this.getAllProducts();
  }


  getAllProducts() {
    this.productService.getProducts('/api/rt/gitrepo/product')
      .subscribe(
        (data: ProductList[]) => {
          this.dataSource = new MatTableDataSource(data);
          console.log(data)
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        (err) => console.log(err),
        () => console.log("DONE")
      )
  }

  viewItem(name: string) {
    this.productService.getProductByID('/api/rt/gitrepo/product/', name)
      .subscribe(
        (data) => {
          console.log(data);
          this.mode = true
          this.viewMode = 'edit'
          this.editData = data;
        },
        (err) => console.log(err),
        () => console.log("DONE")
      )
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }


  /* *********************  */
  /* CUSTOM PARAMS SECTION  */
  /* *********************  */

  openDialog(item): void {
    let dialogRef = this.dialog.open(DialogStepsComponent, {
      width: '500px',
      disableClose: true,
      data: item,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result)
        this.productService.getProductByID('/api/rt/gitrepo/product/', item.name)
          .subscribe(
            (data) => {
              this.viewMode = 'new';
              //Extract engines in new property
              this.stepInfo = {
                'productStatus': item,
                'productData': data,
                'step': result
              }
              result;
            })
      }
    });
  }

  finishAction() {
    this.stepInfo = {
      'productStatus': {
        hasDB: false,
        hasG: false,
        hasV: false,
        hasA: false
      },
      'productData': null,
      'step': null
    };
    this.viewMode = 'list';
    this.getAllProducts();
  }


}