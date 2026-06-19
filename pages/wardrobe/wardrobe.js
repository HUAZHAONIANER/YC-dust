Page({
  data: {
    welcomeTexts: [
      "👗 扬尘 · 时尚生活管理",
      "👔 精心整理每一件心爱衣物", 
      "✨ 穿搭灵感，从衣橱开始"
    ],
    currentWelcome: "",
    welcomeOpacity: 1,
    totalClothes: 0,
    categoriesCount: 0,
    seasonsCount: 0
  },

  onLoad() {
    this.showWelcomeAnimation()
    this.loadStatistics()
  },

  onShow() {
    // 设置当前tabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
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
    const wardrobeData = wx.getStorageSync('wardrobeData') || {}
    const clothes = wardrobeData.clothes || []
    
    // 计算品类数量
    const categories = [...new Set(clothes.map(c => c.category).filter(Boolean))]
    
    // 计算季节数量
    const seasons = [...new Set(clothes.map(c => c.season).filter(Boolean))]
    
    this.setData({
      totalClothes: clothes.length,
      categoriesCount: categories.length,
      seasonsCount: seasons.length
    })
  },

  navigateToAdd() {
    wx.navigateTo({
      url: '/pages/wardrobe/add'
    })
  },

  navigateToHistory() {
    wx.navigateTo({
      url: '/pages/wardrobe/history'
    })
  },

  onUnload() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
})