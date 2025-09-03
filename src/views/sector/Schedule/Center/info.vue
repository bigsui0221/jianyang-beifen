<template>
  <ContentWrap :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <div class="w-100% flex flex-justify-between" v-if="waterAuthority">
      <el-button @click="router.back()" type="primary" >返回</el-button>
      <el-button @click="handleAdd" type="primary">审核</el-button>
    </div>
    <at-tabs :tabs="tabs" v-model="activeTab" />
    <at-info :config="infoConfig" v-if="activeTab === '0'" />
    <!-- <el-steps direction="vertical" :active="1" v-if="activeTab === '1'">
      <el-step title="Step 1" />
      <el-step title="Step 2" />
      <el-step title="Step 3" />
    </el-steps> -->
    <VueFlow style="height: 1000px;margin-top: 100px;" v-if="activeTab === '1'" :nodes="nodes" :edges="edges" :default-edge-options="{ type: 'smoothstep' }"
      fit-view-on-init>
      <template #node-custom="nodeProps">
        <!-- 开始节点的位置 -->
        <Handle type="target" :position="Position.Left" />
        <div class="node-title">{{ nodeProps.data.label }}</div>
        <div>{{ nodeProps.data.label == '上报' || nodeProps.data.label == '续报' ? '上报单位：' : '处置单位：' }} {{ nodeProps.data.handleDeptName }}</div>
        <div>{{ nodeProps.data.label == '上报' || nodeProps.data.label == '续报' ? '上报时间：' : '处置时间：' }} {{ formatToDateTime(nodeProps.data.createTime,'YYYY-MM-DD HH:mm:ss') }}</div>
        <div v-if="nodeProps.data.mystaus">任务状态：{{ nodeProps.data.mystaus }}</div>
        <!-- 结束节点的位置 -->
        <Handle type="source" :position="Position.Right" />
      </template>
    </VueFlow>
    <at-table-dialog
      v-model="dialogFormConfig.visible"
      :config="dialogFormConfig"
      @submit="submitForm"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { EventApi } from '@/api/Floodctrl/event'
import { SuperviseHandleApi } from '@/api/Floodctrl/supervisehandle'
import { formatToDateTime } from '@/utils/dateUtil'

import { VueFlow, Handle, Position  } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'
import dagre from 'dagre'

const waterAuthority = ref(true)
const message = useMessage() // 消息弹窗
const router = useRouter()
const dialogFormConfig = reactive({
  visible: false,
  formData: {} as any,
  width: '600px',
  title: '审核',
  fields: {
    eventType: {
      label: '事件类型',
      components: 'select',
      options: [
        {
          label: '突发事件',
          value: 'SUDDEN'
        },
        {
          label: '预警事件',
          value: 'EARLY_WARNING'
        },
        {
          label: '自闭环事件',
          value: 'AUTISM_LOOP'
        },
        {
          label: '多跨事件',
          value: 'MULTISPAN'
        }
      ],
      row: 24,
      required: true
    },
    submissionDeptId: {
      label: '报送对象',
      components: 'select',
      options: [],
      required: true,
      row: 16
    },
    cityCenter: {
      label: '同步城运中心',
      components: 'switch',
      required: false,
      options: [
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ],
      row: 8
    },
    processingTimeLimit: {
      label: '处理时限',
      components: 'inputNumber',
      append: '小时',
      required: true,
      row: 24
    }
  }
})

const handleAdd = () => {
  dialogFormConfig.visible = true
  dialogFormConfig.formData = {}
}
const submitForm = (data) => {
  console.log(data)
  EventApi.infoReportExamine({...data,
    eventClass: 'CONVENTION'
  }).then(() => {
    message.success('保存成功')
    dialogFormConfig.visible = false
    router.back()
  })
}

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// 颜色数组，用于不同层级的节点
const COLORS = [
  '#10D27A', // 第一层
  '#F1881C', // 第二层
  '#81D85D', // 第三层
  '#0F6DC6', // 第四层
  '#9C27B0', // 第五层
  '#E91E63', // 第六层
  '#607D8B'  // 第七层
]
 
// 转换后端数据为流程图节点和边
const transformDataToFlow = (data, parentId = null, level = 0) => {
  if (!data) return
  
  const nodeId = data.id ? data.id.toString() : Math.random().toString(36).substr(2, 9)
  const color = COLORS[level % COLORS.length]
  // const color = '#10D27A'

  // taskChildren taskDescription
  // 创建当前节点
  const newNode = {
    id: nodeId,
    type: 'custom',
    data: { 
      label: data.noteType?.desc || data.taskDescription || `未命名模型-${nodeId.slice(-4)}`,
      // version: data.version,
      handleDeptName: data.handleDeptName || data.chargeUserName,
      createTime: data.mytime ? data.mytime : data.createTime,
      mystaus: data.mystaus ? data.mystaus : null,
      // algorithmType: data.algorithmType 
    },
    style: { 
      width: '220px', 
      // height: data.algorithmType ? '80px' : '60px', 
      height: '160px',
      // border: `2px solid ${color}`,
      padding: '10px',
      backgroundColor: '#85d1eb',
      borderRadius: '5px',
      color: '#FFF'
    },
    position: { x: 0, y: 0 } // 添加默认 position 属性
  }
  
  nodes.value.push(newNode)
  
  // 如果有父节点，创建边
  if (parentId) {
    edges.value.push({
      id: `e${parentId}->${nodeId}`,
      source: parentId,
      target: nodeId,
      label: '',
      animated: true,
      style: { stroke: color  }
      //markerEnd: 'url(#arrow)'
    })
  }
  
  // 递归处理子节点
  if (data.children && data.children.length > 0) {
    data.children.forEach(child => {
      transformDataToFlow(child, nodeId, level + 1)
    })
  }
  // 递归处理子节点
  if (data.taskChildren && data.taskChildren.length > 0) {
    data.taskChildren.forEach(child => {
      transformDataToFlow(child, nodeId, level + 1)
    })
  }
}

// 使用 dagre 进行自动布局（从左到右）
const layout = () => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  // 修改为从左到右的布局
  dagreGraph.setGraph({ 
    rankdir: 'TB',  // LR 表示从左到右
    ranksep: 150,   // 层级间距
    nodesep: 100,     // 同层级节点间距
    // align: 'UL',       // 对齐方式
    // ranker: 'longest-path' // 最短路径优先排列在中间
    // ranker: 'network-simplex'
  })
 
  // 设置节点尺寸
  nodes.value.forEach(node => {
    const height = typeof node.style === 'object' && node.style?.height === '80px' ? 90 : 70
    const width = 170 // 包括 padding 和 border

    dagreGraph.setNode(node.id, { width, height })
    // dagreGraph.setNode(node.id, {
    //   width: 170, // 包括 padding 和 border
    //   height: node.style?.height === '80px' ? 90 : 70
    // })
  })
 
  // 添加边
  edges.value.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target)
  })
 
  // 计算布局
  dagre.layout(dagreGraph)

  // 计算画布边界以实现居中
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  nodes.value.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id)
    minX = Math.min(minX, nodeWithPosition.x)
    maxX = Math.max(maxX, nodeWithPosition.x)
    minY = Math.min(minY, nodeWithPosition.y)
    maxY = Math.max(maxY, nodeWithPosition.y)
  })
  
  // 计算偏移量使整体居中
  const offsetX = (minX + maxX) / 2
  const offsetY = (minY + maxY) / 2
 
  // 更新节点位置
  nodes.value = nodes.value.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const height = typeof node.style === 'object' && node.style?.height === '80px' ? 90 : 70
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - offsetX, // 居中对齐
        y: nodeWithPosition.y - offsetY - (height / 2)
      }
    }
  })
 
  // 触发响应式更新
  edges.value = [...edges.value]
}

// 查找并修改特定节点的函数
const findAndModifyTaskNodes = (node) => {
  if (!node) return
  
  // 检查当前节点是否符合条件
  if (node.noteType?.name === 'TASK_PROCESSING_PROGRESS' && node.taskChildren && Array.isArray(node.taskChildren)) {
    // 修改 taskChildren 中每个对象的 id 为 idtwo
    node.taskChildren = node.taskChildren.map(child => ({
      ...child,
      id: child.idtwo !== undefined ? child.idtwo : child.id,
      mytime: child.completionTime !== undefined ? child.completionTime : null,
      mystaus: child.taskStatus.desc !== undefined ? child.taskStatus.desc : null
    }))
  }
  
  // 递归处理所有子节点（包括 children 和 taskChildren）
  const childrenToProcess = [
    ...(node.children || []),
    ...(node.taskChildren || [])
  ]
  
  childrenToProcess.forEach(child => {
    findAndModifyTaskNodes(child)
  })
}

const getModelTreeFn = async (id: any) => {
  try {
    const res = await EventApi.getEventProcessNodesTree(id)
    console.log(res);
    
    const configurationFile = typeof res === 'string' ? JSON.parse(res) : res
    
    // 清空现有数据
    nodes.value = []
    edges.value = []
    console.log(configurationFile[0]);
    
     // 在转换数据之前查找并修改特定节点
    if (configurationFile[0]) {
      findAndModifyTaskNodes(configurationFile[0])
    }

    // 转换数据
    transformDataToFlow(configurationFile[0])
    
    console.log(nodes.value,edges.value);
    
    // 应用布局
    layout()
    
  } catch (error) {
    console.error('获取模型树失败:', error)
  }
}

const { query } = useRoute() // 查询参数

const tabs = ref([
  {
    label: '基本信息',
    value: '0'
  },
  {
    label: '流程节点',
    value: '1'
  }
])
const activeTab = ref('0')
const infoConfig = reactive({
  formData: {},
  fields: {
    eventNumber: {
      label: '信息编号'
    },
    eventTitle: {
      label: '信息标题',

      row: 8
    },
    eventStatus: {
      label: '信息状态',
      formatter: (row) => {
        return row.desc
      },
      row: 8
    },
    // value7: {
    //   label: '报送渠道',
    //   row: 8
    // },
    submissionTime: {
      label: '上报时间',

      row: 8
    },
    // value9: {
    //   label: '报送人',

    //   row: 8
    // },
    // value8: {
    //   label: '报送单位',

    //   row: 8
    // },
    incidentTime: {
      label: '事件时间',

      row: 8
    },
    mapAddress: {
      label: '事件地点',

      row: 8
    },
    // value5: {
    //   label: '信息级别',

    //   row: 8
    // },
    // value3: {
    //   label: '信息描述'
    // },
    // value6: {
    //   label: '信息来源',

    //   row: 16
    // },
    // value06: {
    //   label: '所属街道',

    //   row: 8
    // },
    // value10: {
    //   label: '信息类型',

    //   row: 16
    // },
    // value07: {
    //   label: '报送对象',

    //   row: 8
    // },
    attachmentPath: {
      label: '附件',
      components: 'uploadFile',
      row: 24,
      span: 24
    }
  }
})
onMounted(() => {
  console.log(query.id);
  const queryId = query.id as unknown as number // 从 URL 传递过来的 id 编号
  waterAuthority.value = query.waterAuthority === 'true'
  getModelTreeFn(queryId)
  EventApi.getEvent(queryId).then(res => {
    console.log(res)
    // infoConfig.formData = res
    Object.assign(infoConfig.formData, res)
  })
})
</script>
<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";


.vue-flow__handle {
  width: 10px;
  height: 10px;
  background: #555;
}
 
.node-title {
  font-weight: bold;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
 
.node-version {
  font-size: 0.8em;
  color: #aaa;
  margin-bottom: 5px;
}
 
.node-type {
  font-size: 0.8em;
  color: #ddd;
  font-style: italic;

}
</style>
