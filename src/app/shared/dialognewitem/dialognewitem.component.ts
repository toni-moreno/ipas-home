import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-new-item-copy',
  templateUrl: './dialognewitem.component.html'
})
export class DialogNewItemComponent {
  selected : any =  {}
  constructor(
    public dialogRef: MatDialogRef<DialogNewItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log("PAASED DATAAA", data);
     }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
