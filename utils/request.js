const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => resolve(res.data),
      fail: (err) => reject(err)
    });
  });
};

export default request;
