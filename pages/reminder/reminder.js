Page({
  data: {
    expiringProducts: []
  },

  onShow() {
    this.checkExpiry();
  },

  checkExpiry() {
    const products = wx.getStorageSync("cosmeticProducts") || [];
    const today = new Date();
    
    const expiring = products.map(p => {
      const expiry = new Date(p.expiryDate);
      const open = new Date(p.openDate);
      return {
        ...p,
        daysLeft: Math.ceil((expiry - today) / (86400000)),
        usedDays: Math.ceil((today - open) / (86400000))
      };
    }).filter(p => p.daysLeft < 30);
    
    this.setData({ expiringProducts: expiring });
  }
});