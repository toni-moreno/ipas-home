import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'dialog-device-result',
  templateUrl: './dialogresult.component.html'
})
export class DialogResultComponent {
  resultStat: any;
  resultData : any;
  resultParams: any;

  constructor(
    public dialogRef: MatDialogRef<DialogResultComponent>,
    @Inject(MAT_DIALOG_DATA) public importedData: any) {
      this.resultData = importedData.data
      this.resultParams = importedData.params

    for (let i in importedData.data.TaskStat) {
      this.resultStat = importedData.data.TaskStat[i];
    }
    console.log(this.resultStat);
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

}
