// src/utils/image.js
export function toBase64(path) {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: res => resolve(res.data),
      fail: err => reject(err)
    });
  });
}
