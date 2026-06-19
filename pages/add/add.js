Page({
  data: {
    productName: "",
    brand: "",
    series: "",
    shade: "",
    selectedCategory: "",
    otherCategory: "",
    openDate: "",
    shelfLife: "",
    note: "",
    image: "",
    categories: [
      "粉底液", "彩妆品", "香水", "洗面奶", "卸妆膏", "遮瑕","散粉", "修容", "腮红", "眼影盘", "面霜", "睫毛膏", "眼线笔", "口红", "美甲", "身体乳", "定妆", "其它"
    ],
    showOtherInput: false,
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
      this.loadProductData(options.id);
    }
  },

  loadProductData(id) {
    const products = wx.getStorageSync("cosmeticProducts") || [];
    const product = products.find(p => p.id == id);
    if (product) {
      // 判断是否是自定义类别
      const isCustomCategory = !this.data.categories.includes(product.category);
      const selectedCategory = isCustomCategory ? "其它" : product.category;
      
      this.setData({
        productName: product.name || "",
        brand: product.brand || "",
        series: product.series || "",
        shade: product.shade || "",
        selectedCategory: selectedCategory,
        otherCategory: isCustomCategory ? product.category : "",
        openDate: product.openDate || "",
        shelfLife: product.shelfLife ? product.shelfLife.toString() : "",
        note: product.note || "",
        image: product.image || "",
        showOtherInput: isCustomCategory
      });
    }
  },

  // 产品种类选择
  onCategoryChange(e) {
    const index = e.detail.value;
    const selectedCategory = this.data.categories[index];
    const showOtherInput = selectedCategory === "其它";
    
    this.setData({ 
      selectedCategory: selectedCategory,
      showOtherInput: showOtherInput,
      otherCategory: showOtherInput ? this.data.otherCategory : ""
    });
  },

  // 其他类别输入
  onOtherCategoryInput(e) {
    this.setData({ otherCategory: e.detail.value });
  },

  // 品牌输入
  onBrandInput(e) {
    this.setData({ brand: e.detail.value });
  },

  // 产品系列输入
  onSeriesInput(e) {
    this.setData({ series: e.detail.value });
  },

  // 产品名称输入
  onNameInput(e) {
    this.setData({ productName: e.detail.value });
  },

  // 色号输入
  onShadeInput(e) {
    this.setData({ shade: e.detail.value });
  },

  // 启封日期选择
  onOpenDateChange(e) {
    this.setData({ openDate: e.detail.value });
  },

  // 保质期输入
  onShelfLifeInput(e) {
    this.setData({ shelfLife: e.detail.value });
  },

  // 备注输入
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

  saveProduct() {
    // 验证必填字段
    if (!this.data.selectedCategory) {
      wx.showToast({ title: "请选择产品种类", icon: "none" });
      return;
    }
    if (!this.data.brand) {
      wx.showToast({ title: "请填写品牌", icon: "none" });
      return;
    }
    if (!this.data.openDate) {
      wx.showToast({ title: "请选择启封日期", icon: "none" });
      return;
    }
    if (!this.data.shelfLife) {
      wx.showToast({ title: "请填写保质期", icon: "none" });
      return;
    }
    // 如果选择"其它"类别，需要验证其他类别输入
    if (this.data.selectedCategory === "其它" && !this.data.otherCategory) {
      wx.showToast({ title: "请填写其他类别名称", icon: "none" });
      return;
    }

    // 计算过期日期
    const openDate = new Date(this.data.openDate);
    const expiryDate = new Date(openDate);
    expiryDate.setMonth(expiryDate.getMonth() + parseInt(this.data.shelfLife));
    
    const expiryDateStr = expiryDate.toISOString().split("T")[0];
    
    // 确定最终类别名称
    const finalCategory = this.data.selectedCategory === "其它" 
      ? this.data.otherCategory 
      : this.data.selectedCategory;

    // 准备产品数据
    const productData = {
      id: this.data.isEdit ? this.data.editId : 'product_' + Date.now(),
      name: this.data.productName,
      brand: this.data.brand,
      series: this.data.series,
      shade: this.data.shade,
      category: finalCategory,
      openDate: this.data.openDate,
      shelfLife: this.data.shelfLife,
      note: this.data.note,
      image: this.data.image,
      expiryDate: expiryDateStr
    };

    // 添加时间信息
    if (this.data.isEdit) {
      productData.updatedDate = new Date().toISOString().split("T")[0];
      // 保留原有的添加日期
      const existingProducts = wx.getStorageSync("cosmeticProducts") || [];
      const existingProduct = existingProducts.find(p => p.id == this.data.editId);
      if (existingProduct) {
        productData.addedDate = existingProduct.addedDate;
      }
    } else {
      productData.addedDate = new Date().toISOString().split("T")[0];
      productData.updatedDate = new Date().toISOString().split("T")[0];
    }

    // 保存到本地存储
    const products = wx.getStorageSync("cosmeticProducts") || [];
    
    if (this.data.isEdit) {
      // 编辑模式：更新现有产品
      const index = products.findIndex(p => p.id == this.data.editId);
      if (index !== -1) {
        products[index] = productData;
      }
    } else {
      // 添加模式：添加新产品
      products.push(productData);
    }
    
    wx.setStorageSync("cosmeticProducts", products);
    
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