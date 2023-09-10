//操作记录
import { Table } from 'antd'
import LittleHeader from "../LittleHeader"
import { toJS } from "mobx"
import {
  DownloadOutlined,
} from '@ant-design/icons'
import { message } from 'antd'
import { saveAs } from 'file-saver'
import operationImg from '@/assets/img/operation.png'
import { useState, useEffect } from 'react'
import useStore from '@/store'
import { observer } from 'mobx-react-lite'
import moment from 'moment'
import ScrollTable from '../ScrollTable'
function OperationRecord () {
  const { publicStore } = useStore()
  const { operationRecordList } = publicStore
  const [maxHeight, setMaxHeight] = useState(100)
  /*useEffect(() => {
    if (document.body.clientHeight <= 722) {
      setMaxHeight(105)
    } else {
      setMaxHeight(document.body.offsetHeight - 725)
    }
  }, [publicStore.windowResizeFlag])*/
  const columns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: '38%',
      render: (text) => moment(text).format('MM-DD HH:mm:ss')
    },
    {
      title: '操作名称',
      dataIndex: 'name',
      key: 'name',
      width: '33%'
    },
    {
      title: '返回结果',
      dataIndex: 'result',
      key: 'result',
      render: (text) => {
        let index = text.lastIndexOf("\/")
        return text.substring(index + 1, text.length)
      },
      ellipsis: true,
    },
  ]

  const download = () => {
    console.log("operationRecordList", toJS(operationRecordList))
    var arr = []
    arr = toJS(operationRecordList)
    var text = ''
    for (var i = 0; i < arr.length; i++) {
      text += '操作名称:'
      text += arr[i].name
      text += '  操作时间:'
      text += arr[i].time
      text += '  操作内容:'
      text += arr[i].result

      text += '\n'
    }
    console.log('text', text)
    const blob = new Blob([text])		// fileStream 是文件流，一般从后台获取
    saveAs(blob, '操作记录.txt')
    message.success('导出文件成功')
  }
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <LittleHeader img={operationImg} name="操作记录">
        <DownloadOutlined
          onClick={download}
        />
      </LittleHeader>
      <ScrollTable
        dataSource={operationRecordList}
        columns={columns}
        size="small"
        rowKey={(record) => record.time}
        maxH='100vh'
        /* scroll={{ y: maxHeight }} */
        pagination={{
          defaultCurrent: 1,
          position: ['bottomRight'],
          total: operationRecordList.length,
          hideOnSinglePage: false,
          responsive: true,
          showSizeChanger: true,
          simple: true,
        }}
      />
    </div>
  )
}
export default observer(OperationRecord)