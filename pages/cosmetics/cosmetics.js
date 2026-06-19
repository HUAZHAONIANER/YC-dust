Page({
  data: {
    welcomeTexts: [
      "🌸 扬尘 · 精致生活管理",
      "💎 精心呵护每一件美丽藏品", 
      "✨ 保鲜时光，定格美丽容颜"
    ],
    currentWelcome: "",
    welcomeOpacity: 1,
    totalProducts: 0,
    expiringSoon: 0,
    categoriesCount: 0
  },

  onLoad() {
    this.showWelcomeAnimation()
    this.loadStatistics()
  },

  onShow() {
    // 设置当前tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    this.loadStatistics()
  },

  showWelcomeAnimation() {
    let index = 0
    const texts = this.data.welcomeTexts
    this.setData({ currentWelcome: texts[0] })
    
    this.interval = setInterval(() => {
      index = (index + 1) % texts.length
      this.setData({ welcomeOpacity: 0 })
      setTimeout(() => {
        this.setData({
          currentWelcome: texts[index],
          welcomeOpacity: 1
        })
      }, 600)
    }, 3000)
  },

  loadStatistics() {
    const products = wx.getStorageSync("cosmeticProducts") || []
    const today = new Date()
    
    // 计算即将过期的产品（30天内）
    const expiring = products.filter(p => {
      if (!p.expiryDate) return false
      const expiry = new Date(p.expiryDate)
      const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      return daysLeft <= 30 && daysLeft > 0
    })
    
    // 计算品类数量
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
    
    this.setData({
      totalProducts: products.length,
      expiringSoon: expiring.length,
      categoriesCount: categories.length
    })
  },

  navigateToAdd() {
    wx.navigateTo({
      url: '/pages/add/add'
    })
  },

  navigateToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  navigateToReminder() {
    wx.navigateTo({
      url: '/pages/reminder/reminder'
    })
  },

  onUnload() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
})