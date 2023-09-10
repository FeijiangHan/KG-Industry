/* 
  节点信息 和 关系信息的展示控制
*/
import React from 'react'
import { Row, Col, Tabs } from 'antd'
const { TabPane } = Tabs
const Style = {
  textAlign: 'right',
  paddingRight: '10px'
}
const formatName = (text) => {
  let index = text.lastIndexOf("/")
  return text.substring(index + 1, text.length)
}
const nodeDetailList = (node, pre, isRight = false) => {

  if (node === null || node === undefined) return ''
  let rowStyle = {}
  if (isRight) {
    rowStyle = Style
  }
  if (node.data.property !== null) {
    // console.log('节点', node.data, pre)
  }

  return (
    <React.Fragment>
      {
        node === null ? '' :
          <Row style={{ marginBottom: '10px' }} key={node.id}>
            <Col span={9} style={rowStyle}>{pre}名称:</Col>
            <Col span={15}>{node === null ? '' : formatName(node.name)}</Col>
          </Row>
      }
      {node === null || node.data.property === null ?
        '' : (
          Object.keys(node.data.property).map(ekey => {
            return (
              <Row key={node.id + ekey} style={{ marginBottom: '10px' }}>
                <Col span={9} style={rowStyle}>
                  {ekey === '' || ekey === undefined ? '' :
                    ekey.substring(ekey.lastIndexOf('/') + 1, ekey.length)
                  }
                  {/* {ekey} */}
                  :</Col>
                <Col span={15}>{node.data.property[ekey]}</Col>
              </Row>)
          })
        )}
    </React.Fragment>
  )
}
const linkSideDetailList = (link) => {
  if (link === null || link === undefined) return ''
  let rowStyle = Style

  return (
    <>
      {link.name ?
        <Row style={{ margin: '15px 0' }}>
          <Col span={4} >关系名称:</Col>
          <Col span={7}>{(link.name)}</Col>
        </Row>

        : ''
      }
      <Row>
        <Col span={11}>
          {nodeDetailList(link.source, "源节点")}
        </Col>
        <Col span={1}>
          <div style={{ width: '1px', height: '100%', backgroundColor: '#bbbb', margin: '0 auto' }}></div>
        </Col>
        <Col span={11}>
          {nodeDetailList(link.target, "目标节点")}
        </Col>
      </Row>

    </>
  )
}
const linkDetailList = (link, isRight = false) => {
  if (link === null || link === undefined || link.name === undefined) return ''
  let rowStyle = {}
  if (isRight) {
    rowStyle = Style
  }
  return (
    <>
      <Row style={{ marginBottom: '15px' }}>
        <Col span={9} style={rowStyle}>关系名称:</Col>
        <Col span={15}>{formatName(link.name)}</Col>
      </Row>
      {
        link.source !== undefined ?
          nodeDetailList(link.source, "源节点", isRight) : ""}
      <Row style={{ border: '0.5px solid #f0f0f4', marginBottom: '15px' }}></Row>
      {link.target !== undefined ?
        nodeDetailList(link.target, "目标节点", isRight) : ""}
    </>
  )
}

const mulLinkDetailList = (link, isRight = false) => {
  if (link === null || link === undefined) return ''
  if (link.otherLinks === undefined) {
    return linkDetailList(link, isRight)
  }
  const other = link.otherLinks
  return (
    <Tabs defaultActiveKey={other[0].id}>
      {
        other.map(curLink => {
          return (
            <TabPane tab={formatName(curLink.name)} key={curLink.id}>
              {linkDetailList(curLink, isRight)}
            </TabPane>
          )
        })
      }
    </Tabs>
  )

}

export {
  linkDetailList,
  mulLinkDetailList,
  nodeDetailList,
  linkSideDetailList
}