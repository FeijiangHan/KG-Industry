import { Input, Button, Popconfirm, Table, message, Space, InputNumber, Spin } from 'antd'
import { useEffect, useState, useRef } from 'react';
import {
  linkDetailList,
  nodeDetailList,
} from '@/components/infoShow.js'
import { observer } from 'mobx-react-lite'
import useStore from '@/store'
import { fuzzyQuery, request } from '@/utils'
import {
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
const { Search } = Input;
const prefix = '/api'
function DataList (props) {
  const { dataSource } = props
  const { publicStore } = useStore()
  const [maxHeight, setMaxHeight] = useState(220)

  const columns = [
    {
      title: '节点名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => {
        let index = text.lastIndexOf("\/");
        return text.substring(index + 1, text.length)
      },
      ellipsis: true,
    },
    {
      title: '得分',
      dataIndex: 'score',
      width: '23%',
      key: 'score',
      defaultSortOrder: 'descend',
      render: (text) => {
        if (text === undefined) return ''
        return text.substring(0, 4)
      },
      sorter: (a, b) => {
        if (a.score > b.score) return 1
        else return -1
      },
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: '操作',
      width: '22%',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm title="确定删除吗?" onConfirm={() => {
            props.delLink(record).then(res => {
              if (res === 'success') {
                message.success("删除成功")
                const newData = dataSource.filter((item) => item.id !== record.id);
                props.setDataSource(newData)
              }
            }, rej => {
              message.error("删除失败")
            })
          }}>
            <DeleteOutlined />
          </Popconfirm>

          <EyeOutlined onClick={() => onTo(record)} />
        </Space>
      ),
    },
  ]


  useEffect(() => {
    if (document.body.clientHeight <= 722) {
      setMaxHeight(240)
    } else {
      setMaxHeight(document.body.offsetHeight - 510)
    }
  }, [publicStore.windowResizeFlag])

  const onTo = (record) => {
    props.getRelationData(record)
  }

  const expandedRowRender = (record) => {
    return (
      <div style={{ marginLeft: '10px' }}>
        {linkDetailList(record)}
      </div>
    )

  }
  return (
    <>
      {/*
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
        节点数:
        <InputNumber
          style={{ width: '46px', marginLeft: '4px' }}
          size="small"
          controls={false}
          min={10}
          max={4000}
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
      */}
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={props.loading}
        size="small"
        rowKey={(record) => record.id}
        scroll={{ y: maxHeight }}
        showHeader={true}
        expandable={{
          expandedRowRender,
          columnWidth: '10%'
        }}
        pagination={{
          defaultCurrent: 1,
          position: ['bottomRight'],
          total: dataSource.length,
          hideOnSinglePage: false,
          responsive: true,
          showSizeChanger: true,
          size: 'small',
          simple: true,
          style: {
            marginBottom: '0px',
          }
        }}
      />
    </>
  )
}
export default observer(DataList)