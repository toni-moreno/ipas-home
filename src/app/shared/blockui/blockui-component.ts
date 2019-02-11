import {Component} from '@angular/core';
@Component({
    selector: 'blockui',
    styleUrls: ['./blockui.css'],
    template:
    `<div class="in modal-backdrop block-overlay"></div>
     <div class="block-message-container" aria-live="assertive" aria-atomic="true">
     
        <div class="block-message" >
        <mat-spinner></mat-spinner>
            <p style="margin-left: 80px">{{ message }}</p>
    </div>
    </div>`
})
export class BlockUIComponent {
    message: any = 'Reloading Config...';

}
