import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ObjectParserPipe } from './pipes.component'
import { SplitCommaPipe } from './pipes.component'

@NgModule({
  imports: [CommonModule],
  declarations: [ObjectParserPipe, SplitCommaPipe ],
  exports: [ObjectParserPipe, SplitCommaPipe ]
})
export class CustomPipesModule {
}