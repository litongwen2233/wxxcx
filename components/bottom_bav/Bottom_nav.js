Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 当前选中的索引
    currentIndex: {
      type: Number,
      value: 0
    },
    // 导航项配置（可选，用于自定义按钮文字和索引）
    navItems: {
      type: Array,
      value: [
        { name: '连接', index: 0 },
        { name: '数据', index: 1 },
        { name: '详细数据', index: 2 }
      ]
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSwitchTab(e) {
      const index = parseInt(e.currentTarget.dataset.index);
      
      // 触发自定义事件，将选中的索引传递给父组件
      this.triggerEvent('switchtab', { index: index });
    }
  }
})