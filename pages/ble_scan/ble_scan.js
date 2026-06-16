// pages/ble_scan/ble_scan.js
const app = getApp();

Page({
  data: {
    devices: [],
    deviceCount: 0,
    isScanning: false
  },

  onLoad() {
    this.initBluetooth();
  },

  onShow() {
    // 页面显示时自动开始扫描
    this.startScan();
  },

  onHide() {
    this.stopScan();
  },

  onUnload() {
    this.stopScan();
    this.closeBluetooth();
  },

  // 初始化蓝牙适配器
  initBluetooth() {
    wx.openBluetoothAdapter({
      success: () => {
        console.log('蓝牙适配器初始化成功');
        this.startScan();
      },
      fail: (err) => {
        console.error('蓝牙适配器初始化失败', err);
        wx.showModal({
          title: '提示',
          content: '请开启蓝牙功能',
          showCancel: false,
          success: () => {
            wx.openSetting();
          }
        });
      }
    });

    // 监听设备发现事件
    wx.onBluetoothDeviceFound((res) => {
      const newDevices = res.devices;
      this.addDevices(newDevices);
    });

    // 监听蓝牙适配器状态变化
    wx.onBluetoothAdapterStateChange((res) => {
      if (!res.available) {
        this.setData({
          isScanning: false
        });
        wx.showToast({
          title: '蓝牙已关闭',
          icon: 'none'
        });
      }
    });
  },

  // 添加新发现的设备
  addDevices(newDevices) {
    const currentDevices = this.data.devices;
    const deviceIds = new Set(currentDevices.map(d => d.deviceId));
    
    newDevices.forEach(device => {
      if (!deviceIds.has(device.deviceId)) {
        device.connected = false;
        currentDevices.push(device);
        deviceIds.add(device.deviceId);
      }
    });

    this.setData({
      devices: currentDevices,
      deviceCount: currentDevices.length
    });
  },

  // 开始扫描
  startScan() {
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: false,
      success: () => {
        this.setData({
          isScanning: true
        });
        console.log('开始扫描蓝牙设备');
      },
      fail: (err) => {
        console.error('开始扫描失败', err);
      }
    });
  },

  // 停止扫描
  stopScan() {
    wx.stopBluetoothDevicesDiscovery({
      success: () => {
        this.setData({
          isScanning: false
        });
        console.log('停止扫描');
      }
    });
  },

  // 切换扫描状态
  toggleScan() {
    if (this.data.isScanning) {
      this.stopScan();
    } else {
      this.startScan();
    }
  },

  // 连接设备
  onDeviceConnect(e) {
    const deviceId = e.currentTarget.dataset.deviceId;
    const name = e.currentTarget.dataset.name;

    wx.showLoading({
      title: '连接中...',
      mask: true
    });

    // 停止扫描
    this.stopScan();

    // 创建蓝牙连接
    wx.createBLEConnection({
      deviceId: deviceId,
      timeout: 10000,
      success: () => {
        wx.hideLoading();
        wx.showToast({
          title: '连接成功',
          icon: 'success'
        });

        // 更新设备连接状态
        const devices = this.data.devices.map(device => {
          if (device.deviceId === deviceId) {
            device.connected = true;
          }
          return device;
        });
        this.setData({ devices });

        // 保存到全局数据
        app.globalData.deviceId = deviceId;
        app.globalData.deviceName = name;
        app.globalData.isConnected = true;

        // 获取服务
        this.getBLEServices(deviceId);

        // 跳转到数据概览页面
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/data_overview/data_overview'
          });
        }, 500);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('连接失败', err);
        wx.showModal({
          title: '连接失败',
          content: '无法连接到该设备，请重试',
          showCancel: false
        });
      }
    });
  },

  // 获取蓝牙服务
  getBLEServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res) => {
        console.log('获取服务成功', res.services);
        if (res.services.length > 0) {
          app.globalData.serviceId = res.services[0].uuid;
          this.getBLECharacteristics(deviceId, res.services[0].uuid);
        }
      },
      fail: (err) => {
        console.error('获取服务失败', err);
      }
    });
  },

  // 获取特征值
  getBLECharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId: deviceId,
      serviceId: serviceId,
      success: (res) => {
        console.log('获取特征值成功', res.characteristics);
        if (res.characteristics.length > 0) {
          app.globalData.characteristicId = res.characteristics[0].uuid;
          
          // 启用通知
          this.enableNotify(deviceId, serviceId, res.characteristics[0].uuid);
        }
      },
      fail: (err) => {
        console.error('获取特征值失败', err);
      }
    });
  },

  // 启用通知
  enableNotify(deviceId, serviceId, characteristicId) {
    wx.notifyBLECharacteristicValueChange({
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      state: true,
      success: () => {
        console.log('启用通知成功');
        
        // 监听数据变化
        wx.onBLECharacteristicValueChange((res) => {
          console.log('收到数据:', res.value);
          // 在这里解析电池数据并更新全局数据
          this.parseBatteryData(res.value);
        });
      },
      fail: (err) => {
        console.error('启用通知失败', err);
      }
    });
  },

  // 解析电池数据（示例，根据实际协议修改）
  parseBatteryData(data) {
    const buffer = data.buffer ? data : new Uint8Array(data);
    const dv = new DataView(buffer);
    
    // 示例解析逻辑，根据实际协议修改
    if (buffer.length >= 10) {
      const voltage = dv.getUint16(0) / 100;
      const current = dv.getInt16(2) / 10;
      const soc = dv.getUint16(4);
      
      app.globalData.batteryData = {
        voltage: voltage,
        current: current,
        soc: soc
      };
    }
  },

  // 关闭蓝牙适配器
  closeBluetooth() {
    wx.closeBluetoothAdapter({
      success: () => {
        console.log('蓝牙适配器已关闭');
      }
    });
  },

  // 计算信号强度百分比
  getSignalStrength(rssi) {
    if (rssi >= -50) return 100;
    if (rssi <= -100) return 0;
    return Math.round(((rssi + 100) / 50) * 100);
  },

  // 获取服务数量
  getServiceCount(serviceUUIDs) {
    return serviceUUIDs ? serviceUUIDs.length : 0;
  }
})