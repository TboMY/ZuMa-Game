// 蛤蟆旋转的角度
let rotateAngle = 0

// 改变角度
export function setAngle (angle) {
  rotateAngle = angle
}

// 获取角度
export function getAngle () {
  return rotateAngle
}

// 全屏canvas,创建ctx然后返回
export function createCtx (id) {
  const canvas = document.getElementById(id)
  const x = document.documentElement.clientWidth
  const y = document.documentElement.clientHeight
  canvas.width = x
  canvas.height = y
  return canvas.getContext('2d')
}

// 圆球的类
// export class CircleClass {
//   index = 0
//
//   constructor (ctx, x, y, color) {
//     this.x = x
//     this.y = y
//     this.angle = Math.PI
//     this.color = color
//   }
// }
