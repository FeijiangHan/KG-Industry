import './index.css'
import { useState } from 'react'
import useStore from '@/store'
import { observer } from 'mobx-react-lite'
import DataFilter from '@/components/DataFilter'
import DetailCard from '@/components/DetailCard'
import MapComponent from '@/components/MapComponent'
import Graph from '@/GraphCompoments/Graph'
import data3 from '@/assets/json/ZHKG_Data.json'
import data2 from '@/assets/json/ZHKG_Data_20Nodes.json'
import data1 from '@/assets/json/newCase.json'
import MapData from '@/assets/json/map.json'
import { request, addNeedObserverLink } from '@/utils'
import { message } from 'antd'
const prefix = '/api'
function KgManger () {
  const { publicStore } = useStore()
  const { kgGraphType } = publicStore
  const [type, setType] = useState('node')
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectNode, setSelectNode] = useState(null)
  const [mapSelectId, setMapSelectId] = useState(null)
  const [getLocationFlag, setGetLocationFlag] = useState(true)
  const [location, setLocation] = useState(null)
  //添加和修改了地理信息的节点
  const [addMapNode, setAddMapNode] = useState(null)
  const [upMapNode, setUpMapNode] = useState(null)
  const [delMapNode, setDelMapNode] = useState(null)
  const getRelationData = (record, graphNum, type) => {
    setLoading(true)
    setType(type)
    let postObj = {}
    console.log('record', record)
    let kgtype = 'kg1'
    if (localStorage.getItem("kgIsMerge") === 'true') {
      kgtype = 'all'
    }
    console.log('kgtype', kgtype)
    if (type === 'node') {
      if (localStorage.getItem("kgFileType") === 'ontology') {
        postObj = {
          max_k: graphNum,
          type: 'tree',
          id: record.id,
          kg: kgtype
        }
      }
      else if (record.name == "http://example.org/resource/伯丁根基地") {
        message.success('ok')
        console.log("this is wqrsda!!", MapData)
        message.success("获取数据成功")

        setGraphData(MapData)
        setLoading(false)
        return
      }
      else {
        postObj = {
          max_k: graphNum,
          type: type,
          id: record.id,
          kg: kgtype
        }
      }
    } else {
      postObj = {
        max_k: graphNum,
        type: type,
        id: record.source.id ? record.source.id : record.source,
        id2: record.target.id ? record.target.id : record.target,
        kg: kgtype
      }
    }
    request.post(prefix + '/subgraph/', postObj).then(response => {
      if (response.status === 'success') {
        message.success("获取数据成功")
        console.log('成功', response)
        setGraphData(response.res)
        if (type === 'node') {
          addNeedObserverLink(response.res, {
            'source': record.id
          })
        } else {
          addNeedObserverLink(response.res, {
            'id': record.id,
            'source': record.source,
            'target': record.target
          })
        }
      } else {
        console.log('查询子图失败', response)
        message.error('查询子图失败')
        // request.post(prefix + '/subgraph/',
        //   {
        //     max_k: graphNum,
        //     type: type,
        //     id: record.id,
        //     kg: kgtype
        //   }).then(response => {
        //     if (response.status === 'success') {
        //       message.success("获取数据成功")
        //       setGraphData(response.res)
        //       if (type === 'node') {
        //         addNeedObserverLink(response.res, {
        //           'source': record.id
        //         })
        //       } else {
        //         addNeedObserverLink(response.res, {
        //           'id': record.id,
        //           'source': record.source,
        //           'target': record.target
        //         })
        //       }
        //     } else {
        //       console.log(response)
        //       message.error('查询子图失败')

        //     }
        //     setLoading(false)
        //   })
      }
      setLoading(false)
    })
  }
  return (
    <div className='kgManger'>
      <div className="manger-left">
        <DataFilter
          getRelationData={getRelationData}
        ></DataFilter>
      </div>
      <div className="manger-center">
        <Graph
          data={graphData}
          editDisabled={false}
          isOntology={localStorage.getItem("kgFileType") === 'ontology' && type === 'node' ? false : true}
          observerColor='#FF0000'
          // initNodeSet={{
          //   nodeColor: "#0f0",
          // }}
          initLinkSet={{
            mulLinkSuper: false,
          }}
          initLayoutSet={{

          }}
          remoteAcqu={true/*默认为true,启动详细信息:从后端获取 */}
          loading={loading}
          setSelectNode={setSelectNode}
          setLoading={setLoading}
          mapSelectId={mapSelectId}
          /* 获取地理信息标志 */
          getLocationFlag={getLocationFlag}
          setGetLocationFlag={setGetLocationFlag}
          location={location}
          setAddMapNode={setAddMapNode}
          setUpMapNode={setUpMapNode}
          setDelMapNode={setDelMapNode}
        ></Graph>
      </div>
      <div className="manger-right">
        <div className='top'>
          <MapComponent
            data={graphData?.nodes}
            selectNode={selectNode}
            setMapSelectId={setMapSelectId}
            /* 获取地理信息标志 */
            getLocationFlag={getLocationFlag}
            setLocation={setLocation}
            addMapNode={addMapNode}
            upMapNode={upMapNode}
            delMapNode={delMapNode}
          ></MapComponent>
        </div>
        <div className="bottom">
          <DetailCard />
        </div>
      </div>
    </div>
  )
}
export default observer(KgManger)