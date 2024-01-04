// 登录
export const loginAPI = data => {
  return axios({
    url: 'http://localhost:8080/login',
    method: 'post',
    data
  })
}

// 获取所有轨道数据
export const initTracksAPI = () => {
  return axios.get('http://localhost:8080/initTracks')
}

// 获取小球数组初始数据
export const initCircleArrAPI = name => {
  return axios.get('http://localhost:8080/initCircleArr', {
    params: {
      name
    }
  })
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

// 发送是否停止回滚的请求
export const isStopAPI = (rollbackCircle, preCircle) => {
  return axios({
    url: 'http://localhost:8080/isStopRollback',
    method: 'post',
    data: {
      preCircle,
      rollbackCircle
    }
  })
}

// 回滚之后是否可以再次消除
export const isClearAgainAPI = (circleArr, index) => {
  return axios({
    url: 'http://localhost:8080/isReClear',
    method: 'post',
    data: {
      circleArr,
      index
    }
  })
}

// 下一关
export const nextLevelAPI = name => {
  return axios.get('http://localhost:8080/nextLevel', {
    params: {
      name
    }
  })
}

// 获取第几关
export const getLevelIdAPI = name => {
  return axios.get('http://localhost:8080/getLevel', {
    params: {
      name
    }
  })
}

// 获取排行榜
export const getRankingListAPI = page => {
  return axios.get('http://localhost:8080/getRanking',{
    params: {
      page
    }
  })
}

// 获取所有条数
export const getTotalCountAPI = () => {
  return axios.get('http://localhost:8080/getTotalCount')
}

// 获取道具数量
// 'getPluginCount'
export const getPluginCountAPI = name => {
  return axios.get('http://localhost:8080/getPluginCount', {
    params: {
      name
    }
  })
}

// 修改道具剩余数量
export const updatePluginCountAPI = (name, moneyPlugin, commonPlugin) => {
  return axios({
    url: 'http://localhost:8080/updatePluginCount',
    method: 'post',
    data: {
      name,
      moneyPlugin,
      commonPlugin
    }
  })
}
