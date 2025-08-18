// /stores/useAuthFlow.ts
import { defineStore } from 'pinia'
import { submitAuth } from '@/api/user'

export type OcrState = 'idle' | 'success' | 'fail'

export const useAuthFlow = defineStore('authFlow', {
  state: () => ({
    // 身份证
    idFront: { imageUrl: '', realName: '', idNumber: '', sex:'', birth:'', address:'', state: 'idle' as OcrState },
    idBack:  { imageUrl: '', issueOrg: '', validDate: '', state: 'idle' as OcrState },

    // 驾驶证
    license: { imageUrl:'', realName:'', drivingType:'', validDate:'', idNumber:'', state: 'idle' as OcrState },

    // 人脸
    face:    { imageUrl:'', verified: false, score: 0, state: 'idle' as OcrState },

    // 进度
    step: 1 as 1|2|3
  }),
  getters: {
    canNextFromId: (s) => s.idFront.state==='success' && s.idBack.state==='success',
    canNextFromLicense: (s) => s.license.state==='success',
    canSubmit: (s) =>
      s.idFront.state==='success' &&
      s.idBack.state==='success'  &&
      s.license.state==='success' &&
      s.face.state==='success' &&
      s.face.verified === true
  },
  actions: {
    reset() {
      this.$reset()
    },
    async doSubmit() {
      const userId = uni.getStorageSync('userId')
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
