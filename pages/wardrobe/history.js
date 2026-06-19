Page({
  data: {
    clothes: [],
    searchKeyword: "",
    filterCategory: "全部",
    filterSeason: "全部",
    showFilter: false,
    categories: ["全部"],
    seasons: ["全部"],
    filteredClothes: [],
    totalCount: 0,
    
    // 统计信息
    categoryStats: {},
    seasonStats: {},
    colorStats: {}
  },

  onShow() {
    this.loadClothes();
    this.loadFilters();
  },

  loadClothes() {
    const wardrobeData = wx.getStorageSync('wardrobeData') || {};
    const clothes = wardrobeData.clothes || [];
    
    // 按添加日期倒序排列
    clothes.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    
    this.setData({ 
      clothes: clothes,
      filteredClothes: clothes, // 初始化时显示所有衣物
      totalCount: clothes.length
    });
    
    this.calculateStats(clothes);
  },

  filterClothes() {
    let filtered = this.data.clothes;
    
    // 搜索筛选
    if (this.data.searchKeyword.trim()) {
      const keyword = this.data.searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(c => 
        (c.brand && c.brand.toLowerCase().includes(keyword)) ||
        (c.category && c.category.toLowerCase().includes(keyword)) ||
        (c.color && c.color.toLowerCase().includes(keyword)) ||
        (c.material && c.material.toLowerCase().includes(keyword))
      );
    }
    
    // 类别筛选
    if (this.data.filterCategory && this.data.filterCategory !== "全部") {
      filtered = filtered.filter(c => c.category === this.data.filterCategory);
    }
    
    // 季节筛选
    if (this.data.filterSeason && this.data.filterSeason !== "全部") {
      filtered = filtered.filter(c => c.season === this.data.filterSeason);
    }
    
    this.setData({ 
      filteredClothes: filtered,
      totalCount: filtered.length
    });
  },

  loadFilters() {
    const clothes = this.data.clothes;
    
    // 获取所有类别
    const categories = [...new Set(clothes.map(c => c.category).filter(Boolean))];
    
    // 获取所有季节
    const seasons = [...new Set(clothes.map(c => c.season).filter(Boolean))];
    
    this.setData({ 
      categories: ["全部", ...categories.sort()],
      seasons: ["全部", ...seasons.sort()]
    });
  },

  calculateStats(clothes) {
    const categoryStats = {};
    const seasonStats = {};
    const colorStats = {};
    
    clothes.forEach(clothing => {
      // 统计类别
      if (clothing.category) {
        categoryStats[clothing.category] = (categoryStats[clothing.category] || 0) + 1;
      }
      
      // 统计季节
      if (clothing.season) {
        seasonStats[clothing.season] = (seasonStats[clothing.season] || 0) + 1;
      }
      
      // 统计颜色
      if (clothing.color) {
        colorStats[clothing.color] = (colorStats[clothing.color] || 0) + 1;
      }
    });
    
    this.setData({
      categoryStats: categoryStats,
      seasonStats: seasonStats,
      colorStats: colorStats
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
    this.filterClothes();
  },

  // 筛选类别
  onCategoryFilterChange(e) {
    const index = e.detail.value;
    const selectedCategory = this.data.categories[index];
    
    this.setData({ 
      filterCategory: selectedCategory
    });
    
    this.filterClothes();
  },

  // 筛选季节
  onSeasonFilterChange(e) {
    const index = e.detail.value;
    const selectedSeason = this.data.seasons[index];
    
    this.setData({ 
      filterSeason: selectedSeason
    });
    
    this.filterClothes();
  },

  // 切换筛选面板
  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  // 编辑衣物
  editClothing(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/wardrobe/add?id=${id}`
    });
  },

  // 删除衣物
  deleteClothing(e) {
    const id = e.currentTarget.dataset.id;
    const clothing = this.data.clothes.find(c => c.id === id);
    
    if (!clothing) return;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${clothing.brand ? clothing.brand + ' ' : ''}${clothing.category} 吗？`,
      confirmColor: '#9b5de5',
      success: (res) => {
        if (res.confirm) {
          const wardrobeData = wx.getStorageSync('wardrobeData') || {};
          const updatedClothes = wardrobeData.clothes.filter(c => c.id !== id);
          wardrobeData.clothes = updatedClothes;
          wx.setStorageSync('wardrobeData', wardrobeData);
          
          // 重新加载数据
          this.loadClothes();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      searchKeyword: "",
      filterCategory: "全部",
      filterSeason: "全部"
    });
    
    this.filterClothes();
  },

  // 添加新衣物
  addNewClothing() {
    wx.navigateTo({
      url: '/pages/wardrobe/add'
    });
  },

  // 颜色转换函数
  getColorHex(color) {
    const colorMap = {
      '白色': '#ffffff',
      '黑色': '#000000',
      '灰色': '#808080',
      '红色': '#ff0000',
      '蓝色': '#0000ff',
      '绿色': '#008000',
      '黄色': '#ffff00',
      '粉色': '#ffc0cb',
      '紫色': '#800080',
      '棕色': '#a52a2a',
      '其它': '#cccccc'
    };
    return colorMap[color] || '#cccccc';
  }
});