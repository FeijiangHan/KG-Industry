import { download } from './graphUtil'
import docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import JSZipUtils from 'jszip-utils'
import { saveAs } from 'file-saver'
import ImageModule from 'docxtemplater-image-module-free' //这句是导出图片用的
const err = "data:image/png;base64,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"
/*
上边这行代码不好使的情况下需要用var ImageModule = require('docxtemplater-image-module-free')
*/
/*
 ********
 base64DataURLToArrayBuffer函数代码块--导出图片函数编写位置
 ********
*/
const selectToWordData = (select) => {
  let word = ''
  if (select.type === 'node') {
    word = `节点名称:  ${select.name}\n`
    if (select.data.property !== null) {
      for (let key in select.data.property) {
        word += `${key}:  ${select.data.property[key]}\n`
      }
    }
  } else {
    let links = []
    if (select.otherLinks === undefined) {
      links.push(select)
    } else {
      links = select.otherLinks
    }
    for (let link of links) {
      word += `关系名称:  ${link.name}\n`
      const orNode = link.source
      const tarNode = link.target
      word += `源节点名称: ${orNode.name}\n`
      if (orNode.data.property !== null) {
        for (let key in orNode.data.property) {
          word += `${key}:  ${orNode.data.property[key]}\n`
        }
      }
      word += `目标节点名称: ${tarNode.name}\n`
      if (tarNode.data.property !== null) {
        for (let key in tarNode.data.property) {
          word += `${key}:  ${tarNode.data.property[key]}\n`
        }
      }
      word += '\n'
    }
  }
  return word
}
async function exportWord (select, selectSvgRef, selectSvgContainerRef) {
  // 设置模板变量的值,这个就是模板里所插入的内容数据，根据需要写成动态就好了。
  download(selectSvgRef, selectSvgContainerRef).then(({ base64, width, height }) => {
    let wordData = {}
    wordData.test = selectToWordData(select)
    var lines = wordData.test.split("\n")
    var pre = "<w:p><w:r><w:t>";
    var post = "</w:t></w:r></w:p>";
    var lineBreak = "<w:br/>";
    wordData.test = pre + lines.join(lineBreak) + post;
    wordData.picture = base64

    // 读取并获得模板文件的二进制内容，是docxtemplater提供的固定写法
    JSZipUtils.getBinaryContent("/tag-example.docx", function (error, content) {
      // exportTemplate.docx是模板，React写在public里。我们在导出的时候，会根据此模板来导出对应的数据
      //图片导出功能
      var opts = {}
      opts.centered = false; //Set to true to always center images
      opts.fileType = "docx"; //Or pptx
      opts.getImage = function (chartId) {
        if (chartId === null) return null
        return base64DataURLToArrayBuffer(chartId);
      }
      //Pass the function that return image size
      opts.getSize = function () {
        return [width, height]
      }
      var imageModule = new ImageModule(opts);
      // 抛出异常
      if (error) {
        throw error;
      }
      // 创建一个PizZip实例，内容为模板的内容
      let zip = new PizZip(content);
      // 创建并加载docxtemplater实例对象
      let doc = new docxtemplater()
        .attachModule(imageModule) //图片导出功能
        .loadZip(zip)
        .compile();

      // 生成一个代表docxtemplater对象的zip文件（不是一个真实的文件，而是在内存中的表示）
      doc.resolveData(wordData).then(function () {
        //console.log('ready');
        doc.render();
        var out = doc.getZip().generate({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        // 将目标文件对象保存为目标类型的文件，并命名（起一个自己需要的名字就好了）
        saveAs(out, "卡片内容.docx");
      })
    });
  })

}

function base64DataURLToArrayBuffer (dataURL) {
  //console.log(dataURL);
  const base64Regex = /^data:image\/(png|jpg|svg|jpeg|svg\+xml);base64,/;
  if (!base64Regex.test(dataURL)) {
    return false;
  }
  const stringBase64 = dataURL.replace(base64Regex, "");
  let binaryString;
  if (typeof window !== "undefined") {
    binaryString = window.atob(stringBase64);
  } else {
    binaryString = new Buffer(stringBase64, "base64").toString("binary");
  }
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes.buffer;
}
// Image对象转base64
function imageToBase64 (image) {
  let canvas = document.createElement('canvas')
  let width = image.width
  let height = image.height

  canvas.width = width
  canvas.height = height
  let context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/png')
}

// 回调方式
function urlToBase64 (url) {
  return new Promise(function (resolve, reject) {
    let image = new Image()

    image.setAttribute('crossOrigin', 'Anonymous')
    image.src = `${process.env.REACT_APP_URL}/api/img/${url}`
    //console.log(`${process.env.REACT_APP_URL}/api/img/${url}`)
    image.onload = function () {
      let dataURL = imageToBase64(image)
      let obj = {
        'base64': dataURL,
        width: image.width,
        height: image.height
      }
      resolve(obj)
    }
    image.onerror = function (err) {
      let obj = {
        base64: err,
        width: 64,
        height: 64
      }
      reject(obj)
    }
  })

}
// Promise方式
function urlToBase64Async (url) {
  return new Promise((resolve, reject) => {
    urlToBase64(url).then(res => {
      resolve(res)
    }, rej => {
      resolve(rej)
    })
  })
}
export default exportWord