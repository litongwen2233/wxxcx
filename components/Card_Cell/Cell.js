Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 单体电压数据数组
    cellData: {
      type: Array,
      value: []
    },
    // 标题文字
    title: {
      type: String,
      value: '单体电压'
    },
    // 电压单位
    unit: {
      type: String,
      value: 'mV'
    },
    // 每行显示数量
    columns: {
      type: Number,
      value: 5
    },
    // 是否显示边框和阴影
    showBorder: {
      type: Boolean,
      value: true
    },
    // 自定义样式
    customStyle: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击单个电池事件
    onCellTap(e) {
      const index = e.currentTarget.dataset.index;
      const cell = this.data.cellData[index];
      
      // 触发自定义事件，将点击的电池信息传递给父组件
      this.triggerEvent('celltap', {
        index: index,
        cellData: cell
      });
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件加载时的初始化逻辑
      console.log('CellVoltage组件已加载');
    }
  }
})