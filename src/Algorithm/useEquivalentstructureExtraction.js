/*
 等价结构提取:
 2种结构 标记颜色
 1. 扇簇聚合
2. 单桥聚合
*/
const global = {
  nodeDegreeMap: null,
  nodeNeighbor: null,
  nodes: null,
  links: null,
  nodeSet: null,
  linkMap: null,
  nodeLinkMap: null, //节点id 与对应的边id
  //
  cluster_min_num: 2,
  bridge_min_num: 2,
}
/*
 获取所有节点的度以及邻居节点记录,也是初始化
*/
function pre_handle_process (xnodes, xlinks) {
  global.nodeDegreeMap = new Map()//节点度 map
  global.nodeNeighbor = new Map()//节点邻居map
  global.nodeSet = new Set() //节点集合 方便删除与增加
  global.linkMap = new Map() //边集合 方便删除与增加
  global.nodeLinkMap = new Map() //节点id: [边id,边id]

  global.nodes = xnodes
  global.links = xlinks
  const { nodeDegreeMap, nodeNeighbor, nodeSet, linkMap, nodes, links,
    nodeLinkMap
  } = global
  console.log(nodes, links)
  nodes.forEach(node => {
    node.structure = undefined
    nodeDegreeMap.set(node, 0)
    nodeNeighbor.set(node, [])
    nodeSet.add(node)
    nodeLinkMap.set(node.id, [])
  });
  //防止二重边 去重
  let singleBridgeHash = new Set()
  links.forEach(link => {
    let source = link.source
    let target = link.target
    let uuid = ''
    if (source.id > target.id) {
      uuid = source.id + target.id
    } else {
      uuid = target.id + source.id
    }
    if (singleBridgeHash.has(uuid)) { }
    else {
      nodeDegreeMap.set(source, nodeDegreeMap.get(source) + 1)
      nodeDegreeMap.set(target, nodeDegreeMap.get(target) + 1)
      singleBridgeHash.add(uuid)
    }

    nodeNeighbor.set(source, [...nodeNeighbor.get(source), target])
    nodeNeighbor.set(target, [...nodeNeighbor.get(target), source])
    nodeLinkMap.set(source.id, [...nodeLinkMap.get(source.id), link.id])
    nodeLinkMap.set(target.id, [...nodeLinkMap.get(target.id), link.id])
    let resLink = { ...link }
    resLink.source = resLink.source.id
    resLink.target = resLink.target.id
    linkMap.set(resLink.id, resLink)
  })
  //nodeNeighbor去重和nodeLinkMap去重
  for (let key of nodeLinkMap.keys()) {
    nodeLinkMap.set(key, [...new Set(nodeLinkMap.get(key))])
  }
  for (let key of nodeNeighbor.keys()) {
    nodeNeighbor.set(key, [...new Set(nodeNeighbor.get(key))])
  }

}


/* 获取扇形簇结果
 * 
 */
function get_cluster () {
  const { nodeDegreeMap, nodeNeighbor, nodes, links,
    nodeSet, linkMap, cluster_min_num, nodeLinkMap } = global
  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i]
    if (nodeDegreeMap.get(node) <= 1) {
      continue
    }
    //获取node的一度邻居
    const neighborNode = nodeNeighbor.get(node)
    const oneDegreeNode = neighborNode.filter(d => nodeDegreeMap.get(d) === 1)
    //节点没有类型,无需进行分组
    let nodeArray = oneDegreeNode
    if (nodeArray.length < cluster_min_num) continue

    for (let node of nodeArray) {
      node['structure'] = 'cluster'
    }
    //const abstractNode = generateAbstractNode(nodeArray)
    //const abstractLink = generateLink(node, abstractNode)
    /*linkMap.set(abstractLink.id, abstractLink)
    nodeSet.add(abstractNode)
    //删除nodeArray与nodeArray关联的边
    for (let delNode of nodeArray) {
      nodeSet.delete(delNode)
      nodeLinkMap.get(delNode.id).forEach(linkId => {
        linkMap.delete(linkId)
      })
    }*/

    //nodes.filter(node =>)
  }
}
/* 获取单桥结果
 * 
 */
function get_bridge () {
  const { nodeDegreeMap, nodes, bridge_min_num, nodeSet, linkMap, nodeLinkMap, nodeNeighbor } = global
  const singleBridgeHash = new Set()
  for (let node of nodes) {
    if (nodeDegreeMap.get(node) !== 2) {
      continue
    }
    //寻找二度节点
    //获取二度节点邻居节点
    const clusterNodes = nodeNeighbor.get(node)
    let uuid = ''
    if (clusterNodes[0].id > clusterNodes[1].id) {
      uuid = clusterNodes[0].id + clusterNodes[1].id
    } else {
      uuid = clusterNodes[1].id + clusterNodes[0].id
    }
    if (singleBridgeHash.has(uuid)) { continue }
    singleBridgeHash.add(uuid)
    //获取共同邻居节点
    const clusterNeiNodes1 =
      new Set(nodeNeighbor
        .get(clusterNodes[0]).filter(k => nodeDegreeMap.get(k) === 2))
    const clusterNeiNodes2 = new Set(nodeNeighbor.get(clusterNodes[1])
      .filter(k => nodeDegreeMap.get(k) === 2))

    //求交集
    let intersect = new Set([...clusterNeiNodes1].filter(x => clusterNeiNodes2.has(x)))
    let nodeArray = [...intersect]
    if (nodeArray.length < bridge_min_num) continue
    for (let node of nodeArray) {
      node['structure'] = 'bridge'
    }
    /*
    const abstractNode = generateAbstractNode(nodeArray, 'bridge')
    const abstractLink1 = generateLink(clusterNodes[0], abstractNode)
    const abstractLink2 = generateLink(abstractNode, clusterNodes[1])
    linkMap.set(abstractLink1.id, abstractLink1)
    linkMap.set(abstractLink2.id, abstractLink2)
    nodeSet.add(abstractNode)
    //处理
    //删除nodeArray与nodeArray关联的边
    for (let delNode of nodeArray) {
      nodeSet.delete(delNode)
      nodeLinkMap.get(delNode.id).forEach(linkId => {
        linkMap.delete(linkId)
      })
    }
    */
  }
}
/* 获取双桥结果
 * 
 */
function get_doubleBridge () {
  const {
    nodeDegreeMap,
    nodeNeighbor,
    links,
    linkMap,
    nodeSet,
    nodeLinkMap,
  } = global
  //双桥哈希 防重
  const doubleBridgeHash = new Set()
  const edgeList = [] //获取两端节点均为二度的连边
  for (let link of links) {
    let sourceDegree = nodeDegreeMap.get(link.source)
    let targetDegree = nodeDegreeMap.get(link.target)
    if (sourceDegree === 2 && targetDegree === 2) {
      edgeList.push(link)
    }
  }
  for (let link of edgeList) {
    let source = link.source
    let c1 = nodeNeighbor.get(source).filter(d => nodeDegreeMap.get(d) > 2)
    let target = link.target
    let c2 = nodeNeighbor.get(target).filter(d => nodeDegreeMap.get(d) > 2)
    if (c1.length !== 1 || c2.length !== 1) continue
    let clusterNodes = [c1[0], c2[0]]
    // 防止重
    let uuid = ''
    if (clusterNodes[0].id > clusterNodes[1].id) {
      uuid = clusterNodes[0].id + clusterNodes[1].id
    } else {
      uuid = clusterNodes[1].id + clusterNodes[0].id
    }
    if (doubleBridgeHash.has(uuid)) { continue }
    doubleBridgeHash.add(uuid)

    const clusterNeiNodes1 = new Set(nodeNeighbor.get(clusterNodes[0]))
    const clusterNeiNodes2 = new Set(nodeNeighbor.get(clusterNodes[1]))
    const nodesSet1 = [...clusterNeiNodes1].filter(d => nodeDegreeMap.get(d) === 2)
    const nodesSet2 = new Set([...clusterNeiNodes2].filter(d => nodeDegreeMap.get(d) === 2))
    //
    const relatedNodes =
      nodesSet1.map(d => [d, nodeNeighbor.get(d).find(x => nodesSet2.has(x))])
    const nodeArray = []
    relatedNodes.forEach(eles => {
      if (eles[0] === undefined || eles[1] === undefined) { }
      else {
        nodeArray.push(...eles)
      }
    })
    for (let node of nodeArray) {
      node['structure'] = 'doubleBridge'
    }
    /*
    //超点创建 超边创建
    const abstractNode = generateAbstractNode(nodeArray, 'doubleBridge')
    const abstractLink1 = generateLink(clusterNodes[0], abstractNode)
    const abstractLink2 = generateLink(abstractNode, clusterNodes[1])

    linkMap.set(abstractLink1.id, abstractLink1)
    linkMap.set(abstractLink2.id, abstractLink2)
    nodeSet.add(abstractNode)

    //处理
    //删除nodeArray与nodeArray关联的边
    
    for (let delNode of nodeArray) {
      nodeSet.delete(delNode)
      nodeLinkMap.get(delNode.id).forEach(linkId => {
        linkMap.delete(linkId)
      })
    }*/

  }
}
export default function equivalentstructureExtraction (xnodes, xlinks) {
  pre_handle_process(xnodes, xlinks)
  get_cluster()
  get_bridge()
  //get_doubleBridge()  //本项目不需要该结构
  const { nodes, links } = global
  return {
    nodes,
    links
  }
}