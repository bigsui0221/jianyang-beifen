<template>
  <ContentWrap class="content-wrap" :border="false" padding="20px" :body-style="{ padding: '0px' }">
    <div>
      <DeptTree @node-click="handleDeptNodeClick" @add="handleAdd" />
    </div>
    <div class="content-wrap-table">
      <div class="flex flex-justify-flex-end mb-10">
        <el-button type="primary" @click="handleSave()" v-if="activeTab">{{ activeTab ? '编辑' : '保存' }}</el-button>

      </div>

      <at-info :config="infoConfig" v-if="activeTab" />

      <el-form v-else ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="120px" class="demo-ruleForm"
      :label-position="labelPosition"
       status-icon>
        <el-form-item>
          <el-col :span="24">
            <el-form-item prop="regionId" label="行政区域：">
              <el-select-v2 v-model="ruleForm.regionId" placeholder="请选择行政区域" :options="areadata" />
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item required>
          <el-col :span="11">
            <el-form-item prop="siteDeviceType" label="类型：">
              <el-select-v2 v-model="ruleForm.siteDeviceType" placeholder="请选择设备类型" :options="options1" @change="handleSiteDeviceTypeChange"/>
            </el-form-item>
          </el-col>
          <el-col class="text-center" :span="2">
            <span class="text-gray-500"></span>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="ledReminder" label="关联设备：">
              <el-select-v2 v-model="ruleForm.ledReminder" placeholder="请选择设备" :options="Devlist" />
            </el-form-item>
          </el-col>
        </el-form-item>


        <el-form-item required>
          <el-col :span="11">
            <el-form-item prop="siteName" label="名称：">
              <el-input v-model="ruleForm.siteName" />
            </el-form-item>
          </el-col>
          <el-col class="text-center" :span="2">
            <span class="text-gray-500"></span>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="sort" label="排序：">
              <el-input v-model="ruleForm.sort" />
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item required>
          <el-col :span="11">
            <el-form-item prop="siteType" label="类型：">
              <el-select-v2 v-model="ruleForm.siteType" placeholder="请选择" :options="options2" @change="handleChange"/>
            </el-form-item>
          </el-col>
          <el-col class="text-center" :span="2">
            <span class="text-gray-500"></span>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="led" label="LED提示屏：">
              <el-select-v2 v-model="ruleForm.led" placeholder="请选择LED提示屏" :options="options3" />
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item required>
          <el-col :span="11">
            <el-form-item prop="mapAddress" label="地址：">
              
              <AtInputMap :config="ruleForm" v-model="ruleForm.mapAddress" @change="onChange" />









            </el-form-item>
          </el-col>
          <el-col class="text-center" :span="2">
            <span class="text-gray-500"></span>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="address" label="详细地址：">
              <el-input v-model="ruleForm.address" />
            </el-form-item>
          </el-col>
        </el-form-item>

        <el-form-item prop="count">
          <el-col class="text-center" :span="13">
            <span >数据设置：设计值只用作计算首页-列表数据，不做告警判断</span>
          </el-col>
        </el-form-item>

        <el-form-item prop="count" v-for="(item,index) in siteoptions" :key="index">
          <el-col class="text-center" :span="6">
            <span class="text-gray-500">设计值：</span>
          </el-col>
          <el-col :span="9">        
            <el-form-item :prop="`${item.keyarr[0]}`" :label="item.label" label-width="150px">
              <!-- <span>设计值：超警示</span> -->
              <el-select-v2 v-model="ruleForm[item.keyarr[0]]" placeholder="请选择" :options="item.op" />
            </el-form-item>
          </el-col>
          
          <el-col :span="9">
            <el-form-item :prop="`${item.keyarr[1]}`" label="值：">
              <el-input v-model="ruleForm[item.keyarr[1]]" />
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            保存
          </el-button>
          <el-button @click="cancle()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { SiteApi } from '@/api/Floodctrl/site'
import { DeptTree } from '../components'
import type { FormInstance, FormRules } from 'element-plus'
import {RegionApi} from '@/api/Floodctrl/region'
import { DeviceApi } from '@/api/Floodctrl/device'
import { DeviceAggApi } from '@/api/Floodctrl/deviceagg'

const message = useMessage() // 消息弹窗
const activeTab = ref(true)
const areadata = ref()
const orsitelist = ref<any[]>([])


interface RuleForm {

  id: number| null
  deviceId: number  | null
  regionId: number  | null
  siteDeviceType: string
  ledReminder: number  | null
  siteName: string
  sort: string
  siteType: string
  led: boolean | null
  mapAddress: string
  address: string

  gsEwlIndexType: string
  gsEwlValue: number | null
  gsWwlIndexType: string
  gsWwlValue: number | null
  rwlEwlIndexType: string
  rwlEwlValue: number | null
  rwlWwlIndexType: string
  rwlWwlValue: number | null
  rerFclIndexType: string
  rerFclValue: number | null
  rerDwlIndexType: string
  rerDwlValue: number | null
  rerCtwlIndexType: string
  rerCtwlValue: number | null
  twlWaIndexType: string
  twlWaValue: number | null
  twlWsIndexType: string
  twlWsValue: number | null
  dcgAtfIndexType: string
  dcgAtfValue: number | null
  dcgEtfIndexType: string
  dcgEtfValue: number | null
  wlSwIndexType: string
  wlSwValue: number | null
  wlSaIndexType: string
  wlSaValue: number | null
  latitude: number | null
  longitude: number | null
}
const labelPosition = ref<'right' | 'top' | 'left'>('right')
const formSize = ref('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  id: null,
  deviceId: null,
  regionId: null,
  siteDeviceType: '',
  ledReminder: null,
  siteName: '',
  sort: '',
  siteType: '',
  led: null,
  mapAddress: '',
  address: '',
  latitude: null,
  longitude: null,
  gsEwlIndexType: '',
  gsEwlValue: null,
  gsWwlIndexType: '',
  gsWwlValue:null,
  rwlEwlIndexType: '',
  rwlEwlValue:null,
  rwlWwlIndexType: '',
  rwlWwlValue:null,
  rerFclIndexType: '',
  rerFclValue:null,
  rerDwlIndexType: '',
  rerDwlValue:null,
  rerCtwlIndexType: '',
  rerCtwlValue:null,
  twlWaIndexType: '',
  twlWaValue:null,
  twlWsIndexType: '',
  twlWsValue:null,
  dcgAtfIndexType: '',
  dcgAtfValue:null,
  dcgEtfIndexType: '',
  dcgEtfValue:null,
  wlSwIndexType: '',
  wlSwValue:null,
  wlSaIndexType: '',
  wlSaValue:null

})
const INITIAL_FORM_STATE = {
  id: null,
  deviceId: null,
  regionId: null,
  siteDeviceType: '',
  ledReminder: null,
  siteName: '',
  sort: '',
  siteType: '',
  led: null,
  mapAddress: '',
  address: '',
  latitude: null,
  longitude: null,
  gsEwlIndexType: '',
  gsEwlValue: null,
  gsWwlIndexType: '',
  gsWwlValue: null,
  rwlEwlIndexType: '',
  rwlEwlValue: null,
  rwlWwlIndexType: '',
  rwlWwlValue: null,
  rerFclIndexType: '',
  rerFclValue: null,
  rerDwlIndexType: '',
  rerDwlValue: null,
  rerCtwlIndexType: '',
  rerCtwlValue: null,
  twlWaIndexType: '',
  twlWaValue: null,
  twlWsIndexType: '',
  twlWsValue: null,
  dcgAtfIndexType: '',
  dcgAtfValue: null,
  dcgEtfIndexType: '',
  dcgEtfValue: null,
  wlSwIndexType: '',
  wlSwValue: null,
  wlSaIndexType: '',
  wlSaValue: null
}

const rules = reactive<FormRules<RuleForm>>({
  regionId: [
     {
      required: true,
      message: '请选择',
      trigger: 'change',
    },
  ],
  siteDeviceType: [
    {
      required: true,
      message: '请选择',
      trigger: 'change',
    },
  ],
  siteName: [
    {
      required: true,
      message: '请输入',
      trigger: 'blur',
    },
  ],
  siteType: [
    {
      required: true,
      message: '请选择',
      trigger: 'change',
    },
  ],
  mapAddress: [
    {
      required: true,
      message: '请选择',
      trigger: 'change',
    },
  ],
})
const onChange =  (val) => {
  console.log(val);
  ruleForm.mapAddress = val.mapAddress
  ruleForm.longitude = val.longitude
  ruleForm.latitude = val.latitude
}
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log(valid,fields,ruleForm);

      console.log('submit!')
      if(ruleForm.id){
        SiteApi.updateSite(ruleForm).then(() => { 
          message.success('修改成功')
          activeTab.value = true
          getsitelist()
        })
      }else{
        SiteApi.createSite(ruleForm).then(() => { 
          message.success('保存成功')
          activeTab.value = true

        })
      }
      
    } else {
      message.error('保存失败,请检查数据项')
      console.log('error submit!', fields)
    }
  })
}


const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`,
}))
const options2 = [
  { label: '水位站', value: 'GAUGING_STATION' },
  { label: '河道水位', value: 'RIVER_WATER_LEVEL' },
  { label: '水库', value: 'RESERVOIR' },
  { label: '隧道水位', value: 'TUNNEL_WATER_LEVEL' },
  { label: '流量', value: 'DISCHARGE' },
  { label: '内涝', value: 'WATERLOGGING' },

  { label: '简易雨量站', value: 'RAIN_SIMPLE_STATION' },
  { label: '雨量站', value: 'RAIN_STATION' },
  { label: '水位雨量站', value: 'WATER_RAIN_STATION' },
  // { label: '水文站', value: 'WATER_HYDROLOGY' },
  // { label: '供水取水量', value: 'WATER_SUPPLY_AND_WITHDRAWAL' },
  // { label: '渠道流量', value: 'CHANNEL_FLOW' },
  // { label: '重要断面流量', value: 'KEY_SECTION_FLOW' },

]
const options1 = [
  { label: '聚合设备', value: 'AGG_DEVICE' },
  { label: '设备', value: 'DEVICE' },
]
const options3 = [
  { label: 'LED提示屏', value: true }
]
var sitedatalist = [
  {
    siteType: 'GAUGING_STATION',
    options: [
      {
        label: '保证水位指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['gsEwlIndexType','gsEwlValue'],
      },
      {
        label: '警戒指标类型', op	: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['gsWwlIndexType','gsWwlValue'],
      }
    ]
  },
  {
    siteType: 'RIVER_WATER_LEVEL',
    options: [
      {
        label: '保证水位指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rwlEwlIndexType','rwlEwlValue'],

      },
      {
        label: '警戒指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rwlWwlIndexType','rwlWwlValue'],

      }
    ]
  },
  {
    siteType: 'RESERVOIR',
    options: [
      {
        label: '汛限水位指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rerFclIndexType','rerFclValue'],
      },
      {
        label: '设计水位指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rerDwlIndexType','rerDwlValue'],
      },
      {
        label: '校核水位指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rerCtwlIndexType','rerDwlValue'],
      }
    ]
  },
  {
    siteType: 'TUNNEL_WATER_LEVEL',
    options: [
      {
        label: '警示水位指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['twlWaIndexType','twlWaValue'],

      },
      {
        label: '警戒水位指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['twlWsIndexType','twlWsValue'],
      }
    ]
  },
  {
    siteType: 'DISCHARGE',
    options: [
      {
        label: '警戒流量指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['dcgAtfIndexType','dcgAtfValue'],

      },
      {
        label: '保证流量指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['dcgEtfIndexType','dcgEtfValue'],
      }
    ]
  },
  {
    siteType: 'WATERLOGGING',
    options: [
      {
        label: '超警示指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['wlSwIndexType','wlSwValue'],
      },
      {
        label: '超警戒指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['wlSaIndexType','wlSaValue'],
      }
    ]
  },
  // 7，8，9的keyarr都一样
  {
    siteType: 'RAIN_SIMPLE_STATION',
    options: [
      {
        label: '超警示指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rainSwIndexType','rainSwValue'],
      },
      {
        label: '超警戒指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rainSaIndexType','rainSaValue'],
      }
    ]
  },
  {
    siteType: 'RAIN_STATION',
    options: [
      {
        label: '超警示指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rainSwIndexType','rainSwValue'],
      },
      {
        label: '超警戒指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rainSaIndexType','rainSaValue'],
      }
    ]
  },
  {
    siteType: 'WATER_RAIN_STATION',
    options: [
      {
        label: '超警示指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rainSwIndexType','rainSwValue'],
      },
      {
        label: '超警戒指标类型', op: [
          { label: '水位', value: 'WATER_LEVEL' },
          { label: '降雨量', value: 'RAINFALL' },
          { label: '流量', value: 'DISCHARGE' },   
        ],
        keyarr: ['rainSaIndexType','rainSaValue'],
      }
    ]
  },
  // 10，11，12，13的keyarr没有
  // {
  //   siteType: 'WATER_HYDROLOGY',
  //   options: [
  //     {
  //       label: '超警示指标类型', op: [
  //         { label: '水位', value: 'WATER_LEVEL' },
  //         { label: '降雨量', value: 'RAINFALL' },
  //         { label: '流量', value: 'DISCHARGE' },   
  //       ],
  //       keyarr: ['wlSwIndexType','wlSwValue'],
  //     },
  //     {
  //       label: '超警戒指标类型', op: [
  //         { label: '水位', value: 'WATER_LEVEL' },
  //         { label: '降雨量', value: 'RAINFALL' },
  //         { label: '流量', value: 'DISCHARGE' },   
  //       ],
  //       keyarr: ['wlSaIndexType','wlSaValue'],
  //     }
  //   ]
  // },
  // {
  //   siteType: 'WATER_SUPPLY_AND_WITHDRAWAL',
  //   options: [
  //     {
  //       label: '超警示指标类型', op: [
  //         { label: '水位', value: 'WATER_LEVEL' },
  //         { label: '降雨量', value: 'RAINFALL' },
  //         { label: '流量', value: 'DISCHARGE' },   
  //       ],
  //       keyarr: ['wlSwIndexType','wlSwValue'],
  //     },
  //     {
  //       label: '超警戒指标类型', op: [
  //         { label: '水位', value: 'WATER_LEVEL' },
  //         { label: '降雨量', value: 'RAINFALL' },
  //         { label: '流量', value: 'DISCHARGE' },   
  //       ],
  //       keyarr: ['wlSaIndexType','wlSaValue'],
  //     }
  //   ]
  // },
  // {
  //   siteType: 'CHANNEL_FLOW',
  //   options: [
  //     {
  //       label: '超警示指标类型', op: [
  //         { label: '水位', value: 'WATER_LEVEL' },
  //         { label: '降雨量', value: 'RAINFALL' },
  //         { label: '流量', value: 'DISCHARGE' },   
  //       ],
  //       keyarr: ['wlSwIndexType','wlSwValue'],
  //     },
  //     {
  //       label: '超警戒指标类型', op: [
  //         { label: '水位', value: 'WATER_LEVEL' },
  //         { label: '降雨量', value: 'RAINFALL' },
  //         { label: '流量', value: 'DISCHARGE' },   
  //       ],
  //       keyarr: ['wlSaIndexType','wlSaValue'],
  //     }
  //   ]
  // },
  // {
  //   siteType: 'KEY_SECTION_FLOW',
  //   options: [
  //     {
  //       label: '超警示指标类型', op: [
  //         { label: '水位', value: 'WATER_LEVEL' },
  //         { label: '降雨量', value: 'RAINFALL' },
  //         { label: '流量', value: 'DISCHARGE' },   
  //       ],
  //       keyarr: ['wlSwIndexType','wlSwValue'],
  //     },
  //     {
  //       label: '超警戒指标类型', op: [
  //         { label: '水位', value: 'WATER_LEVEL' },
  //         { label: '降雨量', value: 'RAINFALL' },
  //         { label: '流量', value: 'DISCHARGE' },   
  //       ],
  //       keyarr: ['wlSaIndexType','wlSaValue'],
  //     }
  //   ]
  // },
]
var siteoptions = ref()

const handleChange = (val) => { 
  console.log(val);
  const list = sitedatalist.filter((item)=>{ return item.siteType === val})
  console.log(list);
  siteoptions.value = list[0].options
}
const handleSiteDeviceTypeChange = (val) => {
  console.log(val);
  if(val === 'AGG_DEVICE'){
    Devlist.value = devagglist.value
  }else{
    Devlist.value = devlist.value
  }
}
const Devlist = ref<any[]>([])
const devlist = ref<any[]>([])
const devagglist = ref<any[]>([])
const infoConfig = reactive({
  formData: {} as any,
  fields: {
    title1: {
      label: '站点信息',
      components: 'title',
    },
    siteName: {
      label: '名称',
      row: 12
    },
    siteType: {
      label: '类型',
      row: 12,
      formatter: (row) => {
        console.log(row);

        return row.desc
      }
    },
    siteDeviceType: {
      label: '关联设备',
      row: 12,
      formatter: (row) => {
        return row.desc
      }
    },
    sort: {
      label: '排序',
      row: 12
    },
    mapAddress: {
      label: '地址',
      row: 12
    },
    ledReminder: {
      label: '设备',
      row: 12,
      // options: Devlist.value,
      // components: 'select',
    },
  //   value7: {
  //     label: '数据',
  //     row: 12
  //   },
  }
})
const handleSave = () => {
  
  if (activeTab.value) {
    activeTab.value = !activeTab.value
    console.log(infoConfig.formData.siteType.name);
    
    if(infoConfig.formData.siteType.name){
      infoConfig.formData.siteType =  infoConfig.formData.siteType.name
      const lists = sitedatalist.filter((item)=>{ return item.siteType === infoConfig.formData.siteType})
      console.log(lists);
      siteoptions.value = lists[0].options
      siteoptions.value.forEach((item) => { 
        infoConfig.formData[item.keyarr[0]] = infoConfig.formData[item.keyarr[0]].name
      })



      if(infoConfig.formData.siteDeviceType.name === 'AGG_DEVICE'){
        Devlist.value = devagglist.value
      }else{
        Devlist.value = devlist.value
      }

      infoConfig.formData.siteDeviceType =  infoConfig.formData.siteDeviceType.name

    }
    


    Object.assign(ruleForm, infoConfig.formData)
    console.log(infoConfig.formData.siteType);
    //新增的三个类型没有在以前存的类型里面，所以遍历不到
    const list = sitedatalist.filter((item)=>{ return item.siteType === infoConfig.formData.siteType})
    console.log(list);
    if(list.length > 0) {
      siteoptions.value = list[0].options
    }

    
  } else {
    console.log(22222, ruleFormRef.value);
    message.error('请保存表单信息或者取消后再新增')
    // activeTab.value = false
  }
}
const handleAdd = () => { 
  activeTab.value = false
  resetForm()
}
const resetForm = () => {
  Object.assign(ruleForm, INITIAL_FORM_STATE)
}
const cancle = () => {
  activeTab.value = true
  const temp = orsitelist.value.filter((item) => { return item.id === infoConfig.formData.id })
  handleDeptNodeClick(temp[0])
}
const handleDeptNodeClick = (node: any) => {
  console.log('handleDeptNodeClick', node);
  activeTab.value = true
  Object.assign(infoConfig.formData, node)

  if(infoConfig.formData.siteDeviceType.name === 'AGG_DEVICE'){
    Devlist.value = devagglist.value
  }else{
    Devlist.value = devlist.value
  }
  if(infoConfig.formData.ledReminder){
    infoConfig.formData.ledReminder = Devlist.value.filter((item) => {return infoConfig.formData.ledReminder == item.value})[0].label
  }
  // infoConfig.fields.deviceId.options = Devlist.value
  console.log(infoConfig.formData);
  
}
const getRegion = async () => {
  const res = await RegionApi.getRegionPage({
    pageNo: 1,
    pageSize: 1000,
  })
  console.log(res.list);
  areadata.value = res.list.map((item: any) => { 
    return { 
      label: item.regionName,
      value: item.id,
    }
  })
}
const getdevice = async () => { 
  const res = await DeviceApi.getDevicePage({
    pageNo: 1,
    pageSize: 1000,
  })
  console.log(res.list);
  devlist.value = res.list.map((item: any) => { 
    return { 
      label: item.deviceName,
      value: item.deviceId * 1,
    }
  })
  console.log(devlist.value);
  getdeviceagg()
}
const getdeviceagg = async () => { 
  const res = await DeviceAggApi.getDeviceAggPage({
    pageNo: 1,
    pageSize: 1000,
  })
  console.log(res.list,infoConfig.formData.deviceId);
  devagglist.value = res.list.map((item: any) => { 
    return { 
      label: item.aggName,
      value: item.deviceId * 1,
    }
  })
  if(infoConfig.formData.siteDeviceType.name === 'AGG_DEVICE'){
    Devlist.value = devagglist.value
  }else{
    Devlist.value = devlist.value
  }
  if(infoConfig.formData.ledReminder){
    infoConfig.formData.ledReminder = Devlist.value.filter((item) => {return infoConfig.formData.ledReminder == item.value})[0].label
  }
  console.log(infoConfig.formData.deviceId);
  
}
const getsitelist = () =>{
  SiteApi.getSitePage({
    pageNo: 1,
    pageSize: 1000,
  }).then((res) => {
    console.log(res);
    if (res.list.length > 0) {
      orsitelist.value = res.list
      Object.assign(infoConfig.formData, res.list[0])
      
      console.log(infoConfig.formData);
    }
    getdevice()

  })
}

onMounted(() => {
 getsitelist()
 getRegion()
})
</script>
<style lang="scss" scoped>
.content-wrap {
  > :deep(.el-card__body) {
    display: flex;
  }

  .content-wrap-table {
    flex: 1;
    margin-left: 50px;
  }
}
</style>
