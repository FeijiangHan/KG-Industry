/**
 * 使用indexof方法实现模糊查询
 * @param  {Array}  list     进行查询的数组
 * @param  {String} keyWord  查询的关键词
 * @return {Array}           查询的结果
 */
function fuzzyQuery (list, keyWord) {
  var arr = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i].name.indexOf(keyWord) >= 0) {
      arr.push(list[i]);
    }
  }
  return arr;
}

export {
  fuzzyQuery
}