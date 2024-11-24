<template>
    <div>
      <!-- 上半部分 -->
      <div>
        <label>Password:</label>
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter password"
        />
        <span class="" @click="togglePasswordVisibility">
          {{ showPassword ? '🔓' : '🔒' }}
        </span>
        <textarea v-model="content" placeholder="Enter content"></textarea>
        <div class="button-group">
          <button @click="saveContent">Save</button>
          <button @click="loadClipboard">Query</button>
        </div>
      </div>
  
      <!-- 虚线 -->
       <div class="separator"></div>

      <!-- 下半部分 -->
      <div class="grid">
        <div v-for="item in clipboardData" :key="item.timestamp" class="card">
          <button class="copy-button" @click="copyToClipboard(item.content)">
            Copy
          </button>
          <p>{{ item.content }}</p>
          <small>{{ formatDate(item.timestamp) }}</small>
        </div>
      </div>
  
      <!-- Toast 提示 -->
      <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>

      <!-- 悬浮说明按钮 -->
    <button class="info-button" @click="toggleInfoModal">?</button>

        <!-- 说明模态框 -->
        <div v-if="showInfoModal" class="info-modal">
            <div class="info-content">
                <h3>说明</h3>
                <p>1. 数据不会进行持久化，默认 15 分钟会被删除。</p>
                <p>2. 请合理设置密码，保障数据安全。</p>
                <button @click="toggleInfoModal">关闭</button>
            </div>
        </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  export default {
    data() {
      return {
        password: '',
        content: '',
        clipboardData: [],
        showPassword: false, // 控制密码明文显示
        toastMessage: '', // Toast 提示内容
        toastTimeout: null, // 控制提示的定时器
        showInfoModal: false, // 控制说明模态框的显示
      };
    },
    methods: {
      togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
      },
      async saveContent() {
        if (!this.password || !this.content) {
          this.showToast('Password and content are required.');
          return;
        }
  
        try {
          const response = await axios.post(`${API_BASE_URL}/clipboard/save`, {
            password: this.password,
            content: this.content,
          });
  
          if (response.data.code === 0) {
            this.showToast(response.data.message);
            this.loadClipboard();
            this.content = '';
          } else {
            this.showToast('Failed to save content.');
          }
        } catch (error) {
          console.error(error);
          this.showToast('Error saving content.');
        }
      },
      async loadClipboard() {
        if (!this.password) {
          this.showToast('Password is required to load clipboard.');
          return;
        }
  
        try {
          const response = await axios.post(`${API_BASE_URL}/clipboard/list`, {
            password: this.password,
          });
  
          if (response.data.code === 0) {
            this.clipboardData = response.data.data.clipboard_contents;
            // this.showToast('Query successful.');
          } else {
            this.showToast('Failed to load clipboard.');
          }
        } catch (error) {
          console.error(error);
          this.showToast('Error loading clipboard.');
        }
      },
      formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
      },
      copyToClipboard(content) {
        navigator.clipboard.writeText(content).then(
          () => this.showToast('Copied to clipboard!'),
          () => this.showToast('Failed to copy.')
        );
      },
      showToast(message) {
        this.toastMessage = message;
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
          this.toastMessage = '';
        }, 2000); // 显示 2 秒后消失
      },
      toggleInfoModal() {
        this.showInfoModal = !this.showInfoModal;
      },
    },
    mounted() {
      // this.loadClipboard(); // 页面加载时自动加载数据
    },
  };
  </script>
  
  <style scoped>
  /* 样式调整 */
  textarea {
    display: block;
    margin: 10px 0;
    width: 100%;
    height: 80px;
  }
  button {
    margin: 10px 0;
    padding: 10px;
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  button:hover {
    background: #0056b3;
  }
  
  .button-group {
    display: flex;
    gap: 15px; /* 增加按钮间距 */
  }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    gap: 20px;
  }
  
  .card {
    position: relative;
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* 文本显示控制 */
.card p {
  margin-top: 30px;
  margin-bottom: 30px;
  white-space: pre-wrap; /* 保持换行格式 */
  word-wrap: break-word; /* 长单词换行 */
}
/* 时间固定底部 */
.card small {
  position: absolute;
  bottom: 10px; /* 与卡片底部保持间距 */
  left: 15px; /* 与卡片左侧对齐 */
  font-size: 12px;
  color: #888;
}

  .copy-button {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 5px 10px;
    font-size: 12px;
    background: #28a745;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .copy-button:hover {
    background: #218838;
  }
  
  /* 密码输入框旁的眼睛图标 */
.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.eye-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
}

  .toast {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    animation: fadeInOut 2s forwards;
  }
  
  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .separator {
  border-top: 2px dashed #ccc;
  margin: 20px 0;
}



/* 说明按钮 */
.info-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #007bff;
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-button:hover {
  background-color: #0056b3;
}

/* 说明模态框 */
.info-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.info-content {
  padding: 20px;
  text-align: center;
}

.info-content h3 {
  margin-bottom: 10px;
}

.info-content button {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #007bff;
  color: #fff;
  border-radius: 5px;
}

.info-content button:hover {
  background-color: #0056b3;
}

/* 遮罩层 */
.info-modal::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
}

  </style>
  