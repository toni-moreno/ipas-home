import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-new-list',
  templateUrl: './dialoglist.component.html'
})
export class DialogListComponent {

  selected : any =  null
  constructor(
    public dialogRef: MatDialogRef<DialogListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
