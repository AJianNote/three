import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import {
  Color,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import TWEEN from '@tweenjs/tween.js'
import { WheelControls } from '../../../utils/wheelControls'

@Component({
  selector: 'app-ray-cast',
  templateUrl: './ray-cast.component.html',
  styleUrls: ['./ray-cast.component.scss']
})
export class RayCastComponent implements AfterViewInit {

  @ViewChild('container')
  container: ElementRef | undefined

  rayCaster: Raycaster

  mouse: Vector2

  color: Color

  white: Color

  camera: PerspectiveCamera | undefined

  scene: Scene

  mesh: InstancedMesh | undefined

  renderer: WebGLRenderer

  controls: OrbitControls | undefined

  stats: Stats

  wheelControls: WheelControls | undefined

  constructor() {
    this.rayCaster = new Raycaster()
    this.mouse = new Vector2()
    this.color = new Color()
    this.white = new Color().setHex(0xfffffff)
    this.scene = new Scene()
    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.stats = new Stats()
  }

  rotate(direction: string) {
    const rotateDirection = new Vector2(0, 0)
    const step: number = 150
    switch (direction) {
      case 'left':
        rotateDirection.x += step
        break
      case 'right':
        rotateDirection.x -= step
        break
      case 'up':
        rotateDirection.y += step
        break
      case 'down':
        rotateDirection.y -= step
        break
    }
    this.wheelControls?.rotate(rotateDirection)
  }

  ngAfterViewInit(): void {
    const aspect = this.container?.nativeElement.clientWidth / this.container?.nativeElement.clientHeight
    this.camera = new PerspectiveCamera(60, aspect, 0.1, 100)
    const amount = parseInt(window.location.search.slice(1)) || 10
    this.camera.position.set(amount, amount, amount)
    this.camera.lookAt(0, 0, 0)

    const light = new HemisphereLight(0xffffff, 0x888888)
    light.position.set(0, 1, 0)
    this.scene.add(light)

    const geometry = new IcosahedronGeometry(0.5, 3)
    const material = new MeshPhongMaterial({
      color: 0xffffff
    })
    const count = Math.pow(amount, 3)
    this.mesh = new InstancedMesh(geometry, material, count)
    const offset = (amount - 1) / 2
    const matrix = new Matrix4()
    let i = 0
    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        for (let z = 0; z < amount; z++) {
          matrix.setPosition(offset - x, offset - y, offset - z)
          this.mesh.setMatrixAt(i, matrix)
          this.mesh.setColorAt(i, this.color)
          i++
        }
      }
    }
    this.scene.add(this.mesh)
    this.renderer.setSize(this.container?.nativeElement.clientWidth, this.container?.nativeElement.clientHeight)
    this.container?.nativeElement.appendChild(this.renderer.domElement)
    this.container?.nativeElement.appendChild(this.stats.dom)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.wheelControls = new WheelControls(this.controls)
    this.controls.enableDamping = true
    this.controls.enableZoom = false
    this.controls.enablePan = false
    this.controls.maxPolarAngle = Math.PI / 2 * 0.98

    this.container?.nativeElement.addEventListener('mousemove', (event: any) => {
      event.preventDefault()
      this.mouse.x = (event.clientX / this.container?.nativeElement.clientWidth) * 2 - 1
      this.mouse.y = -(event.clientY / this.container?.nativeElement.clientHeight) * 2 + 1
    })

    this.renderer.setAnimationLoop(() => {
      this.controls?.update()
      this.stats.update()
      TWEEN.update()


      if (this.camera) {
        this.rayCaster.setFromCamera(this.mouse, this.camera)
        const intersection = this.rayCaster.intersectObjects(this.scene.children)
        if (intersection.length > 0) {
          const instanceId: number | undefined = intersection[0].instanceId
          if (instanceId) {
            this.mesh?.getColorAt(instanceId, this.color)
            if (this.color.equals(this.white)) {
              this.mesh?.setColorAt(instanceId, this.color.setHex(Math.random() * 0xffffff))
              if (this.mesh?.instanceColor) {
                this.mesh.instanceColor.needsUpdate = true
              }
            }
          }
        }
        this.renderer.render(this.scene, this.camera)
      }
    })
  }
}
