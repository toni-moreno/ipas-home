import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-device-copy',
  templateUrl: './dialogcopy.component.html'
})
export class DialogCopyComponent {
  selected : any =  null
  constructor(
    public dialogRef: MatDialogRef<DialogCopyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log("PAASED DATAAA", data);
     }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
