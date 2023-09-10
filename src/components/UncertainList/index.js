/*
*  这个组件是检测
*/
import './index.css'
import { Tabs, Button, Input, InputNumber } from 'antd'
import DataList from './dataList'
import OperationRecord from '../OperationRecord';
import predict_id from '@/assets/json/predict_id.json'
import { useEffect, useRef, useState } from 'react';
const { TabPane } = Tabs
function UncertainList (props) {
  const [existenceDataSource, setexistenceDataSource] = useState([])
  const [typeDataSource, settypeDataSource] = useState([])
  const [graphNum, setGraphNum] = useState(20)
  const filterDiv = useRef()
  const getRelationData = (record) => {
    props.getRelationData(record, graphNum)
  }
  const delLink = (record) => {
    return new Promise((resolve, reject) => {
      props.delLink(record).then(res => {
        resolve(res)
      }, rej => {
        reject(rej)
      })
    })

  }
  useEffect(() => {
    let existData = []
    console.log(Object.values(predict_id))
    for (let data of Object.values(predict_id)) {
      //console.log(data)
      let temp = {
        id: data[1].id,
        source: data[0],
        target: data[2],
        name: data[1].name,
        score: data[3]
      }
      existData.push(temp)
    }
    setexistenceDataSource(existData)
  }, [predict_id])
  return (
    <div className="data-filter-view" style={{ width: '100%', height: '100%' }}>
      <div ref={filterDiv} className="data-filter-tab" >
        <Tabs defaultActiveKey="1" tabBarGutter={50} centered>
          <TabPane tab="存在性检测" key="1">
            <div className='uncertainList-row'>
              节点数:
              <InputNumber
                style={{ width: '46px', marginRight: '20px' }}
                size="small"
                controls={false}
                min={10}
                max={4000}
                value={graphNum}
                onChange={(val) => { setGraphNum(val) }} />
              <Button type='primary' size='small'>开始关联关系审查</Button>
            </div>

            <DataList
              type='existence'
              getRelationData={getRelationData}
              dataSource={existenceDataSource}
              delLink={delLink}
              setDataSource={setexistenceDataSource}
            />
          </TabPane>
          <TabPane tab="类型检测" key="2">
            <div className="uncertainList-row">
              <Input addonBefore="源id" size="small" style={{ width: '110px', marginRight: '15px' }}></Input>
              <Input addonBefore="目标id" size="small" style={{ width: '120px' }}></Input>
            </div>
            <div className='uncertainList-row'>
              节点数:
              <InputNumber
                style={{ width: '46px', marginRight: '20px' }}
                size="small"
                controls={false}
                min={10}
                max={4000}
                value={graphNum}
                onChange={(val) => { setGraphNum(val) }} />
              <Button type='primary' size='small'>开始关联关系审查</Button>
            </div>
            <DataList
              type='type'
              filterDiv={filterDiv}
              dataSource={typeDataSource}
              getRelationData={getRelationData}
              setDataSource={settypeDataSource}
            />
          </TabPane>
        </Tabs>
      </div>
      <div className="data-filter-operation">
        <OperationRecord></OperationRecord>
      </div>
    </div>
  )
}
export default UncertainList