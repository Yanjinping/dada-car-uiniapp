// /src/services/carTripService.js
export class CarTripService {
  constructor() {
    this.timer = null
    this.startTime = null
    this.tripData = {
      duration: 0, // 秒
      distance: 0, // 米
      currentCost: 0 // 元
    }
  }

  // 开始行程
  startTrip(ratePerHour, ratePerKilometer) {
    this.startTime = Date.now()
    this.timer = setInterval(() => {
      this.updateTripData(ratePerHour, ratePerKilometer)
    }, 1000)
  }

  // 更新行程数据
  updateTripData(ratePerHour, ratePerKilometer) {
    const currentTime = Date.now()
    const elapsedSeconds = (currentTime - this.startTime) / 1000
    
    // 模拟行驶距离 (40km/h ≈ 11.11m/s)
    const newDistance = this.tripData.distance + 11.11
    
    // 计算费用
    const timeCost = (elapsedSeconds / 3600) * ratePerHour
    const distanceCost = (newDistance / 1000) * ratePerKilometer
    
    this.tripData = {
      duration: Math.floor(elapsedSeconds),
      distance: Math.floor(newDistance),
      currentCost: parseFloat((timeCost + distanceCost).toFixed(2))
    }
  }

  // 结束行程
  endTrip() {
    clearInterval(this.timer)
    return {
      ...this.tripData,
      endTime: new Date().toISOString()
    }
  }

  // 获取当前行程数据
  getCurrentTripData() {
    return this.tripData
  }
}