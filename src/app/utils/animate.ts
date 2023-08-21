import TWEEN from '@tweenjs/tween.js'

/**
 * 创建一个简单的过度效果
 * @param startStatus 开始状态
 * @param endStatus 结束状态
 * @param duration 动画持续时间
 * @param update 每次更新的回调函数
 * @param easing 动画效果 TWEEN.Easing枚举
 * @param complete 动画结束回调
 */
export function createSimpleAnimate(startStatus: any, endStatus: any, duration: number, update: Function, easing: any, complete?: Function) {
  new TWEEN.Tween(startStatus)
      .to(endStatus, duration)
      .onUpdate((obj) => {
        update(obj)
      })
      .easing(easing || TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        if (typeof complete === 'function') {
          complete()
        }
      })
      .start()
}
