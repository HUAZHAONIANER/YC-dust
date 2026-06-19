Page({
  data: {
    currentTab: 'record',
    recordType: 'income',
    amount: '',
    date: '',
    category: '',
    note: '',
    categories: {
      income: ['工资', '奖金', '投资', '兼职', '其他收入'],
      expense: ['餐饮', '购物', '交通', '娱乐', '住房', '医疗', '教育', '其他支出']
    },
    records: [],
    years: [],
    months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
    filterYear: '',
    filterMonth: '',
    
    // 统计数据显示
    monthlyIncome: '0.00',
    monthlyExpense: '0.00',
    monthlyBalance: '0.00',
    yearlyIncome: '0.00',
    yearlyExpense: '0.00',
    yearlyBalance: '0.00',
    incomeCategories: [],
    expenseCategories: [],
    
    hasIncomeData: false,
    hasExpenseData: false
  },

  onLoad() {
    this.initDateFilters();
    this.loadFinanceData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    this.loadFinanceData();

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    this.loadFinanceData();
  },

  // 初始化日期筛选器
  initDateFilters() {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push((now.getFullYear() - i).toString());
    }
    
    this.setData({
      date: now.toISOString().split('T')[0],
      filterYear: currentYear,
      filterMonth: currentMonth,
      years: years
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    if (tab === 'statistics') {
      this.calculateStatistics();
    }
  },

  loadFinanceData() {
    try {
      const financeData = wx.getStorageSync('financeData') || {};
      const records = financeData.records || [];
      
      this.setData({
        records: records.sort((a, b) => new Date(b.date) - new Date(a.date))
      });
      
      if (this.data.currentTab === 'statistics') {
        this.calculateStatistics();
      }
    } catch (error) {
      console.error('加载财务数据失败:', error);
    }
  },

  onRecordTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 
      recordType: type,
      category: ''
    });
  },

  onAmountInput(e) {
    this.setData({ amount: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    const category = this.data.categories[this.data.recordType][index];
    this.setData({ category: category });
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },

  saveRecord() {
    // 验证输入
    if (!this.data.amount || !this.data.date || !this.data.category) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    const amount = parseFloat(this.data.amount);
    if (isNaN(amount) || amount <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }

    try {
      const record = {
        id: 'finance_' + Date.now(),
        type: this.data.recordType,
        amount: amount,
        date: this.data.date,
        category: this.data.category,
        note: this.data.note,
        createdAt: new Date().toISOString()
      };

      const financeData = wx.getStorageSync('financeData') || {};
      financeData.records = financeData.records || [];
      financeData.records.push(record);
      wx.setStorageSync('financeData', financeData);
      
      this.setData({
        amount: '',
        category: '',
        note: ''
      });

      wx.showToast({ 
        title: '记录成功', 
        icon: 'success',
        success: () => {
          this.loadFinanceData();
        }
      });
    } catch (error) {
      console.error('保存记录失败:', error);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    const financeData = wx.getStorageSync('financeData') || {};
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            financeData.records = financeData.records.filter(r => r.id !== id);
            wx.setStorageSync('financeData', financeData);
            this.loadFinanceData();
            wx.showToast({ title: '删除成功', icon: 'success' });
          } catch (error) {
            console.error('删除记录失败:', error);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  onYearFilterChange(e) {
    const index = e.detail.value;
    this.setData({ filterYear: this.data.years[index] });
    this.calculateStatistics();
  },

  onMonthFilterChange(e) {
    const index = e.detail.value;
    this.setData({ filterMonth: this.data.months[index] });
    this.calculateStatistics();
  },

  // 统计计算逻辑
  calculateStatistics() {
    const { records, filterYear, filterMonth } = this.data;
    
    // 初始化统计数据
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let yearlyIncome = 0;
    let yearlyExpense = 0;
    
    const incomeCategories = {};
    const expenseCategories = {};
    
    // 初始化分类统计
    this.data.categories.income.forEach(cat => incomeCategories[cat] = 0);
    this.data.categories.expense.forEach(cat => expenseCategories[cat] = 0);

    // 遍历记录计算统计
    records.forEach(record => {
      const recordDate = new Date(record.date);
      const year = recordDate.getFullYear().toString();
      const month = (recordDate.getMonth() + 1).toString().padStart(2, '0');
      const amount = parseFloat(record.amount) || 0;

      // 月度统计
      if (year === filterYear && month === filterMonth) {
        if (record.type === 'income') {
          monthlyIncome += amount;
          // 分类统计
          if (incomeCategories[record.category] !== undefined) {
            incomeCategories[record.category] += amount;
          }
        } else {
          monthlyExpense += amount;
          // 分类统计
          if (expenseCategories[record.category] !== undefined) {
            expenseCategories[record.category] += amount;
          }
        }
      }

      // 年度统计
      if (year === filterYear) {
        if (record.type === 'income') {
          yearlyIncome += amount;
        } else {
          yearlyExpense += amount;
        }
      }
    });

    // 计算余额
    const monthlyBalance = monthlyIncome - monthlyExpense;
    const yearlyBalance = yearlyIncome - yearlyExpense;

    // 处理分类数据
    const incomeCategoriesData = Object.keys(incomeCategories)
      .map(name => ({
        name: name,
        amount: incomeCategories[name],
        amountText: this.formatAmount(incomeCategories[name])
      }))
      .filter(item => item.amount > 0);

    const expenseCategoriesData = Object.keys(expenseCategories)
      .map(name => ({
        name: name,
        amount: expenseCategories[name],
        amountText: this.formatAmount(expenseCategories[name])
      }))
      .filter(item => item.amount > 0);

    // 更新数据
    this.setData({
      monthlyIncome: this.formatAmount(monthlyIncome),
      monthlyExpense: this.formatAmount(monthlyExpense),
      monthlyBalance: this.formatAmount(monthlyBalance),
      yearlyIncome: this.formatAmount(yearlyIncome),
      yearlyExpense: this.formatAmount(yearlyExpense),
      yearlyBalance: this.formatAmount(yearlyBalance),
      incomeCategories: incomeCategoriesData,
      expenseCategories: expenseCategoriesData,
      hasIncomeData: incomeCategoriesData.length > 0,
      hasExpenseData: expenseCategoriesData.length > 0
    });
  },

  // 格式化金额
  formatAmount(amount) {
    return parseFloat(amount || 0).toFixed(2);
  },

  exportData() {
    try {
      const financeData = wx.getStorageSync('financeData') || {};
      const dataStr = JSON.stringify(financeData, null, 2);
      
      wx.showModal({
        title: '导出数据',
        content: '数据已复制到剪贴板',
        showCancel: false,
        success: () => {
          wx.setClipboardData({
            data: dataStr,
            success: () => {
              wx.showToast({ title: '数据已复制', icon: 'success' });
            }
          });
        }
      });
    } catch (error) {
      console.error('导出数据失败:', error);
      wx.showToast({ title: '导出失败', icon: 'none' });
    }
  },
})