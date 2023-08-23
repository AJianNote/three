import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import {
  Color,
  Fog,
  HemisphereLight,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene, SpotLight,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { ReflectorForSSRPass } from 'three/examples/jsm/objects/ReflectorForSSRPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader'

@Component({
  selector: 'app-postprocessing-ssr',
  templateUrl: './postprocessing-ssr.component.html',
  styleUrls: ['./postprocessing-ssr.component.scss']
})
export class PostprocessingSsrComponent implements AfterViewInit {

  @ViewChild('container')
  container: ElementRef | undefined

  scene: Scene

  camera: PerspectiveCamera | undefined

  renderer: WebGLRenderer

  controls: OrbitControls | undefined

  groundReflector: ReflectorForSSRPass | undefined

  composer: EffectComposer | undefined

  ssrPass: SSRPass | undefined

  selects: any[]

  constructor() {
    this.scene = new Scene()
    this.scene.background = new Color(0x443333)
    this.scene.fog = new Fog(0x443333, 1, 4)

    this.renderer = new WebGLRenderer({
      antialias: true,
      // logarithmicDepthBuffer: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setAnimationLoop(() => {
      // if (this.camera) {
      //   this.renderer.render(this.scene, this.camera)
      // }
      this.composer?.render()
      this.controls?.update()
    })
    // this.renderer.outputColorSpace = LinearSRGBColorSpace
    this.selects = []
  }


  ngAfterViewInit(): void {
    const aspect: number = this.container?.nativeElement.clientWidth / this.container?.nativeElement.clientHeight
    this.camera = new PerspectiveCamera(35, aspect, 0.1, 15)
    this.camera.position.set(0.13271600513224902, 0.3489546826045913, 0.43921296427927076)

    const plane = new Mesh(
      new PlaneGeometry(8, 8),
      new MeshPhongMaterial({
        color: 0x999999,
        specular: 0x101010
      })
    )
    plane.rotation.x = -Math.PI / 2
    plane.position.y = -0.0001
    this.scene.add(plane)

    const hemisphereLight: HemisphereLight = new HemisphereLight(0x443333, 0x111122)
    this.scene.add(hemisphereLight)

    const spotLight = new SpotLight()
    spotLight.angle = Math.PI / 16
    spotLight.penumbra = 0.5
    spotLight.position.set(-1, 1, 1)
    this.scene.add(spotLight)

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('assets/draco/')
    dracoLoader.setDecoderConfig({ type: 'js' })
    dracoLoader.load('assets/models/draco/bunny.drc', (geometry) => {
      geometry.computeVertexNormals()
      const material = new MeshStandardMaterial({
        color: 0x606060
      })
      const mesh = new Mesh(geometry, material)
      mesh.position.y = -0.0365
      this.scene.add(mesh)
      this.selects.push(mesh)
      dracoLoader.dispose()
    })

    this.groundReflector = new ReflectorForSSRPass(
      new PlaneGeometry(1, 1),
      {
        clipBias: 0.0003,
        textureWidth: window.innerWidth,
        textureHeight: window.innerHeight,
        color: 0x888888,
        useDepthTexture: true,
      }
    )
    this.groundReflector.material.depthWrite = false
    this.groundReflector.rotation.x = -Math.PI / 2
    this.groundReflector.visible = false
    this.scene.add(this.groundReflector)
    this.renderer.setSize(this.container?.nativeElement.clientWidth, this.container?.nativeElement.clientHeight)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.target.set(0, 0.0635, 0)
    this.controls.update()

    this.container?.nativeElement.appendChild(this.renderer.domElement)

    this.composer = new EffectComposer(this.renderer)
    this.ssrPass = new SSRPass({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      width: this.container?.nativeElement.clientWidth,
      height: this.container?.nativeElement.clientHeight,
      groundReflector: this.groundReflector,
      selects: this.selects
    })
    this.composer.addPass(this.ssrPass)
    this.composer.addPass(new ShaderPass(GammaCorrectionShader))
    this.ssrPass.thickness = 0.018
    this.ssrPass.maxDistance = 0.1
    this.groundReflector.maxDistance = this.ssrPass.maxDistance
    this.ssrPass.opacity = 1
    this.groundReflector.opacity = this.ssrPass.opacity
  }

}
