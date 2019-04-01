import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ObjectParserPipe } from './pipes.component'
import { SplitCommaPipe } from './pipes.component'
import { UniquePipe } from './pipes.component'

@NgModule({
  imports: [CommonModule],
  declarations: [ObjectParserPipe, SplitCommaPipe, UniquePipe ],
  exports: [ObjectParserPipe, SplitCommaPipe, UniquePipe ]
})
export class CustomPipesModule {
}