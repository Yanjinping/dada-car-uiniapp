// /stores/useAuthFlow.js
import { defineStore } from 'pinia'
import { submitAuth } from '../api/auth.js'

function ok(v) {
  // 将 state 统一小写判断；允许 true/1/'true' 等等作为布尔真
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return v.trim().toLowerCase() === 'true'
  return !!v
}
function isSuccess(state) {
  return String(state || '').toLowerCase() === 'success'
}
function pickUrl(primary, fallback) {
  return primary || fallback || ''
}

export const useAuthFlow = defineStore('authFlow', {
  state: () => ({
    // 身份证
    idFront: {
      imageUrl: '',
      serverImageUrl: '',
      realName: '',
      idNumber: '',
      sex: '',
      birth: '',
      address: '',
      state: 'idle'
    },
    idBack: {
      imageUrl: '',
      serverImageUrl: '',
      issueOrg: '',
      validDate: '',
      state: 'idle'
    },

    // 人脸
    face: {
      imageUrl: '',
      serverImageUrl: '',
      verified: false,
      score: 0,
      state: 'idle'
    },

    // 驾驶证
    license: {
      imageUrl: '',
      serverImageUrl: '',
      realName: '',
      idNumber: '',
      drivingType: '',
      validDate: '',
      state: 'idle'
    },

    // 当前步骤（1=身份证，2=人脸，3=驾驶证）
    step: 1
  }),

  getters: {
    // 身份证完成：正反面都 success
    canNextFromId(s) {
      return isSuccess(s.idFront.state) && isSuccess(s.idBack.state)
    },

    // 人脸完成：state=success 且 verified 为真
    canNextFromFace(s) {
      return isSuccess(s.face.state) && ok(s.face.verified)
    },

    // 驾驶证完成：state=success
    canNextFromLicense(s) {
      return isSuccess(s.license.state)
    },

    // 全流程提交：三段都 success，且人脸 verified
    canSubmit(s) {
      return (
        isSuccess(s.idFront.state) &&
        isSuccess(s.idBack.state) &&
        isSuccess(s.license.state) &&
        isSuccess(s.face.state) &&
        ok(s.face.verified)
      )
    }
  },

  actions: {
    reset() {
      this.$reset()
    },

    setStep(n) {
      this.step = Number(n) || 1
    },

    // 便捷 patch（可选）
    setIdFront(payload = {}) {
      this.idFront = { ...this.idFront, ...payload }
    },
    setIdBack(payload = {}) {
      this.idBack = { ...this.idBack, ...payload }
    },
    setFace(payload = {}) {
      this.face = { ...this.face, ...payload }
    },
    setLicense(payload = {}) {
      this.license = { ...this.license, ...payload }
    },

    async doSubmit() {
      const userId = uni.getStorageSync('userId') || ''

      const payload = {
        userId,

        // 身份证
        realName: this.idFront.realName,
        idNumber: this.idFront.idNumber,
        frontImageUrl: pickUrl(this.idFront.serverImageUrl, this.idFront.imageUrl),
        backImageUrl: pickUrl(this.idBack.serverImageUrl, this.idBack.imageUrl),
        sex: this.idFront.sex,
        birth: this.idFront.birth,
        address: this.idFront.address,
        issueOrg: this.idBack.issueOrg,
        validDate: this.idBack.validDate,

        // 驾驶证
        drivingType: this.license.drivingType,
        drivingValidDate: this.license.validDate,
        drivingIdNumber: this.license.idNumber,
        drivingImageUrl: pickUrl(this.license.serverImageUrl, this.license.imageUrl),

        // 人脸
        faceVerified: ok(this.face.verified),
        faceScore: this.face.score
      }

      await submitAuth(payload)
    }
  }
})
