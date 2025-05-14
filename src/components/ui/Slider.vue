<template>
  <div class="relative flex touch-none select-none items-center" :style="{ width: width }">
    <!-- 减小按钮 -->
    <button type="button" class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground mr-2 focus:outline-none focus:ring-1 focus:ring-primary hover:bg-primary/20 disabled:opacity-30" @click="decrementValue" :disabled="modelValue <= min">
      <MinusIcon class="h-3 w-3" />
    </button>

    <div class="relative flex-grow">
      <div ref="track" class="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div class="absolute h-full bg-primary" :style="{ width: `${percentage}%` }"></div>
      </div>
      <div ref="thumb" class="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" :style="{ left: `calc(${percentage}% - 8px)` }" tabindex="0" @mousedown="startDrag" @touchstart="startDrag" @keydown="handleKeyDown" role="slider" :aria-valuemin="min" :aria-valuemax="max" :aria-valuenow="modelValue"></div>
    </div>

    <!-- 增加按钮 -->
    <button type="button" class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ml-2 focus:outline-none focus:ring-1 focus:ring-primary hover:bg-primary/20 disabled:opacity-30" @click="incrementValue" :disabled="modelValue >= max">
      <PlusIcon class="h-3 w-3" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MinusIcon, PlusIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: '100%'
  }
});

const emit = defineEmits(['update:modelValue']);

const track = ref(null);
const thumb = ref(null);
const dragging = ref(false);

// 计算百分比
const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});

// 从事件获取值
const getValueFromEvent = (event) => {
  if (!track.value) return props.modelValue;

  const rect = track.value.getBoundingClientRect();
  const clientX = event.type.includes('touch')
    ? event.touches[0].clientX
    : event.clientX;

  // 计算相对位置，范围从0到1
  let percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

  // 将百分比转换为实际值
  let value = props.min + percent * (props.max - props.min);

  // 如果设置了步长，按步长取整
  if (props.step) {
    value = Math.round(value / props.step) * props.step;
  }

  // 确保值在范围内
  return Math.max(props.min, Math.min(props.max, value));
};

// 开始拖动
const startDrag = (event) => {
  if (props.disabled) return;

  event.preventDefault();
  dragging.value = true;

  // 立即更新值
  updateValue(event);

  // 添加文档级事件监听器
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', onDrag);
  document.addEventListener('touchend', stopDrag);
};

// 拖动中
const onDrag = (event) => {
  if (!dragging.value) return;
  updateValue(event);
};

// 停止拖动
const stopDrag = () => {
  dragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', stopDrag);
};

// 更新值
const updateValue = (event) => {
  const newValue = getValueFromEvent(event);
  if (newValue !== props.modelValue) {
    emit('update:modelValue', newValue);
  }
};

// 增加值
const incrementValue = () => {
  if (props.disabled || props.modelValue >= props.max) return;

  const newValue = Math.min(props.max, props.modelValue + props.step);
  emit('update:modelValue', newValue);
};

// 减少值
const decrementValue = () => {
  if (props.disabled || props.modelValue <= props.min) return;

  const newValue = Math.max(props.min, props.modelValue - props.step);
  emit('update:modelValue', newValue);
};

// 键盘导航
const handleKeyDown = (event) => {
  if (props.disabled) return;

  let newValue = props.modelValue;

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      newValue = Math.min(props.max, props.modelValue + props.step);
      break;
    case 'ArrowLeft':
    case 'ArrowDown':
      newValue = Math.max(props.min, props.modelValue - props.step);
      break;
    case 'Home':
      newValue = props.min;
      break;
    case 'End':
      newValue = props.max;
      break;
    default:
      return;
  }

  event.preventDefault();
  emit('update:modelValue', newValue);
};

// 组件卸载时清理事件监听器
onUnmounted(() => {
  if (dragging.value) {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDrag);
  }
});
</script> 