import { initLine, circleTrackArr, CircleClass, createCtx, getAngle } from './util.js'

// 创建ctx对象
const ctx = createCtx('main-canvas')

// 计算所有轨道的长度
const totalLength = getCircleLength()
// 球在圆弧轨道运动需要的时间
let totalTime = 15
// 计算圆弧上运动的平均速度
let speed = totalLength / totalTime
// 是否失败
let isFail = false
// Δt
let dt = 0.015
// 球的所有颜色数组
// const colorArr = ['skyblue', 'yellow', 'green', 'red']
const colorArr =['#00c0ff', '#fff900', '#00ff00', '#ff0000']

// 生成所有球
const circleArr = createInitCircleArr()
// 在蛤蟆嘴里的圆,这个坐标是相对于蛤蟆中心的坐标
let shotCircle = new CircleClass(ctx, 70, 0, colorArr[Math.floor(Math.random() * 4)])

// 渲染
function render () {
  if (isFail) {
    alert('游戏结束,你输了')
    return
  }
  // 清除canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // 没有处于发射状态的球,跟随鼠标移动
  if (!shotCircle.isShoot) {
    drawCircleInMouse(shotCircle)
  }
  circleArr.forEach(circle => {
    updateCircleMovingOnTrack(circle)
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

// 生成轨道上所有球,返回circleArr
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

// =====================================================

// 点击事件,发射球
document.getElementById('main-canvas').addEventListener('click', () => {
  shootingCircle()
})

// 发射球
function shootingCircle () {
  // 处于发射状态,不再发射
  if (shotCircle.isShoot) {
    return
  }

  // 1s后再次生成一个球
  setTimeout(() => {
    shotCircle = createCircleObj(70, 0, colorArr[Math.floor(Math.random() * 4)])
  }, 800)

  shotCircle.cos = Math.cos(getAngle())
  shotCircle.sin = Math.sin(getAngle())
  shotCircle.x = 920 + 70 * shotCircle.cos
  shotCircle.y = 380 + 70 * shotCircle.sin
  shotCircle.isShoot = true

  // 发射球的动画
  updateShootingCircle()
}

// 发射的球的动画
function updateShootingCircle () {
  if (!shotCircle.isShoot) {
    return
  }
  drawFillCircle(ctx, shotCircle.x, shotCircle.y, 40, 0, Math.PI * 2, true, shotCircle.color)
  shotCircle.x += shotCircle.cos * 6
  shotCircle.y += shotCircle.sin * 6
  requestAnimationFrame(updateShootingCircle)
}

// 画最在蛤蟆嘴里的圆
function drawCircleInMouse (circle) {
  ctx.save()
  ctx.translate(920, 380)
  ctx.rotate(getAngle())
  drawFillCircle(ctx, circle.x, circle.y, 40, 0, Math.PI * 2, true, circle.color)
  ctx.restore()
}

// 填充圆的函数,带全参数
function drawFillCircle (ctx, x, y, radius, startAngle, endAngle, anticlockwise, color) {
  ctx.save()
  const gradient = ctx.createRadialGradient(x-15, y-15, 5, x, y, radius)
  // gradient.addColorStop(0, `${color}30`)
  gradient.addColorStop(0, `#ffffff80`)
  gradient.addColorStop(0.4, `${color}90`)
  gradient.addColorStop(1, color)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  ctx.fill()

  // ctx.fillStyle = color
  // ctx.beginPath()
  // ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  // ctx.fill()
  ctx.restore()
}

// =====================================================

// 在轨道内运动的球的动画
function updateCircleMovingOnTrack (circle) {
  const index = circle.index
  if (index > 3) {
    isFail = true
    return
  }
  // 在直线上
  if (index === 0) {
    setTimeout(() => dt = 0.002, 600)
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
  drawFillCircle(ctx, circle.x, circle.y, 40, 0, Math.PI * 2, true, circle.color)
}

render()


