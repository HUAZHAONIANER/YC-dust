App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 初始化数据
    this.initCosmeticData()
    this.initWardrobeData()
    this.initHealthData()
    this.initFinanceData()
  },

  initCosmeticData() {
    const cosmeticProducts = wx.getStorageSync('cosmeticProducts')
    if (!cosmeticProducts) {
      wx.setStorageSync('cosmeticProducts', [])
    }
  },

  initWardrobeData() {
    const wardrobeData = wx.getStorageSync('wardrobeData')
    if (!wardrobeData) {
      wx.setStorageSync('wardrobeData', {
        clothes: []
      })
    }
  },

  initHealthData() {
    const healthData = wx.getStorageSync('healthData')
    if (!healthData) {
      wx.setStorageSync('healthData', {
        bmiRecords: [],
        periodRecords: [],
        milkteaRecords: []
      })
    }
  },

  initFinanceData() {
    const financeData = wx.getStorageSync('financeData')
    if (!financeData) {
      wx.setStorageSync('financeData', {
        records: []
      })
    }
  },

  globalData: {
    userInfo: null
  }
})