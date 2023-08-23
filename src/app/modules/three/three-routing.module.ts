import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CompressModelComponent } from './compress-model/compress-model.component'
import { PostprocessingSsrComponent } from './postprocessing-ssr/postprocessing-ssr.component'
import { InstancingPerformanceComponent } from './instancing-performance/instancing-performance.component'
import { RayCastComponent } from './ray-cast/ray-cast.component'
import { InstancingScatterComponent } from './instancing-scatter/instancing-scatter.component'

const routes: Routes = [
  {
    path: 'compressModel',
    component: CompressModelComponent
  },
  {
    path: 'postprocessingSsr',
    component: PostprocessingSsrComponent
  },
  {
    path: 'instancingPerformance',
    component: InstancingPerformanceComponent
  },
  {
    path: 'rayCast',
    component: RayCastComponent
  },
  { path: 'instancingScatter', component: InstancingScatterComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThreeRoutingModule {
}
