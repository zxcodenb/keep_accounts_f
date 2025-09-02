<template>
  <div class="ai-chat">
    <el-card class="chat-card">
      <template #header>
        <div class="card-header">
          <span>AI 对话助手</span>
          <div>
            <el-switch
              v-model="autoCreateRecord"
              active-text="自动创建记录"
            />
          </div>
        </div>
      </template>

      <div class="messages" ref="messagesContainer">
        <div v-for="(m, idx) in messages" :key="idx" class="message" :class="m.role">
          <span class="role">{{ m.role === 'user' ? '我' : 'AI' }}</span>
          <div class="content">{{ m.content }}</div>
        </div>
        <div v-if="streaming" class="message assistant">
          <span class="role">AI</span>
          <div class="content">{{ streamingBuffer }}</div>
        </div>
      </div>

      <div class="composer">
        <el-input
          v-model="input"
          type="textarea"
          rows="3"
          placeholder="例如：帮我记一笔今天中午吃饭 32 元；或：这个月工资 12000"
          @keydown.enter.exact.prevent="handleSend"
        />
        <div class="actions">
          <el-button type="primary" :loading="sending" @click="handleSend">发送</el-button>
          <el-button v-if="streaming" type="warning" @click="handleStop">停止</el-button>
          <el-button v-else @click="clearChat">清空</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { aiApi, accountApi } from '@/api/account'

const input = ref('')
const messages = ref([])
const sending = ref(false)
const streaming = ref(false)
const streamingBuffer = ref('')
const eventSourceRef = ref(null)
const autoCreateRecord = ref(true)
const messagesContainer = ref(null)

function scrollToBottom() {
  nextTick(() => {
    const el = messagesContainer.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

function appendAssistantChunk(chunk) {
  streamingBuffer.value += chunk
  scrollToBottom()
}

function handleStop() {
  if (eventSourceRef.value) {
    eventSourceRef.value.close()
    eventSourceRef.value = null
  }
  if (streamingBuffer.value) {
    messages.value.push({ role: 'assistant', content: streamingBuffer.value })
  }
  streamingBuffer.value = ''
  streaming.value = false
}

async function tryCreateRecordFromAIText(text) {
  if (!autoCreateRecord.value) return
  try {
    // 简单示例：尝试从 AI 文本里匹配 “收入/支出 + 金额 + 备注”
    // 例如："已为你记录一笔支出 32 元，备注：中午吃饭" 或 "收入 12000 元 工资"
    const incomeMatch = text.match(/收入\s*(\d+(?:\.\d+)?)\s*元?(?:\s*[，,。\s]*)(.*)?/)
    const expenseMatch = text.match(/支出\s*(\d+(?:\.\d+)?)\s*元?(?:\s*[，,。\s]*)(.*)?/)
    let type = ''
    let amount = 0
    let note = ''
    if (incomeMatch) {
      type = 'income'
      amount = parseFloat(incomeMatch[1])
      note = (incomeMatch[2] || '').trim()
    } else if (expenseMatch) {
      type = 'expense'
      amount = parseFloat(expenseMatch[1])
      note = (expenseMatch[2] || '').trim()
    } else {
      return
    }
    if (!isFinite(amount) || amount <= 0) return

    await accountApi.addRecord({
      type,
      amount,
      note: note || 'AI 创建',
      date: new Date().toISOString().slice(0, 10)
    })
    ElMessage.success('已根据 AI 回复自动创建记录')
  } catch (e) {
    // 忽略失败，只做提示
    ElMessage.warning('创建记录失败，可手动添加')
  }
}

async function handleSend() {
  const text = input.value.trim()
  if (!text) return
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  sending.value = true
  streaming.value = true
  streamingBuffer.value = ''

  try {
    const es = aiApi.streamChat(text)
    eventSourceRef.value = es

    es.addEventListener('message', (ev) => {
      appendAssistantChunk(ev.data || '')
    })

    es.onerror = () => {
      handleStop()
      ElMessage.error('连接出错或已中断')
    }

    es.onopen = () => {
      sending.value = false
    }

    // 当连接被服务端正常关闭时，浏览器会触发 error。这里在 stop 中统一收尾
  } catch (err) {
    sending.value = false
    streaming.value = false
    ElMessage.error('发送失败')
  }
}

function clearChat() {
  messages.value = []
  streamingBuffer.value = ''
}

onBeforeUnmount(() => {
  if (eventSourceRef.value) {
    eventSourceRef.value.close()
    eventSourceRef.value = null
  }
})
</script>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chat-card {
  width: 100%;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.messages {
  min-height: 300px;
  max-height: 60vh;
  overflow-y: auto;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 12px;
}
.message {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.message .role {
  flex: 0 0 auto;
  color: var(--el-text-color-secondary);
}
.message .content {
  white-space: pre-wrap;
  word-break: break-word;
}
.message.user .role { color: #409eff; }
.message.assistant .role { color: #67c23a; }
.composer {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>


