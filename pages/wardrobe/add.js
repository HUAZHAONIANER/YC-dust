Page({
  data: {
    brand: "",
    category: "",
    color: "",
    season: "",
    material: "",
    purchaseDate: "",
    note: "",
    image: "",
    
    categories: [
      "上衣", "下装","连衣裙", "外套", 
      "鞋子", "包包", "配饰", "其它"
    ],
    seasons: [
      "春季", "夏季", "秋季", "冬季", "四季"
    ],
    colors: [
      "白色", "黑色", "灰色", "红色", 
      "蓝色", "绿色", "黄色", "粉色", 
      "紫色", "棕色", "其它"
    ],
    
    selectedCategoryIndex: 0,
    selectedColorIndex: 0,
    selectedSeasonIndex: 0,
    
    isEdit: false,
    editId: null
  },

  onLoad(options) {
    if (options && options.id) {
      // 编辑模式
      this.setData({ 
        isEdit: true, 
        editId: options.id 
      });
      this.loadClothingData(options.id);
    }
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split("T")[0];
    this.setData({ purchaseDate: today });
  },

  loadClothingData(id) {
    const wardrobeData = wx.getStorageSync('wardrobeData') || {};
    const clothes = wardrobeData.clothes || [];
    const clothing = clothes.find(c => c.id == id);
    
    if (clothing) {
      const categoryIndex = this.data.categories.indexOf(clothing.category);
      const colorIndex = this.data.colors.indexOf(clothing.color);
      const seasonIndex = this.data.seasons.indexOf(clothing.season);
      
      this.setData({
        brand: clothing.brand || "",
        category: clothing.category || "",
        color: clothing.color || "",
        season: clothing.season || "",
        material: clothing.material || "",
        purchaseDate: clothing.purchaseDate || "",
        note: clothing.note || "",
        image: clothing.image || "",
        selectedCategoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        selectedColorIndex: colorIndex >= 0 ? colorIndex : 0,
        selectedSeasonIndex: seasonIndex >= 0 ? seasonIndex : 0
      });
    }
  },

  // 输入处理函数
  onBrandInput(e) {
    this.setData({ brand: e.detail.value });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({ 
      category: this.data.categories[index],
      selectedCategoryIndex: index
    });
  },

  onColorChange(e) {
    const index = e.detail.value;
    this.setData({ 
      color: this.data.colors[index],
      selectedColorIndex: index
    });
  },

  onSeasonChange(e) {
    const index = e.detail.value;
    this.setData({ 
      season: this.data.seasons[index],
      selectedSeasonIndex: index
    });
  },

  onMaterialInput(e) {
    this.setData({ material: e.detail.value });
  },

  onPurchaseDateChange(e) {
    this.setData({ purchaseDate: e.detail.value });
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },

  // 上传图片
  uploadImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        that.setData({
          image: tempFilePath
        });
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        });
      }
    })
  },

  saveClothing() {
    // 验证必填字段
    if (!this.data.category) {
      wx.showToast({ title: "请选择衣物类别", icon: "none" });
      return;
    }
    if (!this.data.color) {
      wx.showToast({ title: "请选择颜色", icon: "none" });
      return;
    }
    if (!this.data.season) {
      wx.showToast({ title: "请选择适用季节", icon: "none" });
      return;
    }
    if (!this.data.purchaseDate) {
      wx.showToast({ title: "请选择购买日期", icon: "none" });
      return;
    }

    // 准备衣物数据
    const clothingData = {
      id: this.data.isEdit ? this.data.editId : 'clothing_' + Date.now(),
      brand: this.data.brand,
      category: this.data.category,
      color: this.data.color,
      season: this.data.season,
      material: this.data.material,
      purchaseDate: this.data.purchaseDate,
      note: this.data.note,
      image: this.data.image,
      addedDate: new Date().toISOString().split("T")[0]
    };

    // 添加更新时间信息
    if (this.data.isEdit) {
      clothingData.updatedDate = new Date().toISOString().split("T")[0];
      
      // 保留原有的添加日期
      const wardrobeData = wx.getStorageSync('wardrobeData') || {};
      const clothes = wardrobeData.clothes || [];
      const existingClothing = clothes.find(c => c.id == this.data.editId);
      if (existingClothing) {
        clothingData.addedDate = existingClothing.addedDate;
      }
    } else {
      clothingData.updatedDate = new Date().toISOString().split("T")[0];
    }

    // 保存到本地存储
    const wardrobeData = wx.getStorageSync('wardrobeData') || {};
    wardrobeData.clothes = wardrobeData.clothes || [];
    
    if (this.data.isEdit) {
      // 编辑模式：更新现有衣物
      const index = wardrobeData.clothes.findIndex(c => c.id == this.data.editId);
      if (index !== -1) {
        wardrobeData.clothes[index] = clothingData;
      }
    } else {
      // 添加模式：添加新衣物
      wardrobeData.clothes.push(clothingData);
    }
    
    wx.setStorageSync('wardrobeData', wardrobeData);
    
    wx.showToast({
      title: this.data.isEdit ? "更新成功" : "保存成功",
      icon: "success",
      duration: 1500,
      complete: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 1600);
      }
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});