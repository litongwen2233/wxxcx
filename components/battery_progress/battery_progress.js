// components/battery_progress/battery_progress.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    percent: {
      type: Number,
      value: 50,
      observer: function(newVal) {
        // 当percent变化时自动更新状态
        this.updateBatteryStatus(newVal);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: function() {
    return {
      batteryLevel: 'full'
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 根据百分比更新电池状态
    updateBatteryStatus: function(percent) {
      let level = 'full';
      if (percent <= 30) {
        level = 'low';
      } else if (percent <= 60) {
        level = 'med';
      }
      this.setData({ batteryLevel: level });
    },

  // 外部可调用的方法：设置电量
    setBatteryLevel: function(newPercent) {
      newPercent = Math.max(0, Math.min(100, newPercent));
      this.setData({ percent: newPercent });
    } 
  }
})