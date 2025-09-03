<template>
  <div class="flv-player-container">
    <div class="player-wrapper">
      <!-- 视频播放器 -->
      <video ref="videoRef" class="flv-video" :controls="controls" :autoplay="autoplay" :muted="muted"
        @error="handleVideoError"></video>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>正在连接...</p>
    </div>

    <!-- 错误信息 -->
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="reloadPlayer" class="reload-btn">重新加载</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import flvjs from 'flv.js';

// 组件属性定义
const props = defineProps<{
  // FLV 流地址
  url: string;
  // 是否显示控制条
  controls?: boolean;
  // 是否自动播放
  autoplay?: boolean;
  // 是否静音
  muted?: boolean;
  // 视频宽度
  width?: string;
  // 视频高度
  height?: string;
  // 最大缓冲长度(秒)
  maxBufferLength?: number;
  // 最大MaxBufferLength(秒)
  maxMaxBufferLength?: number;
}>();

// 默认属性值
const defaultProps = {
  controls: true,
  autoplay: true,
  muted: true,
  width: '100%',
  height: 'auto',
  maxBufferLength: 1,
  maxMaxBufferLength: 5,
};

// 视频元素引用
const videoRef = ref<HTMLVideoElement | null>(null);
// FLV 播放器实例
let flvPlayer: flvjs.Player | null = null;
// 加载状态
const isLoading = ref(true);
// 错误信息
const errorMessage = ref('');

// 计算属性 - 合并默认值和传入的属性
const playerOptions = computed(() => ({
  type: 'flv',
  url: props.url,
  isLive: true,
  hasAudio: true,
  hasVideo: true,
  enableStashBuffer: false,
  maxBufferLength: props.maxBufferLength || defaultProps.maxBufferLength,
  maxMaxBufferLength: props.maxMaxBufferLength || defaultProps.maxMaxBufferLength,
  controls: props.controls || defaultProps.controls,
}));

// 视频样式
const videoStyle = computed(() => ({
  width: props.width || defaultProps.width,
  height: props.height || defaultProps.height,
}));

// 初始化播放器
const initPlayer = () => {
  // 重置状态
  isLoading.value = true;
  errorMessage.value = '';

  // 检查浏览器支持
  if (!flvjs.isSupported()) {
    errorMessage.value = '您的浏览器不支持FLV视频播放';
    isLoading.value = false;
    return;
  }

  // 检查视频元素和URL
  if (!videoRef.value || !props.url) {
    errorMessage.value = '视频元素或播放地址不存在';
    isLoading.value = false;
    return;
  }

  // 销毁已存在的播放器
  if (flvPlayer) {
    destroyPlayer();
  }

  try {
    // 创建新的FLV播放器
    flvPlayer = flvjs.createPlayer(playerOptions.value);
    flvPlayer.attachMediaElement(videoRef.value);

    // 监听播放器事件
    flvPlayer.on(flvjs.Events.LOADING_COMPLETE, handlePlayerLoadingComplete);

    flvPlayer.on(flvjs.Events.ERROR, handlePlayerError);

    // 加载视频
    flvPlayer.load();

    // 如果需要自动播放
    if (props.autoplay || defaultProps.autoplay) {
      videoRef.value.play().catch(err => {
        console.error('自动播放失败:', err);
      }).finally(() => {
        isLoading.value = false;
      });
    }
  } catch (error) {
    console.error('初始化播放器失败:', error);
    errorMessage.value = '初始化播放器失败，请重试';
    isLoading.value = false;
  }
};
const handlePlayerLoadingComplete = () => {
  isLoading.value = false;
}
// 销毁播放器
const destroyPlayer = () => {
  if (flvPlayer) {
    flvPlayer.off(flvjs.Events.LOADING_COMPLETE, handlePlayerLoadingComplete);
    flvPlayer.off(flvjs.Events.ERROR, handlePlayerError);

    if (flvPlayer.mediaElement) {
      flvPlayer.mediaElement.pause();
    }

    flvPlayer.destroy();
    flvPlayer = null;
  }
};

// 处理播放器错误
const handlePlayerError = (errorType: flvjs.ErrorTypes, errorDetail: flvjs.ErrorDetails) => {
  isLoading.value = false;

  console.error('FLV播放器错误:', errorType, errorDetail);

  // 根据错误类型设置错误信息
  switch (errorType) {
    case flvjs.ErrorTypes.NETWORK_ERROR:
      errorMessage.value = '网络错误，无法连接到视频源';
      break;
    case flvjs.ErrorTypes.MEDIA_ERROR:
      errorMessage.value = '媒体格式错误，无法播放视频';
      break;
    default:
      errorMessage.value = '播放出错，请重试';
  }
};

// 处理视频元素错误
const handleVideoError = (e: Event) => {
  isLoading.value = false;
  console.error('视频元素错误:', e);
  errorMessage.value = '视频播放出错，请重试';
};

// 重新加载播放器
const reloadPlayer = () => {
  initPlayer();
};

// 监听URL变化，重新加载播放器
watch(
  () => props.url,
  () => {
    initPlayer();
  }
);

// 组件挂载时初始化播放器
onMounted(() => {
  initPlayer();
});

// 组件卸载时销毁播放器
onUnmounted(() => {
  destroyPlayer();
});

// 暴露重新加载方法给父组件
defineExpose({
  reloadPlayer
});
</script>

<style scoped>
.flv-player-container {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
}

.player-wrapper {
  position: relative;
  background-color: #000;
  width: 100%;
  height: 100%;
}

.flv-video {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  text-align: center;
  z-index: 10;
}

.reload-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reload-btn:hover {
  background-color: #359e75;
}
</style>
