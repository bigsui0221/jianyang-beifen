


<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="mapView" @click="handleSearch" />
  <!-- 绘制提示 -->
  <div class="draw-tips" v-if="isDrawing">
    <el-icon>
      <InfoFilled />
    </el-icon>帮助提示<p>点击鼠标左键绘制分区，<span>双击左键</span>完成绘制</p>
  </div>
  <!-- <el-button class="toList" type="primary" @click="$router.push('/plan/keylist/index')">防汛重点区域</el-button> -->
  <!-- 图例区 -->
  <!-- <div class="legend">
    <div class="title">图例</div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-1.png" alt="" />防汛重点
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-2.png" alt="" />监控点位
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-3.png" alt="" />监控范围
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-4.png" alt="" />逃生路线
    </div>
    <div class="item">
      <img src="@/assets/imgs/floodctrl/plan/icon-5.png" alt="" />避灾场所
    </div>
  </div> -->

  <!-- <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
    :name="item.waterResourceName" theme="green">
    <template #main>
      <div class="my-marker-info">
        <div class="item">
          <span class="name">重点区域：</span>
          <span class="value">0.32NTU</span>
        </div>
        <div class="item">
          <span class="name">预计受困人数：</span>
          <span class="value">1.8mg/L</span>
        </div>
        <div class="item">
          <span class="name">逃生路线：</span>
          <span class="value">7.3</span>
        </div>
      </div>
    </template>
    <template #icon>
      <img class="my-marker-icon" src="@/assets/imgs/floodctrl/marker/icon-6.png" alt="" />
    </template>
  </at-marker> -->


  <!-- 新增弹窗 -->
  <div class="edit-card">
    <div class="edit-card-title">区域管理
      <el-icon class="edit-card-title-close">
        <Close />
      </el-icon>
    </div>
    <div class="edit-card-content-btn w-70 ml-7 mt-5" v-if="!showadd">
      <el-input @change="handleSearcharea" v-model="kewowrd" placeholder="搜索关键字">
        <template #append>
          <el-button :icon="Search" />
        </template>
      </el-input>
    </div>
    
    <el-button type="primary" class="w-70 ml-7 mt-5 mb-10" @click="handleAddarea()" v-if="!showadd">新建区域</el-button>
    
    <div v-if="!showadd">
      <div v-for="item in arealist" :key="item.id" class="mb-3 ml-10 c-gray cursor-pointer" @click="handleEditarea(item)">
        {{ item.mapAddress }}
      </div>
    </div>

    <div class="edit-card-content" v-if="showadd">
      <div class="edit-card-content-btn mb-10">
        <el-button type="primary" @click="startDrawing">绘制区域</el-button>
        <el-button @click="clearDrawing">清除</el-button>
      </div>
      <div class="w-80 ">
        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="rules"
          label-width="120px"
          class="demo-ruleForm"
          status-icon
        >
          <el-form-item label="区域名称" prop="deptId">
            <el-tree-select
              v-model="ruleForm.deptId"
              :data="deptList"
              check-strictly
              :render-after-expand="false"
              :props="defaultProps"
              check-on-click-node
              ref="treeRef"
              :filter-node-method="filterNode"
              default-expand-all
              highlight-current
              node-key="id"
              @node-click="handleNodeClick"
              class="w-100 mb-5"
            />
          </el-form-item>
          <el-form-item label="区域地址" prop="mapAddress">
            <el-input placeholder="请输入" class="mb-5 w-100" v-model="ruleForm.mapAddress"/>
          </el-form-item>
        </el-form>
      </div>

      <div class="edit-card-content-title">边框及填充色</div>
      <el-color-picker v-model="selectColor" @change="changeSelectColor" />
    </div>
    <div class="edit-card-footer" v-if="showadd">
      <el-button @click="handleCancel(ruleFormRef)">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)">保存</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { initGisMap, createPolygonGraphic,
  getSimpleFillSymbol,esriModules } from '@/utils/gis'

import { toRaw } from 'vue'
const drawTool = shallowRef<any>(null)
const currentPolygon = shallowRef<any>(null)
const isDrawing = ref<boolean>(false)

const gisMap = shallowRef<any>(null);
const mapView = shallowRef<any>(null);
const popups = shallowRef<any[]>([])
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')

const refs = ref<any>({})
const keynoteList = reactive<any[]>([
  { id: 1, waterResourceName: '测试1', longitude: 104.567121, latitude: 30.399821 },
  { id: 2, waterResourceName: '测试2', longitude: 104.557101, latitude: 30.389841 }])

const handleSearch = (data) => {
}

const polygonList = ref([])

/**
 * 设置点
 */
const setKeynoteMarker = () => {
  keynoteList.forEach((item) => {
    // 绑定弹窗
    let dom = refs.value[`keynote${item.id}`];
    if (Array.isArray(dom)) {
      dom = dom[0].$el;
    } else {
      dom = dom.$el;
    }
    // 存储弹窗信息
    popups.value.push({
      element: dom,
      graphic: new esriModules.Graphic({
        geometry: new esriModules.Point({
          longitude: item.longitude,
          latitude: item.latitude,
          spatialReference: { wkid: 4326 } // WGS84坐标系，与高德默认一致
        })
      }),
    });
  })
}
/**
 * 设置多边形
 */
const setKeyNotePolyon = (row) => {
  console.log(row);
  
  if(row.regionRectangle !== ''){
    polygonList.value = JSON.parse(row.regionRectangle)
    console.log(row.regionRectangle);

    const graphics = createPolygonGraphic(JSON.parse(row.regionRectangle), row.borderStyle);
    console.log(graphics);
    
    polygonInfo.value.push(graphics);
    mapView.value.graphics.add(graphics);
  }
}

/**
 * 更新所有弹窗位置
 */
const updateAllPopupPositions = () => {
  if (!mapView.value) return;
  popups.value.forEach(item => {
    updatePopupPosition(item.element, item.graphic.geometry);
  });
};

/**
 * 更新单个弹窗位置
 * @param element 
 * @param point 
 */
const updatePopupPosition = (element: HTMLElement, point: any) => {
  if (!mapView.value) return;
  // 将地图坐标转换为屏幕坐标
  const screenPoint = mapView.value.toScreen(point);
  if (screenPoint) {
    // 设置弹窗位置（偏移一点，避免与标记重叠）
    element.style.left = `${screenPoint.x - 14}px`;
    element.style.top = `${screenPoint.y - 34}px`;
  }
};

/**
 * 监听地图变化，更新弹窗位置
 */
const watchMapChanges = () => {
  if (!mapView.value) return;

  // 当地图移动、缩放或旋转时更新弹窗位置
  mapView.value.watch('extent', updateAllPopupPositions);
  mapView.value.watch('rotation', updateAllPopupPositions);

  // 更精确的方式：监听视图的"update"事件
  mapView.value.on('update', (event) => {
    if (event.viewpoint) {
      updateAllPopupPositions();
    }
  });
};

// 初始化地图
const initMap = async () => {
  const { map, view } = await initGisMap(document.getElementById('mapContainer'))
  console.log(map, view)
  mapView.value = view
  gisMap.value = map
  // gisMap.value.add(graphicsLayer.value)
  isLoading.value = false;
  initDrawTool();
  // setKeynoteMarker()
  updateAllPopupPositions()
  watchMapChanges()
};
// 初始化绘图工具
const initDrawTool = () => {
  if (!mapView.value) return;
  drawTool.value = new esriModules.Draw({
    view: mapView.value,
  });
  setKeyNotePolyon(arealist.value[0])
};


import { ElTree } from 'element-plus'
import { Close, InfoFilled } from '@element-plus/icons-vue'
import { RegionApi } from '@/api/Floodctrl/region'
import { Search } from '@element-plus/icons-vue'

import type { FormInstance, FormRules } from 'element-plus'

import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'

const showadd = ref<boolean>(false)
const arealist = ref<any>([])

const polygonInfo = ref<[number, number][]>([])
// const currentPolygon = ref<any>(null)
const selectColor = ref<string>('#3A7DFF')

const kewowrd = ref<string>('')

const value = ref()

const changeSelectColor = (color) => {
  if (currentPolygon.value)
    currentPolygon.value.symbol = getSimpleFillSymbol(color)
}

const orarealist = ref<any>([])
const deptList = ref<Tree[]>([]) // 树形结构
const treeRef = ref<InstanceType<typeof ElTree>>()
const ruleFormRef = ref<FormInstance>()

const handleEditarea = (item: any) => { 
  // clearDrawing()
  
  if (mapView.value) {
    console.log(polygonInfo.value[0]);
    polygonInfo.value.forEach(item =>{
      mapView.value.graphics.remove(toRaw(item));
    })
    polygonInfo.value = [];
    // mapView.value.graphics.remove(currentPolygon.value);
  }
  
  console.log(item);
  // ruleForm = deepClone(item)
  Object.assign(ruleForm, item)
  selectColor.value = item.borderStyle
  console.log(ruleForm);
  
  //处理字符串为数组
  if(item.regionRectangle !== ''){
    polygonList.value = JSON.parse(item.regionRectangle)
    const graphic = createPolygonGraphic(toRaw(polygonList.value), item.borderStyle);
    polygonInfo.value.push(graphic);
    console.log(graphic);
    currentPolygon.value = graphic;

    currentPolygon.value.symbol = getSimpleFillSymbol(item.borderStyle)
    mapView.value.graphics.add(graphic);
  }
  
  showadd.value = true
}
const handleSearcharea = () => {
  if(kewowrd.value === ''){
    arealist.value = orarealist.value
    return
  }
  console.log('handleSearcharea',kewowrd.value);
  arealist.value = orarealist.value.filter((item) => item.mapAddress.includes(kewowrd.value))
  console.log(arealist.value);
}


const initarea = () => { 
  RegionApi.getRegionPage({ pageNo: 1, pageSize: 100 }).then((res)=>{
    // console.log(res);
    arealist.value = res.list
    orarealist.value = res.list
    // setKeyNotePolyon(arealist.value[0])
  })
}
/** 获得部门树 */
const getTree = async () => {
  const res = await DeptApi.getDeptPage({pageNo: 1, pageSize: 100, street: true })
  deptList.value = []
  deptList.value.push(...handleTree(res))
}

// 开始绘制
const startDrawing = () => {
  if (!mapView.value || !drawTool.value || isDrawing.value) return;
  isDrawing.value = true;
  // 开始绘制多边形
  const action = drawTool.value.create('polygon');
  // fires when a vertex is added
  action.on("vertex-add", function (evt) {
    measureLine(evt.vertices);
  });

  // fires when the pointer moves
  action.on("cursor-update", function (evt) {
    measureLine(evt.vertices);
  });

  // fires when the drawing is completed
  action.on("draw-complete", function (evt) {
    measureLine(evt.vertices);
  });

  // fires when a vertex is removed
  action.on("vertex-remove", function (evt) {
    measureLine(evt.vertices);
  });
  // fires when the drawing is completed
  action.on('draw-complete', (evt) => {
    const graphic = measureLine(evt.vertices);
    currentPolygon.value = graphic;
    console.log(evt.vertices);
    polygonList.value = evt.vertices
    isDrawing.value = false;
    //初始化绘制
  });
};

// 结束绘制
// const stopDrawing = () => {
//   if (mouseTool.value) {
//     mouseTool.value.close();
//     isDrawing.value = false;
//   }
// };
const measureLine = (vertices) => {
  mapView.value.graphics.removeAll();
  const graphic = createPolygonGraphic(vertices, selectColor.value);
  polygonInfo.value.push(graphic);
  mapView.value.graphics.add(graphic);
  return graphic;
}
// 清除绘制
const clearDrawing = () => {
  if (mapView.value) {
    polygonInfo.value = [];
    // currentPolygon.value = null
    mapView.value.graphics.remove(currentPolygon.value);
  }
};
/** 基于名字过滤 */
const filterNode = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}
const rowdata = ref<any>({})
const handleNodeClick = async (row: { [key: string]: any }) => {
  console.log(row);
  rowdata.value = row
  ruleForm.deptId = row.id * 1
  console.log(ruleForm.deptId);
}

interface RuleForm {
  deptId: any,
  mapAddress: string,
  id: any,
  fid: any,
  longitude: any,
  latitude: any,
  regionRectangle: any,
  backgroundStyle: any,
  borderStyle: any
}

var ruleForm = reactive<RuleForm>({
  deptId: null,
  mapAddress: '',
  id: null,
  fid: null,
  longitude: null,
  latitude: null,
  regionRectangle: null,
  backgroundStyle: null,
  borderStyle: null
})

const rules = reactive<FormRules<RuleForm>>({
  deptId: [
    {
      required: true,
      message: '请选择',
      trigger: 'change',
    },
  ],
  mapAddress: [
    {
      required: true,
      message: '请输入地址',
      trigger: 'blur'
    },
  ],
})


const message = useMessage() // 消息弹窗

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      
      console.log(polygonInfo.value);
      
      if(ruleForm.id){
        RegionApi.updateRegion({
          id: ruleForm.id,
          fid: ruleForm.fid,
          deptId: ruleForm.deptId,
          latitude: ruleForm.latitude,
          longitude: ruleForm.longitude,
          mapAddress: ruleForm.mapAddress,
          regionRectangle: JSON.stringify(toRaw(polygonList.value)),
          backgroundStyle: selectColor.value,
          borderStyle: selectColor.value
        }).then(() => {
          message.success('保存成功')
          showadd.value = false
          initarea()
        })
      }else{
        console.log(1212);
        RegionApi.createRegion({
          // id: arealist.value[arealist.value.length - 1].id + 1,
          fid: rowdata.value.parentId,
          deptId: rowdata.value.id,
          latitude: 0,
          longitude: 0,
          mapAddress: ruleForm.mapAddress,
          regionRectangle: JSON.stringify(toRaw(polygonList.value)),
          backgroundStyle: selectColor.value,
          borderStyle: selectColor.value
        }).then(() => {
          message.success('保存成功')
          showadd.value = false
          initarea()
        })
      }
      // resetForm(formEl)
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 先重置表单数据
  ruleForm.deptId = null
  ruleForm.mapAddress = ''
  ruleForm.id = null
  ruleForm.fid = null
  ruleForm.longitude = null
  ruleForm.latitude = null
  ruleForm.regionRectangle = null
  ruleForm.backgroundStyle = null
  ruleForm.borderStyle = null
  // 再调用Element Plus的resetFields方法
  formEl.resetFields()
}

const handleAddarea = () => {
  showadd.value = true
  selectColor.value = '#3A7DFF'
  // 重置表单数据
  ruleForm.deptId = null
  ruleForm.mapAddress = ''
  ruleForm.id = null
  ruleForm.fid = null
  ruleForm.longitude = null
  ruleForm.latitude = null
  ruleForm.regionRectangle = null
  ruleForm.backgroundStyle = null
  ruleForm.borderStyle = null
  
  if (mapView.value) {
    console.log(polygonInfo.value[0]);
    polygonInfo.value.forEach(item =>{
      mapView.value.graphics.remove(toRaw(item));
    })
    polygonInfo.value = [];
    console.log(arealist.value);

    // mapView.value.graphics.remove(currentPolygon.value);
  }
}
const handleCancel = (formEl: FormInstance | undefined) => {
  showadd.value = false
  if (mapView.value) {
    console.log(polygonInfo.value[0]);
    polygonInfo.value.forEach(item =>{
      mapView.value.graphics.remove(toRaw(item));
    })
    polygonInfo.value = [];
    // mapView.value.graphics.remove(currentPolygon.value);
  }
  setKeyNotePolyon(arealist.value[0])
  console.log(arealist.value);
  
}

onMounted(() => {
  initMap()
  initarea()
  getTree()
})
onUnmounted(() => {
  if (mapView.value) {
    mapView.value.destroy();
    mapView.value = null;
  }
  if (gisMap.value) {
    gisMap.value.destroy()
    gisMap.value = null
  }
})
</script>
<style lang="scss" scoped>
.toList {
  position: absolute;
  top: 20px;
  right: 20px;
}

.draw-tips {
  background: #FFFFFF;
  box-shadow: 0px 2 6px 0px rgba(0, 0, 0, 0.1);
  border-radius: 4px 4px 4px 4px;
  padding: 8px 18px;
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  color: #3A7DFF;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;

  .el-icon {
    margin-right: 8px;
  }

  p {
    margin-left: 12px;

    span {
      color: #FF4D4F;
    }
  }
}

.my-marker-info {
  margin-bottom: 8px;
  white-space: nowrap;

  &:last-child {
    margin-bottom: 0;
  }

  .item {
    margin-right: 10px;

    &:last-child {
      margin-right: 0;
    }
  }

  .name {
    font-size: 12px;
    color: #666;
    line-height: 1;
  }

  .value {
    font-size: 12px;
    line-height: 1;
  }
}

.my-marker-icon {
  width: 28px;
  height: 34px;
}

.edit-card {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 340px;
  background-color: #fff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.05);
  border-radius: 8px 8px 8px 8px;

  &-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
    color: #333333;
    padding: 12px;
    border-bottom: 1px solid #EDEDED;

    &-close {
      font-size: 24px;
      color: #4E5969;
      margin-left: auto;
      cursor: pointer;

      &:hover {
        opacity: 0.6;
      }
    }
  }

  &-content {
    padding: 16px 12px;

    .at-form {
      margin-top: 24px;
    }

    .at-table {
      margin-top: 6px;
    }

    &-title {
      font-weight: 600;
      font-size: 16px;
      color: #333333;
      margin-bottom: 12px;
    }
  }

  &-footer {
    padding: 16px 12px;
    display: flex;
    justify-content: flex-end;
  }
}

.my-marker {
  width: 28px;
  height: 34px;
  background: url('../../../../assets/images/map/marker.png') no-repeat;
  background-size: 100% 100%;
  cursor: pointer;

  &.active {}
}
</style>
