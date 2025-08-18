// /stores/useAuthFlow.js
import { defineStore } from 'pinia'
import { submitAuth } from '@/api/user'

export const useAuthFlow = defineStore('authFlow', {
  state: () => ({
    // 身份证
    idFront: { imageUrl: '',serverImageUrl:'', realName: '', idNumber: '', sex: '', birth: '', address: '', state: 'idle' },
    idBack:  { imageUrl: '',serverImageUrl:'', issueOrg: '', validDate: '', state: 'idle' },

    // 驾驶证
    license: { imageUrl: '',serverImageUrl:'', realName: '', idNumber: '', drivingType: '', validDate: '', state: 'idle' },

    // 人脸
    face:    { imageUrl: '', serverImageUrl:'',verified: false, score: 0, state: 'idle' },

    step: 1
  }),
  getters: {
    canNextFromId(s) {
      return s.idFront.state === 'success' && s.idBack.state === 'success'
    },
    canNextFromLicense(s) {
      return s.license.state === 'success'
    },
    canSubmit(s) {
      return (
        s.idFront.state === 'success' &&
        s.idBack.state === 'success' &&
        s.license.state === 'success' &&
        s.face.state === 'success' &&
        s.face.verified === true
      )
    }
  },
  actions: {
    reset() { this.$reset() },
    async doSubmit() {
      const userId = uni.getStorageSync('userId') || ''
      const payload = {
        userId,
        // 身份证
        realName: this.idFront.realName,
        idNumber: this.idFront.idNumber,
        frontImageUrl: this.idFront.imageUrl,
        backImageUrl: this.idBack.imageUrl,
        sex: this.idFront.sex,
        birth: this.idFront.birth,
        address: this.idFront.address,
        issueOrg: this.idBack.issueOrg,
        validDate: this.idBack.validDate,
        // 驾驶证
        drivingType: this.license.drivingType,
        drivingValidDate: this.license.validDate,
        drivingIdNumber: this.license.idNumber,
        drivingImageUrl: this.license.imageUrl,
        // 人脸
        faceVerified: this.face.verified,
        faceScore: this.face.score
      }
      await submitAuth(payload)
    }
  }
})
