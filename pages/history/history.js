Page({
  data: {
    products: []
  },

  onShow() {
    this.loadProducts()
  },

  loadProducts() {
    const products = wx.getStorageSync('cosmeticProducts') || []
    this.setData({ products })
  },

  getDaysLeft(expiryDate) {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diff = expiry - today
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
})