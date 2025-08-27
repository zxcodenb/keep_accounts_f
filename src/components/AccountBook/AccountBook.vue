<template>
  <el-row :gutter="20">
    <el-col :span="16">
  <el-card class="box-card overview-card">
        <template #header>
          <div class="card-header">
            <span>财务概览</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="月可支配收入 (元)" :value="disposableIncome" />
          </el-col>
          <el-col :span="6">
            <el-statistic 
              :title="'本月收入 (元)'"
              :value="monthlyTotalIncome"
              :value-style="{ color: '#67c23a' }" 
            >
              <template #suffix>
                <small style="color: #606266">/ {{ totalIncome }}</small>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic 
              :title="'本月支出 (元)'"
              :value="monthlyTotalExpenses"
              :value-style="{ color: '#f56c6c' }" 
            >
              <template #suffix>
                <small style="color: #606266">/ {{ totalExpenses }}</small>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic 
              title="结余 (元)" 
              :value="remainingBalance"
              :value-style="{ color: remainingBalance >= 0 ? '#67c23a' : '#f56c6c' }" 
            />
          </el-col>
        </el-row>
      </el-card>

      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span class="title">收支明细</span>
              <el-date-picker
                v-model="selectedMonth"
                type="month"
                placeholder="选择月份"
                format="YYYY年MM月"
                value-format="x"
                :clearable="false"
                :shortcuts="monthShortcuts"
                class="month-picker"
              />
            </div>
            <div class="filter-container">
              <el-radio-group v-model="filterType" size="small">
                <el-radio-button :label="-1">全部</el-radio-button>
                <el-radio-button :label="0">支出</el-radio-button>
                <el-radio-button :label="1">收入</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        <el-table 
          :data="records"
          :default-sort="{ prop: 'recordDate', order: 'descending' }"
          style="width: 100%"
        >
          <el-table-column prop="type" label="类型" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.type === '1' ? 'success' : 'danger'">
                {{ scope.row.type === '1' ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="recordDate" label="日期" sortable>
            <template #default="scope">
              {{ formatDate(new Date(scope.row.recordDate).getTime()) }}
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.type === '1' ? 'success' : 'warning'" size="small">
                {{ getCategoryLabel(scope.row.category, scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" sortable></el-table-column>
          <el-table-column prop="amount" label="金额 (元)" sortable>
            <template #default="scope">
              <span :class="{ 'income-amount': scope.row.type === '1', 'expense-amount': scope.row.type === '0' }">
                {{ (scope.row.type === '1' ? '+' : '-') + scope.row.amount }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <div class="operation-buttons">
                <el-button type="primary" size="small" @click="updateRecord(scope.$index)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="deleteRecord(scope.$index)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            background
            layout="total, sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>添加新记录</span>
          </div>
        </template>
        <el-form :model="newRecord" ref="recordForm" label-width="80px">
          <el-form-item label="类型" prop="type">
            <el-radio-group v-model="newRecord.type">
              <el-radio label="0">支出</el-radio>
              <el-radio label="1">收入</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select 
              v-model="newRecord.category"
              :placeholder="newRecord.type === '1' ? '选择收入分类' : '选择支出分类'"
              style="width: 100%"
            >
              <el-option
                v-for="item in (newRecord.type === '1' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="newRecord.type === '1' ? '收入描述' : '支出描述'" prop="description">
            <el-input 
              v-model="newRecord.description" 
              :placeholder="newRecord.type === '1' ? '例如：月度工资' : '例如：午餐费用'"
            />
          </el-form-item>
          <el-form-item :label="newRecord.type === '1' ? '收入金额' : '支出金额'" prop="amount">
            <el-input-number v-model="newRecord.amount" :precision="2" :step="10" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="时间" prop="recordDate">
            <el-date-picker
              v-model="newRecord.recordDate"
              type="datetime"
              placeholder="选择日期和时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
              :shortcuts="dateShortcuts"
              :disabled-date="disableFutureDate"
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="addRecord"
              :loading="loading"
              :disabled="loading"
            >
              {{ newRecord.type === '1' ? '添加收入' : '添加支出' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>

  <!-- 更新记录对话框 -->
  <el-dialog v-model="updateDialogVisible" title="更新记录" width="30%">
    <el-form :model="updateForm" ref="updateFormRef" label-width="80px">
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="updateForm.type">
          <el-radio label="0">支出</el-radio>
          <el-radio label="1">收入</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select 
          v-model="updateForm.category"
          :placeholder="updateForm.type === '1' ? '选择收入分类' : '选择支出分类'"
          style="width: 100%"
        >
          <el-option
            v-for="item in (updateForm.type === '1' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
  <el-form-item :label="updateForm.type === '1' ? '收入描述' : '支出描述'" prop="description">
        <el-input 
          v-model="updateForm.description" 
          :placeholder="updateForm.type === '1' ? '例如：月度工资' : '例如：午餐费用'"
        />
      </el-form-item>
  <el-form-item :label="updateForm.type === '1' ? '收入金额' : '支出金额'" prop="amount">
        <el-input-number v-model="updateForm.amount" :precision="2" :step="10" :min="0"></el-input-number>
      </el-form-item>
      <el-form-item label="时间" prop="date">
        <el-date-picker
          v-model="updateForm.date"
          type="datetime"
          placeholder="选择日期和时间"
          format="YYYY-MM-DD HH:mm"
          value-format="x"
          :shortcuts="dateShortcuts"
          :disabled-date="disableFutureDate"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdate">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { accountApi } from '@/api/account';

// 支出分类常量
const EXPENSE_CATEGORIES = [
  { value: 'FOOD', label: '餐饮' },
  { value: 'TRANSPORT', label: '交通' },
  { value: 'SHOPPING', label: '购物' },
  { value: 'ENTERTAINMENT', label: '娱乐' },
  { value: 'MEDICAL', label: '医疗' },
  { value: 'EDUCATION', label: '教育' },
  { value: 'HOUSING', label: '住房' },
  { value: 'UTILITIES', label: '水电' },
  { value: 'COMMUNICATION', label: '通讯' },
  { value: 'FINANCE', label: '金融' },
  { value: 'OTHER', label: '其他' }
];

// 收入分类常量
const INCOME_CATEGORIES = [
  { value: 'SALARY', label: '工资' },
  { value: 'BONUS', label: '奖金' },
  { value: 'INVESTMENT', label: '投资收益' },
  { value: 'PART_TIME', label: '兼职' },
  { value: 'OTHER', label: '其他' }
];

const disposableIncome = ref(5000);
const records = ref([]);
const total = ref(0);  // 总记录数

// 分页和筛选相关
const currentPage = ref(1);
const pageSize = ref(10);
const filterType = ref(-1); // -1: 全部, 0: 支出, 1: 收入
const selectedMonth = ref(Date.now()); // 默认选择当前月份
const updateDialogVisible = ref(false);
const updateForm = ref({
  type: '0',
  category: '',
  description: '',
  amount: '0.00',
  recordDate: new Date().toISOString()
});
const updateIndex = ref(-1); // 当前正在更新的记录索引

const loading = ref(false); // 添加记录时的加载状态

const newRecord = ref({
  type: '0', // 默认为支出，后端需要字符串类型
  category: '', // 分类
  description: '',
  amount: 0,
  recordDate: new Date().toISOString(), // 使用ISO格式的字符串，后端可以解析为LocalDateTime
});

// 处理后端接口错误
const handleApiError = (error) => {
  let message = '操作失败';
  if (error.response) {
    // 服务器返回错误响应
    message = error.response.data?.message || error.message || `操作失败: ${error.response.status}`;
  } else if (error.request) {
    // 请求发出但未收到响应
    message = '网络连接错误，请检查网络';
  } else {
    // 请求配置出错
    message = error.message || '请求配置错误';
  }
  ElMessage({
    type: 'error',
    message: message,
    duration: 5000
  });
};

// 获取分类标签
const getCategoryLabel = (categoryValue, type) => {
  const categories = type === '1' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const category = categories.find(c => c.value === categoryValue);
  return category ? category.label : '其他';
};

// 统计计算
const totalIncome = computed(() => {
  return records.value
    .filter(record => record.type === '1')
    .reduce((total, record) => total + parseFloat(record.amount), 0);
});

const totalExpenses = computed(() => {
  return records.value
    .filter(record => record.type === '0')
    .reduce((total, record) => total + parseFloat(record.amount), 0);
});

const remainingBalance = computed(() => {
  return disposableIncome.value - totalExpenses.value;
});

// 筛选后的记录
const filteredRecords = computed(() => {
  // 先按月份筛选（后端返回的字段为 recordDate）
  const monthFiltered = records.value.filter(record => isInSelectedMonth(record.recordDate));
  
  // 再按类型筛选（后端 type 为字符串 '0'/'1'）
  if (filterType.value === -1) {
    return monthFiltered;
  }
  return monthFiltered.filter(record => record.type === String(filterType.value));
});

// 月度统计
const monthlyTotalIncome = computed(() => {
  return records.value
    .filter(record => record.type === '1' && isInSelectedMonth(record.recordDate))
    .reduce((total, record) => total + parseFloat(record.amount), 0);
});

const monthlyTotalExpenses = computed(() => {
  return records.value
    .filter(record => record.type === '0' && isInSelectedMonth(record.recordDate))
    .reduce((total, record) => total + parseFloat(record.amount), 0);
});

// 月份快捷选项
const monthShortcuts = [
  {
    text: '本月',
    value: () => Date.now()
  },
  {
    text: '上月',
    value: () => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return date.getTime();
    }
  },
  {
    text: '今年一月',
    value: () => {
      const date = new Date();
      date.setMonth(0);
      date.setDate(1);
      return date.getTime();
    }
  }
];

// 判断日期是否在选定月份内
const isInSelectedMonth = (dateStr) => {
  const date = new Date(dateStr);
  const selected = new Date(Number(selectedMonth.value));
  return date.getFullYear() === selected.getFullYear() && 
         date.getMonth() === selected.getMonth();
};

// 日期快捷选项
const dateShortcuts = [
  {
    text: '现在',
    value: () => Date.now()
  },
  {
    text: '今天上午',
    value: () => {
      const date = new Date();
      date.setHours(9, 0, 0, 0);
      return date.getTime();
    }
  },
  {
    text: '今天中午',
    value: () => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      return date.getTime();
    }
  },
  {
    text: '今天晚上',
    value: () => {
      const date = new Date();
      date.setHours(18, 0, 0, 0);
      return date.getTime();
    }
  },
  {
    text: '昨天',
    value: () => {
      const date = new Date();
      date.setTime(Date.now() - 3600 * 1000 * 24);
      date.setHours(12, 0, 0, 0);
      return date.getTime();
    }
  }
];

// 禁用未来日期
const disableFutureDate = (time) => {
  return time > Date.now();
};

// 获取记录列表
const fetchRecords = async () => {
  try {
    const params = {
      pageNum: currentPage.value,  // 页码从1开始
      pageSize: pageSize.value
    };

    // 如果选择了收入或支出类型
    if (filterType.value !== -1) {
      params.type = String(filterType.value);  // 转换为字符串类型
    }

    // 如果选择了月份
    if (selectedMonth.value) {
      const date = new Date(Number(selectedMonth.value));
      params.year = date.getFullYear();
      params.month = date.getMonth() + 1;  // JavaScript月份从0开始，需要+1
    }

    const response = await accountApi.getRecords(params);
  if (response && response.code === 200) {
      records.value = response.rows.map(record => ({
        ...record,
        amount: Number(record.amount).toFixed(2) // 确保金额格式正确
      }));
      total.value = response.total;
    } else {
      ElMessage({
        type: 'error',
        message: (response && response.msg) || '获取数据失败'
      });
    }
  } catch (error) {
    handleApiError(error);
  }
};

// 获取分页后的数据
const paginatedRecords = computed(() => records.value);



// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(Number(timestamp));
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // 判断是否是今天
  if (date.toDateString() === today.toDateString()) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  // 判断是否是昨天
  else if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  // 其他日期
  else {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// 格式化金额
const formatAmount = (amount) => {
  return amount.toFixed(2);
};

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  fetchRecords(); // 重新获取数据
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchRecords(); // 重新获取数据
};

// 删除记录
const deleteRecord = (index) => {
  const record = records.value[index];
  const recordType = record.type === '1' ? '收入' : '支出';
  
  ElMessageBox.confirm(`确定要删除这条${recordType}记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await accountApi.deleteRecord(record.id);
  if (response && response.code === 200) {
        ElMessage({
          type: 'success',
          message: response.msg || '删除成功'
        });
        
        // 删除成功后重新获取当前页数据
        await fetchRecords();
        
        // 如果当前页没有数据了，返回上一页
        if (records.value.length === 0 && currentPage.value > 1) {
          currentPage.value--;
          await fetchRecords();
        }
      } else {
        ElMessage({
          type: 'error',
          message: (response && response.msg) || '删除失败'
        });
      }
    } catch (error) {
      handleApiError(error);
    }
  }).catch(() => {});
};



// 打开更新对话框
const updateRecord = (index) => {
  const record = paginatedRecords.value[index];
  updateForm.value = { ...record };
  updateIndex.value = index;
  updateDialogVisible.value = true;
};

// 确认更新记录
const confirmUpdate = async () => {
  if (!updateForm.value.description || !updateForm.value.amount || !updateForm.value.recordDate || !updateForm.value.category) {
    ElMessage({
      message: '请输入完整的记录信息（分类、描述、金额和时间）',
      type: 'warning',
    })
    return;
  }

  try {
    const record = records.value[updateIndex.value];
    const response = await accountApi.updateRecord(record.id, {
      ...updateForm.value,
      amount: Number(updateForm.value.amount).toFixed(2) // 确保金额格式正确
    });

  if (response && response.code === 200) {
      ElMessage({
        type: 'success',
        message: response.msg || '更新成功'
      });
      updateDialogVisible.value = false;
      // 更新成功后重新获取数据
      await fetchRecords();
    } else {
      ElMessage({
        type: 'error',
        message: (response && response.msg) || '更新失败'
      });
    }
  } catch (error) {
    handleApiError(error);
  }
};

// 监听筛选条件变化
watch([filterType, selectedMonth], () => {
  currentPage.value = 1; // 重置到第一页
  fetchRecords(); // 重新获取数据
});

// 组件挂载时获取数据
onMounted(() => {
  fetchRecords();
});

const addRecord = async () => {
  // 表单验证
  if (!newRecord.value.category || !newRecord.value.description || newRecord.value.amount <= 0 || !newRecord.value.recordDate) {
    ElMessage({
      message: '请输入完整的记录信息（分类、描述、金额和时间）',
      type: 'warning',
    })
    return;
  }

  loading.value = true;
  try {
    // 准备请求数据，确保金额为BigDecimal格式的字符串
    const recordData = {
      type: String(newRecord.value.type), // 确保是字符串
      category: newRecord.value.category,
      description: newRecord.value.description,
      amount: Number(newRecord.value.amount).toFixed(2), // 转为字符串，保留两位小数
      recordDate: newRecord.value.recordDate
    };

    // 发送POST请求
    const response = await accountApi.addRecord(recordData);
    
  if (response && response.code === 200) {
      // 添加成功后刷新列表数据
      await fetchRecords();
      
      ElMessage({
        message: response.msg || `${newRecord.value.type === '1' ? '收入' : '支出'}添加成功`,
        type: 'success',
      });
    } else {
      ElMessage({
        type: 'error',
        message: (response && response.msg) || '添加失败'
      });
      return; // 如果添加失败，不重置表单
    }
    
    // 重置表单
    newRecord.value = {
      type: newRecord.value.type, // 保持当前选择的类型
      category: '', // 清空分类
      description: '',
      amount: 0,
      recordDate: new Date().toISOString() // 重置为当前时间，使用ISO格式
    };
    
    // 添加新记录后，跳转到第一页
    currentPage.value = 1;
    
    ElMessage({
      message: `${newRecord.value.type === '1' ? '收入' : '支出'}添加成功`,
      type: 'success',
    });
  } catch (error) {
    handleApiError(error);
  } finally {
    loading.value = false;
  }
};


</script>

<style scoped>
.el-header {
  text-align: center;
}

.el-row {
  margin: 0 !important;
}

.box-card {
  margin-bottom: 20px;
  height: 100%;
}

.overview-card {
  height: 220px; /* 固定高度，可根据需要调整 */
  overflow: hidden;
}

.overview-card .el-card__body {
  height: 100%;
  overflow: auto; /* 内部滚动，避免卡片被拉长 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;

  .title {
    font-weight: bold;
    font-size: 16px;
  }

  .month-picker {
    width: 140px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.income-amount {
  color: #67c23a;
  font-weight: bold;
}

.expense-amount {
  color: #f56c6c;
  font-weight: bold;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .el-row {
    margin: 0 -10px !important;
  }
  
  .el-col {
    padding: 0 10px !important;
  }
  
  :deep(.el-card) {
    margin-bottom: 15px;
  }

  .pagination-container {
    .el-pagination {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}
</style>
