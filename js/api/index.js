// 获取所有轨道数据
export const initTracksAPI = () => {
  return axios.get('http://localhost:8080/initTracks')
}

// 获取小球数组初始数据
export const initCircleArrAPI = () => {
  return axios.get('http://localhost:8080/initCircles')
}

// 获取蛤蟆嘴里的球
export const getNewShotCircleAPI = () => {
  return axios.get('http://localhost:8080/newShotCircle')
}

// 碰撞之后发送请求
export const hitAPI = (circleArr, trackCircle, shotCircle, indexInCircleArr) => {
  return axios({
    url: 'http://localhost:8080/hit',
    method: 'post',
    data: {
      circleArr,
      trackCircle,
      shotCircle,
      indexInCircleArr
    }
  })
}
