import './index.css'
import { observer } from 'mobx-react-lite'
import { DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { Tabs, Button, Popconfirm, Descriptions, Progress, Input, InputNumber, Select, Table, Tooltip, message } from 'antd'
import DataList from '@/components/DataFilter/dataList'
import DetailCard from '@/components/DetailCard'
import OperationRecord from '@/components/OperationRecord'
import useStore from '@/store'
import { useEffect } from 'react'
import { fuzzyQuery, request, addNeedObserverLink } from '@/utils'
import React, { useState, useRef } from 'react'
import Graph from '../../GraphCompoments/Graph'
import data1 from '@/assets/json/newCase.json'
import {
  linkDetailList
} from '@/components/infoShow.js'
import useFormItemStatus from 'antd/es/form/hooks/useFormItemStatus'
import { tab } from '@testing-library/user-event/dist/tab'
import ScrollTable from '../../components/ScrollTable'
const { Option } = Select
const { TabPane } = Tabs
const { Search } = Input
const prefix = '/api'

function UncertaintyReview () {

  const { publicStore } = useStore()
  const { addOperationRecordList, kgGraphType } = publicStore
  const { windowResizeFlag } = publicStore
  const { graphStore } = useStore()
  const { generateOperation, linkCreateFlag, algorithmFlag, setAlgorithmFlag } = graphStore
  const [existDataList, setExistDataList] = useState()
  const [typeDataList, setTypeDataList] = useState()
  const [sourceList, setSourceList] = useState([])
  const [targetList, setTargetList] = useState([])
  const [dottedLine, setDottedLine] = useState(null)
  const [tab, setTab] = useState(1)
  const tabType = useRef(1)
  // const [graphNum, setGraphNum] = useState(1)
  const [graph, setGraph] = useState([])
  const [sourceloading, setsourceLoading] = useState(false)
  const [targetloading, settargetLoading] = useState(false)
  const [tableloading, settabletLoading] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const jump = useRef(1)
  const showGraph = useRef(false)
  const optionFlag = useRef('node')
  const linkIdList = useRef({})
  const metaData = useRef([])
  //当前选中关系
  const linkDetail = useRef(
    {
      source_id: '',
      target_id: '',
      algorithm: '',
      algorithm2: '',
      link_id: '',
      link_name: '',
      source_name: '',
      target_name: '',
      jump: 1
    }
  )
  const typeCheckList = useRef(
    {
      jump: 1,
      source_id: '',
      target_id: '',
      source_name: '',
      target_name: '',
      algorithm: '',
      algorithm2: '',
      link_id: '',
      link_name: '',
    }
  )
  //options
  // const [optionFlag, setOptionFlag] = useState('node')
  useEffect(() => {
    console.log("测试mobx")
  }, [windowResizeFlag])
  const columns = [
    {
      title: '关系名称',
      dataIndex: 'link_name',
      key: 'link_name',
      render: (text) => {
        if (text === '' || text == undefined) {
          return <></>
        }
        else {
          let index = text.lastIndexOf("\/")
          return <div>{text.substring(index + 1, text.length)}</div>
        }
      }
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      width: '26%',
      sorter: (a, b) => a.score - b.score,
      render: (score) => {
        return score.toFixed(4)
      }
    },
    {
      title: '操作',
      key: 'function',
      dataIndex: 'function',
      width: '24%',
      render: (_, record) =>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <Popconfirm
            title="确定删除关系吗?"
            onConfirm={() => {
              request.post(prefix + '/dellink/', {
                id: record.link_id
              }).then(res => {
                if (res.status === 'success') {
                  message.success('删除关系成功')
                  getGraph()
                  addOperationRecordList({
                    'name': '删除关系',
                    'result': record.link_name,
                    'time': new Date()
                  })
                } else {
                  message.error('删除关系失败')
                }


              })
            }}
            onCancel={() => { message.error('Click on No') }}
            okText="确定"
            cancelText="取消"
          >
            <DeleteOutlined style={{ marginRight: '6px' }} />

          </Popconfirm>

          <EyeOutlined
            onClick={() => {
              console.log('record', record)
              linkDetail.current.source_id = record.source_id
              linkDetail.current.target_id = record.target_id
              linkDetail.current.link_id = record.link_id
              getGraph()
            }}
          />
        </div>
    }
  ]
  const typecolumns = [
    {
      title: '关系名称',
      dataIndex: 'link_name',
      key: 'link_name',
      width: '36%',
      render: (text) => {
        if (text === '' || text == undefined) {
          return <></>
        }
        else {
          let index = text.lastIndexOf("/")
          return <div>{text.substring(index + 1, text.length)}</div>
        }
      }
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      width: '26%',
      sorter: (a, b) => a.score - b.score,
      render: (score) => {
        return score.toFixed(5)
      }
    },
    {
      title: '操作',
      key: 'function',
      dataIndex: 'function',
      width: '24%',
      render: (_, record) =>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <EyeOutlined
            style={{ marginRight: '6px' }}
            onClick={() => {
              console.log('record', record)
              linkDetail.current.link_name = record.link_name
              addDottedLine(record)
            }}
          />
          <Popconfirm
            title="确定增加关系吗?"
            onConfirm={() => {
              console.log('record', record)
              request.post(prefix + '/addlink/', {
                source: linkDetail.current.source_id,
                target: linkDetail.current.target_id,
                name: record.link_name
              }).then(res => {
                if (res.status === 'success') {
                  var id = res.id
                  linkDetail.current.link_id = id
                  linkIdList.current[record.link_name] = id
                  console.log('linkidlist', linkIdList.current[record.link_name])
                  // console.log('linkIdList',linkIdList)
                  message.success('添加关系成功')
                  addOperationRecordList({
                    'name': '增加关系',
                    'result': record.link_name,
                    'time': new Date()
                  })
                  getGraph()
                  // startCheckType()
                } else {
                  message.error('添加关系失败')
                }


              })
            }}
            onCancel={() => { message.error('Click on No') }}
            okText="确定"
            cancelText="取消"
          >
            <PlusOutlined style={{ marginRight: '6px' }} />
          </Popconfirm>
          <Popconfirm
            title="确定删除关系吗?"
            onConfirm={() => {
              request.post(prefix + '/dellink/', {
                id: linkIdList.current[record.link_name]
              }).then(res => {
                if (res.status === 'success') {
                  message.success('删除关系成功')
                  getGraph()
                  console.log(linkDetail.current)
                  addOperationRecordList({
                    'name': '删除关系',
                    'result': record.link_name,
                    'time': new Date()
                  })
                } else {
                  message.error('删除关系失败')
                }


              })
            }}
            onCancel={() => { message.error('Click on No') }}
            okText="确定"
            cancelText="取消"
          >
            <DeleteOutlined />
          </Popconfirm>


        </div>
    }
  ]
  //存在性检测/类型检测
  const onChangeType = (activeKey) => {
    // this.forceUpdate() // 强制刷新数据
    console.log('activekey', activeKey)
    settabletLoading(false)
    setLoading(false)
    setTab(activeKey)
    setExistDataList()
    setTypeDataList()
    linkDetail.current = {
      source_id: linkDetail.current.source_id,
      target_id: linkDetail.current.target_id,
      algorithm: linkDetail.current.algorithm,
      algorithm2: linkDetail.current.algorithm2,
      link_id: '',
      link_name: '',
      jump: 1
    }
    setGraph([])
    setDottedLine(null)
    showGraph.current = false
    metaData.current = []
    tabType.current = activeKey
    // setDataGraph(false)
  }
  const addDottedLine = (record) => {
    console.log("增加虚拟边", linkDetail.current)
    let link = {
      'name': linkDetail.current.link_name,
      // 'name': 'mother',
      'source': linkDetail.current.source_id,
      'target': linkDetail.current.target_id,
    }
    setDottedLine(link)
    console.log(link)

  }

  const startCheckType = () => {

    if (linkDetail.current.algorithm2 === '') {
      message.error("请选择算法")
    } else if (linkDetail.current.source_id === '' || linkDetail.current.target_id === '') {
      message.error('请选择头尾节点')
    }
    else {
      message.success('开始检测')
      settabletLoading(true)
      console.log('typecheckList', linkDetail.current)
      request.post(prefix + '/typecheck/', {
        algorithm: linkDetail.current.algorithm2,
        source: linkDetail.current.source_id,
        target: linkDetail.current.target_id,

      }).then(res => {
        console.log('algorithm', linkDetail.current.algorithm2)
        console.log('类型检测结果', res)
        if (res.status === 'success') {
          message.success('检测完成')
          var arr = res.res.links
          setTypeDataList(arr)
          metaData.current = arr
          // settabletLoading(false)
          getGraph()

          //设置头尾节点
          for (var i = 0; i < sourceList.length; i++) {
            if (sourceList[i].id === linkDetail.current.source_id) {
              // message.success('ok')
              let index = sourceList[i].name.lastIndexOf("/")
              linkDetail.current.source_name = sourceList[i].name.substring(index + 1, sourceList[i].name.length)
              console.log('头结点', linkDetail.current.source_name)
            }
          }
          for (var i = 0; i < targetList.length; i++) {
            if (targetList[i].id === linkDetail.current.target_id) {
              // message.success('ok')
              let index = targetList[i].name.lastIndexOf("/")
              linkDetail.current.target_name = targetList[i].name.substring(index + 1, targetList[i].name.length)
              console.log('头结点', linkDetail.current.target_name)
            }
          }
        } else {
          message.error('检测失败')
        }
        settabletLoading(false)
      })
    }
  }
  const getGraph = () => {
    setLoading(true)
    //后端获取子图
    let kgtype = 'kg1'
    if (localStorage.getItem("kgIsMerge") === 'true') {
      kgtype = 'all'
    }
    console.log('kgtype', kgtype)
    request.post(prefix + '/subgraph/', {
      max_k: linkDetail.current.jump,
      type: 'link',
      id: linkDetail.current.source_id,
      id2: linkDetail.current.target_id,
      kg: kgtype
    }).then(res => {
      if (res.status === 'success') {
        // message.success('查询成功')
        console.log('查询图成功', tabType.current, linkDetail.current)
        if (linkDetail.current.link_id !== '') {
          // message.success(linkDetail.current.link_id)
          addNeedObserverLink(res.res, {
            'id': linkDetail.current.link_id,
            'source': linkDetail.current.source_id,
            'target': linkDetail.current.target_id
          })
        } else {
          // message.error('无边')
          addNeedObserverLink(res.res, {
            // 'id': linkDetail.current.link_id,
            'source': linkDetail.current.source_id,
            'target': linkDetail.current.target_id
          })
        }

        setGraph(res.res)
        // console.log(res.res.nodes)
        // setLoading(false)
        showGraph.current = true
        // setTypeDataList(dataSource1)
      } else {
        message.error('查询失败')
      }
      setLoading(false)

    })

  }


  const onSearchSource = (value) => {
    // message.success('开始')
    setsourceLoading(true)
    request.post(prefix + '/fuzzysearch/', {
      type: 'node',
      keyword: value
    }).then(res => {
      if (res.status === 'success') {
        // message.success('查询头结点成功')
        console.log('头结点', res.res.nodes)
        // setDataSource(res.res.nodes)
        setSourceList(res.res.nodes)
      } else {
        message.error('查询失败')
      }
      setsourceLoading(false)

    })

    console.log('search:', value)
  }
  const onSearchTarget = (value) => {
    // message.success('开始')
    settargetLoading(true)
    request.post(prefix + '/fuzzysearch/', {
      type: 'node',
      keyword: value
    }).then(res => {
      if (res.status === 'success') {
        // message.success('查询尾节点成功')
        console.log(res.res.nodes)
        // setDataSource(res.res.nodes)
        setTargetList(res.res.nodes)
      } else {
        message.error('查询失败')
      }
      settargetLoading(false)

    })

    console.log('search:', value)
  }

  //开始存在性检测
  const startCheckExist = () => {
    if (linkDetail.current.algorithm === '' || linkDetail.current.algorithm === undefined) {
      message.error('还未选择算法！')
    } else {
      message.success('开始检测')
      settabletLoading(true)
      request.post(prefix + '/existence/', {
        algorithm: linkDetail.current.algorithm
      }).then(res => {
        console.log('algorithm', linkDetail.current.algorithm)
        console.log('存在性检测结果', res)
        if (res.status === 'success') {
          message.success('检测完成')
          var arr = res.res.links
          setExistDataList(arr)
          metaData.current = arr
          settabletLoading(false)
        } else {
          message.error('检测失败')
        }
        // setLoading(false)
      })
    }

    // setExistDataList(arr)
  }




  const OnTypeRow = record => {
    return {
      onClick: event => {
        console.log('record', record)
        setLoading(true)
        //后端获取子图
        let kgtype = 'kg1'
        if (localStorage.getItem("kgIsMerge") === 'true') {
          kgtype = 'all'
        }
        request.post(prefix + '/subgraph/', {
          max_k: 1,
          type: 'link',
          id: typeCheckList.current.source_id,
          id2: typeCheckList.current.target_id,
          kg: kgtype
        }).then(res => {
          if (res.status === 'success') {
            message.success('查询成功')
            // addNeedObserverLink(res.res, {
            //   'id': record.link_name,
            //   'source': typeCheckList.current.source_id,
            //   'target': typeCheckList.current.target_id
            // })
            setGraph(res.res)
            // console.log(res.res.nodes)
            setLoading(false)
            showGraph.current = true
            // setTypeDataList(dataSource1)
          } else {
            message.error('查询失败')
          }
          setLoading(false)

        })

      }
    }
  }
  const handleOptionChange = (value) => {
    optionFlag.current = value.key
    setExistDataList(metaData.current)
  }
  const onSearchRelation = (value, e) => {
    console.log(value, e)
    if (value === '' && (metaData.current !== '' || metaData.current !== undefined)) {
      setTypeDataList(metaData.current)

    }
    // if (optionFlag.current === 'node') {
    //   let result = existDataList.filter((item, i) => {  //从list里面进行遍历字符串，然后看看是否包含关键字
    //     // console.log(i, item)
    //     if (item.sourceName.includes(value) || item.targetName.includes(value)) {
    //       return true
    //     }
    //     return false
    //   })
    //   setExistDataList(result)
    // } else 
    // if (optionFlag.current === 'relation') {
    let result = typeDataList.filter((item, i) => {  //从list里面进行遍历字符串，然后看看是否包含关键字
      // console.log(i, item)
      if (item.link_name.includes(value)) {
        return true
      }
      return false
    })
    if (value !== '') {
      addOperationRecordList({
        'name': '查询关系(' + value + ')',
        'result': '查询成功',
        'time': new Date()
      })
    }

    setTypeDataList(result)
    // }
  }
  const onSearch = (value, e) => {
    console.log(value, e)
    if (value === '' && (metaData.current !== '' || metaData.current !== undefined)) {

      setExistDataList(metaData.current)

    }
    if (optionFlag.current === 'node') {
      let result = existDataList.filter((item, i) => {  //从list里面进行遍历字符串，然后看看是否包含关键字
        console.log(i, item)
        if (item.source_name.includes(value) || item.target_name.includes(value)) {
          return true
        }
        return false
      })
      if (value !== '') {
        addOperationRecordList({
          'name': '查询节点(' + value + ')',
          'result': '查询成功',
          'time': new Date()
        })
      }
      setExistDataList(result)
    } else if (optionFlag.current === 'relation') {
      let result = existDataList.filter((item, i) => {  //从list里面进行遍历字符串，然后看看是否包含关键字
        // console.log(i, item)
        if (item.link_name.includes(value)) {
          return true
        }
        return false
      })
      if (value !== '') {
        addOperationRecordList({
          'name': '查询关系(' + value + ')',
          'result': '查询成功',
          'time': new Date()
        })
      }
      setExistDataList(result)
    }


  }
  const addLink = () => {
    request.post(prefix + '/addlink/', {

      source: typeCheckList.current.source_id,
      target: typeCheckList.current.target_id,
      name: '新的边'
    }).then(res => {
      if (res.status === 'success') {
        message.success('添加边成功')

      } else {
        message.error('查询失败')
      }


    })
  }
  const algorithmChange = (value) => {
    console.log('算法', value)
    linkDetail.current.algorithm = value
  }
  const algorithmChange2 = (value) => {
    console.log('算法', value)
    linkDetail.current.algorithm2 = value
  }
  return (
    <div className='uncertaintyReview'>
      <div className='uLeft'>
        <div className={tab === 1 ? 'uLeft-top' : ''}>
          <Tabs
            defaultActiveKey="1"
            tabBarGutter={36}
            centered
            onChange={onChangeType}
          >
            <TabPane tab="关联关系存在性检测" key="1">
              <div className='uhead'>
                <Select
                  allowClear={true}
                  placeholder="算法"
                  onChange={algorithmChange}
                >
                  <Option value="transE">transE</Option>
                  <Option value="transH">transH</Option>

                </Select>
                跳数:
                <InputNumber
                  style={{ width: '46px', }}
                  controls={false}
                  min={1}
                  max={20}
                  value={linkDetail.current.jump}
                  onChange={(val) => { linkDetail.current.jump = val }}
                />
                <Button
                  onClick={startCheckExist}
                >开始审查</Button>
              </div>
              <div className='uSearch'>
                <Select style={{ width: 100, marginRight: '4px' }}
                  placeholder='节点'
                  labelInValue
                  defaultValue={{
                    value: 'node',
                    label: '节点',
                  }}
                  onChange={handleOptionChange}
                >
                  <Option value="node">节点</Option>
                  <Option value="relation">关系</Option>
                </Select>
                <Search
                  allowClear
                  enterButton="检索"
                  onSearch={onSearch}
                />
              </div>
              <ScrollTable
                className='uleftTable'
                dataSource={existDataList}
                columns={columns}
                // onRow={OnRow}
                loading={tableloading}
                // loading={loading}
                size="small"
                rowKey={(record) => record.link_id}
                maxH="70vh"
                // showHeader={false}
                expandable={{
                  expandedRowRender: (record) => (
                    <Descriptions column={1} size='samll'>
                      <Descriptions.Item label="name">{record.link_name}</Descriptions.Item>
                      <Descriptions.Item label="source">{record.source_name}</Descriptions.Item>
                      <Descriptions.Item label="target">{record.target_name}</Descriptions.Item>
                    </Descriptions>
                  ),
                  rowExpandable: (record) => record.name !== 'Not Expandable',
                }}
              />
            </TabPane>
            <TabPane tab="关联关系类型检测" key="2">
              <div className='uhead1'>
                <>节点：</>
                <Select
                  style={{ width: '115px' }}
                  showSearch
                  placeholder="选择头结点"
                  optionFilterProp="children"
                  onChange={(val) => {
                    linkDetail.current.source_id = val
                    // typeCheckList.current.source_id = val 
                  }}
                  onSearch={onSearchSource}
                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                  loading={sourceloading}
                >
                  {sourceList.map(p => (
                    <React.Fragment key={p.id}>
                      <Option value={p.id}>
                        {p.name.substring(p.name.lastIndexOf("\/") + 1, p.name.length)}
                      </Option>
                    </React.Fragment>
                  ))
                  }

                </Select>
                <Select
                  style={{ width: '115px' }}
                  showSearch
                  placeholder="选择尾结点"
                  optionFilterProp="children"
                  onChange={(val) => {
                    // typeCheckList.current.target_id = val 
                    linkDetail.current.target_id = val
                  }}
                  onSearch={onSearchTarget}
                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                  loading={targetloading}
                >
                  {targetList.map(p => (
                    <React.Fragment key={p.id}>
                      <Option value={p.id}>
                        {p.name.substring(p.name.lastIndexOf("\/") + 1, p.name.length)}
                      </Option>
                    </React.Fragment>
                  ))
                  }
                </Select>
              </div>
              <div className='uhead'>
                <Select placeholder="算法"
                  onChange={algorithmChange2}>
                  <Option value="transE">transE</Option>
                  <Option value="transH">transH</Option>

                </Select>
                跳数:
                <InputNumber
                  style={{ width: '46px', }}
                  controls={false}
                  min={1}
                  max={20}
                  value={1}
                  onChange={(val) => { linkDetail.current.jump = val }}
                />
                <Button
                  // type='primary'
                  onClick={startCheckType}
                >开始审查</Button>
              </div>

            </TabPane>
          </Tabs>
        </div>
        <div className='uLeft-bottom'>
          <OperationRecord />
        </div>


      </div>

      {tabType.current == 2 ?
        <div className='unewTable1'>
          <div className='uSearch'>
            <Select style={{ width: 100, marginRight: '4px' }}
              placeholder='节点'
              labelInValue
              defaultValue={{
                value: 'relation',
                label: '关系',
              }}
            // onChange={handleOptionChange}
            >
              {/* <Option value="node">节点</Option> */}
              <Option value="relation">关系</Option>
            </Select>
            <Search
              allowClear
              enterButton="检索"
              onSearch={onSearchRelation}
            />
          </div>
          <ScrollTable
            className='uleftTable'
            maxH="100vh"
            loading={tableloading}
            // onRow={OnTypeRow}
            dataSource={typeDataList}
            columns={typecolumns}
            size="small"
            rowKey={(record) => record.id}
          />
        </div>
        : <></>
      }
      <div className='uCenter'>

        {showGraph.current === false ? <></> :
          <>
            <div className='legend'>
              <div className='legend_item'>
                <Progress
                  percent={100}
                  size="small"
                  strokeWidth={4}
                  strokeColor='#434242'
                  showInfo={false} />
                <div style={{ width: '80px' }}>多条边</div>
              </div>
              <div className='legend_item'>
                <Progress
                  percent={100}
                  size="small"
                  strokeWidth={4}
                  strokeColor='#B7B7B7'
                  showInfo={false} />
                <div style={{ width: '80px' }}>单条边</div>
              </div>
              <div className='legend_item'>
                <Progress
                  percent={100}
                  size="small"
                  strokeColor='#FF0000'
                  showInfo={false}
                  strokeWidth={4}
                />
                <div style={{ width: '80px' }}
                >选中边</div>
              </div>
              {/* !!!!!!!!!! */}
              {/* {
                tabType.current === 2 && linkDetail.current.source_name !== '' && linkDetail.current.target_name !== '' ?
                  <>
                    <div className='legend_item'>
                      <div style={{ width: '80px' }}>头结点:</div>
                      <div style={{ width: '80px' }}>
                        <Tooltip title={linkDetail.current.source_name}>
                          {linkDetail.current.source_name.substring(0, 8)}
                        </Tooltip>

                      </div>
                    </div>
                    <div className='legend_item'>
                      <div style={{ width: '80px' }}>尾结点:</div>
                      <div style={{ width: '80px' }}>
                        <Tooltip title={linkDetail.current.target_name}>
                          {linkDetail.current.target_name.substring(0, 7)}
                        </Tooltip>

                      </div>
                    </div>

                  </> : <></>
              } */}
            </div>
            <Graph
              data={graph}
              isAlgorithm={true}
              isOntology={kgGraphType === 'ontology' ? false : true}
              // data={data1}
              dottedLine={dottedLine}
              dottedLineColor='#f4df00'
              observerColor='#FF0000'
              editDisabled={false}
              loading={loading}
            ></Graph>
          </>
        }

      </div>

    </div>

  )
}
export default observer(UncertaintyReview)