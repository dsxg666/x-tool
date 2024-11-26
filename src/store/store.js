import {reactive} from "vue"
import {defineStore} from "pinia"

const infoStore = defineStore('info', () => {
    const data = reactive({
        userId: "",
        username: "",
        expireDate: "",
        token: "",
        path: "",
    })

    const asideShowData = reactive({
        chatroom: false,
        todolist: false,
        game: false,
        blog: false,
        music: false,
        english: false,
    })

    const save = (userId, username, expireDate, token, path) => {
        data.userId = userId
        data.username = username
        data.expireDate = expireDate
        data.token = token
        data.path = path
    }

    const updateUsername = (username) => {
        data.username = username
    }

    const updatePath = (path) => {
        data.path = path
    }

    const updateChatroomShow = (value) => {
        asideShowData.chatroom = value
    }

    const updateTodolistShow = (value) => {
        asideShowData.todolist = value
    }

    const updateGameShow = (value) => {
        asideShowData.game = value
    }

    const updateBlogShow = (value) => {
        asideShowData.blog = value
    }

    const updateMusicShow = (value) => {
        asideShowData.music = value
    }

    const updateEnglishShow = (value) => {
        asideShowData.english = value
    }

    return {
        data,
        asideShowData,
        save,
        updateUsername,
        updatePath,
        updateChatroomShow,
        updateTodolistShow,
        updateGameShow,
        updateBlogShow,
        updateMusicShow,
        updateEnglishShow,
    }
}, {
    persist: true
})

export {infoStore}