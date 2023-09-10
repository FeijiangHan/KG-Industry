// 等价结构化简算法
let that = {
  d_group_sum: {},
  g_group_sum: {},
  cluster_group_index: {},
  cb_group_index: {}, //簇桥结构编号
  bridge_group_index: {},
  u_group_index: {},
  u_group_dict: {},
  isShow: false,
  listNodeType: ''
};

function simplificateEntrence (listName, rate, d3_nodes, d3_links) {
  //d3_nodes = d3_nodes.filter(() => true);
  //d3_links = d3_links.filter(() => true);
  let list;
  switch (listName) {
    case 'cluster':
      list = that.cluster_group_index;
      break;
    case 'cluster_bridge':
      list = that.cb_group_index;
      break;
    case 'bridge':
      list = that.bridge_group_index;
      break;
  }
  //list 是组名
  //nodes_sum 是每个组中有多个节点
  let nodes_sum = [];
  //nodes_sum 是每个边中有多个节点
  let links_sum = [];
  for (let x of list) {
    //统计点数  
    let cur_nodes = [];
    let n_sum = d3_nodes.filter(d => {
      if (d['group'] && parseInt(d['group'].substring(1, 4)) === x) {
        cur_nodes.push(d.id);
        return true
      } else return false;
    }).length;
    nodes_sum.push(n_sum);
    //统计边数
    let l_sum = d3_links.filter(d => {
      if (cur_nodes.findIndex(val => val === d.source || val === d.target) >= 0) {
        return true;
      } else return false;
    }).length;
    links_sum.push(l_sum);
  }

  let i = 0;
  for (let x of list) {
    if (nodes_sum[i] > 3 && links_sum[i] > 3) { //点边都大于三才可以化简
      //化简
      specificSimplificate(x, nodes_sum[i], rate, d3_nodes, d3_links);
    }
    i++;//计数器
  }
}

function specificSimplificate (groupIndex, sum, rate, d3_nodes, d3_links) { //具体对三种结构化简
  let i = 0;
  let indexs = [];
  for (let i = 0; i < sum; i++) {
    indexs[i] = i;
  }
  indexs.shuffle();
  let deleteSum = sum - Math.floor(rate * sum) >= 3 ? Math.floor(rate * sum) : sum - 3;

  indexs.splice(deleteSum, sum)

  let nodes_name = [];
  d3_nodes.forEach(d => {
    if (d['group'] && parseInt(d['group'].substring(1, 4)) === groupIndex) {
      //25%-40%
      if (indexs.includes(i)) {
        d["hidden"] = 1;
        nodes_name.push(d.id);
      }
      i++;
    }
  });
  d3_links.forEach(d => {
    if (nodes_name.findIndex(val => val === d.source || val === d.target) >= 0) {
      d["hidden"] = 1;
    }
  })
}

function uniqueSimplificate (rate, d3_nodes, d3_links) {//对u_group化简
  let dict = that.u_group_dict;
  let list = that.u_group_index;
  let nodes_name = [];
  let sum = d3_nodes.filter(d => {
    return d['u_group']
  }).length / 2
  let indexs = [];
  for (let i = 0; i < sum; i++) {
    indexs[i] = i;
  }
  indexs.shuffle();
  let deleteSum = sum - Math.floor(rate * sum) >= 3 ? Math.floor(rate * sum) : sum - 3;

  indexs.splice(deleteSum, sum)

  for (let x of list) {
    let i = 0;
    let total = d3_nodes.filter(d => {
      return d['u_group'] && parseInt(d['u_group'].substring(2, d['u_group'].indexOf("-") - 1)) === x;
    }).length;
    if (total > 6) {
      d3_nodes.forEach((d, index) => {
        //只找u_group-1的节点
        if (d['u_group'] && d['u_group'].substring(2, d['u_group'].indexOf("-") + 3) === x + " - 1") {
          if (indexs.includes(i)) {
            d["hidden"] = 1;
            nodes_name.push(d.id);
            d3_nodes[dict[index]]["hidden"] = 1;
            nodes_name.push(d3_nodes[dict[index]].id);
          }
          i++;
        }

      });
      d3_links.forEach(d => {
        if (nodes_name.findIndex(val => val === d.source || val === d.target) >= 0) {
          d["hidden"] = 1;
        }
      });


    }
  }
}

Array.prototype.shuffle = function () {
  var array = that;
  var m = array.length,
    t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

function sum (arr) {
  return arr.reduce(function (prev, curr) {
    return prev + curr;
  });
}

function matrixData (rawdata) {
  let nodes = rawdata.nodes;
  let links = rawdata.links;
  //新增一个边类型数组
  let caseMatrix = [], linkTypeMatrix = [], nodeID = {},
    matrixLength = nodes.length,
    mergeMatix = [];
  let group = [], traveled = []; // group 里面分组保存每一个节点的索引值
  let n = 0;
  //caseMatrix二维矩阵
  for (let i = 0; i < matrixLength; i++) {
    let row = [];
    for (let j = 0; j < matrixLength; j++) {
      row[j] = 0;
    }
    caseMatrix.push(row);
  }
  // 节点id 和节点位置 map
  nodes.forEach((d, index) => {
    nodeID[d.id] = index;

  })
  links.forEach((d) => {
    d.source = d.source.id
    d.target = d.target.id
    // 获取2个节点所处数组的位置
    let r = nodeID[d.source], c = nodeID[d.target];
    //标记为1
    caseMatrix[r][c] = 1;
    caseMatrix[c][r] = 1;
  })

  for (let m = 0; m < matrixLength; m++) {
    //set每个点的度数
    nodes[m]['degree'] = sum(caseMatrix[m])
    mergeMatix[m] = caseMatrix[m].join('');
    // 提取度数为 1 的节点
    if (sum(caseMatrix[m]) === 1) {
      nodes[m]['merge_degree'] = 1;
    }
  }
  for (let [index, value] of mergeMatix.entries()) {
    if (traveled.includes(index) || !value.includes('1')) {
      continue;
    }
    let gSet = new Set();
    //还需添加自身 所有是从index开始
    for (let n = index; n < mergeMatix.length; n++) {
      let flag = 0;
      if (mergeMatix[n] == value) {
        //节点出度情况相同，初始化假设所有这些边类型相同,flag置1
        flag = 1;
      }
      //flag=1时，说明两节点所有边射向节点相同且所有边类型相同
      if (flag == 1) {
        gSet.add(n);
        traveled.push(n);
      }
    }
    group.push(Array.from(gSet));
  }
  // 过滤掉只有一个节点的分组，即保留节点数大于2的等价分组
  group = group.filter((d) => {
    return d.length > 1
  })
  let finalGroup = group


  let cluster_gIndex = new Set();
  let bridge_gIndex = new Set();
  let cb_gIndex = new Set();
  finalGroup.forEach((d, i) => {
    d.forEach(v => {
      nodes[v]['group'] = `g${i}`;
      //判断是否为簇结构 即只有一条边
      if (nodes[v]['merge_degree'] === 1) {
        cluster_gIndex.add(i);
        nodes[v]['struct_type'] = 'cluster';
      }
      //判断是否为簇桥结构/桥结构 //
      else {
        /*
        let related_nodes = [];  //相关的节点
        let related_links_type = []; //相关的边
        //把相关节点和边类型保持起来
        links.filter(d => {
          if (d.source === nodes[v].name) {
            related_nodes.push(d.target);
            related_links_type.push(d.relation);
            return true;
          } else if (d.target === nodes[v].name) {
            related_nodes.push(d.source);
            related_links_type.push(d.relation);
            return true;
          }
          else {
            return false;
          }
        });*/
        /* let ret = 0; //默认为簇桥
         //判断根据 相关边类型与 相关点对应边占比来判断是否为簇桥
         for (let i = 0; i < related_nodes.length; i++) {
           let sum, same_sum;
           sum = links.filter(d => {
             return d.source === related_nodes[i] || d.target === related_nodes[i];
           }).length;
           same_sum = links.filter(d => {
             return (d.source === related_nodes[i] || d.target === related_nodes[i]) && d.relation === related_links_type[i];
           }).length;
           //可调参数
           if (same_sum / sum < 0.70) {
             ret = 1;//为桥节点
           }
         }*/
        /*if (ret) {
          bridge_gIndex.add(i);
          nodes[v]['struct_type'] = 'bridge';
        } else {*/
        cb_gIndex.add(i);
        nodes[v]['struct_type'] = 'cb';
      }
    })
  });

  that.cluster_group_index = cluster_gIndex;
  that.bridge_group_index = bridge_gIndex;
  that.cb_group_index = cb_gIndex;


  //某些节点可能只连
  let d_groups = []
  for (let m = 0; m < matrixLength; m++) {
    if (nodes[m]['merge_degree'] == 1 && nodes[m]['group'] == undefined/* && nodes[m]['u_group'] == undefined*/) {
      nodes[m]['d_group'] = `d${n}`;
      d_groups.push(nodes[m])
      n++;
    }
  }
  //对d_group进行进一步分类
  let i2 = 0
  d_groups.forEach(d => {
    d['unimportant_d_group'] = `uid${i2}`
    i2++
  })
}

// 入口函数，在脚手架中 export 这个函数即可
export default function simplify_equiv (in_nodes, in_links, rate = 0.562, a = 0.5, b = 0.1, c = 1.2, d = 1, e = 0.6, discontinuity = 0.5, p = 0.4, q = 0.6) {

  /*
   入参：要化简的节点集合 && 要化简的连边集合【这里的数据是原始的数据集合，不是通过 d3 修改后的数据集合】
 	
   出参：化简后的节点集合 && 化简后的连边集合 {nodes,links}
  */
  const start_time = new Date();
  let d3_nodes = JSON.parse(JSON.stringify(in_nodes));
  let d3_links = JSON.parse(JSON.stringify(in_links));

  let l1 = d3_nodes.length;
  let rawdata = {};
  rawdata.nodes = d3_nodes;
  rawdata.links = d3_links;
  //进行等价结构的检测
  matrixData(rawdata);

  let sum = 0;
  sum += d3_nodes.filter(d => {
    return d['group']
  }).length

  let percentage = sum / l1;
  // group :分组节点
  // d_group: 单边的自己一个组的节点
  // sum-li:d_group+多边的就自己一个组的节点

  if (rate == 0) {
    if (percentage <= discontinuity) {
      rate = a * percentage + b;
    } else {
      rate = -c * Math.pow((percentage - d), 2) + e
    }
  }

  /*
  let sum1 = d3_nodes.filter(d => {
    return d['normal_d_group'] !== undefined
  }).length
  */
  let sum2 = d3_nodes.filter(d => {
    return d['unimportant_d_group'] !== undefined
  }).length

  //仅大于2 才化简  就是说孤立节点是否过滤的问题
  //化简普通独立弱等价
  /*if (sum1 > 2) {
    let filterName = new Set();
    let d_group_node = d3_nodes.filter(d => {
      return d['normal_d_group'] !== undefined
    });
    let d_group_index = d_group_node.map(d => {
      return d['normal_d_group']
    });

    //打乱顺序
    d_group_index.shuffle();

    d_group_index.splice(Math.min(Math.floor((p) * sum1), sum1 - 3), sum1)

    d3_nodes.forEach(d => {
      //非松散节点在此不过滤
      if (!(d['normal_d_group'] === undefined)) {
        //离散过滤约50%-60%的松散节点
        if (d_group_index.includes(d['normal_d_group'])) {
          filterName.add(d.name);
        }
      }
    });
    //返回不在删除节点内的边
    d3_links.forEach(d => {
      if (d.relation !== "r_cert") {
        if (filterName.has(d.source) || filterName.has(d.target)) {
          d["hidden"] = 1;
        }
      } else {//是证书关系
        if (filterName.has(d.source)) {
          filterName.delete(d.source);
        } else if (filterName.has(d.target)) {
          filterName.delete(d.target)
        }
      }
    });

    d3_nodes.forEach(d => {
      if (filterName.has(d.name)) {
        d["hidden"] = 1;
      }
    });
  }*/

  //化简不重要独立弱等价
  if (sum2 > 2) {
    let filterName = new Set();
    let d_group_node = d3_nodes.filter(d => {
      return d['unimportant_d_group'] !== undefined
    });
    let d_group_index = d_group_node.map(d => {
      return d['unimportant_d_group']
    });
    //打乱顺序
    d_group_index.shuffle();

    d_group_index.splice(Math.min(Math.floor((q) * sum2), sum2 - 3), sum2)


    d3_nodes.forEach(d => {
      //非松散节点在此不过滤
      if (!(d['unimportant_d_group'] === undefined)) {
        //离散过滤约50%-60%的松散节点
        if (d_group_index.includes(d['unimportant_d_group'])) {
          filterName.add(d.id);
        }
      }
    });

    //返回不在删除节点内的边
    d3_links.forEach(d => {
      if (true) {
        if (filterName.has(d.source) || filterName.has(d.target)) {
          d["hidden"] = 1;
        }
      }
    });

    d3_nodes.forEach(d => {
      if (filterName.has(d.id)) {
        d["hidden"] = 1;
      }
    });
  }

  //化简三种等价结构

  simplificateEntrence("cluster", rate, d3_nodes, d3_links)
  simplificateEntrence("cluster_bridge", rate, d3_nodes, d3_links)
  simplificateEntrence("bridge", rate, d3_nodes, d3_links)
  //uniqueSimplificate(rate, d3_nodes, d3_links)

  const sim_nodes = d3_nodes.filter(d => {
    return d['hidden'] === undefined
  })
  const sim_links = d3_links.filter(d => {
    return d['hidden'] === undefined
  })

  // 此处的 d3_nodes 和 d3_links 与 d3 没有任何关系，只是命名而已
  const end_time = new Date()

  return {
    nodes: sim_nodes,
    links: sim_links,
    simplificateEntrence,
    uniqueSimplificate,
    rate,
  };
}