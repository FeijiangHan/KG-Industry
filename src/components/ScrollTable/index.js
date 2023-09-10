import { getTableScroll } from "@/utils"
import { useEffect, useRef, useState } from "react"
import { Table, Select } from 'antd'
import useStore from "@/store"
import { observer } from 'mobx-react-lite'
const { Option } = Select
export default observer(function (props) {
  const { publicStore } = useStore()
  const [scrollY, setScrollY] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  let countRef = useRef(null)
  const itemRender = (_, type, originalElement) => {
    if (type === 'next') {
      return (
        <>
          {originalElement}
          {/* 禁止了向父传递事件 */}
          <div style={{ float: 'left' }} onClick={(e) => e.stopPropagation()}>
            <Select
              size='small'
              defaultValue={pageSize}
              style={{
                width: 100,
                marginRight: 10
              }}
              onChange={(value) => {

                setPageSize(value)
              }}
            >
              <Option value={10}>10/页</Option>
              <Option value={20}>20/页</Option>
              <Option value={50}>50/页</Option>
              <Option value={100}>100/页</Option>
            </Select>

          </div>

        </>
      )
    }
    return originalElement
  }
  useEffect(() => {
    if (countRef && countRef.current) {
      let scrolly = getTableScroll({ ref: countRef, maxH: props.maxH })
      // console.log("更改window", scrolly)
      setScrollY(scrolly)
    }
  }, [props, publicStore.windowResizeFlag])
  return <div ref={countRef}>
    <Table {...props} scroll={{ y: scrollY }}
      pagination={{
        simple: true,
        position: ['bottomRight'],
        pageSize: pageSize,
        /*total: dataSource.length,*/
        itemRender: itemRender,
      }}

    ></Table>
  </div>
})