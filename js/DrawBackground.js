import { getAngle, setAngle, createCtx } from './util/util.js'
import { initTracksAPI } from './api'

// 直线轨道
let initLine
// 所有圆形轨道的数组
let circleTrackArr = []
// 让canvas填充全屏,并创建ctx,作为全局变量
let ctx

// 初始化
init()
// 初始化函数
async function init () {
  // 获取所有轨道数据
  const data = (await initTracksAPI()).data
  initLine = data[0]
  circleTrackArr = data[1]

  ctx = createCtx('bc-canvas')
  // 画一个灰色全屏矩形
  drawRect(0, 0, ctx.canvas.width, ctx.canvas.height, 'gray')
  // 画所有轨道
  drawAllTrack()
  // 画蛤蟆和终点图,并绑定事件
  drawImgAndBindEvent()
}

// =====================================================
// 填充矩形的函数
function drawRect (x, y, width, height, color) {
  ctx.save()
  ctx.beginPath()
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height)
  ctx.restore()
}

// =====================================================
// 画所有轨迹
function drawAllTrack () {
  // 画初始直线
  drawLine(initLine.x1, initLine.y1, initLine.x2, initLine.y2, 'white', 80)
  // 画所有圆形轨道
  circleTrackArr.forEach(circle => {
    const { x, y, radius, loop } = circle
    let direction = [Math.PI, 0]
    if (!loop) {
      direction = [0, Math.PI]
    }
    drawStrokeCircle(x, y, radius, ...direction, true, '#8d067c80', 80)
  })
}

// 画线的函数
function drawLine (x1, y1, x2, y2, color, width) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()
}

// 描绘圆的函数,带全参数
function drawStrokeCircle (x, y, radius, startAngle, endAngle, anticlockwise, color, width) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  ctx.stroke()
  ctx.restore()
}

// =====================================================
// 绘制图片,并绑定事件
async function drawImgAndBindEvent () {
  // 加载图片
  const [haMaImg, endImg] = await Promise.all([
    loadImg('./img/ha_ma.png'),
    loadImg('./img/end.png')
  ])
  // 绘画图片
  drawImage(haMaImg, 820, 280, 200, 200)
  drawImage(endImg, 1125, 280, 150, 150)
  // 绑定事件
  bindImgRotateEvent(haMaImg)

  // 给图片绑定随鼠标旋转效果
  function bindImgRotateEvent (img) {
    const canvas = document.getElementById('main-canvas')
    canvas.addEventListener('mousemove', e => {
      // 算角
      const x = e.x
      const y = e.y
      const diffX = x - 920
      const diffY = y - 380
      setAngle(Math.atan2(diffY, diffX))
      // 画图
      ctx.save()
      ctx.clearRect(810, 270, 220, 220)
      drawRect(810, 270, 220, 220, 'gray')
      ctx.translate(920, 380)
      ctx.rotate(getAngle())
      ctx.drawImage(img, -100, -100, 200, 200)
      ctx.restore()
    })
  }
}

// 根据img对象,在canvas上绘制图片
function drawImage (img, x, y, width, height) {
  ctx.save()
  ctx.beginPath()
  ctx.drawImage(img, x, y, width, height)
  ctx.restore()
}

// 引入图片到js中的函数
function loadImg (src) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.src = src
  })
}

// =====================================================




