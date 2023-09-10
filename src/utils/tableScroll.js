//antd中表格自适应高度
/**
 * 获取第一个表格的可视化高度
 * @param {number} extraHeight 额外的高度(表格底部的内容高度 Number类型,默认为74) 
 * @param {reactRef} ref Table所在的组件的ref
 */
export function getTableScroll ({ extraHeight = 54, ref, maxH } = {}) {
  //  extraHeight 默认底部分页64 + 边距10 
  if (!maxH) {
    maxH = '100vh'
  }
  let tHeader = null
  let width = null
  if (ref && ref.current) {
    tHeader = ref.current.getElementsByClassName("ant-table-header")[0]
  } else {
    tHeader = document.getElementsByClassName("ant-table-header")[0]
  }
  //表格内容距离顶部的距离
  let tHeaderBottom = 0
  if (tHeader) {
    tHeaderBottom = tHeader.getBoundingClientRect().bottom
    width = tHeader.clientWidth
  }
  // console.log("width,", width)
  // 窗体高度-表格内容顶部的高度-表格内容底部的高度
  // let height = document.body.clientHeight - tHeaderBottom - extraHeight
  // calc(100vh - 64px)/2 + 64px //calc(50vh + 32px)
  let height = `calc(${maxH} - ${tHeaderBottom + extraHeight}px)`
  // 空数据的时候表格高度保持不变,暂无数据提示文本图片居中
  if (ref && ref.current) {
    let placeholder = ref.current.getElementsByClassName('ant-table-placeholder')[0]
    if (placeholder) {
      placeholder.style.height = height
      if (width)
        placeholder.style.width = width - 20 + 'px'
      placeholder.style.display = "flex"
      placeholder.style.alignItems = "center"
      placeholder.style.justifyContent = "center"
    }
  }
  return height
}