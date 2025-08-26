<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>存款目标</span>
            <el-button type="primary" @click="showAddGoalDialog">添加目标</el-button>
          </div>
        </template>
        <el-table :data="savingsGoals">
          <el-table-column prop="name" label="目标名称"></el-table-column>
          <el-table-column prop="targetAmount" label="目标金额">
            <template #default="scope">
              {{ scope.row.targetAmount }} 元
            </template>
          </el-table-column>
          <el-table-column prop="currentAmount" label="已存金额">
            <template #default="scope">
              {{ scope.row.currentAmount }} 元
            </template>
          </el-table-column>
          <el-table-column label="进度">
            <template #default="scope">
              <el-progress 
                :percentage="(scope.row.currentAmount / scope.row.targetAmount * 100).toFixed(1)"
                :format="(percentage) => percentage + '%'"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button-group>
                <el-button type="primary" size="small" @click="updateProgress(scope.row)">
                  更新进度
                </el-button>
                <el-button type="danger" size="small" @click="deleteGoal(scope.$index)">
                  删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>总体进度</span>
          </div>
        </template>
        <el-statistic title="总目标金额" :value="totalTargetAmount">
          <template #suffix>元</template>
        </el-statistic>
        <el-divider />
        <el-statistic title="已存金额" :value="totalCurrentAmount">
          <template #suffix>元</template>
        </el-statistic>
        <el-divider />
        <div class="overall-progress">
          <span>整体完成度</span>
          <el-progress 
            :percentage="overallProgress" 
            :format="(percentage) => percentage + '%'"
            :status="overallProgress >= 100 ? 'success' : ''"
          />
        </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 添加目标对话框 -->
  <el-dialog v-model="dialogVisible" title="添加存款目标" width="30%">
    <el-form :model="newGoal" label-width="100px">
      <el-form-item label="目标名称">
        <el-input v-model="newGoal.name" placeholder="例如：买房首付"></el-input>
      </el-form-item>
      <el-form-item label="目标金额">
        <el-input-number v-model="newGoal.targetAmount" :min="0" :precision="2"></el-input-number>
      </el-form-item>
      <el-form-item label="初始金额">
        <el-input-number v-model="newGoal.currentAmount" :min="0" :precision="2"></el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addGoal">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const savingsGoals = ref([
  {
    name: '买房首付',
    targetAmount: 500000,
    currentAmount: 100000,
  },
])

const dialogVisible = ref(false)
const newGoal = ref({
  name: '',
  targetAmount: 0,
  currentAmount: 0,
})

const totalTargetAmount = computed(() => {
  return savingsGoals.value.reduce((sum, goal) => sum + goal.targetAmount, 0)
})

const totalCurrentAmount = computed(() => {
  return savingsGoals.value.reduce((sum, goal) => sum + goal.currentAmount, 0)
})

const overallProgress = computed(() => {
  return totalTargetAmount.value === 0 
    ? 0 
    : ((totalCurrentAmount.value / totalTargetAmount.value) * 100).toFixed(1)
})

const showAddGoalDialog = () => {
  newGoal.value = {
    name: '',
    targetAmount: 0,
    currentAmount: 0,
  }
  dialogVisible.value = true
}

const addGoal = () => {
  if (!newGoal.value.name || newGoal.value.targetAmount <= 0) {
    ElMessage.warning('请填写完整的目标信息')
    return
  }
  savingsGoals.value.push({ ...newGoal.value })
  dialogVisible.value = false
  ElMessage.success('添加目标成功')
}

const updateProgress = (goal) => {
  ElMessageBox.prompt('请输入新的已存金额', '更新进度', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'number',
    inputValue: goal.currentAmount,
  }).then(({ value }) => {
    const newAmount = parseFloat(value)
    if (newAmount >= 0) {
      goal.currentAmount = newAmount
      ElMessage.success('进度更新成功')
    } else {
      ElMessage.warning('请输入有效金额')
    }
  }).catch(() => {})
}

const deleteGoal = (index) => {
  ElMessageBox.confirm('确定要删除这个存款目标吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    savingsGoals.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overall-progress {
  margin-top: 20px;
}

.el-divider {
  margin: 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
