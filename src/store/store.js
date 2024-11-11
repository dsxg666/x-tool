import {reactive} from "vue"
import {defineStore} from "pinia"

const infoStore = defineStore('info', () => {
    const data = reactive({
        userId: "",
        username: "",
        expireDate: "",
        token: "",
    })

    const save = (userId, username, expireDate, token) => {
        data.userId = userId
        data.username = username
        data.expireDate = expireDate
        data.token = token
    }

    const updateUsername = (username) => {
        data.username = username
    }

    return {
        data,
        save,
        updateUsername,
    }
}, {
    persist: true
})

export {infoStore}