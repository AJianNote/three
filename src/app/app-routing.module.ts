import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  {
    path: 'canvas',
    loadChildren: () => import('./modules/canvas/canvas.module').then(m => m.CanvasModule)
  },
  {
    path: 'three',
    loadChildren: () => import('./modules/three/three.module').then(m => m.ThreeModule)
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
