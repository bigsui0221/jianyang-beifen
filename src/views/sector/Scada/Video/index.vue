<template>
  <at-title title="视频墙">
    <template #right>
      <div class="opt-box">
        <el-button type="primary" @click="$router.push('/scada/video/image')">图像站</el-button>
        <el-button type="primary" @click="$router.push('/scada/video/map')">地图</el-button>
      </div>
    </template>
  </at-title>
  <div class="inspection">
    <div class="filter" v-if="waterWorkList.length > 0">
      <div class="filter-box" v-for="item in waterWorkList" :key="item.id" :class="{ open: open[item.id] }">
        <div class="filter-box-title" :class="{ active: currentSelect == item.id }" @click="changeProcess(item)">
          {{ item.factoryName }}
          <img v-if="currentSelect == item.id" class="active-icon" src="@/assets/imgs/floodctrl/video/icon-5.png" />
          <el-icon v-if="open[item.id]" @click="onToggle(item.id)">
            <ArrowUp />
          </el-icon>
          <el-icon v-else @click="onToggle(item.id)">
            <ArrowDown />
          </el-icon>
        </div>
        <div class="filter-box-list">
          <div class="filter-box-list-item" v-for="video in videoDataList" :key="video.id" :class="video.factoryId + '_' + video.id === currentSelect ? 'active' : ''
            " @click="changeVideoItem(video)">
            {{ video.videoName }}
            <img class="active-icon" src="@/assets/imgs/floodctrl/video/icon-5.png" />
          </div>
        </div>
      </div>
    </div>
    <div class="right">
      <!-- 监控列表 -->
      <div class="inspection-main" :class="`type${currentMode}`">
        <div class="inspection-main-head" v-if="currentMode > 0">
          <div class="name">
            {{ bindMode?.[selectModeIndex]?.videoName ?? "" }}
          </div>
          <div class="btn-group">
            <div class="btn btn-1" :class="{ active: currentMode === 1 }" @click="onModeClick(1)"></div>
            <div class="btn btn-2" :class="{ active: currentMode === 2 }" @click="onModeClick(2)"></div>
            <div class="btn btn-4" :class="{ active: currentMode === 4 }" @click="onModeClick(4)"></div>
          </div>
        </div>
        <div class="inspection-main-list">
          <div class="inspection-main-list-item" v-for="(item, index) in videoList" :key="index"
            :class="{ active: selectModeIndex === index }" @click="onSelectModeClick(index)">
            <div class="item" v-if="item">
              <video-player ref="videoPlayer" v-if="currentMode > 0" :url="item.videoUrl" :title="item.videoName"
                :controls="false" />
              <img v-else :src="item.snapUrl" alt="" />
              <div class="btn" @click.stop="setCurrentPlayVideo(item)">
                <el-icon>
                  <FullScreen />
                </el-icon>
              </div>
              <div class="footer">
                {{ item.videoName }}
              </div>
            </div>
            <div class="item-no" v-else>
              <p>选择视频进行展示</p>
              <p>先选择展示区域，再选择左侧监控</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 监控弹框 -->
    <div class="video-pops" v-if="lookVideo">
      <el-button type="primary" :icon="Close" @click="closeVideo()" />
      <div class="inspection-main-video">
        <video-player ref="videoPlayer" v-if="currentPlayVideo && currentPlayVideo.videoUrl"
          :url="currentPlayVideo.videoUrl" :title="currentPlayVideo.videoName" />
        <div class="not-get-device" v-if="!currentPlayVideo || !currentPlayVideo.videoUrl">
          当前暂未获取到设备！
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowUp, ArrowDown, FullScreen, Close } from "@element-plus/icons-vue";
import VideoPlayer from "./VideoPlayers.vue";
const message = useMessage();
const waterWorkList = reactive<any[]>([])

const aiSelect = reactive([true, false])
const videoDataList = reactive<any[]>([])// 视频数据列表
const currentPlayVideo = reactive<any>({}) // 当前播放视频
const lookVideo = ref(false)

const open = reactive<any>({})
const currentSelect = ref<string | null>(null)// 当前选中
const currentMode = ref(0) // 当前模式 0:列表 1:单列 2:双列 3:三列 4:四列'
const bindMode = reactive<any[]>([])//绑定关系
const selectModeIndex = ref(0) //当前右侧选中项

const videoList = computed(() => {
  return currentMode.value === 0 ? videoDataList : bindMode;
})

const onToggle = (id) => {
  open[id] = !open[id];
}
// 切换水厂
const changeProcess = (item) => {
  if (currentSelect.value == item.id) {
    return;
  }
  currentMode.value = 0;
  bindMode.length = 0;
  currentSelect.value = item.id;
  getInspectionVideoList();
}
/**
 * 点击切换视频
 * @param item
 */
const changeVideoItem = (item) => {
  if (currentMode.value == 0) {
    currentMode.value = 1;
    selectModeIndex.value = 0;
  }
  currentSelect.value = item.factoryId + "_" + item.id;
  let index = bindMode.findIndex(
    (video: any) =>
      video && video.factoryId + "_" + video.id === currentSelect.value
  );
  if (index > -1) bindMode.splice(index, 1, null);
  bindMode.splice(selectModeIndex.value, 1, item);
}
/**
 * 点击切换模式
 */
const onModeClick = (mode) => {
  currentMode.value = mode;
  if (bindMode.length < mode) {
    let arr = videoDataList.filter((e: any) => {
      return (
        bindMode.findIndex(
          (item: any) =>
            item &&
            item.factoryId + "_" + item.id === e.factoryId + "_" + e.id
        ) === -1
      );
    });
    for (let i = 0; i < mode; i++) {
      if (!bindMode[i]) {
        bindMode[i] = arr[0];
        arr.splice(0, 1);
      }
    }
    bindMode.push(...new Array(mode - bindMode.length).fill(null));
  }
  if (bindMode.length > mode) {
    if (selectModeIndex.value > mode - 1) {
      const temp = bindMode.slice(
        selectModeIndex.value - mode + 1,
        selectModeIndex.value + 1
      );
      bindMode.splice(0, bindMode.length, ...temp);
    } else {
      const temp = bindMode.slice(0, mode);
      bindMode.splice(0, bindMode.length, ...temp);
    }
    selectModeIndex.value = bindMode.findIndex(
      (video) =>
        video && video.factoryId + "_" + video.id === currentSelect.value
    );
    // currentSelect.value =
    //   bindMode[0].factoryId + "_" + bindMode[0].id;
  }
}
const onSelectModeClick = (index) => {
  if (currentMode.value === 0) {
    currentMode.value = 1;
    currentSelect.value =
      videoDataList[index].factoryId +
      "_" +
      videoDataList[index].id;
    bindMode.splice(0, bindMode.length, videoDataList[index]);
  } else {
    if (bindMode[index]) {
      currentSelect.value =
        bindMode[index].factoryId + "_" + bindMode[index].id;
    } else {
      currentSelect.value = null;
    }
    selectModeIndex.value = index;
  }
}
// 获取视频列表
const getInspectionVideoList = () => {
  videoDataList.length = 0;
  videoDataList.push(...[
    {
      "createTime": null,
      "updateTime": null,
      "creator": null,
      "updater": null,
      "deleted": false,
      "id": 8,
      "videoName": "视频监控",
      "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
      "hlsVideoUrl": "http://61.166.149.53:8990/aotu-media/xgll0401/hls.m3u8",
      "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll0401.png",
      "unitCode": "SSBF",
      "cameraCode": null,
      "platform": "COMMON",
      "factoryId": 1
    },
    {
      "createTime": null,
      "updateTime": null,
      "creator": null,
      "updater": null,
      "deleted": false,
      "id": 9,
      "videoName": "视频监控",
      "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
      "hlsVideoUrl": "http://61.166.149.53:8990/aotu-media/xgll0402/hls.m3u8",
      "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll0402.png",
      "unitCode": "SSBF",
      "cameraCode": null,
      "platform": "COMMON",
      "factoryId": 1
    },
    {
      "createTime": null,
      "updateTime": null,
      "creator": null,
      "updater": null,
      "deleted": false,
      "id": 10,
      "videoName": "视频监控",
      "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
      "hlsVideoUrl": "http://61.166.149.53:8990/aotu-media/xgll0403/hls.m3u8",
      "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll05.png",
      "unitCode": "SSBF",
      "cameraCode": null,
      "platform": "COMMON",
      "factoryId": 1
    },
    {
      "createTime": null,
      "updateTime": null,
      "creator": null,
      "updater": null,
      "deleted": false,
      "id": 11,
      "videoName": "视频监控",
      "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
      "hlsVideoUrl": "http://61.166.149.53:8990/aotu-media/xgll0404/hls.m3u8",
      "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll0404.png",
      "unitCode": "SSBF",
      "cameraCode": null,
      "platform": "COMMON",
      "factoryId": 1
    },
    {
      "createTime": null,
      "updateTime": null,
      "creator": null,
      "updater": null,
      "deleted": false,
      "id": 12,
      "videoName": "视频监控",
      "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
      "hlsVideoUrl": "http://61.166.149.53:8990/aotu-media/xgll0405/hls.m3u8",
      "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll0405.png",
      "unitCode": "SSBF",
      "cameraCode": null,
      "platform": "COMMON",
      "factoryId": 1
    },
    {
      "createTime": null,
      "updateTime": null,
      "creator": null,
      "updater": null,
      "deleted": false,
      "id": 13,
      "videoName": "视频监控",
      "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
      "hlsVideoUrl": "http://61.166.149.53:8990/aotu-media/xgll0406/hls.m3u8",
      "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll05.png",
      "unitCode": "SSBF",
      "cameraCode": null,
      "platform": "COMMON",
      "factoryId": 1
    },
    {
      "createTime": null,
      "updateTime": null,
      "creator": null,
      "updater": null,
      "deleted": false,
      "id": 14,
      "videoName": "视频监控",
      "videoUrl": "https://media.zhsw.wiseaotu.com:443/sms/34020000002020000001/flv/hls/34020000001110000001_34020000001320000014.flv",
      "hlsVideoUrl": "http://61.166.149.53:8990/aotu-media/xgll0407/hls.m3u8",
      "snapUrl": "http://minio.zhsw.wiseaotu.com/zhsw/136/SYSTEM/xgll05.png",
      "unitCode": "SSBF",
      "cameraCode": null,
      "platform": "COMMON",
      "factoryId": 1
    },

  ]);
}
// 设备功能切换
const changeSelect = (index) => {
  const temp = aiSelect.map((item, aIndex) => {
    if (index == aIndex) {
      return !item;
    }
    return item;
  });
  aiSelect.splice(0, aiSelect.length, ...temp);
}

// 设置当前播放视频
const setCurrentPlayVideo = (videoData) => {
  if (videoData && videoData.videoUrl) {
    Object.assign(currentPlayVideo, videoData);
    lookVideo.value = true;
  } else {
    message.error("视频播放出错，请重试！");
  }
}
// 关闭弹框
const closeVideo = () => {
  Object.keys(currentPlayVideo).forEach(key => {
    delete currentPlayVideo[key];
  });
  lookVideo.value = false;
}
onMounted(() => {
  waterWorkList.push({
    "factoryName": "视频监控",
    "factoryLogo": null,
    "factoryCoordinates": null,
    "clockRange": null,
    "designAmount": 25000.0,
    "factoryShortName": null,
    "treatmentProcess": null,
    "waterStandard": null,
    "factoryType": null,
    "factoryZone": null,
    "factoryAddress": null,
    "managerName": null,
    "mangerPhone": null,
    "factoryStatus": "1",
    "onlineStatus": "ON",
    "waterStatus": "GOOD",
    "id": 1,
    "createTime": null
  })
  open[1] = true;
  changeProcess(waterWorkList[0])
  getInspectionVideoList();
})
</script>

<style lang="scss" scoped>
.at-title {
  .opt-box {
    display: flex;
    align-items: center;
    justify-content: end;
    margin-bottom: 12px;
    margin-left: auto;
  }
}

.inspection {
  position: relative;
  display: flex;
  border-radius: 8px;
  min-height: calc(100vh - 56px - 20px - 20px - 44px);

  .filter {
    position: fixed;
    width: 312px;
    background: #192c46;
    border: 1px solid #2a4268;
    flex-shrink: 0;
    padding: 16px;
    overflow-y: auto;
    height: calc(100vh - 56px - 20px - 20px - 44px);

    &-box {
      // padding: 0 12px;

      &.open {
        .filter-box-list {
          height: auto;
        }
      }

      &-title {
        height: 44px;
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 14px;
        color: #ffffff;
        padding: 0 12px;
        border: 2px solid transparent;
        cursor: pointer;

        .active-icon {
          &+i {
            margin-left: 4px;
          }
        }

        i {
          margin-left: auto;
          font-size: 16px;
        }

        &:hover,
        &.active {
          background: #192c46;
          box-shadow: inset 0px 0px 12px 0px #4a90fa;
          border-radius: 4px 4px 4px 4px;
          border-color: #4a90fa;
          font-weight: 500;
          color: #4a90fa;
        }

        &.active {
          .active-icon {
            display: block;
          }
        }
      }

      &-list {
        interpolate-size: allow-keywords;
        height: 0;
        transition: all 0.3s;
        overflow: hidden;

        &-item {
          margin-top: 8px;
          height: 44px;
          padding: 0 12px 0 26px;
          display: flex;
          align-items: center;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
          border: 2px solid transparent;
          cursor: pointer;

          &:hover,
          &.active {
            background: #192c46;
            box-shadow: inset 0px 0px 12px 0px #4a90fa;
            border-radius: 4px 4px 4px 4px;
            border-color: #4a90fa;
            font-weight: 500;
            color: #4a90fa;
          }

          &.active {
            .active-icon {
              display: block;
            }
          }
        }
      }

      .active-icon {
        display: none;
        width: 20px;
        height: 20px;
        margin-left: auto;
      }
    }
  }

  .right {
    flex: 1;
    margin-left: calc(312px + 16px);
    display: flex;
    flex-direction: column;
  }

  &-main {
    flex: 1;
    background: #192c46;
    border: 1px solid #2a4268;

    &.type0 {
      border-color: transparent;
      background: #192c46;

      .inspection-main-list-item {
        width: calc(25% - 6px);

        &:nth-child(4n + 1) {
          margin-left: 0;
        }
      }
    }

    &.type1 {
      .inspection-main-list-item {
        width: 100%;
        height: calc(100vh - 56px - 20px - 20px - 72px - 44px - 2px);
        margin-bottom: 0;
      }
    }

    &.type2,
    &.type4 {
      .inspection-main-head {
        padding-bottom: 8px;
      }

      .inspection-main-list-item {
        width: calc(50% - 4px);
        height: calc((100vh - 56px - 20px - 20px - 72px - 44px - 2px) / 2 - 4px);
        margin-top: 8px;
        margin-bottom: 0;

        &:nth-child(2n + 1) {
          margin-left: 0;
        }

        &.active {
          border: 1px solid #4a90fa;
        }
      }
    }

    &-head {
      display: flex;
      align-items: center;
      padding: 24px 24px 16px;

      .name {
        font-weight: 500;
        font-size: 16px;
        color: #ffffff;
      }

      .btn-group {
        margin-left: auto;
        display: flex;
        align-items: center;

        .btn {
          width: 32px;
          height: 32px;
          background-size: 100%;
          background-repeat: no-repeat;
          cursor: pointer;

          &+.btn {
            margin-left: 16px;
          }

          &-1 {
            background-image: url("/@/assets/imgs/floodctrl/video/icon-1.png");

            &.active,
            &:hover {
              background-image: url("/@/assets/imgs/floodctrl/video/icon-1-h.png");
            }
          }

          &-2 {
            background-image: url("/@/assets/imgs/floodctrl/video/icon-2.png");

            &.active,
            &:hover {
              background-image: url("/@/assets/imgs/floodctrl/video/icon-2-h.png");
            }
          }

          &-4 {
            background-image: url("/@/assets/imgs/floodctrl/video/icon-4.png");

            &.active,
            &:hover {
              background-image: url("/@/assets/imgs/floodctrl/video/icon-4-h.png");
            }
          }
        }
      }
    }

    &-list {
      display: flex;
      flex-wrap: wrap;
      align-items: stretch;

      &-item {
        position: relative;
        margin-bottom: 8px;

        &+.inspection-main-list-item {
          margin-left: 8px;
        }

        .item {
          height: 100%;
        }

        .item-no {
          background: #1e334f;
          border: 1px solid #456493;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;

          p {
            margin: 0;
            font-size: 14px;
            color: #ffffff;

            &:first-child {
              font-weight: 500;
              font-size: 16px;
              margin-bottom: 8px;
            }
          }
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .btn {
          width: 36px;
          height: 28px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 0px 0px 0px 8px;
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          i {
            font-size: 16px;
            color: #fff;
          }
        }

        .footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 38px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.5);
          font-weight: 500;
          font-size: 16px;
          color: #ffffff;

          &::before {
            content: "";
            border-radius: 50%;
            display: inline-block;
            margin-right: 7px;
            width: 8px;
            height: 8px;
            margin-top: 2px;
            background: #00bd42;
            box-shadow: inset 0px 1px 1px 0px #37fc7c,
              inset 0px -1px 1px 0px #008a30;
          }
        }
      }
    }
  }

  .video-pops {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999999;
    background: rgba(0, 0, 0, 0.8);

    .el-button {
      position: absolute;
      top: 5%;
      left: calc(90% + 20px);
    }

    .inspection-main-video {
      width: 80%;
      margin-left: 10%;
      font-size: 0;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 0 10px 1px rgba($color: #020a10, $alpha: 1);
      position: absolute;
      top: 5%;
      bottom: 5%;
      z-index: 20;

      .not-get-device {
        margin-top: 50px;
        font-size: 16px;
        color: #efefef;
        text-align: center;
        letter-spacing: 1px;
      }
    }
  }
}
</style>
