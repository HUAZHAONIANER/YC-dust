Page({
  data: {
    products: [],
    searchKeyword: "",
    filterCategory: "",
    showFilter: false,
    categories: ["全部"],
    filteredProducts: [],
    totalCount: 0,
    expiringCount: 0,  // 30天内过期的产品数量
    urgentCount: 0,    // 7天内过期的产品数量
    pickerCategoryIndex: 0
  },

  onShow() {
    this.loadProducts();
    this.loadCategories();
  },

  loadProducts() {
    const products = wx.getStorageSync('cosmeticProducts') || [];
    // 按添加日期倒序排列，确保最新的在前面
    products.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    
    // 为每个产品计算剩余天数
    const productsWithDays = products.map(product => {
      const daysLeft = this.getDaysLeft(product.expiryDate);
      return {
        ...product,
        daysLeft: daysLeft,
        expiryStatus: this.getExpiryStatus(daysLeft)
      };
    });
    
    this.setData({ 
      products: productsWithDays,
      filteredProducts: productsWithDays,
      totalCount: productsWithDays.length
    });
    this.filterProducts();
  },

  // 过滤产品
  filterProducts() {
    let filtered = this.data.products;
    
    // 搜索筛选
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(keyword)) ||
        (p.brand && p.brand.toLowerCase().includes(keyword)) ||
        (p.series && p.series.toLowerCase().includes(keyword)) ||
        (p.category && p.category.toLowerCase().includes(keyword))
      );
    }
    
    // 类别筛选
    if (this.data.filterCategory && this.data.filterCategory !== "全部") {
      filtered = filtered.filter(p => p.category === this.data.filterCategory);
    }
    
    // 计算统计数据
    const expiringCount = filtered.filter(p => p.daysLeft <= 30 && p.daysLeft > 0).length;
    const urgentCount = filtered.filter(p => p.daysLeft <= 7 && p.daysLeft > 0).length;
    
    this.setData({ 
      filteredProducts: filtered,
      totalCount: filtered.length,
      expiringCount: expiringCount,
      urgentCount: urgentCount
    });
  },

  loadCategories() {
    const products = wx.getStorageSync('cosmeticProducts') || [];
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    // 确保"全部"在第一位
    const allCategories = ["全部", ...categories.sort()];
    
    this.setData({ 
      categories: allCategories
    });
    
    // 设置默认picker索引
    const currentIndex = this.data.categories.indexOf(this.data.filterCategory);
    this.setData({
      pickerCategoryIndex: currentIndex >= 0 ? currentIndex : 0
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
    this.filterProducts();
  },

  // 筛选类别
  onFilterChange(e) {
    const index = parseInt(e.detail.value);
    const selectedCategory = this.data.categories[index];
    
    this.setData({ 
      filterCategory: selectedCategory,
      pickerCategoryIndex: index
    });
    
    this.filterProducts();
  },

  // 切换筛选面板
  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  // 编辑产品
  editProduct(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/add/add?id=${id}`
    });
  },

  // 删除产品
  deleteProduct(e) {
    const id = e.currentTarget.dataset.id;
    const product = this.data.products.find(p => p.id === id);
    
    if (!product) return;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${product.brand}${product.name ? ' - ' + product.name : ''} 吗？`,
      confirmColor: '#ff5499',
      success: (res) => {
        if (res.confirm) {
          const products = this.data.products.filter(p => p.id !== id);
          wx.setStorageSync('cosmeticProducts', products);
          this.loadProducts();
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 获取剩余天数
  getDaysLeft(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diff = expiry - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  // 获取过期状态
  getExpiryStatus(daysLeft) {
    if (daysLeft < 0) {
      return {
        text: '已过期',
        class: 'expired',
        color: '#ff6b6b'
      };
    } else if (daysLeft <= 7) {
      return {
        text: '即将过期',
        class: 'urgent',
        color: '#ffa94d'
      };
    } else if (daysLeft <= 30) {
      return {
        text: '注意保质期',
        class: 'warning',
        color: '#ffd43b'
      };
    } else {
      return {
        text: '保质期内',
        class: 'normal',
        color: '#51cf66'
      };
    }
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      searchKeyword: "",
      filterCategory: "全部",
      pickerCategoryIndex: 0
    });
    this.filterProducts();
  },

  // 添加新产品
  addNewProduct() {
    wx.navigateTo({
      url: '/pages/add/add'
    });
  }
});