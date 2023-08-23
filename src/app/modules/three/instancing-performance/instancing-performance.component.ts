import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import {
  BufferGeometry,
  BufferGeometryLoader,
  Color,
  Euler,
  InstancedMesh,
  Matrix4,
  MeshNormalMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { InstancedBufferGeometry } from 'three/src/core/InstancedBufferGeometry'
import Stats from 'three/examples/jsm/libs/stats.module'

@Component({
  selector: 'app-instancing-performance',
  templateUrl: './instancing-performance.component.html',
  styleUrls: ['./instancing-performance.component.scss']
})
export class InstancingPerformanceComponent implements AfterViewInit {
  @ViewChild('container')
  container: ElementRef | undefined

  camera: PerspectiveCamera | undefined

  renderer: WebGLRenderer

  scene: Scene

  controls: OrbitControls | undefined

  material: MeshNormalMaterial

  status: Stats

  constructor() {
    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.scene = new Scene()
    this.material = new MeshNormalMaterial()
    this.status = new Stats()
  }

  ngAfterViewInit(): void {
    const aspect = this.container?.nativeElement.clientWidth / this.container?.nativeElement.clientHeight
    this.camera = new PerspectiveCamera(70, aspect, 1, 100)
    this.camera.position.z = 30

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.container?.nativeElement.clientWidth, this.container?.nativeElement.clientHeight)
    this.renderer.setAnimationLoop(() => {
      if (this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
      this.controls?.update()
      this.status?.update()
    })
    this.container?.nativeElement.appendChild(this.renderer.domElement)
    this.container?.nativeElement.appendChild(this.status.dom)

    this.scene.background = new Color(0xffffff)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotate = true

    this.initMesh()
  }

  initMesh() {
    new BufferGeometryLoader().setPath('assets/models/json/')
      .load('suzanne_buffergeometry.json', (geometry) => {
        geometry.computeVertexNormals()
        this.makeInstanced(geometry)
      })
  }

  makeInstanced(geometry: InstancedBufferGeometry | BufferGeometry) {
    const matrix4 = new Matrix4()
    const mesh: InstancedMesh<BufferGeometry, MeshNormalMaterial> = new InstancedMesh(geometry, this.material, 4000)

    for (let i = 0; i < 4000; i++) {
      this.randomizeMatrix(matrix4)
      // 设置每个物体的位置,通过下标设置
      mesh.setMatrixAt(i, matrix4)
    }
    this.scene.add(mesh)
  }

  /**
   * 随机物体的位置
   * @param matrix4
   */
  randomizeMatrix(matrix4: Matrix4) {
    const position = new Vector3()
    const rotation = new Euler()
    const quaternion = new Quaternion()
    const scale = new Vector3()
    position.x = Math.random() * 40 - 20
    position.y = Math.random() * 40 - 20
    position.z = Math.random() * 40 - 20

    rotation.x = Math.random() * 2 * Math.PI
    rotation.y = Math.random() * 2 * Math.PI
    rotation.z = Math.random() * 2 * Math.PI
    quaternion.setFromEuler(rotation)

    scale.x = scale.y = scale.z = Math.random()
    matrix4.compose(position, quaternion, scale)
  }
}
