import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSidenav } from '@angular/material';
import { FormControl } from '@angular/forms';
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

  displayedColumns: string[] = ['actions', 'name', 'db', 'gather', 'visual', 'alert'];
  dataSource: MatTableDataSource<ProductList> = new MatTableDataSource();

  constructor(public productService: ProductService) {

    this.productService.getProducts('/api/rt/gitrepo/product')
      .subscribe(
      (data: ProductList[]) => { this.dataSource = new MatTableDataSource(data); console.log(data) },
      (err) => console.log(err),
      () => console.log("DONE")
      )
  }

  viewItem(name: string) {
    this.productService.getProductByID('/api/rt/gitrepo/product/', name)
      .subscribe(
      (data) => {
        console.log(data);
      },
      (err) => console.log(err),
      () => console.log("DONE")
      )
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
}