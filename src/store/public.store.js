import { makeAutoObservable } from 'mobx'
class PublicStore {
  constructor() {
    makeAutoObservable(this)
  }
  //全局操作记录
  operationRecordList = [

  ]
  addOperationRecordList = (val) => {
    // console.log('操作记录', val, this.operationRecordList, JSON.parse(JSON.stringify(this.operationRecordList)))
    this.operationRecordList = [...this.operationRecordList, val]
  }
  // 浏览器视窗大小发生变化标志 可以做自适应
  windowResizeFlag = false
  onWindowResizeFlag = () => {
    this.windowResizeFlag = !this.windowResizeFlag
  }

  kgGraphName1 = ''
  kgGraphName2 = ''
  kgGraphName3 = ''
  kgGraphType = ''
  isLoad = false
  // isOntologyFlag=false
  // changeIsOntologyFlag=(value)=>{
  //   this.isOntologyFlag=value
  // }
  changeLoad = (value) => {
    this.isLoad = value
  }
  changekgGraphType = (value) => {
    this.kgGraphType = value
  }
  // constructor(){
  //   makeAutoObservable(this)
  // }
  changeName = (name, key) => {
    switch (key) {
      case 1: this.kgGraphName1 = name; break
      case 2: this.kgGraphName2 = name; break
      case 3: this.kgGraphName3 = name; break

    }
  }
}
export default PublicStore