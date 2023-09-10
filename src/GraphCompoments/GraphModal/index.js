
//提供 増删改的各种对话框
import './index.css'
import { Modal, Form, Input, Row, Col, Button, Select, InputNumber, Checkbox } from 'antd'
import { MinusCircleOutlined, PlusOutlined, PoweroffOutlined } from '@ant-design/icons'
import React, { useEffect, useRef, useState } from 'react'
import useStore from '../../store'
import { observer } from 'mobx-react-lite'
import {
  nodeDetailList,
  linkSideDetailList
} from '@/components/infoShow.js'
const { Option } = Select
function GraphModal (props) {
  const {
    addNodeModal, setAddNodeModal,
    upNodeModal, setUpNodeModal,
    delNodeModal, setDelNodeModal,
    addLinkModal, setAddLinkModal,
    closeEditLink, clearEdit,
    delLinkModal, setDelLinkModal, upLinkModal, setupLinkModal, doubleSelect,
    setGetLocationFlag, getLocationFlag, location
  } = props
  const [provinceData, setprovinceData] = useState([])
  const [provinceValue, setProvinceValue] = useState()
  const [checked, setChecked] = useState(true)
  const [selectLink, setSelectLink] = useState()
  const { graphStore } = useStore()
  const form = useRef()
  const upLinkForm = useRef()
  useEffect(() => {
    if (delLinkModal === true || upLinkModal === true) {
      if (graphStore.select && graphStore.select.otherLinks) {
        setprovinceData(graphStore.select.otherLinks)
        setProvinceValue(graphStore.select.otherLinks[0].name)
        setSelectLink(graphStore.select.otherLinks[0])
      } else {
        setSelectLink(graphStore.select)
      }
    }
    if (upLinkModal === true) {
      if (graphStore.select && graphStore.select.otherLinks) {
        upLinkForm.current.setFieldsValue({
          name: graphStore.select.otherLinks[0].name,
        })
      } else {
        upLinkForm.current.setFieldsValue({
          name: graphStore.select.name,
        })
      }
    }

  }, [delLinkModal, upLinkModal])
  useEffect(() => {
    if (setGetLocationFlag)
      setGetLocationFlag(false)
    setChecked(false)
    //console.log("modal", graphStore.select !== null ? graphStore.select.data : null)
    if (addNodeModal === true) {
      form.current.setFieldsValue({
        name: '',
        propertys: [],
      })
    } else if (upNodeModal === true) {
      const { select } = graphStore
      const propertys = []
      for (let key in select.data.property) {
        var keyname = key.substring(key.lastIndexOf('/') + 1, key.length)
        const item = {
          'property': keyname,
          'value': select.data.property[key]
        }
        propertys.push(item)
      }
      form.current.setFieldsValue({
        name: select.name,
        propertys,
        lon: select.location !== undefined ? select.location[1] : undefined,
        lat: select.location !== undefined ? select.location[0] : undefined,
      })
    }
  }, [addNodeModal, upNodeModal])
  useEffect(() => {
    if (!location) return
    if (location.length === 0) return
    form.current.setFieldsValue({
      ...form.current.getFieldsValue(),
      lon: location[0],
      lat: location[1]
    })
  }, [location])
  const startAddUpNode = (values) => {
    if (setGetLocationFlag)
      setGetLocationFlag(false)
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
    if (getLocationFlag) {
      node.data.property['http://example.org/property/latitude'] = location[0]
      node.data.property['http://example.org/property/longitude'] = location[1]
      node.location = [location[1], location[0]]
    }
    if (addNodeModal) {
      props.addNode(node)
    } else if (upNodeModal) {
      node['id'] = graphStore.select.id
      props.upNode(node)
    }
    setAddNodeModal(false)
    setUpNodeModal(false)
  }
  const startDelNode = () => {
    props.delNode()
    setDelNodeModal(false)
  }
  const startAddLink = (value) => {
    props.addLink(value)
    setAddLinkModal(false)
  }
  const startUpLink = (value) => {
    const link = { ...value }
    link.id = selectLink.id
    props.upLink(link)
    setupLinkModal(false)
  }
  const startDelLink = () => {
    props.delLink(selectLink)
    setDelLinkModal(false)
  }

  const handleProvinceChange = (val) => {
    setProvinceValue(val)
    const link = graphStore.select.otherLinks.find(ele => ele.id.toString() === val.toString())
    setSelectLink(link)
    if (upLinkModal === true) {
      upLinkForm.current.setFieldsValue({
        name: link.name,
      })
    }
  }
  return (
    <>
      {/* 增加/修改节点对话框 */}

      <Modal
        forceRender
        width='60%'
        style={{
          left: '-100px',
        }}
        title={addNodeModal ? '增加节点' : '修改节点'}
        visible={addNodeModal || upNodeModal}
        footer={null}
        mask={false}
        centered={false}
        onCancel={(e) => {
          if (e.target.nodeName === 'DIV') return
          if (setGetLocationFlag)
            setGetLocationFlag(false)
          setAddNodeModal(false)
          setUpNodeModal(false)
        }}>
        <div style={{ height: '360px', overflow: 'auto' }}>
          <Form
            ref={form}
            name="basic"
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 14,
            }}
            onFinish={startAddUpNode}
          >
            <Form.Item
              label="名称"
              name="name"
              rules={[{ required: true, message: '请输入名称!' }]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            <Row >
              <Col span={6} offset={3}>
                <Form.Item
                  label={(
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        setChecked(e.target.checked)
                        if (setGetLocationFlag)
                          setGetLocationFlag(false)
                      }}>
                      经度
                    </Checkbox>
                  )}
                  name="lon"
                  labelCol={{
                    span: 12,
                  }}
                  wrapperCol={{
                    span: 12,
                  }}
                  rules={[{ required: false, message: '非必填!' }]}
                >
                  <InputNumber autoComplete="off"
                    disabled={!checked}
                    min={0}
                    max={180}
                    step={0.001}
                  />
                </Form.Item>
              </Col>
              <Col span={5} offset={1}>
                <Form.Item
                  label="纬度"
                  name="lat"
                  labelCol={{
                    span: 6,
                  }}
                  wrapperCol={{
                    span: 14,
                  }}
                  rules={[{ required: false, message: '非必填!' }]}
                >
                  <InputNumber autoComplete="off"
                    disabled={!checked}
                    min={0}
                    max={180}
                    step={0.001}
                  />
                </Form.Item>
              </Col>
              {
                setGetLocationFlag ?
                  <Col>
                    <Button
                      size="middle"
                      type="primary"
                      disabled={!checked}
                      icon={!getLocationFlag ? <PoweroffOutlined /> : <MinusCircleOutlined />}
                      onClick={() => {
                        setGetLocationFlag(!getLocationFlag)
                      }}
                    >{!getLocationFlag ? '开启地图点选获取' : '关闭地图点选获取'}</Button>
                  </Col> : ''
              }

            </Row>

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
                            //   pattern: /^[a-zA-Z]{1,12}$/,
                            //   message: '只允许输入英文,长度1-12'
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
                          name={[name, 'value']}
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
                </>
              )}
            </Form.List>
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
                setAddNodeModal(false)
                setUpNodeModal(false)
              }} >
                取消
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>


      {/* 删除节点对话框 */}
      {
        delNodeModal ?
          <Modal
            title="确定要删除该节点吗?"
            width='40%'
            visible={delNodeModal}
            onOk={startDelNode}
            onCancel={() => setDelNodeModal(false)}>
            <div style={{ height: '360px', overflow: 'auto' }}>
              {nodeDetailList(graphStore.select, '', true)}
            </div>
          </Modal> : ''
      }
      {/* 增加边对话框 */}
      <Modal
        title="添加关系"
        width='60%'
        visible={addLinkModal}
        onOk={startAddLink}
        footer={null}
        onCancel={() => {
          setAddLinkModal(false)
          clearEdit()
        }}>
        <div style={{ height: '360px', overflow: 'auto' }}>
          <Form
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 14,
            }}
            onFinish={startAddLink}
          >
            <Form.Item
              label="关系名称"
              name="name"
              rules={[{ required: true, message: '请输入关系名称!' }]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            {
              linkSideDetailList({
                source: graphStore.sourceNode?.data,
                target: graphStore.targetNode?.data
              })
            }
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
                setAddLinkModal(false)
                clearEdit()
              }} >
                取消
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      {/* 修改边对话框 */}
      <Modal
        forceRender
        title="更新关系信息"
        width='60%'
        visible={upLinkModal}
        footer={null}
        onCancel={() => setupLinkModal(false)}>
        {graphStore.select && graphStore.select.otherLinks ?
          (
            <>
              <Row>
                <Col span={6}>请选择需修改的关系:</Col>
                <Col span={14}>
                  <Select
                    value={provinceValue}
                    style={{
                      width: '100%',
                      marginBottom: '20px'
                    }}
                    onChange={handleProvinceChange}
                  >
                    {provinceData.map((province) => (
                      <Option key={province.id}>{province.name}</Option>
                    ))}
                  </Select>
                </Col>

              </Row>
            </>

          )
          : ''}
        <div style={{ height: '360px', overflow: 'auto' }}>
          <Form
            ref={upLinkForm}
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 14,
            }}
            onFinish={startUpLink}
          >
            <Form.Item
              label="关系名称"
              name="name"
              rules={[{ required: true, message: '请输入名称!' }]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            {linkSideDetailList(selectLink)}
            <Form.Item
              wrapperCol={{
                offset: 15,
                span: 9
              }}
            >
              <Button type="primary" htmlType="submit" style={{ marginRight: '6px' }}>
                提交
              </Button>
              <Button htmlType="button" onClick={() => setupLinkModal(false)} >
                取消
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      {/* 删除边对话框 */}
      <Modal
        title="删除关系"
        width='60%'
        visible={delLinkModal}
        onOk={startDelLink}
        onCancel={() => setDelLinkModal(false)}>
        <div style={{ height: '360px', overflow: 'auto' }}>
          {graphStore.select && graphStore.select.otherLinks ?
            (
              <>
                请选择需删除的关系:
                <Select
                  value={provinceValue}
                  style={{
                    width: '80%',
                    marginLeft: '30px'
                  }}
                  onChange={handleProvinceChange}
                >
                  {provinceData.map((province) => (
                    <Option key={province.id}>{province.name}</Option>
                  ))}
                </Select>
              </>

            )
            : ''}
          {linkSideDetailList(selectLink)}
        </div>
      </Modal>
    </>
  )
}
export default observer(GraphModal)