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
      const daysLeft = Math.ceil((expiry - today) / (86400000));
      const usedDays = Math.ceil((today - open) / (86400000));
      
      return {
        ...p,
        daysLeft: daysLeft,
        usedDays: usedDays
      };
    }).filter(p => p.daysLeft < 30); // 显示30天内过期的产品
    
    this.setData({ expiringProducts: expiring });
  }
});