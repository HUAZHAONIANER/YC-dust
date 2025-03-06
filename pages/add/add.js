Page({
  data: {
    productName: "",
    brand: "",
    selectedCategory: "",
    openDate: "",
    shelfLife: "",
    categories: [
      "粉底液", "彩妆", "香水", 
      "口红", "美甲", "身体乳","定妆",
    ]
  },

  // 原有输入处理
  onNameInput(e) {
    this.setData({ productName: e.detail.value });
  },

  // 新增处理方法
  onBrandInput(e) {
    this.setData({ brand: e.detail.value });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    this.setData({ 
      selectedCategory: this.data.categories[index] 
    });
  },

  onOpenDateChange(e) {
    this.setData({ openDate: e.detail.value });
  },

  onShelfLifeInput(e) {
    this.setData({ shelfLife: e.detail.value });
  },

  saveProduct() {
    const requiredFields = [
      { field: "productName", name: "产品名称" },
      { field: "brand", name: "品牌" },
      { field: "selectedCategory", name: "产品种类" },
      { field: "openDate", name: "启封日期" },
      { field: "shelfLife", name: "保质期" }
    ];

    // 验证字段
    for (let {field, name} of requiredFields) {
      if (!this.data[field]) {
        wx.showToast({ title: `请填写${name}`, icon: "none" });
        return;
      }
    }

    // 计算过期日期
    const openDate = new Date(this.data.openDate);
    const expiryDate = new Date(openDate.setMonth(
      openDate.getMonth() + parseInt(this.data.shelfLife)
    ).toISOString().split("T")[0]);

    // 存储数据
    const newProduct = {
      name: this.data.productName,
      brand: this.data.brand,
      category: this.data.selectedCategory,
      openDate: this.data.openDate,
      shelfLife: this.data.shelfLife,
      expiryDate: expiryDate,
      addedDate: new Date().toISOString().split("T")[0]
    };

    const products = wx.getStorageSync("cosmeticProducts") || [];
    products.push(newProduct);
    wx.setStorageSync("cosmeticProducts", products);

    wx.showToast({
      title: "保存成功",
      icon: "success",
      duration: 1500,
      complete: () => {
        setTimeout(() => wx.navigateBack(), 1600);
      }
    });
  }
});