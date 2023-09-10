
const observerColor = '#00f'
const dottedLineColor = '#0f0'
const initLayoutSet = {
  charge: 30,
  visLegend: false,
  visNodeLable: false,
  visLinkLable: false,
  grahAutoZoom: true,
  graphAutoNodeForce: false,
}
const initNodeSet = {
  radius: 4,
  nodeColor: "#409cff",
  lableSize: 2.4,
}
const initLinkSet = {
  linkColor: '#b7b7b7',
  mulLinkColor: '#434242',
  linkWidth: 1,
  linkLength: 10,
  lableSize: 2.4,
  mulLinkSuper: true, //多边聚合还是分散
}
const structureColor = {
  cluster: '#9fc184',
  bridge: '#f1c996',
  doubleBridge: '#eeee',
  other: 'gray'
}
//骨干提取配色
const boneColor = (d) => {
  if (d.importantCore == 1) {
    return "#ee5355";
  } else if (d.importantBridge == 1) {
    return "#2faef5";
  } else return "#d0d0d0";
}
const boneStrokeColor = (d) => {
  if (d.importantCore == 1 || d.importantBridge == 1) {
    return "#000";
  } else {
    return "#d6d6d6";
  }
}
const boneLinkColorMap = {
  'important': "#000",
  'noImportant': '#d7d7d7'
}
const boneLinkColor = (d) => {
  if (d.important == 1) return boneLinkColorMap.important;
  else return boneLinkColorMap.noImportant;
}

const algorithmZNENmap = new Map(
  [
    ['useSimplifyEquiv', '等价结构化简算法布局'],
    ['useSuperpointextraction', '超点提取算法布局'],
    //useEquivalentstructureExtraction
    ['useEquivalentstructureExtraction', '等价结构提取算法布局'],
    ['useBackboneExtraction', '骨干提取算法布局'],
    ['useHierarchicalPruning', '层次剪枝算法布局'],
  ]
)
export {
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
}