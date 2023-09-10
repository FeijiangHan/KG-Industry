import * as d3 from 'd3'
/**
 * 计算任意形状节点凸包路径属性 d
 * @param nodeList 节点数组（需含坐标）
 * @param radius 节点半径值
 * @returns {*}
 */
const calculateHullPath = (nodeList, radius) => {

  const line = d3.line();
  let pointArr = [];
  const pad = radius * 2;
  nodeList.forEach((d) => {
    pointArr = pointArr.concat([
      [d.x - pad, d.y - pad],
      [d.x - pad, d.y + pad],
      [d.x + pad, d.y - pad],
      [d.x + pad, d.y + pad],
    ]);
  });
  return line(d3.polygonHull(pointArr));
};

function setLinkNumber (sets) {
  if (sets.size <= 1) return;
  let group = [...sets]

  //对该分组内的关系按照方向进行分类，此处根据连接的实体ASCII值大小分成两部分
  var linksA = [], linksB = [];
  for (var i = 0; i < group.length; i++) {
    var link = group[i];
    link.groupInnerLength = group.length
    link.groupInnerId = i
    let linkAid = 0
    let linkBid = 0
    if (link.source.id !== undefined) {
      linkAid = link.source.id
      linkBid = link.target.id
    } else {
      linkAid = link.source
      linkBid = link.target
    }
    if (linkAid < linkBid) {
      linksA.push(link);
    } else {
      linksB.push(link);
    }
  }
  //确定关系最大编号。为了使得连接两个实体的关系曲线呈现对称，根据关系数量奇偶性进行平分。
  //特殊情况：当关系都是连接到同一个实体时，不平分
  var maxLinkNumber = 0;
  maxLinkNumber = group.length % 2 == 0 ? group.length / 2 : (group.length + 1) / 2;

  //如果两个方向的关系数量一样多，直接分别设置编号即可
  if (linksA.length == linksB.length) {
    var startLinkNumber = 1;
    for (var i = 0; i < linksA.length; i++) {
      linksA[i].linknum = startLinkNumber++;
    }
    startLinkNumber = 1;
    for (var i = 0; i < linksB.length; i++) {
      linksB[i].linknum = startLinkNumber++;
    }
  } else {//当两个方向的关系数量不对等时，先对数量少的那组关系从最大编号值进行逆序编号，然后在对另一组数量多的关系从编号1一直编号到最大编号，再对剩余关系进行负编号
    //如果抛开负号，可以发现，最终所有关系的编号序列一定是对称的（对称是为了保证后续绘图时曲线的弯曲程度也是对称的）
    var biggerLinks, smallerLinks;
    if (linksA.length > linksB.length) {
      biggerLinks = linksA;
      smallerLinks = linksB;
    } else {
      biggerLinks = linksB;
      smallerLinks = linksA;
    }

    var startLinkNumber = maxLinkNumber;
    for (var i = 0; i < smallerLinks.length; i++) {
      smallerLinks[i].linknum = startLinkNumber--;
    }
    var tmpNumber = startLinkNumber;

    startLinkNumber = 1;
    var p = 0;
    while (startLinkNumber <= maxLinkNumber) {
      biggerLinks[p++].linknum = startLinkNumber++;
    }
    //开始负编号
    startLinkNumber = 0 - tmpNumber;
    for (var i = p; i < biggerLinks.length; i++) {
      biggerLinks[i].linknum = startLinkNumber++;
    }
  }
}
const addNeedObserverLink = (data, target) => {
  let nodes = data.nodes
  let links = data.links
  let cnt = 0
  for (let node of nodes) {
    if (node.id === target.source || node.id === target.target) {
      node.isNeedObserver = true
      cnt++
    }
    if (cnt === 2) {
      break
    }
  }
  for (let link of links) {
    if ('' + link.id === '' + target.id) {
      link.isNeedObserver = true
    }
  }
}
const download = (svgRef, containerRef) => {
  //得到svg的大小
  let svgx = svgRef.current.node()
  const width = containerRef.current.offsetWidth
  const height = containerRef.current.offsetHeight
  /*let box = svgx.getBBox(),
    x = box.x,
    y = box.y,
    width = box.width,
    height = box.height;
  //得到重置缩放
  let transform = d3.zoomTransform(svgBody.current.node()),
    transformX = transform.x,
    transformY = transform.y,
    scale = transform.k;
  // 还原缩放，并提高分辨率
  x = (x - transformX) / scale * 3;
  y = (y - transformY) / scale * 3;
  width = width / scale * 3;
  height = height / scale * 3;
  */
  //克隆svg
  let svgClone = svgx.cloneNode(true);

  svgClone.setAttribute('width', width)
  svgClone.setAttribute('height', height)
  //svgClone.setAttribute('viewBox', [x - 5, y, width + 10, height]); // 留白 -5避免遮挡裁剪
  //svgClone.getElementsByClassName("graphBody")[0].setAttribute('transform', 'translate(0,0) scale(3)')
  //导出svg为图片
  let serializer = new XMLSerializer()
  let source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgClone)


  let resWidth = width + 200
  let resHeight = height + 200
  var p = new Promise(function (resolve, reject) {
    let image = new Image()
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
    image.onload = function () {
      let canvas = document.createElement('canvas')
      canvas.width = width + 200;
      canvas.height = height + 200;
      let context = canvas.getContext('2d');
      context.rect(0, 0, width + 200, height + 200);
      context.fillStyle = '#fff';
      context.fill();
      context.drawImage(image, 100, 100); // 留白居中

      resolve(
        {
          base64: canvas.toDataURL("image/png"),
          width: resWidth,
          height: resHeight

        }) //将画布内的信息导出为png图片数据
    }
  })
  return p
}
export {
  calculateHullPath,
  setLinkNumber,
  download,
  addNeedObserverLink
}