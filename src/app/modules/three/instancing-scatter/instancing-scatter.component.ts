import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  TorusKnotGeometry,
  Vector3,
  WebGLRenderer
} from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

const api = {

  count: 40500,
  distribution: 'random',
  // resample: resample,
  surfaceColor: 0xFFF784,
  backgroundColor: 0xE39469,

}

@Component({
  selector: 'app-instancing-scatter',
  templateUrl: './instancing-scatter.component.html',
  styleUrls: ['./instancing-scatter.component.scss']
})
export class InstancingScatterComponent implements AfterViewInit {

  @ViewChild('container')
  container: ElementRef | undefined

  surfaceGeometry = new TorusKnotGeometry(12, 4, 200, 32).toNonIndexed()
  surfaceMaterial = new MeshLambertMaterial({ color: api.surfaceColor, wireframe: false })
  surface: Mesh
  sampler: MeshSurfaceSampler

  stemGeometry: BufferGeometry | undefined
  stemMaterial: MeshStandardMaterial | undefined
  blossomGeometry: BufferGeometry | undefined
  blossomMaterial: MeshStandardMaterial | undefined
  stemMesh: InstancedMesh<BufferGeometry, MeshStandardMaterial> | undefined
  blossomMesh: InstancedMesh<BufferGeometry, MeshStandardMaterial> | undefined

  ages: Float32Array = new Float32Array(api.count)
  scales: Float32Array = new Float32Array(api.count)
  private position: Vector3 = new Vector3()
  private normal: Vector3 = new Vector3()
  private scale: Vector3 = new Vector3()

  dummy: Object3D = new Object3D<Event>()

  scene: Scene
  camera: PerspectiveCamera | undefined
  renderer: WebGLRenderer

  controls: OrbitControls | undefined

  status: Stats

  constructor() {
    this.surface = new Mesh(this.surfaceGeometry, this.surfaceMaterial)
    this.sampler = new MeshSurfaceSampler(this.surface)
      .setWeightAttribute(api.distribution === 'weighted' ? 'uv' : null)
      .build()
    this.scene = new Scene()
    this.scene.background = new Color(api.backgroundColor)

    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.status = new Stats()
  }

  ngAfterViewInit(): void {
    this.loadFlower()
  }

  loadFlower() {
    const loader = new GLTFLoader()
    loader.load('assets/models/gltf/Flower.glb', gltf => {
      // 花茎
      const stemMesh: Mesh<BufferGeometry, MeshStandardMaterial> = gltf.scene.getObjectByName('Stem') as Mesh<BufferGeometry, MeshStandardMaterial>
      // 花
      const blossomMesh: Mesh<BufferGeometry, MeshStandardMaterial> = gltf.scene.getObjectByName('Blossom') as Mesh<BufferGeometry, MeshStandardMaterial>
      this.stemGeometry = stemMesh.geometry.clone()
      this.blossomGeometry = blossomMesh.geometry.clone()

      const defaultTransform = new Matrix4().makeRotationX(Math.PI).multiply(new Matrix4().makeScale(3, 3, 3))
      this.stemGeometry.applyMatrix4(defaultTransform)
      this.blossomGeometry.applyMatrix4(defaultTransform)
      this.stemMaterial = stemMesh.material.clone()
      this.blossomMaterial = blossomMesh.material.clone()

      this.stemMesh = new InstancedMesh(this.stemGeometry, this.stemMaterial, api.count)
      this.blossomMesh = new InstancedMesh(this.blossomGeometry, this.blossomMaterial, api.count)

      const color = new Color()
      const blossomPalette = [0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405]
      for (let i = 0; i < api.count; i++) {
        color.setHex(blossomPalette[Math.floor(Math.random() * blossomPalette.length)])
        this.blossomMesh.setColorAt(i, color)
      }
      this.stemMesh.instanceMatrix.setUsage(DynamicDrawUsage)
      this.blossomMesh.instanceMatrix.setUsage(DynamicDrawUsage)
      this.resample()
      this.init()
    })
  }

  resample() {
    const vertexCount = this.surface.geometry.getAttribute('position').count
    console.info('Sampling ' + api.count + ' points from a surface with ' + vertexCount + ' vertices...')
    for (let i = 0; i < api.count; i++) {

      this.ages[i] = Math.random()
      this.scales[i] = this.scaleCurve(this.ages[i])
      this.resampleParticle(i)
    }
    if (this.stemMesh && this.blossomMesh) {
      this.stemMesh.instanceMatrix.needsUpdate = true
      this.blossomMesh.instanceMatrix.needsUpdate = true
    }
  }

  init() {
    const aspect = this.container?.nativeElement.clientWidth / this.container?.nativeElement.clientHeight
    this.camera = new PerspectiveCamera(60, aspect, 0.1, 100)
    this.camera.position.set(25, 25, 25)
    this.camera.lookAt(0, 0, 0)


    const pointLight = new PointLight(0xAA8899, 0.75)
    pointLight.position.set(50, -25, 75)
    this.scene.add(pointLight)
    this.scene.add(new HemisphereLight())

    if (this.stemMesh && this.blossomMesh) {
      this.scene.add(this.stemMesh)
      this.scene.add(this.blossomMesh)
    }
    this.scene.add(this.surface)

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.container?.nativeElement.clientWidth, this.container?.nativeElement.clientHeight)
    this.container?.nativeElement.appendChild(this.renderer.domElement)
    this.container?.nativeElement.appendChild(this.status.dom)

    this.renderer.setAnimationLoop(() => {

      this.controls?.update()
      this.status.update()
      if (this.stemMesh && this.blossomMesh) {
        const time = Date.now() * 0.001
        this.scene.rotation.x = Math.sin(time / 4)
        this.scene.rotation.y = Math.sin(time / 4)

        for (let i = 0; i < api.count; i++) {
          this.updateParticle(i)
        }
        this.stemMesh.instanceMatrix.needsUpdate = true
        this.blossomMesh.instanceMatrix.needsUpdate = true
      }
      if (this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    })

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.enableZoom = false
    this.controls.enablePan = false
    this.controls.maxPolarAngle = Math.PI / 2 * 0.98
  }

  updateParticle(i: number) {
    this.ages[i] += 0.005
    if (this.ages[i] >= 1) {
      this.ages[i] = 0.001
      this.scales[i] = this.scaleCurve(this.ages[i])
      this.resampleParticle(i)
      return
    }

    const prevScale = this.scales[i]
    this.scales[i] = this.scaleCurve(this.ages[i])
    this.scale.set(this.scales[i] / prevScale, this.scales[i] / prevScale, this.scales[i] / prevScale)

    this.stemMesh?.getMatrixAt(i, this.dummy.matrix)
    this.dummy.matrix.scale(this.scale)
    this.stemMesh?.setMatrixAt(i, this.dummy.matrix)
    this.blossomMesh?.setMatrixAt(i, this.dummy.matrix)
  }

  scaleCurve(t: number) {
    return Math.abs(this.easeOutCubic(t > 0.5 ? 1 - t : t) * 2)
  }

  easeOutCubic(t: number) {
    return (--t) * t * t + 1
  }

  resampleParticle(i: number) {
    this.sampler.sample(this.position, this.normal)
    this.normal.add(this.position)
    this.dummy.position.copy(this.position)
    this.dummy.scale.set(this.scales[i], this.scales[i], this.scales[i])
    this.dummy.lookAt(this.normal)
    this.dummy.updateMatrix()
    this.stemMesh?.setMatrixAt(i, this.dummy.matrix)
    this.blossomMesh?.setMatrixAt(i, this.dummy.matrix)
  }
}
