import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-new-params',
  templateUrl: './dialogparams.component.html'
})
export class DialogParamsComponent {

  data_types = ['array','boolean','string','integer']

  constructor(
    public dialogRef: MatDialogRef<DialogParamsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
