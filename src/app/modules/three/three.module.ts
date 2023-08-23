import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { ThreeRoutingModule } from './three-routing.module'
import { CompressModelComponent } from './compress-model/compress-model.component'
import { PostprocessingSsrComponent } from './postprocessing-ssr/postprocessing-ssr.component'
import { InstancingPerformanceComponent } from './instancing-performance/instancing-performance.component'
import { RayCastComponent } from './ray-cast/ray-cast.component'
import { InstancingScatterComponent } from './instancing-scatter/instancing-scatter.component'

@NgModule({
  declarations: [
    CompressModelComponent,
    PostprocessingSsrComponent,
    InstancingPerformanceComponent,
    RayCastComponent,
    InstancingScatterComponent
  ],
  imports: [
    CommonModule,
    ThreeRoutingModule
  ]
})
export class ThreeModule {
}
