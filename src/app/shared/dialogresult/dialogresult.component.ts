import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-device-result',
  templateUrl: './dialogresult.component.html'
})
export class DialogResultComponent {
  resultStat : any;
  constructor(
    public dialogRef: MatDialogRef<DialogResultComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      for (let i in data.TaskStat) {
        this.resultStat = data.TaskStat[i];
      }
      console.log(this.resultStat);
      }
     

  onNoClick(): void {
    this.dialogRef.close();
  }

}
