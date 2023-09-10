/*
  Graph 跟随自身父亲div的宽度和高度
*/
import './index.css'
import orData from '@/assets/json/newCase.json'
import { useEffect, useRef, useState } from 'react'
import GraphSetting from '../GraphSetting'
import GraphContextMenu from '../GraphContextMenu'
import GraphModal from '../GraphModal'
import Tree from '../Tree'
import useStore from '../../store'
import { request, calculateHullPath, setLinkNumber, graphToTreeData } from '@/utils'
//TODO有后端后删除
import { nanoid } from 'nanoid'
import {
  CloseOutlined,
} from '@ant-design/icons'
import * as d3 from 'd3'
import { observer } from 'mobx-react-lite'
import { message, Modal, Radio, Space, InputNumber, Spin } from 'antd'
import {
  initLayoutSet,
  initNodeSet,
  initLinkSet,
  algorithmZNENmap,
  structureColor,
  boneColor,
  boneLinkColor,
  boneLinkColorMap,
  boneStrokeColor,
  observerColor,
  dottedLineColor
} from './config'
import simplify_equiv from '@/Algorithm/useSimplifyEquiv.js'
import superpointextraction from '@/Algorithm/useSuperpointextraction.js'
import equivalentstructureExtraction from '@/Algorithm/useEquivalentstructureExtraction.js'
const prefix = '/api'
const highLightBei = 1.2
function Graph (props) {
  const { dottedLine } = props
  const { graphStore, publicStore } = useStore()

  const { addOperationRecordList } = publicStore
  const { setSelect, clearSelect, clearOperation,
    setTargetNode, setSourceNode, setSelectRef } = graphStore
  const [treeData, setTreeData] = useState(null)
  // div
  const svgContainer = useRef()
  // div->svg 
  const svg = useRef()
  // div->svg->g
  const svgBody = useRef(null)
  // div->svg->g->g 所有节点放在这里 永远在节点的下层
  const linkBody = useRef(null)
  // div->svg->g->g 所有节点放在这里 永远在线的上层
  const nodeBody = useRef(null)

  //div->svg->g->g 最底层 凸包
  const subContainer = useRef(null)
  // div->svg->svgTopEdit->g 所有节点放在这里 永远在线的上层
  const textBody = useRef(null)
  // div->svg->g  生成的编辑线 永远在最顶层
  const svgTopEdit = useRef(null)

  const states = useRef({
    firstUp: false, //第一次更新完毕标志
    nodes: [],
    links: [],
    preNodes: null, //保存上一次结果
    preLinks: null,  // 保存上一次结果
    idMap: null,

    //多边组合所需数据
    linkGroupMap: null,

    // 各类组合
    linkG: null,
    nodeG: null,
    linkTextG: null,
    nodeTextG: null,
    hullG: null,
    // 此处为useState的同名 用于事件等
    graphAutoNodeForce: false,
    layoutSet: { ...initLayoutSet, ...props.initLayoutSet },
    nodeSet: { ...initNodeSet, ...props.initNodeSet },
    linkSet: { ...initLinkSet, ...props.initLinkSet },
    //边创建标志  用于在点击事件中 useState不会更新到的情况
    linkCreateFlag: false,
    //高级算法进入标志
    algorithmFlag: false,
    algorithmType: '',
    hullDatas: [], //超点data
    //选中动画完毕
    editFlagAn: false,
    editLinkSelect: null, //连接线的d3选择器
    editLink: {
      source: {
        x: 0,
        y: 0,
      },
      target: {
        x: 0,
        y: 0,
      }
    },

    transformParam: {
      k: 1,
      x: 0,
      y: 0,
    },
    zoom: d3.zoom(),
    width: 0,
    height: 0,
    noGroup: null,
    lastDottedLine: null,
    //地图
    lastMapSelectNode: null,
    mulNodeColor: null,
    mulLinksColor: null,
  })
  //const [doubleCheckModal, setDoubleCheckModal] = useState(false)
  // 1和2  分别代表2个边
  const [doubleSelect, setDoubleSelect] = useState(1)
  const [layoutSet, upLayoutSet] = useState({ ...initLayoutSet, ...props.initLayoutSet })
  // 由于使用d3绑定事件,但数据id不更新的话 每次只绑定一次数据 
  // 若使用useState 则形成闭包 永远是初始化的linkset
  // 因此nodeSet和linkSet用 useRef 备用
  const [linkSet, upLinkSet] = useState({ ...initLinkSet, ...props.initLinkSet })
  const [nodeSet, upNodeSet] = useState({ ...initNodeSet, ...props.initNodeSet })
  //菜单栏
  const [menuType, setMenuType] = useState("other")
  const [menuTransform, setMenuTransform] = useState()
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuOperate, setMenuOperate] = useState('')
  const [resOperate, setResOperate] = useState('')
  //増删改对话框 显示
  const [addNodeModal, setAddNodeModal] = useState(false)
  const [upNodeModal, setUpNodeModal] = useState(false)
  const [delNodeModal, setDelNodeModal] = useState(false)
  const [addLinkModal, setAddLinkModal] = useState(false)
  const [delLinkModal, setDelLinkModal] = useState(false)
  const [upLinkModal, setupLinkModal] = useState(false)
  //是否只涉及样式更新
  const onlyStyleUpFalg = useRef(false)
  //涉及缩放更新
  const setAutoZoom = useRef(false)
  // 设置不涉及表面更新
  const noUpFalg = useRef(false)
  //layout nodeSet linkSet
  const setType = useRef('')
  const setDetailType = useRef('')
  //节点数量和关系数量
  const [nodeNum, setNodeNum] = useState(0)
  const [linkNum, setLinkNum] = useState(0)
  //边创建标志
  const [linkCreateFlag, setLinkCreateFlag] = useState(false)
  //算法开启标志
  const [algorithmFlag, setAlgorithmFlag] = useState(false)
  // 当前算法名称
  const [algorithmType, setAlgorithmType] = useState('')
  const [ratioValue, setRatioValue] = useState(0.562)
  //图布局和树布局切换
  const [curLayout, setCurLayout] = useState('graph')
  useEffect(() => {
    initGraph()
    return () => {
      setCurLayout('graph')
      clearOperation()
    }
  }, [svgContainer])
  useEffect(() => {
    if (props.data === null) return
    states.current.lastDottedLine = null
    const data = JSON.parse(JSON.stringify(props.data))
    states.current.nodes = data.nodes
    states.current.idMap = new Map()
    states.current.linkGroupMap = new Map()
    states.current.noGroup = new Set() //需要高亮的组 永远不聚合
    const { linkGroupMap } = states.current
    data.nodes.forEach(ele => {
      states.current.idMap.set(ele.id, ele)
    })
    data.links.forEach(ele => {
      //根据边的目标id和源id获取唯一标识
      let key = ele.source > ele.target ? '' + ele.source + ele.target : '' + ele.target + ele.source
      if (ele.isNeedObserver) {
        states.current.noGroup.add(key)
      }
      if (linkGroupMap.has(key)) {
        const group = linkGroupMap.get(key)
        group.add(ele)
      } else {
        linkGroupMap.set(key, new Set([ele]))
      }
    })
    states.current.links = data.links
    for (let item of states.current.linkGroupMap.values()) {
      setLinkNumber(item)
    }
    updata()
  }, [props.data])
  useEffect(() => {
    if (states.current.nodes === null) return
    states.current.nodeSet = nodeSet
    if (props.colorChange) {
      props.colorChange(nodeSet.nodeColor)
    }
    states.current.linkSet = linkSet
    states.current.layoutSet = layoutSet
    //修改了值就可 不需要更新
    if (noUpFalg.current) {
      noUpFalg.current = false
      return
    }
    if (setAutoZoom.current) {
      onAutoZoomTree(layoutSet.grahAutoZoom)
      setAutoZoom.current = false
      return
    }
    if (onlyStyleUpFalg.current) {
      upAllStyle()
    } else {
      updata(false)
    }
    onlyStyleUpFalg.current = false
  }, [nodeSet, linkSet, layoutSet])
  useEffect(() => {
    if (!props.mulNodeColor) return
    states.current.mulNodeColor = props.mulNodeColor
    if (!states.current.firstUp) return
    upAllStyle("mul")
  }, [props.mulNodeColor])
  useEffect(() => {
    if (!props.mulLinksColor) return
    states.current.mulLinksColor = props.mulLinksColor
    if (!states.current.firstUp) return
    upAllStyle("mul")
  }, [props.mulLinksColor])
  useEffect(() => {
    states.current.graphAutoNodeForce = layoutSet.graphAutoNodeForce
  }, [layoutSet.graphAutoNodeForce])
  //发生了操作
  useEffect(() => {
    operateAction(graphStore.operationType)
  }, [graphStore.operationType])
  useEffect(() => {
    operateAction(menuOperate)
  }, [menuOperate])
  /* 外部删除边 */
  useEffect(() => {
    if (!props.delinkData) return
    externDelLink(props.delinkData)
  }, [props.delinkData])
  useEffect(() => {
    if (!props.mapSelectId) return
    let index = states.current.nodes.findIndex(ele => ele.id === props.mapSelectId)
    if (index === -1) return
    let node = states.current.nodes[index]
    node.isMapSelect = true
    selectNodeorLink(node, null, 'node')
    node.isMapSelect = false
  }, [props.mapSelectId])
  /* 虚拟边 */
  useEffect(() => {

    if (states.current.lastDottedLine) {
      webDelLink(states.current.lastDottedLine, false)
    }
    if (!dottedLine) return
    webAddLink(dottedLine, nanoid(), false)
  }, [dottedLine])
  /* 初始化 */
  const initGraph = () => {
    states.current.width = svgContainer.current.offsetWidth
    states.current.height = svgContainer.current.offsetHeight
    /* 缩放  */
    states.current.zoom.scaleExtent([0.1, 20])
      .on('zoom', zoomed)
      .on('end', zoomended)

    svg.current = d3.select(svg.current).on('contextmenu', (e) => {
      e.preventDefault()
      if (states.current.algorithmFlag) return
      if (states.current.linkCreateFlag) {
        clearEdit()
        return
      }
      menuSet(e, "other")
      cancleHighLight()
      clearSelect()
    }).on("click", () => {
      setMenuVisible(false)
      cancleHighLight()
      clearSelect()
    }).on("mousemove", (event) => {
      if (states.current.linkCreateFlag &&
        graphStore.sourceNode !== null &&
        states.current.editFlagAn === false) {
        const { transformParam } = states.current
        const x = (event.offsetX - transformParam.x) / transformParam.k
        const y = (event.offsetY - transformParam.y) / transformParam.k
        states.current.editLinkSelect.attr("x2", x)
          .attr("y2", y)
      }

    })
      .call(states.current.zoom)

    svgBody.current = svg.current.append("g")
      .classed("graphBody", true)

    subContainer.current = svgBody.current.append("g")
      .classed("subContainer", true)

    linkBody.current = svgBody.current.append("g")
      .classed("linkBody", true)
    nodeBody.current = svgBody.current.append("g")
      .classed("nodeBody", true)
    /* textBody.current = svgBody.current.append("g")
       .classed("textBody", true)*/
    states.current.forceSimulation = d3.forceSimulation()
      .force("link", d3.forceLink())
      .force("charge", d3.forceManyBody().strength(-30))
      .force("collide", d3.forceCollide())
      .force("center", d3.forceCenter(states.current.width / 2,
        states.current.height / 2))
    // .force("forceY", d3.forceY(states.current.height / 2))
    svgTopEdit.current = svg.current.append("g")
      .classed("topEdit", true)
      .classed("noEvent", true)
    textBody.current = svgTopEdit.current.append("g")
      .classed("textBody", true)
    states.current.editLinkSelect = svgTopEdit.current
      .append("line")
      .classed("noEvent", true)
      .attr("stroke", "transparent")
      .attr("stroke-width", linkSet.linkWidth * 1.5)
      .attr("marker-end", "")
  }
  /* 更新图谱 */
  const updata = (isAuto = true, isRefresh = true, niu = false) => {
    if (states.current.nodes.length === 0 && niu === false) {
      // message.error("无数据")
      console.log("子图无数据")
      return
    }
    setNodeNum(states.current.nodes.length)
    setLinkNum(states.current.links.length)
    const { forceSimulation, nodes, links } = states.current
    const { grahAutoZoom, charge } = layoutSet
    const { radius } = nodeSet
    const { linkLength } = linkSet
    //生成节点数据
    forceSimulation.nodes(nodes)
      .on("tick", ticked)
    // 碰撞检测
    forceSimulation.force("charge")
      .strength(-charge)
    forceSimulation.force("collide")
      .radius(d => {
        if (d.isAbstract) return radius * highLightBei
        return radius * 1.2
      })
      .strength(1)
    //更新边弹力

    forceSimulation.force("link")
      .id(d => d.id)
      .links(links)
      .distance(function (d) {//每一边的长度
        return linkLength
      })
    forceSimulation.force("center")
      .x(states.current.width / 2)
      .y(states.current.height / 2)

    const hullSelection = subContainer.current.selectAll('path')
      .data(states.current.hullDatas, d => d.id)

    const linkSelection = linkBody.current.selectAll(".lineGroup")
      .data(links, d => d.id)
    const nodeSelection = nodeBody.current.selectAll(".nodeGroup")
      .data(nodes, d => d.id)
    const textLinkSelection = textBody.current.selectAll(".linkText")
      .data(links, d => d.id)
    const textNodeSelection = textBody.current.selectAll(".nodeText")
      .data(nodes, d => d.id)
    /* 移除 */
    const t = d3.transition()
      .duration(450)
      .ease(d3.easeLinear)
    hullSelection.exit().remove('path')
    linkSelection.exit().remove("g")
    /*.transition(t) //它同样是返回选择器 选择器后跟上需要改变的属性
    .attr("opacity", 0.1)*/

    nodeSelection.exit()
      .remove("g")
    textLinkSelection.exit().remove("text")
    textNodeSelection.exit().remove("text")
    /* 新加*/
    const enterHull = hullSelection.enter().append("path")
      .attr("fill", '#dfdfdf')
      .on("contextmenu", function (event, d) { // 显示右键节点菜单
        event.stopPropagation()
        event.preventDefault()
        console.log("超点super", d)
        transForSuper(d)
      })
    const enterLinkText = textLinkSelection.enter().append("text")
      .classed("linkText", true)
    enterLinkText.append("textPath")
      .attr("xlink:href", d => {
        return '#textPath' + d.id
      })
      .style("text-anchor", "middle")
      .attr("startOffset", "50%")
    const enterNodeText = textNodeSelection.enter().append("text")
      .classed("nodeText", true)
    const enterLink = linkSelection.enter()
      .append("g").classed("lineGroup", true)
      .on("contextmenu", function (event, d) { // 显示右键节点菜单
        event.stopPropagation()
        event.preventDefault()
        if (states.current.algorithmFlag) return
        if (states.current.linkCreateFlag) {
          return
        }
        //menuSet(event, "link")
        selectNodeorLink(d, this, 'link', event)
      }).on("click", function (event, d) {
        event.stopPropagation()
        event.preventDefault()
        //if (states.current.algorithmFlag) return
        if (states.current.linkCreateFlag) {
          return
        }
        selectNodeorLink(d, this, 'link')
      })
    const enterNode = nodeSelection.enter()
      .append("g").classed("nodeGroup", true)
      .attr("transform", function (d) {
        if (d.newFlag === true) {
          const width = svgContainer.current.offsetWidth
          const height = svgContainer.current.offsetHeight
          console.log(width, height)
          d.fx = width / 2
          d.fy = height / 2
          return //"translate(" + width / 3 + "," + height / 3 + ")"
        } else {
          return
        }
      })
      .call(d3.drag()
        .on("start", started)
        .on("drag", dragged)
        .on("end", ended))
      .on("contextmenu", function (event, d) { // 显示右键节点菜单
        console.log("显示右键节点菜单", d)
        event.stopPropagation()
        event.preventDefault()
        if (states.current.algorithmFlag) {
          if (states.current.algorithmType !== 'useSuperpointextraction')
            return
          if (d.isAbstract) {
            //展开超点
            console.log("超点d", d)
            expandSuperPoint(d)
          }
          return
        }
        if (states.current.linkCreateFlag) {
          return
        }
        //menuSet(event, "node")
        selectNodeorLink(d, this, 'node', event)
      }).on("click", function (event, d) {
        event.stopPropagation()
        event.preventDefault()
        if (d.isAbstract) return
        if (!states.current.linkCreateFlag) {
          selectNodeorLink(d, this, 'node')
          return
        }
        // 此次为创建边启动
        clickSourceNode(d, this)
      })

    enterLink.append("path")
      .attr("fill", "none")
      // 添加id
      .attr("id", d => {
        return "textPath" + d.id
      })
    enterLink.append("text")

    enterNode.append("circle")
    enterNode.append("text")

    /* 全部更新 */
    states.current.hullG = enterHull.merge(hullSelection)
    console.log("凸包", states.current.hullG)
    states.current.linkG = enterLink.merge(linkSelection)
    states.current.nodeG = enterNode.merge(nodeSelection)
    states.current.linkTextG = enterLinkText.merge(textLinkSelection)
    states.current.nodeTextG = enterNodeText.merge(textNodeSelection)
    /* 更新样式 */
    upAllStyle()

    // alpha  默认为1
    // alphaMin 默认为0.001 当alpha减少到alphaMin时会停止
    // alphaDecay 衰减系数 默认为0.0228
    // alphaTarget 可以将alpha 指定为值
    //velocityDecay 移动速度
    // alpha += (alphaTarget - alpha) * alphaDecay;
    // alpha < alphaMin stop
    if (isRefresh) {
      /*while (states.current.forceSimulation.alpha() > states.current.forceSimulation.alphaMin() * 80) {
        states.current.forceSimulation.tick();
      }*/
      states.current.forceSimulation.alphaDecay(0.2)
      states.current.forceSimulation.alphaTarget(1).restart()
      setTimeout(() => {
        states.current.forceSimulation.alphaTarget(0)
        if (grahAutoZoom && isAuto) {
          setTimeout(() => {
            onAutoZoomTree(true)
          }, 100)
        }
      }, 300)
    }
    states.current.firstUp = true
  }
  const judgeIsMulLink = (key) => {
    if (!states.current.linkGroupMap.has(key)) return false
    return states.current.linkGroupMap.get(key).size >= 2
  }
  const getNodeColor = (d, that) => {
    if (d.isAbstract === true) {//第一优先
      console.log(`url(#${d.abstractType})`)
      return 'url(#super)'
      // 'url(#' + d.abstractType + ')'
      // return `url(#${d.abstractType})`
    } else if (states.current.algorithmFlag && states.current.algorithmType === 'useEquivalentstructureExtraction') {
      if (d.structure)
        return structureColor[d.structure]
    } else if (states.current.algorithmFlag && states.current.algorithmType === 'useBackboneExtraction') {
      return boneColor(d)
    } else if (d.kg === 'kg1') {
      return states.current.mulNodeColor ? states.current.mulNodeColor[0] : states.current.nodeSet.nodeColor
    } else if (d.kg === 'kg2') {
      return states.current.mulNodeColor ? states.current.mulNodeColor[1] : states.current.nodeSet.nodeColor
    }
    return states.current.nodeSet.nodeColor
  }
  const upAllStyle = (action) => {
    const { visNodeLable, visLinkLable } = states.current.layoutSet
    const { radius, nodeColor } = states.current.nodeSet
    const { linkWidth, linkColor, mulLinkColor } = states.current.linkSet
    states.current.nodeG.select("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", function (d) {
        if (d3.select(this).attr("highlight") === "1") {
          return radius * highLightBei
        } else if (d.isMapSelect === true) {
          graphStore.select.dom = this
          d3.select(this).attr("highlight", 1)
          return radius * highLightBei
        }
        else if (d.isAbstract === true) {
          return radius * highLightBei
        }
        return radius
      })
      .attr("stroke-width", function (d) {
        if (d3.select(this).attr("highlight") === "1" || d.isMapSelect === true)
          return 1
        else return 0.5
      })
      .attr("stroke", function (d) {
        if (states.current.algorithmFlag && states.current.algorithmType === 'useBackboneExtraction') {
          return boneStrokeColor(d)
        } else if ((d3.select(this).attr("highlight") === "1" || d.isMapSelect === true))
          return "red"
        else if (d.isNeedObserver) {
          return props.observerColor ? props.observerColor : observerColor
        }
        else
          return '#555555'
      })
      .attr("fill", (d) => {
        return getNodeColor(d)
      })
    states.current.linkG.select("path")
      .attr("marker-end", (d) => {
        let key = d.source.id > d.target.id ? '' + d.source.id + d.target.id : '' + d.target.id + d.source.id
        if (states.current.linkSet.mulLinkSuper && !states.current.noGroup.has(key)) {
          if (judgeIsMulLink(key)) {
            return ""
          }
        }
        if (states.current.algorithmFlag && states.current.algorithmType === 'useBackboneExtraction') {
          if (d.important === 1) return "url(#boneImport)"
          else return "url(#boneNoImport)"
        }
        if (states.current.linkSet.mulLinkSuper === false) {
          if (!d.groupInnerLength)
            return "url(#resolved)"
          else
            return "url(#curve)"
        }
        else {
          return "url(#resolved)"
        }
      })
      .attr("stroke-width", function () {
        if (d3.select(this).attr("highlight") === "1")
          return linkWidth * highLightBei
        else
          return linkWidth
      })
      .attr("stroke", function (d) {
        let key = d.source.id > d.target.id ? '' + d.source.id + d.target.id : '' + d.target.id + d.source.id
        if (d3.select(this).attr("highlight") === "1")
          return "red"
        else if (d.isNeedObserver) {
          return props.observerColor ? props.observerColor : observerColor
        } else if (d.dottedLine) {
          return props.dottedLineColor ? props.dottedLineColor : dottedLineColor
        } else if (states.current.algorithmFlag && states.current.algorithmType === 'useBackboneExtraction') {
          return boneLinkColor(d)
        }
        else if (d.kg === 'all') {
          return states.current.mulLinksColor ? states.current.mulLinksColor[0] : linkColor
        }
        else if (states.current.linkSet.mulLinkSuper && !states.current.noGroup.has(key)) {
          //let key = d.source.id > d.target.id ? '' + d.source.id + d.target.id : '' + d.target.id + d.source.id
          if (judgeIsMulLink(key)) {
            return mulLinkColor
          } else {
            return linkColor
          }
        }
        else {
          return linkColor
        }
      })
      .attr("stroke-dasharray", (d) => {
        if (d.dottedLine) return '3 2'
        else return ''
      })
    states.current.nodeTextG
      .text(d => {
        if (visNodeLable) {
          let index = d.name.lastIndexOf("\/")
          return d.name.substring(index + 1, d.name.length)
        }

      })
      .attr("font-size", nodeSet.lableSize)
      .attr("text-anchor", "start")
      .attr("dx", radius + 1)
    states.current.linkTextG.attr("dy", -(~~(linkSet.lableSize / 2)))
    states.current.linkTextG.select("textPath")
      .text(d => {
        let key = d.source.id > d.target.id ? '' + d.source.id + d.target.id : '' + d.target.id + d.source.id
        if (visLinkLable || states.current.noGroup.has(key)) {
          if (states.current.linkSet.mulLinkSuper === false || states.current.noGroup.has(key)) {
            let index = d.name.lastIndexOf("\/")
            return d.name.substring(index + 1, d.name.length)
          } else {

            if (judgeIsMulLink(key)) {
              if (d.groupInnerId === 0) {
                return '多边(' + (d.groupInnerLength) + ')'
              } else {
                return ''
              }
            } else {
              let index = d.name.lastIndexOf("\/")
              return d.name.substring(index + 1, d.name.length)
            }

          }
        }
      })
      .attr("font-size", linkSet.lableSize)

  }
  const ticked = () => {
    const { nodeSet } = states.current
    states.current.hullG.attr("d", (d) =>
      calculateHullPath(d.childrenNodes, nodeSet.radius)
    )

    states.current.linkG.select("path")
      .attr("d", (d) => {
        let key = d.source.id > d.target.id ? '' + d.source.id + d.target.id : '' + d.target.id + d.source.id
        if (!judgeIsMulLink(key))
          return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
        else {
          if (states.current.linkSet.mulLinkSuper && !states.current.noGroup.has(key)) {
            return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
          }
          const group = states.current.linkGroupMap.get(key)
          if (group.size % 2 != 0 && d.linknum === 1) {
            return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y
          }
          let curve = 3
          let homogeneous = 1.2
          let dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy) * (d.linknum + homogeneous) / (curve * homogeneous)
          //当节点编号为负数时，对弧形进行反向凹凸，达到对称效果
          if (d.linknum < 0) {
            dr = Math.sqrt(dx * dx + dy * dy) * (-1 * d.linknum + homogeneous) / (curve * homogeneous)
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,0 " + d.target.x + "," + d.target.y
          }
          return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y
        }
      })

    /*states.current.linkTextG
      .attr("x", function (e) {
        return (e.source.x + e.target.x) / 2;
      })
      .attr("y", function (e) {
        return (e.source.y + e.target.y) / 2;
      })*/

    states.current.nodeG
      .attr("transform", function (d) {
        /*if (d.newFlag === true) {
          return d3.select(this).attr("transform")
        }*/
        //非边编辑操作界面
        if (!states.current.linkCreateFlag || graphStore.sourceNode === null)
          return "translate(" + d.x + "," + d.y + ")"
        //边编辑操作
        if (graphStore.sourceNode.data.id === d.id)
          states.current.editLinkSelect.attr("x1", d.x)
            .attr("y1", d.y)
        if (states.current.editFlagAn === true &&
          graphStore.targetNode.data.id === d.id) {
          states.current.editLinkSelect.attr("x2", d.x)
            .attr("y2", d.y)
        }
        return "translate(" + d.x + "," + d.y + ")"
      })
    states.current.nodeTextG
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")"
      })
  }
  //drag
  function started (event, d) {
    if (d.newFlag === true) {
      d.newFlag = false
    }
    if (!event.active) {
      states.current.forceSimulation.alphaDecay(0.028)
      states.current.forceSimulation.alphaTarget(0.3).restart()//设置衰减系数，对节点位置移动过程的模拟，数值越高移动越快，数值范围[0，1]
    }
    d.fx = d.x
    d.fy = d.y
  }
  function dragged (event, d) {
    d.fx = event.x
    d.fy = event.y
  }
  function ended (event, d) {
    if (!event.active) {
      states.current.forceSimulation.alphaTarget(0)
    }
    d.fx = null
    d.fy = null
  }
  const zoomed = (event) => {

    states.current.transformParam = event.transform
    svgBody.current.attr('transform', event.transform)
    svgTopEdit.current.attr('transform', event.transform)
  }
  const zoomended = () => {

  }


  const expandSuperPoint = (d) => {
    //超点拷贝
    states.current.hullDatas.push(d)
    let superId = d.id
    //删除超点虚拟边
    states.current.hullDatas[states.current.hullDatas.length - 1]
      .superLinks = []
    console.log("link", states.current.links)
    states.current.links = states.current.links.filter(link => {
      if ((link.isXuLink &&
        (link.target.id === superId || link.source.id === superId))) {
        states.current.hullDatas[states.current.hullDatas.length - 1]
          .superLinks.push(link)
        return false
      }
      return true
    })
    let index = states.current.nodes.findIndex(node => node.id === superId)
    states.current.nodes.splice(index, 1)
    for (let node of d.childrenNodes) {
      states.current.nodes.push(node)
    }
    for (let link of d.childrenLinks) {
      states.current.links.push(link)
    }
    updata(false)
  }
  //transForSuper
  const transForSuper = (d) => {
    //删除hull
    states.current.hullDatas = states.current.hullDatas.filter(ele => ele.id !== d.id)

    //添加超点节点
    states.current.nodes.push(d)

    //添加超点边
    d.superLinks.forEach(superLink => {
      superLink.source = superLink.source.id
      superLink.target = superLink.target.id
      states.current.links.push(superLink)
    })

    //删除子节点和子边
    let { childrenLinks, childrenNodes } = d
    for (let node of childrenNodes) {
      states.current.nodes = states.current.nodes.filter(ele => ele.id !== node.id)
    }
    for (let link of childrenLinks) {
      states.current.links = states.current.links.filter(ele => ele.id !== link.id)
    }
    updata(false)
  }
  const menuSet = (event, type) => {
    setMenuType(type)
    setMenuVisible(true)
    setMenuTransform({
      left: event.offsetX + "px",
      top: event.offsetY + "px"
    })
  }
  const selectNodeorLink = (d, dom, type, event = null) => {
    cancleHighLight()
    const select = {
      id: d.id,
      name: d.name,
      location: d.location,
      dom,
      type
    }
    if (type === 'node') {
      onAutoNodeFouce(d)
      select['data'] = d.data
    }
    if (type === 'link') {
      select['source'] = d.source
      select['target'] = d.target
    }
    if (dom && type === 'node' && props.setSelectNode && d.location) //用于地图高亮
      props.setSelectNode(select)
    checkIsMul(select)
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
    if (props.remoteAcqu === undefined || props.remoteAcqu === true)
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
          setSelectRef(svg, svgContainer)
          if (event) {
            menuSet(event, type)
          }
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
      setSelectRef(svg, svgContainer)
      if (dom)
        highLight(dom, type)
      else { //针对地图的
        upAllStyle()
      }
    }
  }
  const getNodeDeatil = (d) => {
    return new Promise((resolve, reject) => {
      request.post(prefix + "/getdetail/", {
        type: 'node',
        id: [d.id]
      }).then(res => {
        if (res.status === 'success') {
          resolve(res.res[d.id])
        } else {
          message.error("节点信息获取失败")
        }
      })
    })
  }
  const highLight = (dom, type) => {
    let selection = d3.select(dom)

    if (type === 'link') {
      let or = selection.select("path")
        .attr("stroke-width")
      selection.select("path")
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
  const cancleTargetNodeHighLight = (dom) => {
    const { radius } = states.current.nodeSet
    d3.select(dom).select("circle")
      .attr("r", radius)
      .attr("stroke-width", 0.5)
      .attr("stroke", '#555555')
      .attr("highlight", 0)
  }
  const cancleHighLight = () => {
    if (graphStore.select === null) return
    const { radius } = states.current.nodeSet
    const { linkWidth, linkColor, mulLinkColor } = states.current.linkSet
    const { type } = graphStore.select
    const dom = graphStore.select.dom
    let selection = d3.select(dom)
    if (type === 'link') {
      //let or = selection.select("path").attr("stroke-width")
      selection.select("path").attr("highlight", 0)
      /* .attr("marker-end", (d) => {
         if (states.current.linkSet.mulLinkSuper) {
           let key = d.source.id > d.target.id ? '' + d.source.id + d.target.id : '' + d.target.id + d.source.id
           if (judgeIsMulLink(key)) {
             return ""
           }
         }
         if (states.current.algorithmFlag && states.current.algorithmType === 'useBackboneExtraction') {
           if (d.important === 1) return "url(#boneImport)"
           else return "url(#boneNoImport)"
         }
         if (states.current.linkSet.mulLinkSuper === false) {
           if (!d.groupInnerLength)
             return "url(#resolved)"
           else
             return "url(#curve)"
         }
         else {
           return "url(#resolved)"
         }
       })

       .attr("stroke-width", function () {
         return or / highLightBei
       })
       .attr("stroke", function (d) {
         if (states.current.algorithmFlag && states.current.algorithmType === 'useBackboneExtraction') {
           return boneStrokeColor(d)
         }
         else
           return '#555555'
       })*/

    } else {
      if (dom.tagName === 'g')
        selection = selection.select("circle")
      //let or = selection.attr("r")
      selection.attr("highlight", 0)
      /*.attr("r", or / highLightBei)
      .attr("stroke-width", 0.5)
      .attr("stroke", '#555555')*/
    }
    upAllStyle()
  }
  const onAutoZoomTree = (flag = false) => {
    //getBBox返回svg显示的最小矩形
    const viewBox = svgBody.current.node().getBBox()
    const width = svgContainer.current.offsetWidth
    const height = svgContainer.current.offsetHeight
    //若getBBOx大于视图高宽
    if (flag || viewBox.width > width || viewBox.height > height) {
      //_svgWidth * pre_scale = 无缩放正常视图宽度
      const next_scale = Math.min((width - 100) / viewBox.width, (height - 100) / viewBox.height),
        //确定中心点
        center_x = width / 2 - (viewBox.x + viewBox.width / 2) * next_scale,
        center_y = height / 2 - (viewBox.y + viewBox.height / 2) * next_scale
      const t = d3.zoomIdentity.translate(center_x, center_y).scale(next_scale)
      svg.current.transition().duration(750).call(states.current.zoom.transform, t).on('end', () => {
        states.current.transformParam.x = t.x
        states.current.transformParam.y = t.y
        states.current.transformParam.k = t.k
      })
    }
  }
  // 自动节点聚焦
  const onAutoNodeFouce = (source) => {
    if (states.current.graphAutoNodeForce) {
      const width = svgContainer.current.offsetWidth
      const height = svgContainer.current.offsetHeight
      const { transformParam, zoom } = states.current
      const scale = transformParam.k,
        x = -source.x,
        y = -source.y

      const center_x = x * scale + width / 2,
        center_y = y * scale + height / 2
      const t = d3.zoomIdentity.translate(center_x, center_y).scale(scale)
      svg.current.transition()
        .duration(750)
        .call(zoom.transform, t).on('end', () => {
          states.current.transformParam.x = t.x
          states.current.transformParam.y = t.y
          states.current.transformParam.k = t.k
        })
    }

  }
  //检查是否是双向边 若是双向边 则添加另一条边选项
  const checkIsMul = (select) => {
    if (states.current.linkSet.mulLinkSuper === false) return false
    if (select.type === 'link') {
      const d = select
      let key = d.source.id > d.target.id ? '' + d.source.id + d.target.id : '' + d.target.id + d.source.id
      const { links, linkGroupMap } = states.current
      //判断是否为多边
      if (!judgeIsMulLink(key)) {
        return false
      }
      //若是多边
      select.otherLinks = []
      for (let item of linkGroupMap.get(key).values()) {
        select.otherLinks.push({ id: item.id, name: item.name })
      }
      //graphStore.addOtherSelects([...linkGroupMap.get(key)])
      return true
    }
    return false
  }
  // 编辑边操作: 选中节点
  const clickSourceNode = (d, dom) => {
    console.log('加边', d)
    if (graphStore.sourceNode !== null) {
      //不能选自己
      if (graphStore.sourceNode.data.id === d.id) return
      getNodeDeatil(d).then(res => {
        setTargetNode({
          'data': res,
          'dom': dom
        })
        message.success("选中完毕")
        states.current.editFlagAn = true
        highLight(dom, 'node')
        states.current.editLinkSelect
          .attr("x2", d.x)
          .attr("y2", d.y)
        setAddLinkModal(true)
      })
    } else {
      highLight(dom, 'node')
      getNodeDeatil(d).then(res => {
        setSourceNode({
          'data': res,
          'dom': dom
        })
      })

      states.current.editLinkSelect.attr("stroke", "red")
        .attr("marker-end", "url(#edit)")
        .attr("x1", d.x)
        .attr("y1", d.y)
        .attr("x2", d.x)
        .attr("y2", d.y)
    }

  }
  // 等价结构化简 更改ratio
  const changeRatio = (e) => {
    if (isNaN(parseFloat(e.target.value))) return
    const ratio = parseFloat(e.target.value)
    if (ratio >= 0) {
      setRatioValue(ratio)
      const obj = simplify_equiv(states.current.preNodes, states.current.preLinks, ratio)
      states.current.nodes = obj.nodes
      states.current.links = obj.links
      updata()
    }
  }
  const operateAction = (type) => {
    if (type === null) return
    let current = type.slice(1)
    setResOperate(current)
    switch (current) {
      case 'addNode':
        setAddNodeModal(true)
        break
      case 'upNode':
        setUpNodeModal(true)
        break
      case 'delNode':
        setDelNodeModal(true)
        break
      case 'addLink':
        startEditLink()
        break
      case 'upLink':
        /* if (graphStore.select.otherLink !== undefined)
           setDoubleCheckModal(true)
         else*/
        setupLinkModal(true)
        break
      case 'delLink':
        /*if (graphStore.select.otherLink !== undefined)
          setDoubleCheckModal(true)
        else*/
        setDelLinkModal(true)
        break
      case 'useSimplifyEquiv':
        preAlgorithm('useSimplifyEquiv')
        let eobj = simplify_equiv(states.current.nodes, states.current.links, ratioValue)
        states.current.nodes = eobj.nodes
        states.current.links = eobj.links
        updata()
        break
      case 'useSuperpointextraction':
        preAlgorithm('useSuperpointextraction')
        states.current.hullDatas = []
        let sobj = superpointextraction(states.current.nodes, states.current.links)

        console.log('res', sobj)
        states.current.nodes = sobj.nodes
        states.current.links = sobj.links
        updata()
        break
      case 'useEquivalentstructureExtraction':
        preAlgorithm('useEquivalentstructureExtraction')
        let exobj = equivalentstructureExtraction(states.current.nodes, states.current.links)
        states.current.nodes = exobj.nodes
        states.current.links = exobj.links
        console.log('res', exobj)
        updata()
        break
      case 'useBackboneExtraction':
        props.setLoading(true)
        preAlgorithm('useBackboneExtraction')
        actionBackBoneExtraction()
        break
      case 'useHierarchicalPruning':
        props.setLoading(true)
        preAlgorithm('useHierarchicalPruning')
        actionHierarchicalPruning()
        break
      case 'useTreeLayout':
        props.setLoading(true)
        preAlgorithm('useTreeLayout')
        actionTreeLayout()
        break
      default:
        break
    }
  }
  const actionBackBoneExtraction = () => {
    const copyLinks = JSON.parse(JSON.stringify(states.current.links))
    for (let link of copyLinks) {
      link.source = link.source.id
      link.target = link.target.id
    }
    request.post(prefix + '/usebackboneextraction/', {
      nodes: states.current.nodes,
      links: copyLinks
    }).then(res => {
      if (res.status === 'success') {
        states.current.nodes = res.res.nodes
        states.current.links = res.res.links
        updata()
      } else {
        message.error("骨干提取失败!")
      }
      props.setLoading(false)
    })
    //updata()
  }
  const actionTreeLayout = () => {
    const copyNodes = JSON.parse(JSON.stringify(states.current.nodes))
    const copyLinks = JSON.parse(JSON.stringify(states.current.links))
    for (let link of copyLinks) {
      link.source = link.source.id
      link.target = link.target.id
    }
    let res = graphToTreeData({
      'nodes': copyNodes,
      'links': copyLinks
    })
    if (res === false) {
      message.error("此图存在环,不可转为树")
      props.setLoading(false)
      afterAlgorithm()
      return
    }
    setTreeData(res)
    setCurLayout("tree")
    props.setLoading(false)
  }
  const actionHierarchicalPruning = () => {
    const copyLinks = JSON.parse(JSON.stringify(states.current.links))
    for (let link of copyLinks) {
      link.source = link.source.id
      link.target = link.target.id
    }
    request.post(prefix + '/usehierarchicalpruning/', {
      nodes: states.current.nodes,
      links: copyLinks
    }).then(res => {
      if (res.status === 'success') {
        states.current.nodes = res.res.nodes
        states.current.links = res.res.links
        updata()
      } else {
        message.error("层次剪枝失败!")
      }
      props.setLoading(false)
    })
    //updata()
  }
  const preAlgorithm = (type) => {
    cancleHighLight()
    clearSelect()
    setAlgorithmFlag(true)
    graphStore.setAlgorithmFlag(true)
    states.current.algorithmFlag = true
    states.current.algorithmType = type
    setAlgorithmType(type)
    //记录先前的
    states.current.preNodes = states.current.nodes
    states.current.preLinks = states.current.links
    message.success("开启算法,禁止操作!")
  }
  const afterAlgorithm = () => {
    setCurLayout("graph")
    setAlgorithmFlag(false)
    graphStore.setAlgorithmFlag(false)
    states.current.algorithmFlag = false
    states.current.nodes = states.current.preNodes
    states.current.links = states.current.preLinks
    states.current.hullDatas = []
    updata()
    //message.success("操作开启!")
  }
  // 编辑边操作: 进入边操作界面
  const startEditLink = () => {
    cancleHighLight()
    clearSelect()
    setLinkCreateFlag(true)
    graphStore.setLinkCreateFlag(true)
    states.current.linkCreateFlag = true
    svg.current.classed("line-edit", true)
    message.success("边创建开始,请点击起始节点开始连接!")
  }
  // 编辑边操作: 清空当前选中源节点
  const clearEdit = () => {
    if (graphStore.sourceNode !== null) {
      cancleTargetNodeHighLight(graphStore.sourceNode.dom)
      if (graphStore.targetNode !== null) {
        cancleTargetNodeHighLight(graphStore.targetNode.dom)
        states.current.editFlagAn = false
      }
      message.success("清空选中源节点")
    }
    setSourceNode(null)
    setTargetNode(null)
    states.current.editLinkSelect.attr("stroke", "transparent")
      .attr("marker-end", "")
  }
  // 编辑边操作: 关闭边操作界面
  const closeEditLink = () => {
    clearEdit()
    //关闭编辑操作界面
    setLinkCreateFlag(false)
    graphStore.setLinkCreateFlag(false)
    states.current.linkCreateFlag = false
    svg.current.classed("line-edit", false)
  }
  const addNode = (node) => {
    const { nodes } = states.current
    request.post(prefix + '/addnode/', node).then(res => {
      if (res.status === 'success') {
        message.success("加入成功")
        node.id = res.id
        message.success(node.id)
        nodes.push(node)
        node.newFlag = true
        updata(true, true, {
          newNode: node
        })
        addOperationRecordList({
          'name': '增加节点',
          'result': node.name,
          'time': new Date()
        })
        console.log(node, node.location)
        if (node.location) {
          if (props.setAddMapNode) {
            console.log("开始了")
            props.setAddMapNode(node)
          }

        }
      } else {
        message.error(res.message)
      }
    })
  }
  const upNode = (node) => {
    const { nodes } = states.current
    const { select } = graphStore
    request.post(prefix + '/altnode/', node).then(res => {
      if (res.status === 'success') {
        let index = nodes.findIndex(ele => ele.id === node.id)
        nodes[index]['name'] = node.name
        nodes[index]['data'] = node.data
        const newSelect = { ...select }
        newSelect['name'] = node.name
        newSelect['data'] = node.data
        if (newSelect.location && props.setSelectNode) //用于地图高亮
          props.setSelectNode(newSelect)
        setSelect(newSelect)
        setSelectRef(svg, svgContainer)
        //仅仅更新数据 不更新布局
        updata(false, false)
        addOperationRecordList({
          'name': '更新节点',
          'result': node.name,
          'time': new Date()
        })
        if (node.location) {
          if (props.setUpMapNode)
            props.setUpMapNode(node)
        }
      } else {
        message.error(res.message)
      }
    })

  }
  const delNode = () => {
    if (graphStore.select === null) {
      message.error("选中被取消了")
      return
    }
    const { nodes, links } = states.current
    //删除节点
    let sid = graphStore.select.id
    request.post(prefix + '/delnode/', {
      id: sid
    }).then(res => {
      if (res.status === "success") {
        let index = nodes.findIndex(ele => ele.id === sid)
        const delNodeName = nodes[index].name
        if (nodes[index].location) {
          if (props.setDelMapNode) {
            console.log(nodes[index], "delxxxxx", {
              id: nodes[index].id
            })
            props.setDelMapNode({
              id: nodes[index].id
            })
          }

        }

        nodes.splice(index, 1)
        //删除边
        states.current.links = links.filter(ele => {
          if (ele.source.id === sid || ele.target.id === sid) return false
          return true
        })
        updata(false, true, true)
        addOperationRecordList({
          'name': '删除节点',
          'result': delNodeName,
          'time': new Date()
        })

      } else {
        message.error(res.message)
      }
    })
  }
  //flag=false 为虚边 完全的前端操作
  //flag=true  代表是实变 配合后端操作
  const webAddLink = (link, newId, flag = true) => {
    const { links, linkGroupMap } = states.current
    link.id = newId
    if (!flag) {
      link.dottedLine = true
      let key = link.source > link.target ? '' + link.source + link.target : '' + link.target + link.source
      states.current.noGroup.add(key)
      states.current.lastDottedLine = link
    }
    links.push(link)
    let key = link.source > link.target ? '' + link.source + link.target : '' + link.target + link.source
    if (linkGroupMap.has(key)) {
      const group = linkGroupMap.get(key)
      group.add(link)
      setLinkNumber(group)
    } else {
      linkGroupMap.set(key, new Set([link]))
    }

    updata()
    if (flag) {
      closeEditLink()
      addOperationRecordList({
        'name': '增加关系',
        'result': link.name,
        'time': new Date()
      })
    }

  }
  const addLink = (value) => {
    if (graphStore.sourceNode !== null && graphStore.targetNode !== null) {
      message.success("添加边中.....")
      const link = {
        "source": graphStore.sourceNode.data.id,
        "target": graphStore.targetNode.data.id,
        "name": value.name,
      }
      request.post(prefix + '/addlink/', link).then(res => {
        if (res.status === 'success') {
          webAddLink(link, res.id)
        } else {
          message.error(res.message)
        }
      })

    }
  }
  const webDelLink = (link, flag = true) => {
    let sid = link.id
    let sourceId = link.source.id
    let targetId = link.target.id
    const { links, linkGroupMap, noGroup } = states.current
    let index = links.findIndex(ele => ele.id === sid)
    const delLinkName = links[index].name
    //TODO 删除对应linkGroupMap
    let key = link.source.id > link.target.id ? '' + link.source.id + link.target.id : '' + link.target.id + link.source.id
    if (linkGroupMap.has(key)) {
      const group = linkGroupMap.get(key)
      let preDelLink = null
      for (let item of group.values()) {
        if (item.id === sid) {
          preDelLink = item
          break
        }
      }
      group.delete(preDelLink)
      setLinkNumber(group)
    }
    if (noGroup.has(key)) {
      states.current.noGroup.delete(key)
    }
    links.splice(index, 1)
    updata()
    if (flag) {
      addOperationRecordList({
        'name': '删除关系',
        'result': delLinkName,
        'time': new Date()
      })
    }

  }
  const externDelLink = (link) => {
    webDelLink(link)
    message.success("只在前端进行了删除,没有删数据库中")
  }
  const delLink = (link) => {
    request.post(prefix + '/dellink/', {
      id: link.id,
    }).then(res => {
      if (res.status === 'success') {
        webDelLink(link)
      } else {
        message.error(res.message)
      }
    })
  }
  const upLink = (link) => {
    const { links } = states.current
    const { select } = graphStore
    console.log(link)

    request.post(prefix + '/altlink/', link).then(res => {
      if (res.status === 'success') {
        let index = links.findIndex(ele => ele.id === link.id)
        links[index]['name'] = link.name
        links[index]['id'] = res.id
        const newSelect = { ...select }
        newSelect['name'] = link.name
        newSelect['id'] = res.id
        setSelect(newSelect)
        setSelectRef(svg, svgContainer)
        //仅仅更新数据 不更新布局
        updata(false, false)
      } else {
        message.error(res.message)
      }
    })


  }
  /*const doubleSelectOk = () => {
    if (resOperate === "upLink") {
      setupLinkModal(true)
    } else if (resOperate === "delLink") {
      setDelLinkModal(true)
    }
    setDoubleCheckModal(false)
  }*/


  const { radius } = nodeSet
  const { linkColor, linkWidth } = linkSet
  return (
    <div ref={svgContainer} className="Graph" style={{ width: '100%', height: '100%' }}>
      <Spin spinning={props.loading} style={{ width: '100%', height: '100%' }}>
        <svg ref={svg} className={curLayout === 'tree' ? 'hidden' : ''} width="100%" height="99%">
          <defs>
            <marker
              id="resolved"
              markerUnits="userSpaceOnUse"
              viewBox={"0 -" + radius * 0.4 + " " + radius * 0.8 + " " + radius * 0.8}
              refX={radius * 1.6}
              refY="0"
              markerWidth={radius * 0.8}
              markerHeight={radius * 0.8}
              orient="auto"
            >
              <path d={"M0,-" + radius * 0.4 + "L" + radius * 0.8 + ",0L0," + radius * 0.4} fill={linkColor}></path>
            </marker>
            <marker
              id="boneImport"
              markerUnits="userSpaceOnUse"
              viewBox={"0 -" + radius * 0.4 + " " + radius * 0.8 + " " + radius * 0.8}
              refX={radius * 1.6}
              refY="0"
              markerWidth={radius * 0.8}
              markerHeight={radius * 0.8}
              orient="auto"
            >
              <path d={"M0,-" + radius * 0.4 + "L" + radius * 0.8 + ",0L0," + radius * 0.4} fill={boneLinkColorMap.important}></path>
            </marker>

            <marker
              id="boneNoImport"
              markerUnits="userSpaceOnUse"
              viewBox={"0 -" + radius * 0.4 + " " + radius * 0.8 + " " + radius * 0.8}
              refX={radius * 1.6}
              refY="0"
              markerWidth={radius * 0.8}
              markerHeight={radius * 0.8}
              orient="auto"
            >
              <path d={"M0,-" + radius * 0.4 + "L" + radius * 0.8 + ",0L0," + radius * 0.4} fill={boneLinkColorMap.noImportant}></path>
            </marker>
            <marker id="curve"
              markerUnits="userSpaceOnUse"
              viewBox={"0 -" + radius * 0.4 + " " + radius * 0.8 + " " + radius * 0.8}
              refX={radius * 1.6}
              refY="0"
              markerWidth={radius * 0.8}
              markerHeight={radius * 0.8}
              orient="auto"
            >
              <path d={"M0,-" + radius * 0.4 + "L" + radius * 0.8 + ",0L0," + radius * 0.4} fill={linkColor}></path>
            </marker>

            <marker
              id="edit"
              markerUnits="userSpaceOnUse"
              viewBox={"0 -" + radius * highLightBei * 0.4 + " " + radius * highLightBei * 0.8 + " " + radius * highLightBei * 0.8}
              refX="0"
              refY="0"
              markerWidth={radius * highLightBei * 0.8}
              markerHeight={radius * highLightBei * 0.8}
              orient="auto"
            >
              <path d={"M0,-" + radius * highLightBei * 0.4 + "L" + radius * highLightBei * 0.8 + ",0L0," + radius * highLightBei * 0.4} fill="red"></path>
            </marker>
          </defs>
        </svg>
        <Tree curLayout={curLayout}
          svgContainer={svgContainer}
          layoutSet={layoutSet}
          linkSet={linkSet}
          nodeSet={nodeSet}
          treeData={treeData}
          observerColor={props.observerColor ? props.observerColor : observerColor}
        ></Tree>
        <div className={linkCreateFlag ? 'out-edit' : 'noVis'}>
          当前正在创建边连接
          <CloseOutlined onClick={closeEditLink} />
        </div>
        <div className='graph-base-info'>
          <span>节点数:{nodeNum}</span>
          <span>关系数:{linkNum}</span>
        </div>
        <div className={algorithmFlag ? 'out-edit' : 'noVis'}>
          {
            algorithmType === 'useSimplifyEquiv' ? <InputNumber
              style={{
                width: 125,
                marginRight: 20
              }}
              addonBefore="化简率"
              controls={false}
              value={ratioValue}
              min={0}
              max={20}
              step={0.001}
              onPressEnter={changeRatio}

            /> : ''
          }
          {algorithmZNENmap.get(algorithmType)}
          <CloseOutlined onClick={afterAlgorithm} />
        </div>
        <GraphSetting
          layoutSet={layoutSet}
          linkSet={linkSet}
          nodeSet={nodeSet}
          upLayoutSet={upLayoutSet}
          upNodeSet={upNodeSet}
          upLinkSet={upLinkSet}
          onlyStyleUpFalg={onlyStyleUpFalg}
          setAutoZoom={setAutoZoom}
          noUpFalg={noUpFalg}
          setType={setType}
          setDetailType={setDetailType}
          svg={svg}
          svgContainer={svgContainer}
        ></GraphSetting>
        <GraphContextMenu
          menuType={menuType}
          menuTransform={menuTransform}
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          algorithmFlag={algorithmFlag}
          setMenuOperate={setMenuOperate}
          editDisabled={props.editDisabled}
          isOntology={props.isOntology}
          isAlgorithm={props.isAlgorithm}
        ></GraphContextMenu>
        <GraphModal
          setGetLocationFlag={props.setGetLocationFlag}
          getLocationFlag={props.getLocationFlag}
          location={props.location}

          addNodeModal={addNodeModal}
          setAddNodeModal={setAddNodeModal}
          upNodeModal={upNodeModal}
          setUpNodeModal={setUpNodeModal}
          delNodeModal={delNodeModal}
          setDelNodeModal={setDelNodeModal}

          addLinkModal={addLinkModal}
          setAddLinkModal={setAddLinkModal}
          clearEdit={clearEdit}
          closeEditLink={closeEditLink}

          delLinkModal={delLinkModal}
          setDelLinkModal={setDelLinkModal}
          upLinkModal={upLinkModal}
          setupLinkModal={setupLinkModal}
          doubleSelect={doubleSelect}

          addNode={addNode}
          upNode={upNode}
          delNode={delNode}
          addLink={addLink}
          delLink={delLink}
          upLink={upLink}
        >
        </GraphModal>
      </Spin>
    </div>
  )

}
export default observer(Graph)