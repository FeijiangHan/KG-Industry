import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import 'antd/dist/antd.min.css'
import { ConfigProvider, message } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import 'moment/locale/zh-cn'
import '@arcgis/core/assets/esri/themes/light/main.css'
const root = ReactDOM.createRoot(document.getElementById('root'))

message.config({
  maxCount: 3,// 最大显示数, 超过限制时，最早的消息会被自动关闭
})
root.render(
  <ConfigProvider locale={zh_CN}>
    <App />
  </ConfigProvider>
)