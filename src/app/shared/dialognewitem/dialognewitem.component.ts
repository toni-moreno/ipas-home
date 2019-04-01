import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-new-item-copy',
  templateUrl: './dialognewitem.component.html'
})
export class DialogNewItemComponent {
  selected : any =  {}
  selectedDevice : string;
  filteredData: any  =  []
  constructor(
    public dialogRef: MatDialogRef<DialogNewItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log("PAASED DATAAA", data);
     }

     selectDevice(dev) {
      this.filteredData = this.data.filter((element) => element.DeviceID === dev);
      this.selected =  {}
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
