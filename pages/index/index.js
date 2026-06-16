import BluetoothManager from '../../utils/BluetoothManager.js'
import Data_analysis from '../../utils/Data_analysis.js'
const bluetoothManager = new BluetoothManager();
Page({
  data: {
    mainwindow_Index: 0 ,           // 当前选中的页面索引，默认第一个
    BT_device: [],//用于保存所有的蓝牙设备信息
    BT_Scan_icon : "",
    BT_SOC_icon :"",
    BT_Button_Start:"",
    Pack_Data:
      {
        voltage:20,
        current:30,
        power:40,
        cap:50,
        count:60,
        statue:"正常",
      },
    rev_data:[],
    Cell_Data:[],
    Temp_data:[],
  },
  onBottomNavSwitch(e){
    const index = e.detail.index;
    this.setData({
      mainwindow_Index: index
    });
  },
  createBLEConnection(e){
    const { deviceId, name } = e.currentTarget.dataset;
  
    if (!deviceId) {
      wx.showToast({ title: '设备ID无效', icon: 'none' });
      return;
    }
  
    console.log('[主界面控制] 尝试连接设备', { deviceId, name });
  
    // 调用蓝牙管理器连接（传入 deviceId 和 name）
    bluetoothManager.connect(deviceId, name)
      .then(() => {
        wx.showToast({ title: '连接成功' });
        bluetoothManager.startAutoSend("01043100002E7EEA", 1000); // 每秒发一次
        
      })
      .catch(err => {
        wx.showToast({ title: '连接失败', icon: 'none' });
        console.error('连接失败:', err);
      });
  },
  onLoad() {
    //注册蓝牙事件
    //当发现新的蓝牙设备后，回调函数中将新的蓝牙设备添加到设备列表中
    bluetoothManager.on('onDeviceFound',(BT_device) =>{
      this.setData({ BT_device });
    });
    //连接设备回调函数
    bluetoothManager.on('onConnected', (deviceId, name) => {
      this.setData({ connected: true, name, deviceId });
    });
    //断开设备回调函数
    bluetoothManager.on('onDisconnected', () => {
      this.setData({ connected: false, chs: [] });
    });
    //接收数据回调函数
    bluetoothManager.on('onDataReceived', (received) => {
      wx.showToast({ title: '数据接收成功' });
       // ✅ 正确：从 this.data.rev_data 获取当前数组，并追加新数据（hex 字符串）
    const newRevData = [...this.data.rev_data, received.value];
    
    // ✅ 更新页面数据
    this.setData({
      rev_data: newRevData
    });

    // 可选：打印日志
    console.log('[收到蓝牙数据]', received.value);
    });
    bluetoothManager.initAdapter()
  },
  onShow: function() {
    // 每次页面显示时刷新设备列表（可选）
    this.loadDeviceList();
  },
   // 加载设备列表的方法
   loadDeviceList: function() {
    // 获取蓝牙管理器中的设备列表
    const deviceList = bluetoothManager.getDeviceList();
    
    // 将设备列表赋值给页面数据
    this.setData({
      BT_device: deviceList,
      devices: deviceList // 如果也需要同步给 devices
    });
    console.log('设备列表已更新:', deviceList);
  },
})
