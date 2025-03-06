Page({
  data: {
    welcomeTexts: [
      "🌸 美，从精心管理开始",
      "💎 你的美丽值得被珍藏",
      "✨ 保鲜时光，定格容颜"
    ],
    currentWelcome: "",
    welcomeOpacity: 1
  },

  onLoad() {
    this.showWelcomeAnimation()
    wx.vibrateShort({ type: "light" })
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

  navHandler(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ 
      url,
      success: () => {
        this.setData({ navActive: true })
      }
    })
  },

  onUnload() {
    clearInterval(this.interval)
  }
})