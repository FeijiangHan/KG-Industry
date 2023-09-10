import * as d3 from 'd3'
//两个功能 
/*
 功能1:判断是否可用转换为树图
  条件1: 只有一个入度为0 是为根节点
  条件2: 其余节点入度均为1
  条件3: 从根开始BFS遍历,数量等于节点总数
 */
function graphToTreeData (graph) {
  const { nodes, links } = graph
  let linksMap = new Map()
  const nodesMap = d3.index(nodes, e => {
    e.indegree = 0
    e.children = []
    return e.id
  })
  //1. 获取每个节点的入度数
  for (let link of links) {
    let { source, target } = link
    const sourceNode = nodesMap.get(source)
    const targetNode = nodesMap.get(target)
    let key = '' + sourceNode.id + targetNode.id
    linksMap.set(key, link)
    targetNode.indegree += 1
    if (targetNode.indegree > 1) {
      console.log("存在入度大于1")
      return false
    }
    sourceNode.children.push(targetNode)
  }
  //2. 获取根节点
  let root = null
  for (let node of nodes) {
    if (node.indegree === 0) {
      root = node
    }
  }
  if (!root) {
    console.log("没有找到根")
    return false
  }
  //4. bfs 检测是否正确
  const getNodechildrenNum = (node) => {
    let sum = 0
    for (let adj of node.children) {
      sum += getNodechildrenNum(adj)
    }
    return sum + 1
  }
  if (getNodechildrenNum(root) !== nodes.length) {
    console.log("数量不匹配")
    return false
  }
  //是真的
  return [d3.hierarchy(root), linksMap]
}
export {
  graphToTreeData
}