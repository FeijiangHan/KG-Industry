import { makeAutoObservable } from 'mobx'
class GraphStore {
  constructor() {
    makeAutoObservable(this)
  }
  // 注意: 所有的Graph组件会共享该数据 所有组件一次只能选择一个
  //选中的节点或边
  select = null
  sourceNode = null
  targetNode = null
  //用于导出所选节点的图谱
  selectSvgRef = null
  selectSvgContainerRef = null
  setSelectRef = (svg, svgContainer) => {
    this.selectSvgRef = svg
    this.selectSvgContainerRef = svgContainer
  }
  /*  select 数据说明
  {
    id: null,
    name: null,
    data: null,  //全部信息
    dom: null,  //dom元素可用于高亮
    type: null, //'link' or 'node'
  }
  */
  setSelect = (val) => {
    this.select = val
  }
  addOtherSelects = (val) => {
    this.select.otherLinks = val
  }
  addDetail = (val) => {
    if (this.select.type === 'node') {
      this.select.data = val[this.select.id].data
    }
  }
  clearSelect = () => {
    this.select = null
  }
  setSourceNode = (val) => {
    this.sourceNode = val
  }
  setTargetNode = (val) => {
    this.targetNode = val
  }
  cnt = 0
  operationType = null
  linkCreateFlag = false
  generateOperation = (type) => {
    this.operationType = "" + this.cnt + type
    if (++this.cnt >= 9) {
      this.cnt = 0
    }
  }
  clearOperation = () => {
    this.operationType = null
  }
  setLinkCreateFlag = (value) => {
    this.linkCreateFlag = value
  }
  algorithmFlag = false
  setAlgorithmFlag = (value) => {
    this.algorithmFlag = value
  }
}
export default GraphStore