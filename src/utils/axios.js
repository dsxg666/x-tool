import axios from 'axios'

const axiosInstance = axios.create({  // axios 实例
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000
})

const axiosUtilObj = {
    get(url, data = {}) {
        return axiosInstance.get(url, { params: data }).then(response => response.data)
    },

    getToken(url, token, data = null) {
        return axiosInstance.get(url, {
            params: data,
            headers: {
                'JwtToken': `${token}`
            }
        }).then(response => response.data)
    },

    post(url, data = null) {
        return axiosInstance.post(url, data).then(response => response.data)
    },

    postFrom(url, data = null) {
        return axiosInstance.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(response => response.data)
    },

    postFile(url, data = null) {
        return axiosInstance.post(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(response => response.data)
    },

    postToken(url, token, data = null) {
        return axiosInstance.post(url, data, {
            headers: {
                'JwtToken': `${token}`
            }
        }).then(response => response.data)
    },
}

export default axiosUtilObj