/*
*  这个组件是知识图谱交互式管理的 节点检索和操作记录功能
*/
import './index.css'
import { Tabs } from 'antd'
import DataList from './dataList'

import OperationRecord from '../OperationRecord'
import { useRef } from 'react'
const { TabPane } = Tabs
function DataFilter (props) {
  const filterDiv = useRef()
  const getRelationData = (record, graphNum, test) => {
    props.getRelationData(record, graphNum, test)
  }
  return (
    <div className="data-filter-view" style={{ width: '100%', height: '100%' }}>
      <div ref={filterDiv} className="data-filter-tab"
        style={props.topListMaxH ? {
          height: props.topListMaxH
        } : {}} >
        <Tabs defaultActiveKey="1" tabBarGutter={50} centered>
          <TabPane tab="节点检索" key="1">
            <DataList
              type='node'
              filterDiv={filterDiv}
              getRelationData={getRelationData}
            />
          </TabPane>
          <TabPane tab="关系检索" key="2">
            <DataList
              type='link'
              filterDiv={filterDiv}
              getRelationData={getRelationData}
            />
          </TabPane>
        </Tabs>
      </div>
      <div className="data-filter-operation">
        <OperationRecord>

        </OperationRecord>
      </div>
    </div>
  )
}
export default DataFilter