Page({
  data: {
    currentTab: 'bmi',
    height: '',
    weight: '',
    bmi: '',
    bmiStatus: '',
    bmiRecords: [],
    periodStartDate: '',
    periodEndDate: '',
    periodDays: '',
    nextPeriodDate: '',
    periodRecords: [],
    milkteaRecords: [],
    milkteaBrand: '',
    milkteaName: '',
    milkteaSize: '',
    milkteaNote: '',
    currentMonthMilkteaCount: 0,
    currentYearMilkteaCount: 0,
    
    chartType: 'month',
    weightChartData: [],
    heightChartData: [],
    bmiChartData: [],
    chartLabels: [],
    showChart: false
  },

  onLoad() {
    this.loadHealthData();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    this.loadHealthData();

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    this.loadHealthData();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    if (tab === 'bmi') {
      this.calculateAverages();
    }
  },

  loadHealthData() {
    const healthData = wx.getStorageSync('healthData') || {};
    const bmiRecords = healthData.bmiRecords || [];
    const periodRecords = healthData.periodRecords || [];
    const milkteaRecords = healthData.milkteaRecords || [];
    this.calculateMilkteaStats(milkteaRecords);
    
    this.setData({
      bmiRecords: bmiRecords.sort((a, b) => new Date(b.date) - new Date(a.date)),
      periodRecords: periodRecords.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
      milkteaRecords: milkteaRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
    }, () => {
      this.calculateAverages();
    });
  },

  onHeightInput(e) {
    this.setData({ height: e.detail.value });
  },

  onWeightInput(e) {
    this.setData({ weight: e.detail.value });
  },

  calculateBMI() {
    const height = parseFloat(this.data.height) / 100;
    const weight = parseFloat(this.data.weight);
    
    if (!height || !weight) {
      wx.showToast({ title: '请输入身高体重', icon: 'none' });
      return;
    }
    const bmi = (weight / (height * height)).toFixed(1);
    let status = '';
    let statusColor = '';
    if (bmi < 18.5) {
      status = '体重过轻';
      statusColor = '#ffa94d';
    } else if (bmi < 24) {
      status = '体重正常';
      statusColor = '#51cf66';
    } else if (bmi < 28) {
      status = '超重';
      statusColor = '#ffd43b';
    } else {
      status = '肥胖';
      statusColor = '#ff6b6b';
    }
    const record = {
      id: 'bmi_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      height: this.data.height,
      weight: this.data.weight,
      bmi: bmi,
      status: status,
      statusColor: statusColor
    };
    this.saveBMIRecord(record);
    this.setData({
      bmi: bmi,
      bmiStatus: status,
      height: '',
      weight: ''
    });
  },

  saveBMIRecord(record) {
    const healthData = wx.getStorageSync('healthData') || {};
    healthData.bmiRecords = healthData.bmiRecords || [];
    healthData.bmiRecords.push(record);
    wx.setStorageSync('healthData', healthData);
    this.loadHealthData();
  },

  calculateAverages() {
    const records = this.data.bmiRecords;
    if (records.length === 0) {
      this.setData({ showChart: false });
      return;
    }

    const averages = this.calculateTimeBasedAverages(records, this.data.chartType);
    this.generateChartData(averages);
    this.setData({ showChart: true });
  },

  calculateTimeBasedAverages(records, type) {
    const groupedData = {};
    
    records.forEach(record => {
      const date = new Date(record.date);
      let key;
      
      switch (type) {
        case 'week':
          const weekNumber = this.getWeekNumber(date);
          key = `${date.getFullYear()}-W${weekNumber}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = {
          weightSum: 0,
          heightSum: 0,
          bmiSum: 0,
          count: 0,
          label: this.getLabel(key, type)
        };
      }
      
      groupedData[key].weightSum += parseFloat(record.weight);
      groupedData[key].heightSum += parseFloat(record.height);
      groupedData[key].bmiSum += parseFloat(record.bmi);
      groupedData[key].count++;
    });

    const averages = [];
    Object.keys(groupedData).sort().forEach(key => {
      const data = groupedData[key];
      averages.push({
        period: key,
        label: data.label,
        avgWeight: (data.weightSum / data.count).toFixed(1),
        avgHeight: (data.heightSum / data.count).toFixed(1),
        avgBMI: (data.bmiSum / data.count).toFixed(1)
      });
    });

    return averages;
  },

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  },

  getLabel(key, type) {
    switch (type) {
      case 'week':
        return `第${key.split('-W')[1]}周`;
      case 'month':
        const [year, month] = key.split('-');
        return `${year}年${month}月`;
      case 'year':
        return `${key}年`;
      default:
        return key;
    }
  },

  generateChartData(averages) {
    const labels = averages.map(item => item.label);
    const weightData = averages.map(item => parseFloat(item.avgWeight));
    const heightData = averages.map(item => parseFloat(item.avgHeight));
    const bmiData = averages.map(item => parseFloat(item.avgBMI));

    this.setData({
      chartLabels: labels,
      weightChartData: weightData,
      heightChartData: heightData,
      bmiChartData: bmiData
    });

    this.drawCharts();
  },

  drawCharts() {
    const query = wx.createSelectorQuery();
    query.select('#weightChart').fields({ node: true, size: true }).exec((res) => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.drawLineChart(ctx, this.data.weightChartData, this.data.chartLabels, '体重 (kg)', '#ff6b6b');
    });

    const query2 = wx.createSelectorQuery();
    query2.select('#bmiChart').fields({ node: true, size: true }).exec((res) => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.drawLineChart(ctx, this.data.bmiChartData, this.data.chartLabels, 'BMI', '#51cf66');
    });
  },

  drawLineChart(ctx, data, labels, title, color) {
    if (!data || data.length === 0) return;

    const canvas = ctx.canvas;
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue || 1;

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 20);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1 || 1);
      const y = canvas.height - padding - ((value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.fillStyle = color;
    data.forEach((value, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1 || 1);
      const y = canvas.height - padding - ((value - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(value.toFixed(1), x, y - 10);
    });

    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1 || 1);
      ctx.fillText(label, x, canvas.height - padding + 20);
    });
  },

  onChartTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ chartType: type }, () => {
      this.calculateAverages();
    });
  },

  toggleChart() {
    this.setData({ showChart: !this.data.showChart }, () => {
      if (this.data.showChart) {
        this.calculateAverages();
      }
    });
  },

  onPeriodStartChange(e) {
    this.setData({ periodStartDate: e.detail.value });
    this.calculatePeriod();
  },

  onPeriodEndChange(e) {
    this.setData({ periodEndDate: e.detail.value });
    this.calculatePeriod();
  },

  calculatePeriod() {
    if (!this.data.periodStartDate || !this.data.periodEndDate) return;
    const start = new Date(this.data.periodStartDate);
    const end = new Date(this.data.periodEndDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    const nextStart = new Date(start);
    nextStart.setDate(nextStart.getDate() + 28);
    this.setData({
      periodDays: days.toString(),
      nextPeriodDate: nextStart.toISOString().split('T')[0]
    });
  },

  savePeriodRecord() {
    if (!this.data.periodStartDate || !this.data.periodEndDate) {
      wx.showToast({ title: '请选择开始和结束日期', icon: 'none' });
      return;
    }
    const record = {
      id: 'period_' + Date.now(),
      startDate: this.data.periodStartDate,
      endDate: this.data.periodEndDate,
      days: this.data.periodDays,
      nextStartDate: this.data.nextPeriodDate
    };
    const healthData = wx.getStorageSync('healthData') || {};
    healthData.periodRecords = healthData.periodRecords || [];
    healthData.periodRecords.push(record);
    wx.setStorageSync('healthData', healthData);
    this.setData({
      periodStartDate: '',
      periodEndDate: '',
      periodDays: '',
      nextPeriodDate: ''
    });
    wx.showToast({ title: '记录成功', icon: 'success' });
    this.loadHealthData();
  },

  onMilkteaBrandInput(e) {
    this.setData({ milkteaBrand: e.detail.value });
  },

  onMilkteaNameInput(e) {
    this.setData({ milkteaName: e.detail.value });
  },

  onMilkteaSizeInput(e) {
    this.setData({ milkteaSize: e.detail.value });
  },

  onMilkteaNoteInput(e) {
    this.setData({ milkteaNote: e.detail.value });
  },

  saveMilkteaRecord() {
    if (!this.data.milkteaBrand || !this.data.milkteaName || !this.data.milkteaSize) {
      wx.showToast({ title: '请填写品牌、名称和容量', icon: 'none' });
      return;
    }
    const record = {
      id: 'milktea_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      brand: this.data.milkteaBrand,
      name: this.data.milkteaName,
      size: this.data.milkteaSize,
      note: this.data.milkteaNote
    };
    const healthData = wx.getStorageSync('healthData') || {};
    healthData.milkteaRecords = healthData.milkteaRecords || [];
    healthData.milkteaRecords.push(record);
    wx.setStorageSync('healthData', healthData);
    this.setData({
      milkteaBrand: '',
      milkteaName: '',
      milkteaSize: '',
      milkteaNote: ''
    });
    wx.showToast({ title: '记录成功', icon: 'success' });
    this.loadHealthData();
  },

  calculateMilkteaStats(records) {
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);
    const currentYear = now.getFullYear().toString();
    
    let monthCount = 0;
    let yearCount = 0;
    records.forEach(record => {
      const recordMonth = record.date.substring(0, 7);
      const recordYear = record.date.substring(0, 4);
      
      if (recordMonth === currentMonth) {
        monthCount++;
      }
      if (recordYear === currentYear) {
        yearCount++;
      }
    });
    this.setData({
      currentMonthMilkteaCount: monthCount,
      currentYearMilkteaCount: yearCount
    });
  },

  deleteRecord(e) {
    const { type, id } = e.currentTarget.dataset;
    const healthData = wx.getStorageSync('healthData') || {};
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          if (type === 'bmi') {
            healthData.bmiRecords = healthData.bmiRecords.filter(r => r.id !== id);
          } else if (type === 'period') {
            healthData.periodRecords = healthData.periodRecords.filter(r => r.id !== id);
          } else if (type === 'milktea') {
            healthData.milkteaRecords = healthData.milkteaRecords.filter(r => r.id !== id);
          }
          
          wx.setStorageSync('healthData', healthData);
          this.loadHealthData();
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  }
})