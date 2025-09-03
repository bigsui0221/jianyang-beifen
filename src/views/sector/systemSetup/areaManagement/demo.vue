<template>
  <div id="mapContainer" v-loading="isLoading"
    :element-loading-background="`rgba(${loadingText == '地图加载中...' ? '255,255,255,0.9' : '0,0,0,0'})`"
    :element-loading-text="loadingText" :element-loading-spinner="`${loadingText == '地图加载中...' ? '' : ' '}`"></div>
  <!-- 搜索区 -->
  <at-map-search :map="map" @click="handleSearch" />
  <!-- 绘制提示 -->
  <div class="draw-tips" v-if="isDrawing">
    <el-icon>
      <InfoFilled />
    </el-icon>帮助提示<p>点击鼠标左键绘制分区，<span>双击左键</span>或者<span>单击右键</span>完成绘制</p>
  </div>
  <at-marker v-for="item in keynoteList" :key="`keynote${item.id}`" :ref="(el) => { refs[`keynote${item.id}`] = el }"
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
  </at-marker>
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
    
    <el-button type="primary" class="w-70 ml-7 mt-5 mb-20" @click="handleAddarea" v-if="!showadd">新建区域</el-button>
    
    <div v-if="!showadd">
      <div v-for="item in arealist" :key="item.id" class="mb-20 ml-10" style="color: gray;">
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
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)">保存</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Close, InfoFilled } from '@element-plus/icons-vue'
import { RegionApi } from '@/api/Floodctrl/region'
import { Search } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const map = ref<any>(null)
const mouseTool = ref<any>(null)
const isLoading = ref<boolean>(true)
const loadingText = ref<string>('地图加载中...')
const isDrawing = ref<boolean>(false)

const kewowrd = ref<string>('')

const value = ref()


import { ElTree } from 'element-plus'

import * as DeptApi from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'


const deptList = ref<Tree[]>([]) // 树形结构
const treeRef = ref<InstanceType<typeof ElTree>>()

/** 获得部门树 */
const getTree = async () => {
  const res = await DeptApi.getSimpleDeptList()
  deptList.value = []
  deptList.value.push(...handleTree(res))
}

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
  mapAddress: string

}

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  deptId: null,
  mapAddress: '',
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
      
      console.log(JSON.stringify(polygonInfo.value),toString.call(ruleForm.deptId));
      
      RegionApi.createRegion({
        id: arealist.value[arealist.value.length - 1].id + 1,
        fid: rowdata.value.parentId,
        deptId: rowdata.value.id,
        latitude: 0,
        longitude: 0,
        mapAddress: ruleForm.mapAddress,
        regionRectangle: JSON.stringify(polygonInfo.value),
        backgroundStyle: selectColor.value,
        borderStyle: selectColor.value
      }).then(() => {
        message.success('添加成功')
        initarea()
      })
      resetForm(formEl)
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const showadd = ref<boolean>(false)
const arealist = ref<any>([])

const polygonInfo = ref<[number, number][]>([])
const currentPolygon = ref<any>(null)
const selectColor = ref<string>('#3A7DFF')
const refs = ref<any>({})
const keynoteList = reactive<any[]>([
  { id: 1, waterResourceName: '测试1', longitude: 104.567121, latitude: 30.399821 },
  { id: 2, waterResourceName: '测试2', longitude: 104.557101, latitude: 30.389841 }])


const handleSearch = (data) => {
  map.value.setCenter(data)
}
const initarea = () => { 
  RegionApi.getRegionPage({ pageNo: 1, pageSize: 100 }).then((res)=>{
    // console.log(res);
    arealist.value = res.list
  })
}
const handleSearcharea = () => {
  console.log('handleSearcharea',kewowrd.value);
  arealist.value = arealist.value.filter((item) => item.mapAddress == kewowrd.value)
  
  console.log(arealist.value);
}
const handleAddarea = () => {
  showadd.value = true
}
const handleCancel = () => {
  showadd.value = false
}
const handlePos = (row) => {

}
const handleDel = (row) => {

}

const setKeynoteListMarker = () => {
  keynoteList.forEach((item) => {
    let marker = setMarker(`keynote${item.id}`, [item.longitude, item.latitude])
    map.value.add(marker)
  })
}
/**
 * 设置自定义点
 * @param refValue 
 * @param position 
 * @param extData 
 */
const setMarker = (refValue, position, extData = null) => {
  let dom = refs.value[refValue];
  if (Array.isArray(dom)) {
    dom = dom[0].$el;
  } else {
    dom = dom.$el;
  }

  // 创建自定义marker
  let marker = new window.AMap.Marker({
    content: dom,
    position: position, //位置
    offset: new window.AMap.Pixel(0, 0), //偏移
    anchor: "bottom-center",
    extData: extData,
  });
  return marker;
}
/**
 * 设置自定义线
 */
const setPolyline = () => {
  if (!map.value) return;

  // 线的路径点（经纬度数组）
  const path: [number, number][] = [
    [104.567121, 30.399821], // 起点
    [104.557101, 30.389841],  // 途经点
    [104.547101, 30.379841]  // 终点
  ];

  // 创建线实例
  const polyline = new window.AMap.Polyline({
    path: path, // 线的路径
    strokeColor: '#00b533', // 线条颜色
    strokeWeight: 2, // 线条宽度
    strokeOpacity: 0.8, // 线条透明度
    strokeStyle: 'solid', // 线条样式（solid/dashed）
    // 若是虚线，可配置虚线样式
    // strokeDasharray: [10, 5] // 实线10px，间隔5px
  });

  // 添加线到地图
  map.value.add(polyline);
};
/**
 * 设置自定义面
 */
const setPolygon = () => {
  if (!map.value) return;
  const path: [number, number][] = [
    [104.567121, 30.399821],
    [104.457101, 30.389841],
    [104.547101, 30.379841],
    [104.567121, 30.399821] // 最后一个点与第一个点相同，确保图形封闭
  ];
  const polygon = new window.AMap.Polygon({
    path: path,
    strokeColor: '#3A7DFF',
    strokeWeight: 2,
    strokeOpacity: 0.8,
    strokeStyle: 'dashed',
    fillColor: '#3A7DFF', // 填充颜色
    fillOpacity: 0.3 // 填充透明度
  });
  map.value.add(polygon);
};

const initMap = () => {
  map.value = new window.AMap.Map('mapContainer', {
    // 设置地图容器id
    viewMode: '3D', // 是否为3D地图模式
    zoom: 14, // 初始化地图级别
    center: [104.557101, 30.389841], // 初始化地图中心点位置
  })
  map.value.on('complete', () => {
    isLoading.value = false
    setKeynoteListMarker();
    setPolyline()
    setPolygon()
  })

  window.AMap.plugin(['AMap.MouseTool'], () => {
    mouseTool.value = new window.AMap.MouseTool(map.value);
    // 监听绘制完成事件
    mouseTool.value.on('draw', (e: any) => {
      if (e.obj instanceof window.AMap.Polygon) {
        const path = e.obj.getPath();
        currentPolygon.value = e.obj;
        console.log(path);
        
        polygonInfo.value = path.map(point => `[${point.lng}, ${point.lat}]`)
        stopDrawing();
      }
    });
  })
}
const changeSelectColor = (color) => {
  currentPolygon.value.setOptions({
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    strokeStyle: 'dashed',
    fillColor: color,
    fillOpacity: 0.3
  })
}

// 开始绘制
const startDrawing = () => {
  if (mouseTool.value) {
    mouseTool.value.polygon({
      strokeColor: selectColor.value,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      strokeStyle: 'dashed',
      fillColor: selectColor.value,
      fillOpacity: 0.3
    });
    isDrawing.value = true;
  }
};

// 结束绘制
const stopDrawing = () => {
  if (mouseTool.value) {
    mouseTool.value.close();
    isDrawing.value = false;
  }
};

// 清除绘制
const clearDrawing = () => {
  if (mouseTool.value) {
    // mouseTool.value.clear();
    polygonInfo.value = [];
    map.value.remove(currentPolygon.value);
  }
};
onMounted(() => {
  initMap()
  initarea()
  getTree()
})
</script>
<style lang="scss" scoped>
#mapContainer {
  width: calc(100% + 40px);
  height: calc(100vh - 56px);
  margin: -20px;
}

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