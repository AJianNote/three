import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Camera, Quaternion, Spherical, Vector2, Vector3 } from 'three'
import { createSimpleAnimate } from './animate'
import TWEEN from '@tweenjs/tween.js'

export class WheelControls {

  controls: OrbitControls
  camera: Camera
  domElement: HTMLElement | Document

  private rotateStart: Vector2 = new Vector2(500, 500)
  private rotateEnd: Vector2 = new Vector2(500, 500)
  private mouseEvent: Vector2 = new Vector2(500, 500)
  private rotateDelta: Vector2 = new Vector2()
  private sphericalDelta: Spherical = new Spherical()
  private offset: Vector3 = new Vector3()
  private quaternion: Quaternion = new Quaternion()
  private quaternionInverse: Quaternion = new Quaternion()
  private lastPosition: Vector3 = new Vector3()
  private lastQuaternion: Quaternion = new Quaternion()
  private twoPI: number = 2 * Math.PI
  private spherical: Spherical = new Spherical()
  private panOffset: Vector3 = new Vector3()
  private rotating: boolean

  constructor(orbitControls: OrbitControls) {
    this.controls = orbitControls
    this.camera = orbitControls.object
    this.domElement = orbitControls.domElement
    this.rotating = false
    this.quaternion.setFromUnitVectors(this.camera.up, new Vector3(0, 1, 0))
    this.quaternionInverse = this.quaternion.clone().invert()
  }

  /**
   * 旋转
   * @param rotateDistance 旋转距离
   * @param duration 旋转持续时间
   */
  rotate(rotateDistance: Vector2, duration: number = 1000) {
    if (this.rotating) {
      return
    }
    const startStatus = {
      x: this.mouseEvent.x,
      y: this.mouseEvent.y
    }
    this.mouseEvent.x += rotateDistance.x
    this.mouseEvent.y += rotateDistance.y
    const endStatus = {
      x: this.mouseEvent.x,
      y: this.mouseEvent.y
    }
    const update = (obj: { x: number, y: number }) => {
      const x = Math.floor(obj.x)
      const y = Math.floor(obj.y)
      this.rotateEnd.set(x, y)
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.controls.rotateSpeed)
      if (this.domElement instanceof HTMLElement) {
        this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / this.domElement.clientHeight
        this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight
      }
      this.rotateStart.copy(this.rotateEnd)
      this.update()
    }
    const complete = () => {
      this.rotating = false
    }
    this.rotating = true
    createSimpleAnimate(startStatus, endStatus, duration, update, TWEEN.Easing.Linear.None, complete)

  }

  update() {
    const position = this.camera.position
    this.offset.copy(position).sub(this.controls.target)
    this.offset.applyQuaternion(this.quaternion)
    this.spherical.setFromVector3(this.offset)
    this.spherical.theta += this.sphericalDelta.theta
    this.spherical.phi += this.sphericalDelta.phi
    this.cyclicRotation()
    // restrict phi to be between desired limits
    this.spherical.phi = Math.max(this.controls.minPolarAngle, Math.min(this.controls.maxPolarAngle, this.spherical.phi))
    this.spherical.makeSafe()
    this.spherical.radius *= 1
    // restrict radius to be between desired limits
    this.spherical.radius = Math.max(this.controls.minDistance, Math.min(this.controls.maxDistance, this.spherical.radius))
    // move target to panned location
    this.controls.target.add(this.panOffset)
    this.offset.setFromSpherical(this.spherical)
    // rotate offset back to "camera-up-vector-is-up" space
    this.offset.applyQuaternion(this.quaternionInverse)
    position.copy(this.controls.target).add(this.offset)
    this.controls.object.lookAt(this.controls.target)
    this.sphericalDelta.set(0, 0, 0)
    this.panOffset.set(0, 0, 0)
    const EPS = 0.000001
    if (this.lastPosition.distanceToSquared(this.controls.object.position) > EPS ||
      8 * (1 - this.lastQuaternion.dot(this.controls.object.quaternion)) > EPS) {
      this.controls.dispatchEvent({ type: 'change' } as any)
      this.lastPosition.copy(this.controls.object.position)
      this.lastQuaternion.copy(this.controls.object.quaternion)
    }
  }

  private cyclicRotation() {
    let min = this.controls.minAzimuthAngle
    let max = this.controls.maxAzimuthAngle
    if (isFinite(min) && isFinite(max)) {
      if (min < -Math.PI) {
        min += this.twoPI
      } else if (min > Math.PI) {
        min -= this.twoPI
      }

      if (max < -Math.PI) {
        max += this.twoPI
      } else if (max > Math.PI) {
        max -= this.twoPI
      }

      if (min <= max) {
        this.spherical.theta = Math.max(min, Math.min(max, this.spherical.theta))
      } else {
        this.spherical.theta = (this.spherical.theta > (min + max) / 2) ?
          Math.max(min, this.spherical.theta) :
          Math.min(max, this.spherical.theta)
      }
    }
  }
}
