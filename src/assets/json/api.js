//更新格式
const upNode = {
  "name": "http://zh.dbpedia.org/resource/Nexus_6P",
  "data": {
    "property": { //也可能是null 随意的
      "qew": "qwe",
      "asd": "asd"
    }
  },
  "id": "100003"
}
//增加格式  返回id
const addNode = {
  "name": "qweqwe",
  "data": {
    "property": {//也可能是null 随意的
      "asd": "asdasd"
    }
  }
}
//增加格式 返回节点id
const addNode1 = { "name": "qweqwe", "data": { "property": {} } }
//删除节点
const del = {
  "id": "xxxx",
}

//增加边 返回边id
const addLink = {
  "source": "nodeid",
  "target": "nodeid",
  "name": "linkname"
}
//更新边
const upLink = {
  "id": "linkid",
  "name": "new name"
}
//删除边
const delLink = {
  "id": "linkid"
}