import { defineStore } from 'pinia'
import { ref } from 'vue'

interface CarItem {
  id: string
  name: string
  price: number
  distance: number
  image: string
}

export const useRentalStore = defineStore('rental', () => {
  // 状态定义
  const userInfo = ref<{ isStudent: boolean }>()
  const returnSpots = ref(['中关村校区', '五道口', '学院路'])
  const availableCars = ref<CarItem[]>([])
  
  // 初始化方法
  const init = async () => {
    // #ifdef MP-WEIXIN
    await checkWxAuth()
    // #endif
    loadCars()
  }
  
  // 业务方法
  const getStudentCars = () => {
    return availableCars.value.filter(car => car.price < 15)
  }
  
  // 私有方法
  const loadCars = async () => {
    // 实际项目替换为API调用
    availableCars.value = [
      {
        id: '001',
        name: '比亚迪e5',
        price: 9,
        distance: 500,
        image: '/static/cars/e5.jpg'
      },
      // 更多车辆数据...
    ]
  }
  
  return {
    userInfo,
    returnSpots,
    availableCars,
    init,
    getStudentCars
  }
})