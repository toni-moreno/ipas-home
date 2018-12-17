import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-new-steps',
  templateUrl: './dialogsteps.component.html'
})
export class DialogStepsComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogStepsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
