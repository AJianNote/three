import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import {
  ACESFilmicToneMapping,
  EquirectangularReflectionMapping,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MultiplyBlending,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  WebGLRenderer
} from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

import { GroundProjectedSkybox } from 'three/examples/jsm/objects/GroundProjectedSkybox'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

@Component({
  selector: 'app-compress-model',
  templateUrl: './compress-model.component.html',
  styleUrls: ['./compress-model.component.scss']
})
export class CompressModelComponent implements AfterViewInit {

  @ViewChild('container', { static: false })
  container: ElementRef | undefined

  camera: PerspectiveCamera | undefined

  scene: Scene

  renderer: WebGLRenderer

  env: GroundProjectedSkybox | undefined

  controls: OrbitControls | undefined

  constructor() {
    this.scene = new Scene()
    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.setAnimationLoop(() => {
      if (this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    })
  }

  async ngAfterViewInit(): Promise<any> {
    this.renderer.setSize(this.container?.nativeElement.clientWidth, this.container?.nativeElement.clientHeight)
    const aspect: number = this.container?.nativeElement.clientWidth / this.container?.nativeElement.clientHeight
    this.camera = new PerspectiveCamera(40, aspect, 1, 1000)
    this.camera.position.set(-20, 7, 20)
    this.camera.lookAt(0, 4, 0)

    const hrdLoader = new RGBELoader()
    const envMap = await hrdLoader.loadAsync('assets/textures/equirectangular/blouberg_sunrise_2_1k.hdr')
    envMap.mapping = EquirectangularReflectionMapping
    this.env = new GroundProjectedSkybox(envMap)
    this.env.scale.setScalar(100)
    this.scene.add(this.env)
    this.scene.environment = envMap

    // 压缩的几何图形加载器
    const dracoLoader: DRACOLoader = new DRACOLoader()
    // 设置解码器路径, 路径是放在公共资源目录下的
    dracoLoader.setDecoderPath('assets/draco/gltf/')
    const loader: GLTFLoader = new GLTFLoader()
    // 设置加载器
    loader.setDRACOLoader(dracoLoader)
    const shadow = await new TextureLoader().loadAsync('assets/image/ferrari_ao.png')
    loader.load('assets/models/gltf/ferrari.glb', (gltf: GLTF) => {
      const bodyMaterial: MeshPhysicalMaterial = new MeshPhysicalMaterial({
        color: 0x000000,
        // 材质与金属的相似度 [0.0, 1.0],  默认值为0.0
        metalness: 1.0,
        // 材质的粗糙程度, 0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0
        roughness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.2
      })

      const meshStandardMaterial: MeshStandardMaterial = new MeshStandardMaterial({
        color: 0xffffff,
        // 材质与金属的相似度 [0.0, 1.0],  默认值为0.0
        metalness: 1.0,
        // 材质的粗糙程度, 0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0
        roughness: 0.5
      })

      const glassMaterial: MeshPhysicalMaterial = new MeshPhysicalMaterial({
        color: 0xffffff,
        // 材质与金属的相似度 [0.0, 1.0],  默认值为0.0
        metalness: 0.25,
        // 材质的粗糙程度, 0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0
        roughness: 0,
        // 透光率（或者说透光性），范围从0.0到1.0。默认值是0.0
        transmission: 1.0
      })

      const cardModel = gltf.scene.children[0]
      cardModel.scale.multiplyScalar(4)
      cardModel.rotation.y = Math.PI
      // 设置车身颜色
      this.setModelMaterial(cardModel, 'body', bodyMaterial)
      // 设置四个轮子描边颜色
      this.setModelMaterial(cardModel, 'rim_fl', meshStandardMaterial)
      this.setModelMaterial(cardModel, 'rim_fr', meshStandardMaterial)
      this.setModelMaterial(cardModel, 'rim_rr', meshStandardMaterial)
      this.setModelMaterial(cardModel, 'rim_rl', meshStandardMaterial)
      // 设置座椅线条颜色
      this.setModelMaterial(cardModel, 'trim', meshStandardMaterial)
      // 设置车窗材质
      this.setModelMaterial(cardModel, 'glass', glassMaterial)
      const mesh = new Mesh(
        new PlaneGeometry(0.655 * 4, 1.3 * 4),
        new MeshBasicMaterial({
          map: shadow,
          blending: MultiplyBlending,
          toneMapped: false,
          transparent: true
        })
      )
      mesh.rotation.x = -Math.PI / 2
      mesh.renderOrder = 2
      cardModel.add(mesh)
      this.scene.add(cardModel)
    })

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, 2, 0)
    this.controls.maxPolarAngle = MathUtils.degToRad(90)
    // 相机的最远距离
    this.controls.maxDistance = 80
    // 相机的最近距离
    this.controls.minDistance = 20
    // 摄像机平移, 默认为true
    this.controls.enablePan = false
    this.controls.update()
    this.container?.nativeElement.appendChild(this.renderer.domElement)
  }

  setModelMaterial(model: Object3D, objectName: string, material: MeshStandardMaterial | MeshPhysicalMaterial) {
    const object3D: any = model.getObjectByName(objectName)
    if (object3D) {
      object3D.material = material
    }
  }
}
