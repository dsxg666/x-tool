<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const gridSize = 20;
const cells = Array(gridSize * gridSize).fill(0);
const snake = ref([0, 1, 2]);
const food = ref(Math.floor(Math.random() * cells.length));
let direction = ref('right');
let interval;

// 获取每个方格的样式
const getCellClass = (index) => {
  if (snake.value.includes(index)) {
    return 'snake';
  } else if (index === food.value) {
    return 'food';
  } else {
    return '';
  }
};

// 生成新的食物
const generateFood = () => {
  food.value = Math.floor(Math.random() * cells.length);
};

// 移动贪吃蛇
const moveSnake = () => {
  const head = snake.value[snake.value.length - 1];
  let newHead;

  if (direction.value === 'right') newHead = head + 1;
  else if (direction.value === 'left') newHead = head - 1;
  else if (direction.value === 'up') newHead = head - gridSize;
  else if (direction.value === 'down') newHead = head + gridSize;

  if (newHead === food.value) {
    generateFood();
  } else {
    snake.value.shift(); // 移除蛇尾
  }

  snake.value.push(newHead);
};

// 监听键盘事件
const handleKeydown = (event) => {
  if (event.key === 'ArrowRight' && direction.value !== 'left') {
    direction.value = 'right';
  } else if (event.key === 'ArrowLeft' && direction.value !== 'right') {
    direction.value = 'left';
  } else if (event.key === 'ArrowUp' && direction.value !== 'down') {
    direction.value = 'up';
  } else if (event.key === 'ArrowDown' && direction.value !== 'up') {
    direction.value = 'down';
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  interval = setInterval(moveSnake, 200);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  clearInterval(interval);
});
</script>

<template>
  <div class="game-board">
    <div
        v-for="(cell, index) in cells"
        :key="index"
        :class="getCellClass(index)"
        class="cell"
    />
  </div>
</template>

<style scoped>
.game-board {
  display: grid;
  grid-template-columns: repeat(20, 20px);
  grid-template-rows: repeat(20, 20px);
  gap: 2px;
}

.cell {
  width: 20px;
  height: 20px;
  background-color: #eee;
}

.snake {
  background-color: green;
}

.food {
  background-color: red;
}
</style>