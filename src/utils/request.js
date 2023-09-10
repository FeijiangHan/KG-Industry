//import { message } from "antd"
import axios from "axios"
//import { getToken } from './token'
//import { history } from "./history"
var qs = require('qs')
axios.defaults.withCredentials = true
const request = axios.create({
  withCredentials: true,  //允许cookie
})
//请求拦截器
request.interceptors.request.use((config) => {
  //headers中的content-type 默认的大多数情况是  application/json，就是json序列化的格式
  config.headers.post['Content-Type'] = 'application/json; charset=UTF-8' //'application/x-www-form-urlencoded';
  //为了判断是否为formdata格式，增加了一个变量为type,如果type存在，而且是form的话，则代表是formData的格式
  if (config.type && config.type === 'form') {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    //data是接收的数据，接收的数据需要通过qs编码才可以直接使用
    if (config.data) {
      config.data = qs.stringify(config.data)
    }
  } else if (config.type && config.type === 'file') {
    config.headers['Content-Type'] = 'multipart/form-data'
  }
  /*
  const token = getToken()
  if (token) {
    config.headers.Authorization = `${token}`
  }
  */
  return config
}, (error) => {
  return Promise.reject(error)
})
//响应拦截器
request.interceptors.response.use((res) => {
  // 如果返回的code是202，则表示token有问题，直接把登录信息清除
  /*
  if (res.data) {
    if (res.data.retCode === 500) {
      res.data.message = "服务器异常"
    } else if (res.data.retCode === 10020) {
      // 返回10020 表示目标节点不存在
      message.error(res.data.message)
    } else if (res.data.retCode === 20020) {
      // 编辑权限过期，请重新申请编辑权限
      message.error(res.data.message)
    } else if (res.data.retCode === 20030) {
      // 当前有用户正在编辑, 请重新申请编辑权限
      message.error(res.data.message)
    } else if (res.data.retCode === 20040) {
      // 无权限, 请重新申请编辑权限！
      message.error(res.data.message)
    }
  }*/
  return res.data
}, (error) => {
  console.dir(error)
  /*
  const status = error.response.status
  if (status === 401) {
    message.error("token失效,请重新登录!!")
    history.push('/login')
  } else if (status === 500) {
    message.error("重复字段等数据库操作错误")
  }*/
  return Promise.reject(error)
})

export { request }