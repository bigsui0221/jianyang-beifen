<template>
  <div :class="`map-markers ${theme} ${trigger} ${show ? 'active' : ''}`" :style="{
    '--rgb': rgb
  }">
    <div class="map-markers-info">
      <div class="map-markers-info-head">{{ name }}</div>
      <div class="map-markers-info-main">
        <!-- 内容插槽 -->
        <slot name="main"></slot>
      </div>
    </div>
    <div class="map-markers-icon" @click.stop="clickToggle()">
      <slot name="icon"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['click'])
const props = defineProps({
  name: {
    type: String,
    default: 'marker name',
  },
  theme: {
    type: String,
    default: '',
  },
  trigger: {
    // 激活方法
    type: String,
    default: 'always',
  },
})
const rgb = computed(() => {
  let hex = props.theme
  hex = hex.replace('#', '');

  // 解析红、绿、蓝分量
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r},${g},${b}`
})
const show = ref(props.trigger === 'always' ? true : false)
const clickToggle = () => {
  if (props.trigger == 'click') {
    show.value = !show.value
  }
  emit('click', show.value)
}
</script>

<style lang="scss" scoped>
// 自定义marker点样式
.map-markers {
  position: absolute;
  left: 0;
  right: 0;
  width: fit-content;

  // 图标
  &-icon {
    display: inline-block;
    margin: auto;
    font-size: 0;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.1);
    }
  }

  // 内容
  &-info {
    background: #eee;
    border-width: 1px;
    border-style: solid;
    border-color: #666;
    border-radius: 8px;
    overflow: hidden;
    cursor: default;
    position: absolute;
    left: 14px;
    bottom: calc(100% + 5px);
    z-index: 2;
    transform: translateX(-50%);

    &-head {
      padding: 7px 10px;
      font-size: 13px;
      font-weight: 500;
      color: #fff;
      line-height: 1;
      white-space: nowrap;
      background: #989898;
    }

    &-main {
      padding: 7px 10px;

      .value {
        color: #333;
      }
    }
  }

  // 鼠标移入显示  class添加'hover'
  &.hover {
    .map-markers-info {
      transition: all 0.3s;
      width: 0;
      height: 0;
      border-width: 0;
      opacity: 0;
    }

    &:hover .map-markers-info {
      /**
                calc-size() 与 interpolate-size:allow-keywords 相同
                使auto等非数值类型的值也能拥有transition过渡效果
            */
      width: calc-size(auto, size);
      height: calc-size(auto, size);
      border-width: 1px;
      opacity: 1;
    }
  }

  // 鼠标点击切换显示  class添加'click'，并动态绑定class='active'，有active时显示，反之隐藏
  &.click {
    .map-markers-info {
      transition: all 0.3s;
      width: 0;
      height: 0;
      border-width: 0;
      opacity: 0;
    }

    &.active .map-markers-info {
      /**
                calc-size() 与 interpolate-size:allow-keywords 相同
                使auto等非数值类型的值也能拥有transition过渡效果
            */
      width: calc-size(auto, size);
      height: calc-size(auto, size);
      border-width: 1px;
      opacity: 1;
    }
  }
}

// 绿色
.map-markers {
  .map-markers-info {
    background: #f0fff4;
    border-color: rgba(var(--rgb), 0.3);

    &-head {
      background-color: rgba(var(--rgb), 1.0);
    }

    &-main {
      :deep(.value) {
        color: rgba(var(--rgb), 0.8);
      }
    }
  }
}

// 深绿色
.map-markers.green {
  .map-markers-info {
    background: #f0fff4;
    border-color: #b2f7ff;

    &-head {
      background: #00a2b4;
    }

    &-main {
      .value {
        color: #00a2b4;
      }
    }
  }
}

// 蓝色
.map-markers.blue {
  .map-markers-info {
    background: #eff6ff;
    border-color: #99c8ff;

    &-head {
      background: #006eef;
    }

    &-main {
      .value {
        color: #006eef;
      }
    }
  }
}

// 深蓝色
.map-markers.blue-dark {
  .map-markers-info {
    background: #eff6ff;
    border-color: #abb1ff;

    &-head {
      background: #6069df;
    }

    &-main {
      .value {
        color: #6069df;
      }
    }
  }
}

// 粉色
.map-markers.pink {
  .map-markers-info {
    background: #fef2ff;
    border-color: #f8adff;

    &-head {
      background: #db30ea;
    }

    &-main {
      .value {
        color: #db30ea;
      }
    }
  }
}

// 紫色
.map-markers.purple {
  .map-markers-info {
    background: #fef2ff;
    border-color: #e1a1ff;

    &-head {
      background: #b853e6;
    }

    &-main {
      .value {
        color: #b853e6;
      }
    }
  }
}

// 深紫色
.map-markers.purple-dark {
  .map-markers-info {
    background: #fef2ff;
    border-color: #f8adff;

    &-head {
      background: #8b3992;
    }

    &-main {
      .value {
        color: #8b3992;
      }
    }
  }
}

// 橙色
.map-markers.orange {
  .map-markers-info {
    background: #fff6e9;
    border-color: #ffd9a4;

    &-head {
      background: #f99100;
    }

    &-main {
      .value {
        color: #f99100;
      }
    }
  }
}

// 红色
.map-markers.red {
  .map-markers-info {
    background: #ffeded;
    border-color: #ffafb0;

    &-head {
      background: #e23e41;
    }

    &-main {
      .value {
        color: #e23e41;
      }
    }
  }
}
</style>
