import { DownOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Dropdown, Menu, message, Button, Input, Form, Space, Modal, Upload, Radio } from 'antd'
import { observer } from 'mobx-react-lite'
import { useLocation } from 'react-router-dom'
import useStore from '@/store'
import { fuzzyQuery, request } from '@/utils'
import './index.css'
import { useEffect, useState } from 'react'
import FormList from 'antd/lib/form/FormList'
import { saveAs } from 'file-saver'
import { useRef } from 'react'
const prefix = '/api'
const { confirm } = Modal
function MenuSetting () {
  const [refresh, setRefresh] = useState(false)
  const { publicStore } = useStore()
  const { changeName, changekgGraphType, changeLoad } = publicStore
  const { pathname } = useLocation()
  const { graphStore } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isdeleteModalOpen, setIsdeleteModalOpen] = useState(false)
  const { generateOperation, linkCreateFlag, algorithmFlag } = graphStore
  const [pageDis, setPageDis] = useState(true)
  const [type, SetType] = useState(null)
  const [value, setValue] = useState()//本体实体选取
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState([])
  const [uploading, setUploading] = useState(false)
  const loading = useRef(false)
  const loadDetail = useRef({
    name: '',
    type: 'entity',

  })
  // 根据页面来定是否展示
  useEffect(() => {
    if (pathname === '/') setPageDis(false)
    else setPageDis(true)
  }, [pathname])
  useEffect(() => {
    refresh && setTimeout(() => setRefresh(false))
  }, [refresh])
  useEffect(() => {
    if (graphStore.select === null) SetType(null)
    else SetType(graphStore.select.type)
  }, [graphStore.select])
  const items =
    [
      {
        key: 'loadData',
        label: '文件导入',
      },
      {
        key: 'derivedData',
        label: "文件导出"
      },
      {
        key: 'deleteData',
        label: "数据清空"
      },
      { type: 'divider', },
      { label: "添加节点", key: 'addNode', disabled: pageDis || linkCreateFlag || algorithmFlag },
      { label: "修改节点", key: 'upNode', disabled: pageDis || type !== 'node' || algorithmFlag },
      { label: "删除节点", key: 'delNode', disabled: pageDis || type !== 'node' || algorithmFlag },
      { type: 'divider', },
      { label: "添加关系", key: 'addLink', disabled: pageDis || linkCreateFlag || algorithmFlag },
      { label: "修改关系", key: 'upLink', disabled: pageDis || type !== 'link' || algorithmFlag },
      { label: "删除关系", key: 'delLink', disabled: pageDis || type !== 'link' || algorithmFlag },
      { type: 'divider', },
      { label: "等价结构化简", key: 'useSimplifyEquiv', disabled: pageDis || linkCreateFlag || algorithmFlag },
      { label: "等价结构提取", key: 'useEquivalentstructureExtraction', disabled: pageDis || linkCreateFlag || algorithmFlag },
      //useSuperpointextraction
      { label: "超点提取", key: 'useSuperpointextraction', disabled: pageDis || linkCreateFlag || algorithmFlag },
      { label: "骨干提取", key: 'useBackboneExtraction', disabled: pageDis || linkCreateFlag || algorithmFlag },
      { label: "层次剪枝", key: 'useHierarchicalPruning', disabled: pageDis || linkCreateFlag || algorithmFlag },
    ]
  const handleClick = (e) => {
    switch (e.key) {
      case "loadData":
        {
          console.log("loadData")
          setIsModalOpen(true)
        }
        break
      case "derivedData":
        console.log("derivedData")
        exportFile()
        break
      case "deleteData":
        console.log("deleteData")
        showConfirm()
        // setIsdeleteModalOpen(true)
        //清空数据
        break
      case 'addNode':
        generateOperation("addNode")
        break
      case 'upNode':
        generateOperation("upNode")
        break
      case 'delNode':
        generateOperation("delNode")
        break
      case 'addLink':
        generateOperation("addLink")
        break
      case 'upLink':
        generateOperation("upLink")
        break
      case 'delLink':
        generateOperation("delLink")
        break
      case 'useSimplifyEquiv':
        generateOperation("useSimplifyEquiv")
        break
      case 'useEquivalentstructureExtraction':
        generateOperation("useEquivalentstructureExtraction")
        break
      case 'useSuperpointextraction':
        generateOperation('useSuperpointextraction')
        break
      case 'useBackboneExtraction':
        generateOperation('useBackboneExtraction')
        break
      case 'useHierarchicalPruning':
        generateOperation('useHierarchicalPruning')
        break
      default:
        break
    }
  }
  const menu = (
    <Menu items={items} onClick={handleClick}></Menu>
  )

  const showConfirm = () => {
    confirm({
      title: '您确定要清空所有数据吗?',
      icon: <ExclamationCircleOutlined />,
      // content: 'Some descriptions',
      onOk () {
        request.post(prefix + '/cleardb/',).then(res => {
          console.log('res', res)
          // setLoading(false)
        })
        window.location.reload()
        localStorage.clear()
        changeName('', 1)
        changeName('', 2)
        changeName('', 3)
        changekgGraphType('')
        form.resetFields()
        setFileList([])
        changeLoad(false)
        message.success('清空数据成功')
        //刷新页面清理其他数据!!
      },

      onCancel () {
        console.log('取消')
      },
    })
  }
  const onChange = ({ fileList: newFileList }) => {
    console.log('file', newFileList)
    setFileList(newFileList)
    if (newFileList[0].status === 'done') {
      form.setFieldsValue({
        graphname: newFileList[0].name,
      })
      loadDetail.current.name = newFileList[0].name
      if (newFileList[0].response.status === 'success') {
        message.success('上传成功')
        localStorage.setItem("kgIsLoad", true)
        changeLoad(true)
      } else {
        message.error('上传失败')
      }

    }
  }


  //导出文件
  const exportFile = () => {
    message.success('开始导出文件')
    request.post(prefix + '/export/',).then(res => {
      console.log('res', res)
      const blob = new Blob([res])		// fileStream 是文件流，一般从后台获取
      saveAs(blob, 'kgGraph.ttl')
      message.success('导出文件成功')
      // setLoading(false)
    })
  }
  const onFinish = (values) => {
    console.log('Success:', values)
  }
  const changekgName = (value) => {
    console.log('name', value.target.value)
    loadDetail.current.name = value.target.value
    // changeName(value.target.value)
    // kgGraphName=value.target.value
    // localStorage.setItem('name', value.target.value)
  }

  const beforeUpload = (file) => {
    //不行，没有返回文件type无法验证
    console.log('filetype', file.type)
    // const istype = file.type === 'ttl' || file.type === 'owl' || file.type === 'rdf' || file.type === 'rdfs'

    // if (!istype) {
    //   message.error('只支持RDF、RDFS、OWL、TTL类型文件!')
    // }

    // const isLt2M = file.size / 1024 / 1024 < 2;

    // if (!isLt2M) {
    //   message.error('Image must smaller than 2MB!');
    // }

    // return istype
  }
  // const onPreview = async (file) => {
  //   let src = file.url

  //   if (!src) {
  //     src = await new Promise((resolve) => {
  //       const reader = new FileReader()
  //       reader.readAsDataURL(file.originFileObj)

  //       reader.onload = () => resolve(reader.result)
  //     })
  //   }

  //   // const image = new Image();
  //   // image.src = src;
  //   // const imgWindow = window.open(src);
  //   // imgWindow?.document.write(image.outerHTML);
  // }

  return (
    <>
      <Dropdown
        overlay={menu}
        placement="bottomLeft">
        <span
          style={{ lineHeight: '64px', width: '200px' }}
          onClick={(e) => e.preventDefault()}>
          <Space>
            菜单
            <DownOutlined />
          </Space>
        </span>
      </Dropdown>
      <Modal
        title='导入图谱'
        visible={isModalOpen}
        // footer={false}
        onOk={() => {
          //传入导入图谱名称
          changeName(loadDetail.current.name, 1)
          changeName(loadDetail.current.name, 3)
          localStorage.setItem("kgName", loadDetail.current.name)
          localStorage.setItem("kgFileName1", loadDetail.current.name)
          setIsModalOpen(false)
        }}
        onCancel={() => setIsModalOpen(false)
        }>
        <Form
          form={form}
          labelCol={{ span: 8, }}
          wrapperCol={{ span: 10, }}
          onFinish={onFinish}
        >
          <Form.Item label="导入类型" name='type'
            required>
            <Radio.Group
              // defaultValue={'entity'}
              onChange={(e) => {
                console.log('radio checked', e.target.value)
                localStorage.setItem("kgFileType", e.target.value)
                loadDetail.current.type = e.target.value
                changekgGraphType(e.target.value)
                setValue(e.target.value)
              }}
              value={value}>
              <Radio value='entity' >实体</Radio>
              <Radio value='ontology'>本体</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item required label="导入文件"
            // name='file'
            help="支持rdf/rdfs/owl格式文件"
            valuePropName="fileList" >
            <Upload
              action="/api/import/"
              listType="picture-card"
              fileList={fileList}
              onChange={onChange}
              // beforeUpload={beforeUpload}
              // onPreview={onPreview}
              data={{ kg: 'kg1', type: loadDetail.current.type }}
              name='file'
            >
              {fileList.length < 1 &&
                <div> <PlusOutlined />
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 5,
                      width: "100px"
                    }}
                  >
                    Upload
                  </div>
                </div>
              }
            </Upload>
          </Form.Item>
          <Form.Item
            required
            name="graphname"
            label="图谱名称">
            <Input
              onChange={changekgName} />
          </Form.Item>
        </Form>

      </Modal>

    </>

  )
}
export default observer(MenuSetting)