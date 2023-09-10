import './index.css'
import React, { useEffect, useState } from 'react'
import card from '@/assets/img/card.png'
import useStore from '../../store'
import { observer } from 'mobx-react-lite'
import LittleHeader from '../LittleHeader'
import {
  DownloadOutlined,
} from '@ant-design/icons'
import {
  mulLinkDetailList,
  nodeDetailList,
} from '@/components/infoShow.js'
import { exportWord } from '@/utils'
import { message } from 'antd'
function DetailCard () {
  const { graphStore } = useStore()
  const { select, selectSvgRef, selectSvgContainerRef } = graphStore
  const download = () => {
    console.log('select', select)
    if (!select) {
      message.error("卡片内容为空")
      return
    }
    exportWord(select, selectSvgRef, selectSvgContainerRef)
    // console.log(selectToWordData(select))
  }
  return (
    <div className="detail-card">
      <LittleHeader img={card} name="知识卡片">
        <DownloadOutlined onClick={download} />
      </LittleHeader>
      <div className={'body'}>
        {
          select === null ? '尚未选中节点或边' :
            select.type === 'node' ?
              nodeDetailList(select, "节点") :
              mulLinkDetailList(select, '')
        }

      </div>
    </div>
  )
}
export default observer(DetailCard)