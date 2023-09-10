import './index.css'
import { Button, Card, Row, Col, Slider, InputNumber, Popover, Switch } from 'antd'
import { UnorderedListOutlined, CloseOutlined, DownloadOutlined } from '@ant-design/icons'
import { useRef, useState } from 'react'
import { ChromePicker } from 'react-color'
import { download } from '../../utils'
import React from 'react'
function GraphSetting (props) {
  const { layoutSet, nodeSet, linkSet, onlyStyleUpFalg, noUpFalg, setAutoZoom,
    upLayoutSet, upNodeSet, upLinkSet,
    setType, setDetailType } = props
  const [showSettingCard, setShowSettingCard] = useState(false)
  const [tab, setTab] = useState('tab1')
  //console.log("card", cardRef.current.offsetHeight)
  //console.log(props.svgContainer.current.offsetHeight)
  const handleCloseCard = (e) => {
    setShowSettingCard(false)
  }
  const handleOpenCard = (e) => {
    setShowSettingCard(!showSettingCard)
  }
  const onTabChange = (key, type) => {
    setTab(key)
  }
  const downedImg = () => {
    download(props.svg, props.svgContainer).then(({ base64 }) => {
      let a = document.createElement('a');
      a.href = base64;
      a.download = "graph";  // 文件名
      a.click(); //点击触发下载
    })
  }
  const onGraphSettingChange = (set, bigType) => {
    setType.current = bigType
    setDetailType.current = set.type
    switch (bigType) {
      case 'layoutSet':
        if (set.type === 'visNodeLable' || set.type === 'visLinkLable') {
          onlyStyleUpFalg.current = true
        }
        if (set.type === 'graphAutoNodeForce') {
          noUpFalg.current = true
        }
        if (set.type === 'grahAutoZoom') {
          setAutoZoom.current = true
        }
        const temp1 = Object.assign({}, layoutSet, { [set.type]: set.value })
        upLayoutSet(temp1)
        break
      case 'nodeSet':
        if (set.type === 'nodeColor' || set.type === 'lableSize') {
          onlyStyleUpFalg.current = true
        }
        const temp2 = Object.assign({}, nodeSet, { [set.type]: set.value })
        upNodeSet(temp2)
        break
      case 'linkSet':
        if (set.type === 'linkColor' ||
          set.type === 'linkWidth' ||
          set.type === 'lableSize' ||
          set.type === 'mulLinkColor') {
          onlyStyleUpFalg.current = true
        }
        const temp3 = Object.assign({}, linkSet, { [set.type]: set.value })
        upLinkSet(temp3)
      default:
        break
    }
  }
  const tabList = [
    { key: 'tab1', tab: '布局设置' },
    { key: 'tab2', tab: "节点设置" },
    { key: 'tab3', tab: "边设置" },
  ]
  const linkSetList = [
    { name: "边宽度", min: 1, max: 5, step: 0.1, value: linkSet.linkWidth, valueName: "linkWidth" },
    { name: "边长度", min: 1, max: 100, step: 0.1, value: linkSet.linkLength, valueName: "linkLength" },
    { name: "边标签大小", min: 1, max: 25, step: 0.1, value: linkSet.lableSize, valueName: "lableSize" },
  ]
  const nodeSetList = [
    { name: "节点大小", min: 1, max: 10, step: 0.1, value: nodeSet.radius, valueName: "radius" },
    { name: "节点标签大小", min: 1, max: 25, step: 0.1, value: nodeSet.lableSize, valueName: "lableSize" },
  ]
  const nodeColorList = [
    { name: "节点颜色", value: nodeSet.nodeColor, valueName: "nodeColor" },
  ]
  const linkColorList = [
    //mulLinkColor
    { name: "边颜色", value: linkSet.linkColor, valueName: "linkColor" },
    { name: "多边聚合颜色", value: linkSet.mulLinkColor, valueName: "mulLinkColor" },
  ]
  const linkBtnList = [
    //mulLinkSuper
    { name: "多边聚合", value: linkSet.mulLinkSuper, valueName: "mulLinkSuper" },
  ]

  const layoutList = [
    { name: "节点斥力", min: 0, max: 100, step: 1, value: layoutSet.charge, valueName: "charge" },
  ]
  const layoutBtnList = [
    /*  { name: "节点类型图例", value: layoutSet.visLegend, valueName: "visLegend" }, */
    { name: "节点标签", value: layoutSet.visNodeLable, valueName: "visNodeLable" },
    { name: "边标签", value: layoutSet.visLinkLable, valueName: "visLinkLable" },
    { name: "自适应缩放", value: layoutSet.grahAutoZoom, valueName: "grahAutoZoom" },
    { name: "节点跟踪聚集", value: layoutSet.graphAutoNodeForce, valueName: "graphAutoNodeForce" },
  ]
  const contentList = {
    tab1: <div>
      <Row gutter={[0, 16]} justify="space-between">
        {
          layoutList.map((set) => {
            return (
              <React.Fragment key={set.valueName}>
                <Col span={24} className="kg-setting-title">{set.name}</Col>
                <Col span={17}>
                  <Slider min={set.min} max={set.max} step={set.step} value={set.value} onChange={value => { onGraphSettingChange({ value: value, type: set.valueName }, "layoutSet") }} />
                </Col>
                <Col span={6}>
                  <InputNumber min={set.min} max={set.max} step={set.step} value={set.value} onChange={value => { onGraphSettingChange({ value: value, type: set.valueName }, "layoutSet") }} />
                </Col>
              </React.Fragment>
            )
          })
        }
        {
          layoutBtnList.map(set => {
            return (
              <React.Fragment key={set.valueName} >
                <Col className="kg-setting-title" span={17}>
                  {set.name}
                </Col>
                <Col span={6}>
                  <Switch checked={set.value} onChange={value => onGraphSettingChange({ value: value, type: set.valueName }, "layoutSet")} />
                </Col>
              </React.Fragment>
            )
          })
        }
        <Col className="kg-setting-title" span={17}>
          导出图谱为图片
        </Col>
        <Col span={6}>
          <Button type="primary" shape="round"
            onClick={downedImg}
            icon={<DownloadOutlined />} size='small' />
        </Col>
      </Row>
    </div>,
    tab2: <div>
      <Row gutter={[0, 16]} justify="space-between" >
        {
          nodeSetList.map((set) => {
            return (
              <React.Fragment key={set.valueName}>
                <Col span={24} className="kg-setting-title">{set.name}</Col>
                <Col span={17}>
                  <Slider min={set.min} max={set.max} step={set.step} value={set.value} onChange={value => { onGraphSettingChange({ value: value, type: set.valueName }, "nodeSet") }} />
                </Col>
                <Col span={6}>
                  <InputNumber min={set.min} max={set.max} step={set.step} value={set.value} onChange={value => { onGraphSettingChange({ value: value, type: set.valueName }, "nodeSet") }} />
                </Col>
              </React.Fragment>
            )
          })
        }
        {
          nodeColorList.map((set) => {
            return (
              <React.Fragment key={set.valueName}>
                <Col className="kg-setting-title" span={17}>
                  {set.name}
                </Col>
                <Col span={6}>
                  <Popover content={<ChromePicker color={set.value} disableAlpha={true} onChangeComplete={value => { onGraphSettingChange({ value: value.hex, type: set.valueName }, "nodeSet") }} />} trigger="click" overlayClassName="site-antd-popover">
                    <span className="kg-setting-colorBox" style={{ backgroundColor: set.value }}></span>
                  </Popover>
                </Col>
              </React.Fragment>
            )
          })
        }
      </Row>
    </div>,
    tab3: <div>
      <Row gutter={[0, 16]} justify="space-between" >
        {
          linkSetList.map((set) => {
            return (
              <React.Fragment key={set.valueName}>
                <Col span={24} className="kg-setting-title">{set.name}</Col>
                <Col span={17}>
                  <Slider min={set.min} max={set.max} step={set.step} value={set.value} onChange={value => { onGraphSettingChange({ value: value, type: set.valueName }, "linkSet") }} />
                </Col>
                <Col span={6}>
                  <InputNumber min={set.min} max={set.max} step={set.step} value={set.value} onChange={value => { onGraphSettingChange({ value: value, type: set.valueName }, "linkSet") }} />
                </Col>
              </React.Fragment>
            )
          })
        }
        {
          linkBtnList.map(set => {
            return (
              <React.Fragment key={set.valueName} >
                <Col className="kg-setting-title" span={17}>
                  {set.name}
                </Col>
                <Col span={6}>
                  <Switch checked={set.value} onChange={value => onGraphSettingChange({ value: value, type: set.valueName }, "linkSet")} />
                </Col>
              </React.Fragment>
            )
          })
        }
        {
          linkColorList.map((set) => {
            return (
              <React.Fragment key={set.valueName}>
                <Col className="kg-setting-title" span={17}>
                  {set.name}
                </Col>
                <Col span={6}>
                  <Popover content={<ChromePicker color={set.value} disableAlpha={true} onChangeComplete={value => { onGraphSettingChange({ value: value.hex, type: set.valueName }, "linkSet") }} />} trigger="click" overlayClassName="site-antd-popover">
                    <span className="kg-setting-colorBox" style={{ backgroundColor: set.value }}></span>
                  </Popover>
                </Col>
              </React.Fragment>
            )
          })
        }
      </Row>
    </div>
  }
  return (
    <div className="Kg-setting" >
      <Button className="Kg-setting-btn" shape="circle" size="large" onClick={handleOpenCard} icon={<UnorderedListOutlined />} />
      <Card
        size="small"

        className="Kg-setting-card"
        style={showSettingCard ? { display: 'block' } : { display: 'none' }}
        bodyStyle={{ padding: "15px" }}
        tabList={tabList}
        activeTabKey={tab}
        tabBarExtraContent={<Button shape="circle" icon={<CloseOutlined />} onClick={handleCloseCard}></Button>}
        onTabChange={key => {
          onTabChange(key, 'key')
        }}>
        {contentList[tab]}

      </Card>
    </div>
  )

}

export default GraphSetting