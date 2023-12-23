// 刚开始的直线
export const initLine = {
  x1: 400,
  y1: 0,
  x2: 400,
  y2: 400,
}
// 所有圆形轨道的数组
export const circleTrackArr = [
  {
    x: 900,
    y: 400,
    radius: 500,
    loop: true //是否从左到右画
  },
  {
    x: 1000,
    y: 400,
    radius: 400,
    loop: false
  },
  {
    x: 900,
    y: 400,
    radius: 300,
    loop: true
  },
]
// 蛤蟆旋转的角度
let rotateAngle = 0

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
export class CircleClass {
  t = 0
  index = 0

  constructor (ctx, x, y, color) {
    this.x = x
    this.y = y
    this.angle = Math.PI
    this.color = color
    // drawFillCircle(ctx, x, y, 40, 0, Math.PI * 2, true, color)
  }
}

// 改变角度
export function setAngle (angle) {
  rotateAngle = angle
}

// 获取角度
export function getAngle () {
  return rotateAngle
}

export const request = axios.create({
  headers: {
    'Access-Control-Allow-Origin': 'http://localhost:8080'
  }
})
