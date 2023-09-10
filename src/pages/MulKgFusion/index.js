import './index.css'
import { observer } from 'mobx-react-lite'
import useStore from '@/store'
import DataList from '../../components/DataFilter/dataList'
import OperationRecord from '../../components/OperationRecord'
import { LoadingOutlined, PlusOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Spin, message, Upload, Divider, Form, Input, Select, Radio, List, Checkbox, Table, Modal } from 'antd'
import { useEffect, useState, useRef } from 'react'
import Graph from '@/GraphCompoments/Graph'
import data3 from '@/assets/json/ZHKG_Data.json'
import data2 from '@/assets/json/ZHKG_Data_20Nodes.json'
import data1 from '@/assets/json/newCase.json'
import DataFilter from '../../components/DataFilter'
import { request, addNeedObserverLink } from '@/utils'
const { Dragger } = Upload
const { Option } = Select
const prefix = '/api'
function MulKgFusion () {
  const { publicStore } = useStore()
  const [selectNode, setSelectNode] = useState(null)
  const { changeName } = publicStore
  const { kgGraphName1, kgGraphName2, kgGraphName3, kgGraphType, isLoad } = publicStore
  const { windowResizeFlag } = publicStore
  const loading = useRef(false)
  const [fileList, setFileList] = useState([])
  const [uploading, setUploading] = useState(false)
  const [value, setValue] = useState(1)
  const [fusionloading, setfusionLoading] = useState(false)
  const [loadingMul1, setLoadingMul1] = useState(false)
  const [loadingMul2, setLoadingMul2] = useState(false)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [loading3, setLoading3] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [graphData1, setGraphData1] = useState(null)
  const [graphData2, setGraphData2] = useState(null)
  const [graphData3, setGraphData3] = useState(null)
  const fusionflag = useRef(0)
  const [form] = Form.useForm()
  const isfusion = useRef(false)
  const algorithm = useRef()
  const isupload = useRef(false)
  //图谱颜色
  //原图谱
  const [ornodeColor, ornodeColorChange] = useState("#409CFF")
  //新加入图谱
  const [addnodeColor, addnodeColorChange] = useState("#95CE7B")
  //融合图谱
  const [mulNodeColor, mulNodeColorChange] = useState(["#409CFF", "#95CE7B"])
  const [mulLinksColor, mulLinksColorChange] = useState(["#409CFF", "#95CE7B"])
  const loadDetail = useRef({
    name: '',

  })
  useEffect(() => {
    console.log("测试mobx")
  }, [windowResizeFlag])
  useEffect(() => {
    if (mulNodeColor[0] !== ornodeColor || mulNodeColor[1] !== addnodeColor) {

      mulNodeColorChange([ornodeColor, addnodeColor])
    }
  }, [addnodeColor, ornodeColor])

  useEffect(() => {
    if (mulLinksColor[0] !== ornodeColor || mulNodeColor[1] !== addnodeColor) {

      mulLinksColorChange([ornodeColor, addnodeColor])
    }
  }, [addnodeColor, ornodeColor])
  // const functionData = [
  //   {
  //     key: '1',
  //     time: '2022-7-20',
  //     name: '删除',
  //     result: ''

  //   },
  //   {
  //     key: '2',
  //     time: '2022-7-20',
  //     name: '增',
  //     result: ''
  //   },
  //   {
  //     key: '3',
  //     time: '2022-7-20',
  //     name: '查找',
  //     result: ''
  //   },
  // ];
  // const onChange1 = (e) => {
  //   console.log(`checked = ${e.target.checked}`);
  // };
  // const searchData = [
  //   '标题',
  //   '标题',
  //   '标题',
  //   '标题',

  // ];

  const loadfusion = () => {
    const hide = message.loading('正在融合图谱..', 0) // Dismiss manually and asynchronously 
    setTimeout(hide, 5000)
  }
  // const getRelationData = (record, graphNum, type) => {
  //   console.log('record', record)
  //   let postObj = {}
  //   let postObj1 = {}
  //   if (type === 'node') {
  //     // if (record.name === "wqrsda") {
  //     //   console.log("this is wqrsda")
  //     //   message.success("获取数据成功")
  //     //   setGraphData2(MapData)
  //     //   setLoading(false)
  //     //   return
  //     // }
  //     postObj = {
  //       max_k: graphNum,
  //       type: type,
  //       id: record.id
  //     }
  //     postObj1 = {
  //       max_k: 2,
  //       type: type,
  //       id: record.id
  //     }
  //   }
  //   else {
  //     postObj = {
  //       max_k: graphNum,
  //       type: type,
  //       id: record.source.id,
  //       id2: record.target.id
  //     }
  //     postObj1 = {
  //       max_k: '2',
  //       type: type,
  //       id: record.source.id,
  //       id2: record.target.id
  //     }
  //   }
  //   //console.log(postObj)
  //   setLoading1(true)
  //   request.post(prefix + '/subgraph/', postObj1).then(response => {
  //     if (response.status === 'success') {
  //       console.log('查询图数据', response)
  //       message.success("获取数据成功")
  //       setGraphData1(response.res)
  //       if (type === 'node') {
  //         addNeedObserverLink(response.res, {
  //           'source': record.id
  //         })
  //       } else {
  //         addNeedObserverLink(response.res, {
  //           'id': record.id,
  //           'source': record.source.id,
  //           'target': record.target.id
  //         })
  //       }
  //     } else {
  //       message.error('查询图失败')
  //     }
  //     setLoading1(false)
  //   })
  //   if (record.kg === 'kg1') {
  //     setLoading2(true)
  //     request.post(prefix + '/subgraph/', postObj).then(response => {
  //       if (response.status === 'success') {
  //         console.log('查询图数据', response)
  //         message.success("获取数据成功")
  //         setGraphData2(response.res)
  //         // setGraphData1(response.res)
  //         setGraphData3(null)
  //         if (type === 'node') {
  //           addNeedObserverLink(response.res, {
  //             'source': record.id
  //           })
  //         } else {
  //           addNeedObserverLink(response.res, {
  //             'id': record.id,
  //             'source': record.source.id,
  //             'target': record.target.id
  //           })
  //         }
  //       } else {
  //         message.error('查询图失败')
  //       }
  //       setLoading2(false)
  //     })
  //   } else {
  //     setLoading3(true)
  //     request.post(prefix + '/subgraph/', postObj).then(response => {

  //       if (response.status === 'success') {
  //         console.log('查询图数据', response)
  //         message.success("获取数据成功")
  //         setGraphData2(null)
  //         // setGraphData1(response.res)
  //         setGraphData3(response.res)
  //         if (type === 'node') {
  //           addNeedObserverLink(response.res, {
  //             'source': record.id
  //           })
  //         } else {
  //           addNeedObserverLink(response.res, {
  //             'id': record.id,
  //             'source': record.source.id,
  //             'target': record.target.id
  //           })
  //         }
  //       } else {
  //         message.error('查询图失败')
  //       }
  //       setLoading3(false)
  //     })
  //   }

  //   console.log(record.id, graphNum, type)
  // }
  const getRelationData = (record, graphNum, type) => {
    console.log('record', record, type)
    let kgtype = 'kg1'
    if (localStorage.getItem("kgIsMerge") === 'true') {
      kgtype = 'all'
    }

    setLoading1(true)
    request.post(prefix + '/subgraph/', {
      max_k: graphNum,
      type: type,
      id: record.id,
      kg: 'all'
    }).then(response => {
      if (response.status === 'success') {
        console.log('查询融合图数据', response)
        message.success("获取数据成功")
        setGraphData1(response.res)
        if (type === 'node') {
          addNeedObserverLink(response.res, {
            'source': record.id
          })
        } else {
          addNeedObserverLink(response.res, {
            'id': record.id,
            'source': record.source.id,
            'target': record.target.id
          })
        }
      } else {
        message.error('查询图失败')
      }
      setLoading1(false)
    })
    if (record.kg === 'kg1') {
      setLoading2(true)
      request.post(prefix + '/subgraph/', {
        max_k: graphNum,
        type: type,
        id: record.id,
        kg: 'kg1'
      }).then(response => {
        if (response.status === 'success') {
          console.log('查询图数据1', response)
          message.success("获取数据成功")
          setGraphData2(response.res)
          // setGraphData1(response.res)
          setGraphData3(null)
          if (type === 'node') {
            addNeedObserverLink(response.res, {
              'source': record.id
            })
          } else {
            addNeedObserverLink(response.res, {
              'id': record.id,
              'source': record.source.id,
              'target': record.target.id
            })
          }
        } else {
          message.error('查询图失败')
        }
        setLoading2(false)
      })
    } else {
      setLoading3(true)
      request.post(prefix + '/subgraph/', {
        max_k: graphNum,
        type: type,
        id: record.id,
        kg: 'kg2'
      }).then(response => {

        if (response.status === 'success') {
          console.log('查询图数据2', response)
          message.success("获取数据成功")
          setGraphData2(null)
          // setGraphData1(response.res)
          setGraphData3(response.res)
          if (type === 'node') {
            addNeedObserverLink(response.res, {
              'source': record.id
            })
          } else {
            addNeedObserverLink(response.res, {
              'id': record.id,
              'source': record.source.id,
              'target': record.target.id
            })
          }
        } else {
          message.error('查询图失败')
        }
        setLoading3(false)
      })
    }

    console.log(record.id, graphNum, type)
  }
  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
    console.log('file', newFileList[0].status, newFileList[0].name)

    if (newFileList[0].status === 'uploadig') {

      return
    }
    if (newFileList[0].status === 'done') {
      form.setFieldsValue({
        graphname: newFileList[0].name,
      })
      loadDetail.current.name = newFileList[0].name

      if (newFileList[0].response.status === 'success') {
        message.success('上传成功')

        isupload.current = true
      } else {
        message.error('上传失败')

      }

    }
  }
  // const handleChange = info => {
  //   setUploading(true)
  //   loading.current = true
  //   if (info.file.status === 'uploadig') {
  //     setUploading(true)
  //     loading.current = true
  //     return
  //   }
  //   if (info.file.status === 'done') {
  //     console.log(info.file)
  //     if (info.file.response.status === 'success') {
  //       message.success('上传成功')

  //       loading.current = false

  //       // message.success('开始图谱融合')
  //       // startMerge()
  //       // loadfusion()
  //     } else {
  //       message.error('上传失败')
  //       loading.current = false
  //     }
  //     setUploading(false)
  //   }
  // }
  const onFinish = (values) => {
    console.log('Success:', values)
  }
  const changekgName = (value) => {
    console.log('name', value.target.value)
    loadDetail.current.name = value.target.value

    // kgGraphName=value.target.value
    // localStorage.setItem('name', value.target.value)
  }
  const startMerge = () => {
    setfusionLoading(true)
    request.post(prefix + '/fusion/', {
      algorithm: algorithm.current
    }).then(response => {
      if (response.status === 'success') {
        message.success("图谱融合成功")
        localStorage.setItem("kgIsMerge", true)
        localStorage.setItem("kgFileName3", 'merge-kg')

        setIsModalOpen(false)
        isfusion.current = true
      } else {
        message.error('图谱融合失败')
      }
      // setLoading(false)
      setfusionLoading(false)
    })


  }
  const algorithmChange = (value) => {
    console.log('算法', value)
    algorithm.current = value
  }
  const handleOk = () => {
    if (algorithm.current === undefined || algorithm.current === '') {
      message.error('请选择融合算法')
    } else {
      changeName(loadDetail.current.name, 2)
      changeName(loadDetail.current.name, 3)
      localStorage.setItem("kgFileName2", loadDetail.current.name)
      localStorage.setItem("kgName", 'merge-kg')
      //开始融合
      startMerge()
    }

  }
  const handleCancel = () => {
    setIsModalOpen(false)
  }
  return (
    // <Spin spinning={fusionloading} >
    <div className='mbody'>
      <div className="manger-left">
        <Button
          type='primary'
          onClick={() => { setIsModalOpen(true) }}
          className='mbutton'>导入融合目标图谱
        </Button>

        <Modal
          // title='导入融合目标图谱'
          visible={isModalOpen}
          // footer={false}
          style={{
            top: 5,
          }}
          footer={[
            <Button key="back" onClick={handleCancel}>
              取消
            </Button>,
            <Button key="submit" disabled={!isupload.current} type="primary" onClick={handleOk}>
              开始图谱融合
            </Button>,

          ]}
          onOk={handleOk}
          onCancel={handleCancel}>
          <Spin spinning={fusionloading} tip="正在图谱融合...">
            <Form
              form={form}
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 10,
              }}
              onFinish={onFinish}
            >
              <Form.Item
                label="原图谱"
                required>
                <Input
                  disabled={true}
                  placeholder={localStorage.getItem("kgFileName1")}
                // placeholder={kgGraphName1}
                />
              </Form.Item>
              <Form.Item label="导入类型"
                required>
                <Radio.Group
                  disabled={true}
                  value={localStorage.getItem("kgFileType")}
                // value={kgGraphType}
                >
                  <Radio value='entity'>实体</Radio>
                  <Radio value='ontology'>本体</Radio>

                </Radio.Group>
              </Form.Item>
              <Form.Item
                label="导入状态"
                required>
                <Input
                  disabled={true}
                  placeholder={localStorage.getItem("kgIsLoad") == 'true' ? '已加载' : '未导入'}
                // placeholder={isLoad ? '已加载' : '未导入'}
                />
              </Form.Item>
              <Divider plain orientation="left">
                导入融合目标图谱
              </Divider>
              <Form.Item label="类型"
              >
                <Radio.Group
                  disabled={true}
                  value={localStorage.getItem("kgFileType")}>
                  <Radio value='entity'>实体</Radio>
                  <Radio value='ontology'>本体</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                help="支持rdf/rdfs/owl格式文件"
                required label="导入图谱" valuePropName="fileList" >
                <Upload
                  action="/api/import/"
                  listType="picture-card"
                  fileList={fileList}
                  onChange={onChange}
                  // onPreview={onPreview}
                  data={{ kg: 'kg2', type: localStorage.getItem("kgFileType") }}
                  name='file'
                >
                  {
                    fileList.length < 1 &&
                    <div> <PlusOutlined />
                      <div
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Upload
                      </div></div>
                  }
                </Upload>

              </Form.Item>

              <Form.Item
                name="graphname"
                required
                label="图谱名称">
                <Input
                  onChange={changekgName} />
              </Form.Item>
              <Form.Item required label="融合算法">
                <Select
                  disabled={!isupload.current}
                  placeholder="请选择融合算法"
                  onChange={algorithmChange}
                >
                  <Option value="transE">transE</Option>
                  <Option value="transH">transH</Option>

                </Select>
              </Form.Item>



            </Form>
          </Spin>
        </Modal>
        <div className='mdatalist'>
          <DataList
            type='node'
            // filterDiv={filterDiv}
            getRelationData={getRelationData}
          />
        </div>
        <div>
          <OperationRecord></OperationRecord>
        </div>
        {/* <DataFilter getRelationData={getRelationData} topListMaxH='calc(70vh - 120px)'></DataFilter> */}
      </div>
      <div className='mbox2'>

        <div className='tips11'>融合后图谱：
          {localStorage.getItem("kgIsMerge") === 'true' ? <>{localStorage.getItem("kgFileName3")}
            {/* {kgGraphName3} */}
          </> : <></>}
        </div>
        <Graph
          data={graphData1}
          isOntology={kgGraphType === 'ontology' ? false : true}
          editDisabled={false}
          observerColor='#FF0000'
          loading={loading1}
          setSelectNode={setSelectNode}
          mulLinksColor={mulLinksColor}
          mulNodeColor={mulNodeColor}
          setLoading={setLoading1}
          remoteAcqu={true}
        ></Graph>

      </div>
      <div className='mbox3'>
        <div className='zmbox'>
          <div className='tips'>原图谱：
            {localStorage.getItem("kgIsMerge") === 'true' ? <>{localStorage.getItem("kgFileName1")}</> : <></>}
          </div>
          {graphData2 === null ? <></> :
            <Graph data={graphData2}
              isOntology={kgGraphType === 'ontology' ? false : true}
              editDisabled={true}
              isAlgorithm={true}
              loading={loading2}
              observerColor='#FF0000'
              initNodeSet={{
                nodeColor: ornodeColor,
              }}
              colorChange={ornodeColorChange}
              setLoading={setLoading2}
              remoteAcqu={false}
            ></Graph>}
        </div>
        <div className='zmbox'>
          <div className='tips'>新导入图谱：
            {localStorage.getItem("kgIsMerge") === 'true' ? <>{localStorage.getItem("kgFileName2")}</> : <></>}
          </div>
          {graphData3 === null ? <></> :
            <Graph data={graphData3}
              editDisabled={true}
              isOntology={kgGraphType === 'ontology' ? false : true}
              loading={loading3}
              observerColor='#FF0000'
              initNodeSet={{
                nodeColor: addnodeColor,
              }}
              isAlgorithm={true}
              colorChange={addnodeColorChange}
              setLoading={setLoading3}
              remoteAcqu={false}>

            </Graph>}
        </div>
      </div>

    </div>
    // {/* </Spin> */}

  )
}
export default observer(MulKgFusion)