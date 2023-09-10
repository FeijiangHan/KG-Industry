
import './index.css'
import { observer } from 'mobx-react-lite'
import useStore from '@/store'
import React from 'react'
import ScrollTable from '../../components/ScrollTable'
import { useState, useEffect, useRef } from 'react'
import { nodeDetailList } from '../../components/infoShow.js'
import data1 from '@/assets/json/newdata1.json'
import { request, addNeedObserverLink } from '@/utils'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import Graph from '../../GraphCompoments/Graph'
import GraphModal from '../../GraphCompoments/GraphModal'
import { Button, Popconfirm, Collapse, Space, Tooltip, message, Spin, Dropdown, Menu, Input, Table, Tag, Divider, Card, Row, Col, Tabs, Select, Modal, Form } from 'antd'

import { set } from 'mobx'
const prefix = '/api'
const { Option } = Select
const { TabPane } = Tabs
const { Search } = Input
const { Panel } = Collapse

function AmbiguityReview () {
  const { publicStore } = useStore()
  const { addOperationRecordList } = publicStore
  const { windowResizeFlag } = publicStore
  const [sonGraph, setSonGraph] = useState(null)
  const [dataList, setDataList] = useState()
  const [checkList, setCheckList] = useState([])
  const [mainNode, setMainNode] = useState()
  const [sortFlag, setSortFlag] = useState(false)
  const [sonGraphList, setSonGraphList] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableloading, settableloading] = useState(false)//左边表格加载
  const [upNodeModal, setUpNodeModal] = useState(false)
  const mainNodeId = useRef()
  const [coupleNodes, setCoupleNode] = useState([])
  const graphId = useRef()
  const form = useRef()
  const metaData = useRef()
  const graphIdList = useRef([])
  const graphList = useRef({})
  const showGraph = useRef(false)
  const upNodeDetail = useRef()
  const algorithm = useRef()//当前选择算法
  const upNodeId = useRef()

  useEffect(() => {
    console.log("测试mobx,mobx存放多组件公用数据")
  }, [windowResizeFlag])
  useEffect(() => {
    //console.log("modal", graphStore.select !== null ? graphStore.select.data : null)  
    // const { select } = graphStore
    const propertys = []
    if (upNodeDetail.current == '' || upNodeDetail.current == undefined) {

    } else {
      for (let key in upNodeDetail.current.data.property) {
        var keyname = key.substring(key.lastIndexOf('/') + 1, key.length)
        const item = {
          'property': keyname,
          'value': upNodeDetail.current.data.property[key]
        }
        propertys.push(item)
      }
      form.current.setFieldsValue({
        name: upNodeDetail.current.name,
        propertys,
      })
    }

  }, [upNodeModal])


  //渲染歧义本体/实体列表
  const columns = [
    {
      title: '歧义本体/实体',
      dataIndex: 'name',
      key: 'name',
      width: '60%',
      render: (text) => {
        let index = text.lastIndexOf("/")
        return <a>{text.substring(index + 1, text.length)}</a>
      },
    },
    {
      title: '歧义个数',
      dataIndex: 'num',
      key: 'num',
      width: '40%',
      sorter: (a, b) => a.num - b.num,
    },

  ]

  //检索本体实体
  const onSearch = (value) => {
    if (value === '' && (metaData.current !== '' || metaData.current !== undefined)) {
      setDataList(metaData.current)
    }
    console.log(value)
    let result = metaData.current.filter((item, i) => {  //从list里面进行遍历字符串，然后看看是否包含关键字
      console.log(i, item)
      if (item.name.includes(value)) {
        return true
      }
      return false
    })
    if (value !== '') {
      addOperationRecordList({
        'name': '查询本体/实体(' + value + ')',
        'result': '查询成功',
        'time': new Date()
      })
    }
    setDataList(result)
  }
  const OnRow = record => {
    return {
      onClick: event => {
        console.log('onrow', record)
        mainNodeId.current = record.id
        graphIdList.current = []
        let kgtype = 'kg1'
        if (localStorage.getItem("kgIsMerge") === 'true') {
          kgtype = 'all'
        }
        console.log('kgtype', kgtype)

        if (mainNodeId.current !== undefined) {
          //传给后端id[],返回节点和相关节点信息
          request.post(prefix + '/subgraph/', {
            type: localStorage.getItem("kgFileType") === 'ontology' ? 'tree' : 'node',
            max_k: 1,
            id: mainNodeId.current,
            kg: kgtype
          }).then(res => {
            if (res.status === 'success') {
              console.log('查询主节点子图成功')
              // console.log(res.res)
              setSonGraph(res.res)
              addNeedObserverLink(res.res, {
                'target': record.id
              })
            } else {
              console.log('查询子图失败')
            }
            // setLoading(false)
          })

          dataList.map(item => {
            if (item.id == mainNodeId.current) {
              // console.log(item.couple_nodes)
              const idlist = item.couple_nodes
              idlist.push(item.id)
              request.post(prefix + '/getdetail/', {
                type: 'node',
                id: idlist
              }).then(res => {
                if (res.status === 'success') {
                  message.success("获取数据成功")
                  console.log('mainNode详细信息', res.res)
                  const temp = res.res
                  setCheckList(temp)
                  // console.log('checkList', temp)

                  var temparr = temp[mainNodeId.current]
                  // console.log('mainnode', temparr)
                  setMainNode(temparr)
                  var arr1 = []

                  for (var i = 0; i < item.couple_nodes.length; i++) {
                    var cArr = temp[item.couple_nodes[i]]
                    // console.log('temparr', cArr)
                    if (item.couple_nodes[i] !== mainNodeId.current) {
                      arr1.push({
                        id: item.couple_nodes[i],
                        score: item.scores[i],
                        name: cArr.name,
                        data: cArr.data,

                      })
                    }
                  }
                  // console.log('coupleList', arr1)
                  setCoupleNode(arr1)

                  // var zgraph = []

                  // console.log('zgraph:', zgraph)
                } else {
                  console.log('request error!')
                }
              })

            }
          })


        }
      }
    }
  }
  const showGraphModel = () => {
    showGraph.current = false
    // console.log('showGraphModel', graphId.current)
    var list = []
    list = graphIdList.current
    let kgtype = 'kg1'
    if (localStorage.getItem("kgIsMerge") === 'true') {
      kgtype = 'all'
    }
    if (graphIdList == '' || graphIdList.current === undefined) {
      request.post(prefix + '/subgraph/', {
        type: localStorage.getItem("kgFileType") === 'ontology' ? 'tree' : 'node',
        max_k: 1,
        id: graphId.current,
        kg: kgtype
      }).then(res => {
        if (res.status === 'success') {
          // message.success('查询子图成功')
          console.log('查询子图成功', res.res)
          //高亮
          // addNeedObserverLink(res.res, {
          //   'source': graphId.current
          // })
          var graphdata = {}
          graphdata = sonGraphList
          graphdata[graphId.current] = res.res
          console.log('graphdata:', graphdata)
          graphList.current = graphdata
          setSonGraphList(graphdata)
          console.log('grapnsondata', graphList.current[graphId.current])
          // setSonGraph(res.res)
          list.push(graphId.current)
          graphIdList.current = list
          setLoading(false)
          showGraph.current = true
        } else {
          console.log('查询子图失败')
        }
        setLoading(false)
      })
    }
    else if (!list.includes(graphId.current)) {
      request.post(prefix + '/subgraph/', {
        type: localStorage.getItem("kgFileType") === 'ontology' ? 'tree' : 'node',
        max_k: 1,
        id: graphId.current,
        kg: kgtype
      }).then(res => {
        if (res.status === 'success') {
          message.success('查询子图成功')
          // addNeedObserverLink(res.res, {
          //   'source': graphId.current
          // })

          console.log(res.res)
          var graphdata = {}
          graphdata = sonGraphList
          graphdata[graphId.current] = res.res
          // graphdata.push(graphId.current, res.res)
          console.log('graphdata:', graphdata)
          graphList.current = graphdata
          setSonGraphList(graphdata)
          console.log('grapnsondata', graphList.current[graphId.current])
          // setSonGraph(res.res)
          list.push(graphId.current)
          graphIdList.current = list
          showGraph.current = true
        } else {
          console.log('查询子图失败')
        }
        setLoading(false)
      })
    } else {
      showGraph.current = true
      setLoading(false)
    }

  }
  const onSearchNode = (value) => {
    console.log(value)
    let result = coupleNodes.filter((item, i) => {  //从list里面进行遍历字符串，然后看看是否包含关键字
      console.log(i, item)
      if (item.name.includes(value)) {
        return true
      }
      return false
    })
    // addOperationRecordList({
    //   'name': '查询歧义节点(' + value + ')',
    //   'result': '查询成功',
    //   'time': new Date()
    // })
    setCoupleNode(result)
    //!!!清除搜索框还原
  }
  const upNode = (values) => {
    const property = {}
    values.propertys.forEach(ele => {
      property[ele.property] = ele.value
    })
    const node = {
      name: values.name,
      data: {
        property
      }
    }

    node['id'] = upNodeId.current
    console.log('upnode', node)
    request.post(prefix + '/altnode/', node).then(res => {
      if (res.status === 'success') {
        message.success('修改节点成功')
        addOperationRecordList({
          'name': '修改节点',
          'result': node.name,
          'time': new Date()
        })
        if (upNodeId.current === mainNodeId.current) {
          setMainNode(node)
        } else {
          var tempNode = coupleNodes.concat()
          console.log('tempNode:', tempNode)
          for (var t = 0; t < tempNode.length; t++) {
            if (tempNode[t].id === upNodeId.current) {
              tempNode[t].name = node.name
              tempNode[t].data = node.data
            }
          }
          console.log('tempNodechange:', tempNode)
          ///有问题不能实时更新！！！！！
          setCoupleNode(tempNode)
        }
      } else {
        message.error(res.message)
      }
    })

    setUpNodeModal(false)
  }
  const algorithmChange = (value) => {
    console.log(value)
    algorithm.current = value
  }
  const startCheck = () => {
    if (algorithm.current === '' || algorithm.current === undefined) {
      message.error('还未选择算法')
    }
    else {
      settableloading(true)
      message.success('开始审查')
      request.post(prefix + '/ambiguity/', {
        algorithm: algorithm.current
      }).then(res => {
        console.log('实体审查结果', res)
        if (res.status === 'success') {
          message.success('审查成功')
          var arr = res.res
          setDataList(arr)
          metaData.current = arr
          settableloading(false)
        } else {
          message.error('审查失败')
          settableloading(false)
        }

      })

    }
  }

  return (
    <div className='ambiguityReview'>
      <div className='aleftBox'>
        <div className='aleftMargin'>
          <div className='leftHead'>
            <Select placeholder="算法"
              style={{ width: '84px' }}
              onChange={algorithmChange}
            >
              <Option value="transE">transE</Option>
              <Option value="transH">transH</Option>
              {/* <Option value="algorithm3">算法3</Option> */}
            </Select>

            <Button
              type='primary'
              // onClick={() => { setDataList(cdataList) }} 
              onClick={startCheck}
            >
              本体/实体歧义性审查
            </Button>
          </div>
          <Search
            className='search'
            placeholder='本体/实体检索'
            allowClear
            onSearch={onSearch}
          />
          <ScrollTable
            dataSource={dataList}
            columns={columns}
            loading={tableloading}
            onRow={OnRow}
            size="small"
            rowKey={(record) => record.id}
            maxH="140vh"
            className='tableLists'
          />
          {/* <Table
            className='tableLists'
            rowKey={(record) => record.id}
            onRow={OnRow}
            size="small"
            loading={tableloading}
            // bordered
            columns={columns}
            dataSource={dataList} /> */}

        </div>

      </div>
      <div className='aCenter'>
        <div className='aCenterMargin'>
          <div className='aMainNodeBox'>
            <div>审查结果</div>
            {mainNode == '' || mainNode == undefined ? <></> :
              <div className='aMainNode'>
                节点名称：
                {mainNode.name}
                <div className='aMainNodeMargin'>
                  <div className='mainNodeDetail'>
                    {mainNode == '' ? <></> :
                      <div className='kgDetails' >
                        节点详细信息：
                        {Object.keys(mainNode.data.property).map(ekey => {
                          return (
                            <Row key={mainNode.id + ekey} style={{ marginBottom: '10px' }}>
                              <Col span={9} >
                                {ekey === '' || ekey === undefined ? '' :
                                  ekey.substring(ekey.lastIndexOf('/') + 1, ekey.length)
                                }

                              </Col>
                              <Col span={15}>{mainNode.data.property[ekey]}</Col>
                            </Row>)
                        })}
                      </div>
                    }
                  </div>
                  <div className='mainNodeGraph' >
                    <Graph
                      data={sonGraph}
                      observerColor='#FF0000'
                      editDisabled={false}
                      loading={false}
                      remoteAcqu={false}
                    // setLoading={setLoading}
                    // delinkData={delinkData}
                    ></Graph>
                  </div>
                </div>
              </div>
            }
          </div>
          <div className='otherNodeHead'>
            <div
              style={{ width: '570px' }}
            >歧义节点</div>
            <Search
              onSearch={onSearchNode}
              allowClear
              placeholder="检索歧义节点"
              style={{
                width: 200,
                marginRight: '10px'
              }}
            />
            <Button className='sortButton'
              // size='small'
              onClick={() => {
                setSortFlag(!sortFlag)
                // console.log('sortFlag', sortFlag)
              }} type="primary">正序/倒序</Button>
          </div>
          <div className='otherNodes'>
            <Modal
              title='修改节点'
              visible={upNodeModal}
              footer={false}
              onCancel={() => setUpNodeModal(false)}
            >
              <div style={{ height: '360px', overflow: 'auto' }}>
                {upNodeDetail.current === '' || upNodeDetail.current === undefined ?
                  <></> :
                  <Form
                    ref={form}
                    name="basic"
                    labelCol={{
                      span: 6,
                    }}
                    wrapperCol={{
                      span: 14,
                    }}
                    onFinish={upNode}
                  >
                    <Form.Item
                      label="名称"
                      name="name"
                      rules={[{ required: true, message: '请输入名称!' }]}
                    >
                      <Input autoComplete="off" />
                    </Form.Item>

                    <Form.List name="propertys">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Row
                              key={key}
                            >
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  wrapperCol={{
                                    offset: 3,
                                    span: 20
                                  }}
                                  name={[name, 'property']}
                                  rules={[
                                    {
                                      required: true,
                                      message: '请输入属性名称',
                                    },
                                    // {
                                    //   pattern: /^[a-zA-Z]{1,50}$/,
                                    //   message: '只允许输入英文,长度1-50'
                                    // }
                                  ]}
                                >
                                  <Input placeholder="属性名称" />
                                </Form.Item>
                              </Col>
                              <Col span={14}>
                                <Form.Item
                                  {...restField}
                                  wrapperCol={{
                                    offset: 0,
                                    span: 24
                                  }}
                                  name={[name
                                    , 'value']}
                                  rules={[
                                    {
                                      required: true,
                                      message: '请输入属性值',
                                    },
                                  ]}
                                >
                                  <Input placeholder="属性值" />
                                </Form.Item>
                              </Col>
                              <Col offset={1}>
                                <MinusCircleOutlined
                                  onClick={() => remove(name)} />
                              </Col>
                            </Row >
                          ))}
                          <Form.Item
                            wrapperCol={{
                              offset: 6,
                              span: 14
                            }}
                          >
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                              增加属性
                            </Button>
                          </Form.Item>
                          <Form.Item
                            wrapperCol={{
                              offset: 15,
                              span: 9
                            }}
                          >
                            <Button type="primary" htmlType="submit" style={{ marginRight: '6px' }}>
                              提交
                            </Button>
                            <Button htmlType="button" onClick={() => {
                              setUpNodeModal(false)
                            }} >
                              取消
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </Form>}
              </div>
            </Modal>
            {coupleNodes === '' ? <></> :
              <div>
                {[...coupleNodes]
                  .sort(function (a, b) {
                    if (sortFlag === true) { return (a.score - b.score) }
                    return (b.score - a.score)
                  })
                  .map(p => (
                    <React.Fragment key={p.id}>
                      <div className='otherNodeBox'>
                        <div>
                          <Collapse
                            // defaultActiveKey={['1']}
                            ghost
                            bordered={false}
                            className="site-collapse-custom-collapse"
                            onChange={() => {
                              setLoading(true)
                              graphId.current = p.id
                              showGraphModel()
                            }}
                          >
                            <Panel
                              header={
                                <>
                                  <div className='otherNodeBoxHead'>
                                    <div style={{ width: '590px' }}>
                                      节点名称：{p.name}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flex_direction: 'row' }}>
                                      <div style={{ marginRight: '10px' }}>
                                        得分：
                                        {p.score !== undefined && p.score !== '' ? <> {p.score.toFixed(4)}</> : <></>}

                                      </div>
                                      <div className='buttonBox'>
                                        <Button
                                          onClick={() => {
                                            setUpNodeModal(true)
                                            upNodeId.current = p.id
                                            upNodeDetail.current = p
                                            console.log('upnodedetail:', upNodeDetail.current)
                                          }}
                                          type='primary' size='small' style={{ marginRight: '10px' }}>
                                          修改
                                        </Button>
                                        <Popconfirm
                                          title="确定删除该歧义节点吗?"
                                          onConfirm={() => {
                                            console.log('删除节点', p)
                                            request.post(prefix + '/delnode/', {
                                              id: p.id
                                            }).then(res => {
                                              if (res.status === 'success') {
                                                message.success('删除节点成功')
                                                addOperationRecordList({
                                                  'name': '删除节点',
                                                  'result': p.name,
                                                  'time': new Date()
                                                })
                                                const tdataList = dataList
                                                tdataList.map(item => {
                                                  if (item.id == mainNodeId.current) {
                                                    item.num = item.num - 1
                                                    const idlist = item.couple_nodes
                                                    var cidList = []
                                                    for (var t = 0; t < idlist.length; t++) {
                                                      if (idlist[t] !== p.id) {
                                                        cidList.push(idlist[t])
                                                      }
                                                    }
                                                    cidList.push(item.id)
                                                    item.couple_nodes = cidList
                                                  }
                                                })
                                                setDataList(tdataList)
                                                var datalist3 = coupleNodes.filter(item => {
                                                  if (item.id === p.id) {
                                                    return false
                                                  }
                                                  return true
                                                })
                                                setCoupleNode(datalist3)
                                              } else {
                                                message.error('删除节点失败')
                                              }
                                            })
                                          }}
                                          onCancel={() => { message.error('取消删除') }}
                                          okText="确定"
                                          cancelText="取消"
                                        >
                                          <Button type='primary' size='small'
                                            style={{ marginRight: '10px' }}
                                          >
                                            删除
                                          </Button>
                                        </Popconfirm>
                                        <Popconfirm
                                          title="确定合并该歧义节点吗?"
                                          onConfirm={() => {
                                            console.log('合并节点', p)
                                            request.post(prefix + '/mergenode/', {
                                              "id1": mainNode.id,
                                              "id2": p.id
                                            }).then(res => {
                                              if (res.status === 'success') {
                                                console.log('res', res)
                                                addOperationRecordList({
                                                  'name': '合并节点',
                                                  'result': p.name,
                                                  'time': new Date()
                                                })
                                                const tdataList = dataList
                                                tdataList.map(item => {
                                                  if (item.id == mainNodeId.current) {
                                                    item.num = item.num - 1
                                                    // console.log(item.couple_nodes)
                                                    const idlist = item.couple_nodes
                                                    var cidList = []
                                                    for (var t = 0; t < idlist.length; t++) {
                                                      if (idlist[t] !== p.id) {
                                                        cidList.push(idlist[t])
                                                      }
                                                    }
                                                    cidList.push(item.id)
                                                    item.couple_nodes = cidList
                                                    request.post(prefix + '/getdetail/', {
                                                      type: 'node',
                                                      id: cidList
                                                    }).then(res => {
                                                      if (res.status === 'success') {
                                                        message.success("获取数据成功")
                                                        console.log('mainNode修改详细信息', res.res)
                                                        const temp = res.res
                                                        setCheckList(temp)
                                                        var temparr = temp[mainNodeId.current]
                                                        // console.log('mainnode', temparr)
                                                        setMainNode(temparr)
                                                        var arr1 = []
                                                        for (var i = 0; i < cidList.length; i++) {
                                                          var cArr = temp[cidList[i]]
                                                          // console.log('temparr', cArr)
                                                          if (cidList[i] !== mainNodeId.current) {
                                                            arr1.push({
                                                              id: cidList[i],
                                                              score: item.scores[i],
                                                              name: cArr.name,
                                                              data: cArr.data,

                                                            })
                                                          }
                                                        }
                                                        // console.log('coupleList', arr1)
                                                        setCoupleNode(arr1)

                                                        // var zgraph = []

                                                        // console.log('zgraph:', zgraph)
                                                      } else {
                                                        console.log('request error!')
                                                      }
                                                    })

                                                  }
                                                })
                                                setDataList(tdataList)
                                                message.success('合并节点成功')
                                                // var datalist3 = coupleNodes.filter(item => {
                                                //   if (item.id === p.id) {
                                                //     return false
                                                //   }
                                                //   return true
                                                // })
                                                // setCoupleNode(datalist3)
                                                let kgtype = 'kg1'
                                                if (localStorage.getItem("kgIsMerge") === 'true') {
                                                  kgtype = 'all'
                                                }
                                                request.post(prefix + '/subgraph/', {
                                                  type: localStorage.getItem("kgFileType") === 'ontology' ? 'tree' : 'node',
                                                  max_k: 1,
                                                  id: mainNodeId.current,
                                                  kg: kgtype
                                                }).then(res => {
                                                  if (res.status === 'success') {
                                                    console.log('查询子图成功')
                                                    // console.log(res.res)
                                                    setSonGraph(res.res)

                                                  } else {
                                                    console.log('查询子图失败')
                                                  }
                                                  // setLoading(false)
                                                })

                                              } else {
                                                message.error('合并节点失败')
                                              }
                                            })
                                          }}
                                          onCancel={() => { message.error('Click on No') }}
                                          okText="确定"
                                          cancelText="取消"
                                        >
                                          <Button type='primary' size='small'
                                          >
                                            合并
                                          </Button>
                                        </Popconfirm>
                                      </div>
                                    </div>
                                  </div></>} key="1"
                              className="site-collapse-custom-panel">
                              <div className='adetail'>
                                <div style={{ width: '50%' }}>
                                  节点详细信息：
                                  <div className='oDtails'>
                                    {nodeDetailList(p, "节点")}

                                  </div>
                                </div>
                                <div style={{ flex: 1, height: '100%' }}>
                                  {showGraph.current === false ? <></> :
                                    <div className='graphbox'>
                                      <Graph
                                        observerColor='#FF0000'
                                        data={graphList.current[p.id]}
                                        // data={data1}
                                        editDisabled={false}
                                        loading={loading}
                                      // setLoading={setLoading}
                                      // delinkData={delinkData}
                                      ></Graph>
                                    </div>
                                  }
                                </div>
                              </div>
                            </Panel>
                          </Collapse>

                        </div>
                      </div>
                    </React.Fragment>
                  ))
                }
              </div>

            }
          </div>
        </div>
      </div>
    </div >
  )
}
export default observer(AmbiguityReview)