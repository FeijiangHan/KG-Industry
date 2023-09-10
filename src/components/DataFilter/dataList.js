import { Input, Button, Checkbox, message, Space, InputNumber, Select } from 'antd'
import { useEffect, useState, useRef } from 'react'
import {
  linkDetailList,
  nodeDetailList,
} from '@/components/infoShow.js'
import { observer } from 'mobx-react-lite'
import ScrollTable from '@/components/ScrollTable'
import useStore from '@/store'
import { fuzzyQuery, request } from '@/utils'
import {
  RollbackOutlined,
  EyeOutlined
} from '@ant-design/icons'
const { Search } = Input
const prefix = '/api'
function DataList (props) {
  const { publicStore } = useStore()

  const { addOperationRecordList } = publicStore
  const { type } = props
  const placeholder = type === 'node' ? '节点检索' : '边检索'
  const title = type === 'node' ? '节点名称' : '关系名称'
  const [isResultSearch, setIsResultSearch] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [maxHeight, setMaxHeight] = useState(200)
  const [graphNum, setGraphNum] = useState(1)
  const [loading, setLoading] = useState(false)
  //假的 有后端就不用了
  const [test, setTest] = useState('data1')
  const [rkey, setrkey] = useState([])
  //保存上一次结果
  const lastData = useRef([])
  const columns = [
    {
      title: title,
      dataIndex: 'name',
      key: 'name',
      render: (text) => {
        let index = text.lastIndexOf("/")
        return text.substring(index + 1, text.length)
      },
      ellipsis: true,
    },
    {
      title: '',
      width: '12%',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <EyeOutlined onClick={() => onTo(record)} />
        </Space>
      ),
    },
  ]
  const sourceInfo = {
    name: "Microsoft_Windows",
    data: {
      "property": null
    }
  }
  const targetInfo = {
    name: "asdasdasd",
    data: {
      "property": {
        asdas: 'asdasd',
        asdasd: 'qweqwe',
      }
    }
  }

  /*
  useEffect(() => {
    if (type === 'node') {
      setDataSource(data1.nodes)
      lastData.current.push([...data1.nodes])
    }
    else {
      setDataSource(data1.links)
      lastData.current.push([...data1.links])
    }

  }, [])*/
  useEffect(() => {
    if (document.body.clientHeight <= 722) {
      setMaxHeight(200)
    } else {
      setMaxHeight(document.body.offsetHeight - 530)
    }
  }, [publicStore.windowResizeFlag])
  const backData = () => {
    if (lastData.current.length >= 1) {
      const data = lastData.current.pop()
      setDataSource(data)
    } else {
      message.error("上一次无结果了")
    }
  }
  const onTo = (record) => {
    props.getRelationData(record, graphNum, type)
  }
  const onSearch = (val) => {
    setrkey([])
    if (isResultSearch === true) {
      lastData.current.push([...dataSource])
      setDataSource(fuzzyQuery(dataSource, val))
    } else {
      setLoading(true)
      request.post(prefix + '/fuzzysearch/', {
        type: type,
        keyword: val
      }).then(res => {
        if (res.status === 'success') {

          if (type === 'node') {
            addOperationRecordList({
              'name': '查询节点(' + val + ')',
              'result': '查询成功',
              'time': new Date()
            })
            setDataSource(res.res.nodes)
          }
          else {
            addOperationRecordList({
              'name': '查询边(' + val + ')',
              'result': '查询成功',
              'time': new Date()
            })
            const links = []
            for (let data of res.res.links) {
              links.push(data)
            }
            setDataSource(links)
          }
        }
        setLoading(false)
      })
    }
  }
  const onExpand = (expanded, record) => {
    if (expanded) {
      if (record.data !== undefined) { //已经更新
        setrkey([record.id])
      } else {
        request.post(prefix + "/getdetail/", {
          type,
          id: [record.id]
        }).then(res => {
          if (res.status === "success") {
            if (type === 'node') {
              record.data = res.res[record.id].data
            } else {
              const linkDetail = res.res[record.id]
              record.source = linkDetail[0]
              record.target = linkDetail[2]
            }
            setrkey([record.id])
          } else {
            message.error('获取信息失败!')
          }
        })
      }
    } else {
      setrkey([])
    }
  }

  const expandedRowRender = (record, index, indent, expanded) => {
    console.log('详细信息', record)
    if (type === 'node') {
      if (!record.data) return
      return (
        <div style={{ marginLeft: '10px' }}>
          {nodeDetailList(record)}
        </div>
      )
    }
    else {
      if (!record.source.data || !record.target.data) return
      return (
        <div style={{ marginLeft: '10px' }}>
          {linkDetailList(record)}
        </div>
      )
    }
  }
  return (
    <>
      <Search
        placeholder={placeholder}
        onSearch={onSearch}
        style={{
          width: '90%',
          marginLeft: '5%',
          marginRight: '5%'
        }}
      />

      <div className="data-filter-checkbox">
        跳数:
        <InputNumber
          style={{ width: '46px', marginLeft: '4px' }}
          size="small"
          controls={false}
          min={1}
          max={20}
          value={graphNum}
          onChange={(val) => { setGraphNum(val) }} />
        <Button type="text"
          onClick={backData}
          icon={<RollbackOutlined />}
          size="small" style={{ marginRight: '3px' }}>
          回退
        </Button>
        <Checkbox checked={isResultSearch} onChange={(e) => setIsResultSearch(e.target.checked)}>结果内检索</Checkbox>
      </div>
      <ScrollTable
        maxH='70vh'
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        size="small"
        rowKey={(record) => record.id}
        showHeader={true}

        expandable={{
          expandedRowKeys: rkey,
          expandedRowRender,
          onExpand,
          columnWidth: '10%',
        }}
      />
    </>
  )
}
export default observer(DataList)