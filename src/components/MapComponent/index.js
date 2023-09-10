/*
*  地图功能
*/
import './index.css'
import mapImg from '@/assets/img/map.png'
import LittleHeader from '../LittleHeader'
import { useEffect, useRef } from 'react'
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import TileLayer from '@arcgis/core/layers/TileLayer';
import Graphic from '@arcgis/core/Graphic'
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
//import window.gConfig from '/config'
function MapComponent(props) {
  const states = useRef({
    //地图view
    mapView: null,
    //地图
    map: null,
    //数据
    mapData: null,
    //图形层数据
    featureLayer: null,
    //高亮的选择
    highlightSelect: null,
    //临死地理信息
    getLocationFlag: false,
    graphicsLayer: null,
    pointGraphic: null,

    data:[],

  })
  useEffect(() => {
    initMap()
  }, [])
  useEffect(() => {
    states.current.getLocationFlag = props.getLocationFlag
    if (states.current.pointGraphic) {
      states.current.graphicsLayer.remove(states.current.pointGraphic)
      states.current.pointGraphic = null
    }
  }, [props.getLocationFlag])
  useEffect(() => {
    if (states.current.featureLayer) {
      states.current.featureLayer.destroy()
    }
    states.current.data = []

    if (!props.data) return
    if (!props.data[0].location) return
    let data = props.data.filter(ele => ele.location[0] !== 1000000 || ele.location[1] !== 1000000)
    if (data.length === 0) return
    states.current.data = data
    initData(data)
  }, [props.data])
  useEffect(() => {
    if (!props.addMapNode) return
    states.current.data.push(props.addMapNode)
    if (states.current.featureLayer)
    states.current.featureLayer.destroy()
    initData(states.current.data)
    //addNode(props.addMapNode)
  }, [props.addMapNode])
  useEffect(() => {
    if (!props.upMapNode) return
    editNode(props.upMapNode)
  }, [props.upMapNode])
  useEffect(() => {
    if (!props.delMapNode) return
    delNode(props.delMapNode)
  }, [props.delMapNode])
  useEffect(() => {
    if (!states.current.featureLayer) return
    if (!props.selectNode) return
    //高亮 参考文档:
    //https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-FeatureLayerView.html#highlight
    states.current.mapView.whenLayerView(states.current.featureLayer).then(function (layerView) {
      states.current.featureLayer
        .queryFeatures({
          objectIds: [props.selectNode.id], //
          outFields: ["*"],
          returnGeometry: true
        })
        .then((results) => {
          if (states.current.highlightSelect) {
            states.current.highlightSelect.remove();
          }
          const feature = results.features[0]
          states.current.highlightSelect = layerView.highlight(props.selectNode.id);
          // 自定义时间函数体
          function customEasing(t) {
            return 1 - Math.abs(Math.sin(-1.7 + t * 4.5 * Math.PI)) * Math.pow(
              0.5, t * 10);
          }
          // center the feature
          states.current.mapView.goTo(
            {
              target: feature.geometry,
              heading: 0, // 旋转角
              tilt: 0 // 倾斜角
            },
            {
              speedFactor: 0.3,
              easing: 'in-expo'
            }
          )

        });
    })

  }, [props.selectNode])
  const initMap = () => {
    const basemap = new Basemap({
      baseLayers: [
        new TileLayer({
          url: window.gConfig.basemap_url,
          title: 'Basemap',
        }),
      ],
      title: 'basemap',
      id: 'basemap',
    });
    states.current.map = new Map({
      basemap: basemap,
    });

    states.current.mapView = new MapView({
      container: 'mapview',
      map: states.current.map,
      zoom: 10,
      center: [104.09028, 30.577999],
    });
    states.current.graphicsLayer = new GraphicsLayer();
    states.current.map.add(states.current.graphicsLayer);
    states.current.mapView.on("click", function (event) {
      if (states.current.highlightSelect) {
        states.current.highlightSelect.remove();
      }
      //检测命中了哪些
      states.current.mapView.hitTest(event).then(function (response) {
        // only get the graphics returned from myLayer
        const graphicHits = response.results?.filter(
          (hitResult) => hitResult.type === "graphic"
        );
        if (graphicHits?.length > 0) {
          // do something with the myLayer features returned from hittest
          const hit = graphicHits[0].graphic.attributes
          props.setMapSelectId(hit.id)
          states.current.mapView.whenLayerView(states.current.featureLayer).then(function (layerView) {
            states.current.highlightSelect = layerView.highlight(graphicHits[0].graphic);
          });
        }
      });
      if (states.current.getLocationFlag) {
        const geom = webMercatorUtils.xyToLngLat(event.mapPoint.x, event.mapPoint.y)
        const lon = geom[0]
        const lat = geom[1]
        props.setLocation(geom)
        //临时添加点图形
        if (states.current.pointGraphic) {
          states.current.graphicsLayer.remove(states.current.pointGraphic)
          states.current.pointGraphic = null
        }
        const point = {
          type: 'point',
          longitude: lon,
          latitude: lat
        }
        const simpleMarkerSymbol = {
          type: 'simple-marker',
          color: [226, 119, 40],
          outline: {
            color: [255, 255, 255], // White
            width: 1
          }
        }
        states.current.pointGraphic = new Graphic({
          geometry: point,
          symbol: simpleMarkerSymbol
        });
        states.current.graphicsLayer.add(states.current.pointGraphic);
        states.current.mapView.goTo(
          {
            target: states.current.graphicsLayer,
            heading: 0, // 旋转角
            tilt: 0 // 倾斜角
          },
          {
            speedFactor: 0.3,
            easing: 'in-expo'
          }
        )

      }

    });
  }
  const initData = (data) => {
    const graphics = data.map((place) => {

      return new Graphic({
        attributes: {
          id: place.id,
          name: place.name
        },
        geometry: {
          type: "point",
          longitude: place.location[1],
          latitude: place.location[0]
          /*longitude: place.location[0]<0?-absA:absA,
          latitude: place.location[1]<0?-absB:absB*/
        },
        symbol: {
          // autocasts as new SimpleMarkerSymbol()
          type: "simple-marker",
          color: [226, 119, 40],
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 2
          }
        }
      });
    })
    states.current.featureLayer = new FeatureLayer({
      source: graphics,
      renderer: {
        type: "simple",                    // autocasts as new SimpleRenderer()
        symbol: {                          // autocasts as new SimpleMarkerSymbol()
          type: "simple-marker",
          color: "#102A44",
          outline: {                       // autocasts as new SimpleLineSymbol()
            color: "#598DD8",
            width: 2
          }
        }
      },
      /* popupTemplate: {                     // autocasts as new PopupTemplate()
         title: "{name}",
       },*/
      objectIdField: "id",           // This must be defined when creating a layer from `Graphic` objects
      fields: [
        {
          name: "id",
          alias: "id",
          type: "oid"
        },
        {
          name: "name",
          alias: "name",
          type: "string"
        }
      ]
    });
    states.current.map.layers.add(states.current.featureLayer);
  }
  const addNode = (data) => {
    const graphic = new Graphic({
      objectId:data.id,
      attributes: {
        id: data.id,
        name: data.name,
        objectId:data.id,
      },
      geometry: {
        type: "point",
        longitude: data.location[1],
        latitude: data.location[0]
      },
      symbol: {
        // autocasts as new SimpleMarkerSymbol()
        type: "simple-marker",
        color: [226, 119, 40],
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 2
        }
      }
    })
    states.current.featureLayer.applyEdits({
      addFeatures: [graphic],
    }).then((results) => {
      // if features were added - call queryFeatures to return
      //    newly added graphics
      if (results.addFeatureResults.length > 0) {
        const objectIds = [];
        
        results.addFeatureResults.forEach((item) => {
          //item.objectId = data.id
          objectIds.push(item.objectId);
        });
      
        // query the newly added features from the layer
        states.current.featureLayer
          .queryFeatures({
            objectIds: objectIds
          })
          .then((results) => {
            console.log(
              results.features.length,
              "features have been added."
            );
          })
      }
    })
      .catch((error) => {
        console.error();
      });
  }
  
  const editNode = (data) => {

    const graphic = new Graphic({
      attributes: {
        id: data.id,
        name: data.name,
        objectId:data.id,
      },
      geometry: {
        type: "point",
        longitude: data.location[1],
        latitude: data.location[0]
      },
      symbol: {
        // autocasts as new SimpleMarkerSymbol()
        type: "simple-marker",
        color: [226, 119, 40],
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 2
        }
      }
    })
    states.current.featureLayer.applyEdits({
      updateFeatures: [graphic],
    }).then((results) => {
      if (results.addFeatureResults.length > 0) {
        console.log('edit');
      }
    })
      .catch((error) => {
        console.error();
      });
  }
  
  const delNode = (data) => {
    const deleteFeatures = [
      { objectId: data.id },
    ];
    states.current.featureLayer.applyEdits({
      deleteFeatures: deleteFeatures
    }).then((results) => {
      // if edits were removed
      if (results.deleteFeatureResults.length > 0) {
        console.log(
          results.deleteFeatureResults.length,
          "features have been removed"
        );
      }
      // if features were added - call queryFeatures to return
      //    newly added graphics
      if (results.addFeatureResults.length > 0) {
        const objectIds = [];
        results.addFeatureResults.forEach((item) => {
          objectIds.push(item.objectId);
        });
        // query the newly added features from the layer
        states.current.featureLayer
          .queryFeatures({
            objectIds: objectIds
          })
          .then((results) => {
            console.log(
              results.features.length,
              "features have been added."
            );
          })
      }
    })
      .catch((error) => {
        console.error();
      });
  }
  return (
    <div className='map-wrap'>
      <LittleHeader img={mapImg} name="地图"></LittleHeader>
      <div id='mapview'>

      </div>
    </div>
  )
}
export default MapComponent