
import { useRef, useEffect } from 'react'
import { graphToTreeData } from '@/utils'
import * as d3 from 'd3'
import useStore from '../../store'
import { observer } from 'mobx-react-lite'
import { request } from '@/utils'
import { message } from 'antd'
const prefix = '/api'
const highLightBei = 1.2
const graphData = {
  "nodes": [
    {
      "name": "Microsoft_Windows",
      "id": "100000",
      "data": {
        "property": null
      }
    },
    {
      "name": "MIUI",
      "id": "100001",
      "data": {
        "property": null
      }
    },
    {
      "name": "ICloud",
      "id": "100002",
      "data": {
        "property": null
      }
    },
    {
      "name": "Nexus_6P",
      "id": "100003",
      "data": {
        "property": null
      }
    },
    {
      "name": "Nexus_6P",
      "id": "100004",
      "data": {
        "property": null
      }
    },
    {
      "name": "Nexus_6P",
      "id": "100005",
      "data": {
        "property": null
      }
    },
  ],
  "links": [
    {
      "name": "operatingSystem",
      "source": "100000",
      "target": "100001",
      "id": "200000"
    },
    {
      "name": "programmedIn",
      "source": "100000",
      "target": "100002",
      "id": "200001"
    },
    {
      "name": "operatingSystem",
      "source": "100000",
      "target": "100003",
      "id": "200002"
    },
    {
      "name": "operatingSystem",
      "source": "100003",
      "target": "100004",
      "id": "200002"
    },
    {
      "name": "operatingSystem",
      "source": "100004",
      "target": "100005",
      "id": "200002"
    },
  ]
}
function Tree (props) {
  const { curLayout, svgContainer,
    treeData, layoutSet,
    nodeSet, linkSet, remoteAcqu
    , observerColor } = props
  const { graphStore } = useStore()
  const { setSelect, clearSelect } = graphStore
  const svg = useRef()
  const svgTree = useRef()
  const initZoom = useRef(true)
  const defs = useRef()
  const mask = useRef()
  const selectMask = useRef()
  //const armyStore.selectNode = useRef(null)
  const linksMap = useRef(null)
  const _duration = useRef(450)
  const _svgWidth = useRef()
  const _svgHeight = useRef()
  const _data = useRef(null)
  const _tree = useRef(d3.tree())
  const _diagonal = useRef(d3.linkHorizontal())
  const _zoom = useRef(d3.zoom())
  const updateLink = useRef(null)
  const updateNode = useRef(null)
  const updateLinkText = useRef(null)
  const prevState = useRef(null)
  const transformParam = useRef({
    k: 1,
    x: 0,
    y: 0,
  })
  const states = useRef({
    lastsetAutoZoom: false,
    graphAutoNodeForce: false,
    nodeSet: nodeSet,
    linkSet: linkSet,
    layoutSet: layoutSet,
  })
  /* 初始化 */
  useEffect(() => {
    svg.current = d3.select(svg.current)
    _diagonal.current.x((d) => d.y).y(d => d.x)
    _zoom.current.scaleExtent([0.1, 20])
      .on('zoom', zoomed)
    /* 收缩节点 */
    svg.current.on('contextmenu', (e) => {
      e.preventDefault()
    }).on("click", () => {
      cancleHighLight()
      clearSelect()
    }).call(_zoom.current)
    svgTree.current = svg.current.append('g')
      .attr('class', 'svg-tree-content')
  }, [])
  useEffect(() => {
    if (!treeData) return
    console.log(treeData)
      ;[_data.current, linksMap.current] = treeData
    const treeNodesList = _data.current.descendants()
    /* 树初始化 */
    _svgWidth.current = svgContainer.current.offsetWidth
    _svgHeight.current = svgContainer.current.offsetHeight
    _tree.current.nodeSize([2 * nodeSet.radius + 1 + 20, 20])
    update()
    return () => {

    }
  }, [treeData])
  useEffect(() => {
    if (curLayout === 'tree') {
      console.log("你进去了？？？？？")
      onAutoZoomTree(true)
    } else {
      _data.current = null
    }
  }, [curLayout])
  useEffect(() => {
    states.current.nodeSet = nodeSet
    states.current.linkSet = linkSet
    states.current.layoutSet = layoutSet
    if (_data.current) {
      update()
    }
    if (states.current.lastsetAutoZoom === false && layoutSet.grahAutoZoom === true) {
      if (_data.current) {
        console.log("你进去了？？？？？")
        onAutoZoomTree(true)
      }
    }
    states.current.graphAutoNodeForce = layoutSet.graphAutoNodeForce
    states.current.lastsetAutoZoom = layoutSet.grahAutoZoom
  }, [nodeSet, linkSet, layoutSet])
  const onAutoZoomTree = (flag = false) => {
    //getBBox返回svg显示的最小矩形
    const viewBox = svgTree.current.node().getBBox()
    const width = svgContainer.current.offsetWidth
    const height = svgContainer.current.offsetHeight
    console.log(width, height, viewBox, svgTree.current.node())
    //若getBBOx大于视图高宽
    if (flag || viewBox.width > width || viewBox.height > height) {
      //_svgWidth * pre_scale = 无缩放正常视图宽度
      const next_scale = Math.min((width - 100) / viewBox.width, (height - 100) / viewBox.height),
        //确定中心点
        center_x = width / 2 - (viewBox.x + viewBox.width / 2) * next_scale,
        center_y = height / 2 - (viewBox.y + viewBox.height / 2) * next_scale
      const t = d3.zoomIdentity.translate(center_x, center_y).scale(next_scale)
      svg.current.transition().duration(750).call(_zoom.current.transform, t).on('end', () => {
        transformParam.current.x = t.x
        transformParam.current.y = t.y
        transformParam.current.k = t.k
      })
    }
  }
  const zoomed = (event) => {
    transformParam.current = event.transform
    svgTree.current.attr('transform', event.transform)
  }
  const update = (source, action) => {
    if (!_data.current) return
    const treeData = _tree.current(_data.current)
    let nodes = treeData.descendants()
    let links = treeData.links()
    nodes.forEach((d) => {
      d.y = (d.depth * linkSet.linkLength * 2)
    })
    /* 设置节点id */
    let node = svgTree.current.selectAll("g.node")
      .data(nodes, (d) => {
        return d.data.id
      })
    /* 设置边id */
    let link = svgTree.current.selectAll("path.link")
      .data(links, (d) => {
        return '' + d.source.data.id + d.target.data.id
      })
    /* 设置边text */
    const linkText = svgTree.current.selectAll("text.linkText")
      .data(links, d => '' + d.source.data.id + d.target.data.id)
    linkText.exit().remove("text")
    let linkTextEnter = linkText.enter()
      .append("text")
      .attr("class", "linkText")
      .append("textPath")
      .attr("xlink:href", d => {
        return '#TreeTextPath' + d.source.data.id + d.target.data.id
      })
      .style("text-anchor", "middle")
      .attr("startOffset", "50%")

    updateLinkText.current = linkTextEnter.merge(linkText)
    // 在父对象的上一个位置添加任何新链接。
    let linkEnter = link.enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", (d) => {
        let o = {}
        if (!d.source.x0) {
          o = {
            x: d.source.x,
            y: d.source.y
          }
        } else {
          o = {
            x: d.source.x0,
            y: d.source.y0
          }
        }
        return _diagonal.current({
          source: o,
          target: o
        })
      })
      .style("fill", 'none')
      // 添加id
      .attr("id", d => {
        return "TreeTextPath" + d.source.data.id + d.target.data.id
      })
      .on("click", function (e, d) {
        e.stopPropagation()
        e.preventDefault()
        console.log(d)
        let linkdetail = linksMap.current.get('' + d.source.data.id + d.target.data.id)
        console.log('' + d.source.data.id + d.target.data.id)
        selectNodeorLink({
          'id': linkdetail.id,
          'name': linkdetail.name,
          'source': d.source.data,
          'target': d.target.data
        }, this, 'link')
      })
    // 过渡链接到目标节点位置。
    updateLink.current = linkEnter.merge(link)
    //同样增加动画
    updateLink.current.transition()
      .duration(_duration.current)
      .attr("d", _diagonal.current)
    //链接退出隐藏，转换到父节点的位置。
    link.exit().transition()
      .duration(_duration.current)
      .attr("d", (d) => {
        const o = {
          x: d.source.x,
          y: d.source.y
        }
        return _diagonal.current({
          source: o,
          target: o
        })
      })
      .remove()
    let nodeEnter = node.enter()
      .append("g")
      .attr("class", "node"/*？？？ */)
      /* 生成节点前所处的位置 */
      .attr("transform", (d) => {
        if (d.parent !== null) { //若有父 从父来
          if (!d.parent.x0) { //若非根
            return `translate(${d.parent.y},${d.parent.x})`
          } else {
            return `translate(${d.parent.y0},${d.parent.x0})`
          }
        } else {
          if (!d.y0) { //若非根
            return `translate(${d.y},${d.x})`
          } else {
            return `translate(${d.y0},${d.x0})`
          }
        }
      })
      .on("click", function (e, d) {
        //第一次点击为true
        e.stopPropagation()
        e.preventDefault()
        onAutoNodeFouce(d)
        selectNodeorLink(d.data, this, 'node')
      })
      .on("contextmenu", function (event, d) { // 显示右键节点菜单
        /*         handleSelectNode(d, this)
                if (d.data.army_id !== 0)
                  onContextmenu(event, d) */
      })

    nodeEnter
      .append("circle")
      .attr("class", "node-circle")

    // 创建文本
    nodeEnter.append("text")
      .attr("x", 0)
      .attr("y", nodeSet.radius + nodeSet.lableSize)
      .attr("text-anchor", "middle")
      .style("font-size", nodeSet.lableSize + "px")

    // 更新
    updateNode.current = nodeEnter.merge(node)
    updateNode.current.transition()
      .duration(_duration.current)
      .attr("transform", (d) => {
        return "translate(" + d.y + "," + d.x + ")"
      })
    let nodeExit = node.exit().transition()
      .duration(_duration.current)
      .attr("transform", (d) => {
        if (d.parent !== null) {
          return "translate(" + d.parent.y + "," + d.parent.x + ")"
        } else {
          return "translate(" + d.y + "," + d.x + ")"
        }

      })
      .remove()
    // 退出时，将节点圆的大小减小为0
    nodeExit.select('circle')
      .attr('r', 1e-6)

    nodes.forEach((d) => {
      d.x0 = d.x
      d.y0 = d.y
    })
    upAllStyle()
    //onAutoZoomTree(true)
    /*     // 自动缩放
        if (armyStore.autoZoomTree) {
          setTimeout(() => {
            onAutoZoomTree()
          }, 500)
        } */
  }
  const upAllStyle = () => {
    const { nodeSet, linkSet, layoutSet } = states.current
    const { visNodeLable, visLinkLable } = layoutSet
    updateLink.current
      .attr("stroke", function (d) {
        if (d3.select(this).attr("highlight") === "1")
          return "red"
        else
          return linkSet.linkColor
      })
      .attr("stroke-width", function () {
        if (d3.select(this).attr("highlight") === "1")
          return linkSet.linkWidth * highLightBei
        else
          return linkSet.linkWidth
      })

    updateNode.current.select("circle")
      .attr("r", nodeSet.radius)
      .attr("fill", nodeSet.nodeColor)
      .attr("stroke-width", function (d) {
        if (d3.select(this).attr("highlight") === "1")
          return 1
        else return 0.5
      })
      .attr("stroke", function (d) {
        if ((d3.select(this).attr("highlight") === "1"))
          return "red"
        else if (d.data.isNeedObserver) {
          return observerColor
        }
        else
          return '#555555'
      })
    updateNode.current.select("text")
      .attr("x", 0)
      .attr("y", nodeSet.radius + nodeSet.lableSize)
      .attr("text-anchor", "middle")
      .style("font-size", nodeSet.lableSize + "px")
      .text((d) => {
        if (visNodeLable) {
          return d.data.name
        }
      })
    updateLinkText.current.attr("dy", -(~~(linkSet.lableSize / 2)))
    updateLinkText.current.select("textPath")
      .attr("font-size", linkSet.lableSize)
      .text((d) => {
        if (visLinkLable) {
          return linksMap.current.get('' + d.source.data.id + d.target.data.id).name

        }
      })

  }
  // 自动节点聚焦
  const onAutoNodeFouce = (source) => {
    if (states.current.graphAutoNodeForce) {
      console.log(transformParam.current)
      const scale = transformParam.current.k,
        x = -source.y,
        y = -source.x

      const width = svgContainer.current.offsetWidth
      const height = svgContainer.current.offsetHeight
      console.log(x, y, scale, width, height)
      const center_x = x * scale + width / 2,
        center_y = y * scale + height / 2
      const t = d3.zoomIdentity.translate(center_x, center_y).scale(scale)
      svg.current.transition()
        .duration(750)
        .call(_zoom.current.transform, t).on('end', () => {
          transformParam.current.x = t.x
          transformParam.current.y = t.y
          transformParam.current.k = t.k
        })
    }
  }
  const selectNodeorLink = (d, dom, type, event = null) => {
    cancleHighLight()
    const select = {
      id: d.id,
      name: d.name,
      dom,
      type
    }
    if (type === 'node') {
      select['data'] = d.data
    }
    if (type === 'link') {
      select['source'] = d.source
      select['target'] = d.target
    }
    //if (dom && type === 'node' && props.setSelectNode && d.location) //用于地图高亮
    //  props.setSelectNode(select)
    //checkIsMul(select)
    //TODO: 获取详细信息
    let queryIds = []
    if (type === 'node') {
      queryIds.push(select.id)
    } else {
      if (select.otherLinks) {
        for (let item of select.otherLinks) {
          queryIds.push(item.id)
        }
      } else {
        queryIds.push(select.id)
      }
    }
    if (remoteAcqu === undefined || remoteAcqu === true)
      request.post(prefix + "/getdetail/", {
        type,
        id: queryIds
      }).then(res => {
        if (res.status === "success") {
          if (type === 'node') {
            select.data = res.res[select.id].data
          } else {
            //是多边
            if (select.otherLinks) {
              for (let item of select.otherLinks) {
                const linkDetail = res.res[item.id]
                item.source = linkDetail[0]
                item.target = linkDetail[2]
                if (item.id === select.id) {
                  select.source = linkDetail[0]
                  select.target = linkDetail[2]
                }
              }
            } //非多边 
            else {
              const linkDetail = res.res[select.id]
              select.source = linkDetail[0]
              select.target = linkDetail[2]
            }
          }
          setSelect(select)
          //setSelectRef(svg, svgContainer)
          if (dom)
            highLight(dom, type)
          else { //针对地图的
            upAllStyle()
          }
        } else {
          message.error("查询详细信息失败!" + res.message)
        }
      }, ERR => {
        message.error("节点详细信息获取失败,无法选中")
      })
    else {
      setSelect(select)
      //setSelectRef(svg, svgContainer)
      if (dom)
        highLight(dom, type)
      else { //针对地图的
        upAllStyle()
      }
    }
  }
  const highLight = (dom, type) => {
    let selection = d3.select(dom)
    if (type === 'link') {
      console.log(selection)
      let or = selection
        .attr("stroke-width")
      selection
        .attr("stroke-width", or * highLightBei)
        .attr("stroke", "red")
        .attr("highlight", 1)

    } else {
      let or = selection.select("circle")
        .attr("r")
      selection.select("circle")
        .attr("r", or * highLightBei)
        .attr("stroke-width", 1)
        .attr("stroke", "red")
        .attr("highlight", 1)
    }

  }
  const cancleHighLight = () => {
    if (graphStore.select === null) return
    const { type } = graphStore.select
    const dom = graphStore.select.dom
    let selection = d3.select(dom)
    if (type === 'link') {
      selection.attr("highlight", 0)
    } else {
      if (dom.tagName === 'g')
        selection = selection.select("circle")
      selection.attr("highlight", 0)
    }
    upAllStyle()
  }
  return (
    <>
      <svg ref={svg} className={curLayout === 'tree' ? '' : 'hidden'} width="100%" height="99%">

      </svg>

    </>
  )
}
export default observer(Tree) 