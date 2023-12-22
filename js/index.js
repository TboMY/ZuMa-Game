import { initLine, circleTrackArr, CircleClass, createCtx, drawFillCircle, getAngle } from './util.js'

// 创建ctx对象
const ctx = createCtx('main-canvas')

// 计算所有轨道的长度
const totalLength = getCircleLength()
// 球在圆弧轨道运动需要的时间
let totalTime = 10
// 计算圆弧上运动的平均速度
let speed = totalLength / totalTime
// 是否失败
let isFail = false
// Δt
let dt = 0.015
// 球的所有颜色数组
const colorArr = ['skyblue', 'yellow', 'green','red']
// 生成所有球
const circleArr = createInitCircleArr()



// 渲染
function render () {
  if (isFail) {
    alert('游戏结束,你输了')
    return
  }
  // 清除canvas
  // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  circleArr.forEach(circle => {
    // update(circle)
  })

  requestAnimationFrame(render)
}


// 计算所有圆弧轨道长度,
function getCircleLength () {
  let totalLength = 0
  circleTrackArr.forEach(circle => {
    totalLength += Math.PI * circle.radius
  })
  return totalLength
}

// 生成开始的几个球,返回circleArr
function createInitCircleArr () {
  const circleArr = Array(60)
  for (let i = 0; i < circleArr.length; i++) {
    // 生成0-4的随机数
    const random = Math.floor(Math.random() * 4)
    circleArr[i] = createCircleObj(400, i * -80, colorArr[random])
  }
  return circleArr
}

// 生成Circle类的实例对象
function createCircleObj (x, y, color) {
  return new CircleClass(ctx, x, y, color)
}

// 更新球的位置
function update (circle) {
  const index = circle.index
  if (index > 3) {
    isFail = true
    return
  }
  // 在直线上
  if (index === 0) {
    setTimeout(() => dt = 0.002, 400)
    // 每次增加的距离
    const diffY = dt * speed
    circle.y = circle.y + diffY

    // 如果使用`circle.y`判断会有明显卡顿,使用`circle.y + diffY`没有很明显
    if (circle.y + diffY >= initLine.y2) {
      circle.index = index + 1
      circle.t = 0
    }
  } else {
    // 在圆形轨道上
    const { radius, x, y, loop } = circleTrackArr[index - 1]

    // 应该在该段轨道运动的时间
    const trackTime = Math.PI * radius / totalLength * totalTime
    // 算出在该段时间内,每一次角度变化多少(Δt=0.002)
    const diffAngle = Math.PI / trackTime / 500.0

    const diffX = radius * Math.cos(circle.angle)
    const diffY = radius * Math.sin(circle.angle) * -1

    circle.angle += diffAngle

    // 从右到左还是从左到右
    if (loop) {
      // true说明:球从左到右
      circle.x = x + diffX
      circle.y = y + diffY
    } else {
      // false说明:球从右到左
      circle.x = x - diffX
      circle.y = y - diffY
    }
    if (circle.t >= trackTime) {
      circle.index = index + 1
      circle.t = 0
      circle.angle = Math.PI
    }
    circle.t += dt
  }
  // 重绘圆
  // drawFillCircle(ctx, circle.x, circle.y, 40, 0, Math.PI * 2, true,circle.color )
}

render()


const canvas = document.getElementById('main-canvas')
canvas.addEventListener('mousemove', e => {
  // 画图
  ctx.save()
  ctx.translate(920, 380)
  ctx.rotate(getAngle())
  drawFillCircle( ctx, 0, 70, 40, 0, Math.PI * 2, true, 'red')
  ctx.restore()
})


