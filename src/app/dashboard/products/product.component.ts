import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSidenav } from '@angular/material';
import { ProductService } from './product.service';

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
  mode : boolean =  false;
  editData : any;

  displayedColumns: string[] = ['actions', 'name', 'hasdb', 'gather', 'visual', 'alert'];
  dataSource: MatTableDataSource<ProductList> = new MatTableDataSource();

  constructor(public productService: ProductService) {

    this.productService.getProducts('/api/rt/gitrepo/product')
      .subscribe(
      (data: ProductList[]) => {
        this.dataSource = new MatTableDataSource(data);
        console.log(data)
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;},
      (err) => console.log(err),
      () => console.log("DONE")
      )
  }

  viewItem(name: string) {
    this.productService.getProductByID('/api/rt/gitrepo/product/', name)
      .subscribe(
      (data) => {
        console.log(data);
        this.mode =  true
        this.viewMode = 'edit'
        this.editData =  data;
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
}