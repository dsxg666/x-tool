import {createRouter, createWebHistory} from 'vue-router'
import {infoStore} from '@/store/store.js'
import axiosUtilObj from '@/utils/axios.js'
import timeUtilObj from '@/utils/time.js'

const routes = [
    {
        path: "/login",
        component: () => import("@/views/Login.vue"),
        meta: {
            title: "Login"
        },
    },
    {
        path: "/register",
        component: () => import("@/views/Register.vue"),
        meta: {
            title: "Register"
        }
    },
    {
        path: "/",
        component: () => import("@/views/Index.vue"),
        meta: {
            title: "lanKaiYun Tool",
            requiresAuth: true,
        },
        children:[
            {
                path: "/",
                component: () => import("@/views/Home.vue"),
                meta: {
                    title: "Home",
                }
            },
            {
                path: "game/gluttonousSnake/infiniteMode",
                component: () => import("@/views/game/snake/InfiniteMode.vue"),
                meta: {
                    title: "Game Gluttonous Snake Infinite Mode",
                }
            },
            {
                path: "blog/list",
                component: () => import("@/views/blog/List.vue"),
                meta: {
                    title: "Blog List",
                }
            },
            {
                path: "blog/post",
                component: () => import("@/views/blog/Post.vue"),
                meta: {
                    title: "Blog Post",
                }
            },
            {
                path: "blog/add",
                component: () => import("@/views/blog/Add.vue"),
                meta: {
                    title: "Blog Add",
                }
            },
            {
                path: "blog/public",
                component: () => import("@/views/blog/Public.vue"),
                meta: {
                    title: "Blog Public",
                }
            },
            {
                path: "blog/favorites",
                component: () => import("@/views/blog/Favorites.vue"),
                meta: {
                    title: "Blog Favorites",
                }
            },
            {
                path: "blog/edit",
                component: () => import('@/views/blog/Edit.vue'),
                meta: {
                    title: "Blog Edit",
                }
            },
            {
                path: "blog/publicPost",
                component: () => import('@/views/blog/PublicPost.vue'),
                meta: {
                    title: "Blog Public Post",
                }
            },
            {
                path: "tool/getStrLength",
                component: () => import("@/views/tool/StrLength.vue"),
                meta: {
                    title: "Tool GetStrLength",
                }
            },
            {
                path: "tool/date",
                component: () => import("@/views/tool/Date.vue"),
                meta: {
                    title: "Tool Date",
                }
            },
            {
                path: "tool/pictureToBase64",
                component: () => import("@/views/tool/PictureToBase64.vue"),
                meta: {
                    title: "Tool Picture To Base64",
                }
            },
            {
                path: "tool/jsonBeautify",
                component: () => import("@/views/tool/JsonBeautify.vue"),
                meta: {
                    title: "Tool Json Beautify",
                }
            },
            {
                path: "tool/numberConversion",
                component: () => import("@/views/tool/NumberConversion.vue"),
                meta: {
                    title: "Tool Number Conversion",
                }
            },
            {
                path: "tool/timestamp",
                component: () => import("@/views/tool/Timestamp.vue"),
                meta: {
                    title: "Tool Timestamp",
                }
            },
            {
                path: "todolist/list",
                component: () => import("@/views/todolist/List.vue"),
                meta: {
                    title: "TodoList List",
                }
            },
            {
                path: "todolist/add",
                component: () => import("@/views/todolist/Add.vue"),
                meta: {
                    title: "TodoList Add",
                }
            },
            {
                path: "todolist/edit",
                component: () => import('@/views/todolist/Edit.vue'),
                meta: {
                    title: "TodoList Edit",
                }
            },
            {
                path: "chatroom/conversations",
                component: () => import('@/views/chatroom/Conversations.vue'),
                meta: {
                    title: "Chatroom Conversions",
                }
            },
            {
                path: "chatroom/contacts",
                component: () => import('@/views/chatroom/Contacts.vue'),
                meta: {
                    title: "Chatroom Contacts",
                }
            },
            {
                path: "chatroom/groups",
                component: () => import('@/views/chatroom/Groups.vue'),
                meta: {
                    title: "Chatroom Groups",
                }
            },
            {
                path: "chatroom/requests",
                component: () => import('@/views/chatroom/Requests.vue'),
                meta: {
                    title: "Chatroom Requests",
                }
            },
            {
                path: "music/home",
                component: () => import('@/views/music/Home.vue'),
                meta: {
                    title: "Music Home",
                }
            },
            {
                path: "music/favorites",
                component: () => import('@/views/music/Favorites.vue'),
                meta: {
                    title: "Music Favorites",
                }
            },
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import("@/views/NotFound.vue"),
        meta: {
            title: "404"
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    try {
        if (to.meta.requiresAuth) {
            const store = infoStore()

            let token = store.data.token

            if (token === "") {
                router.push("/login")
            }

            let verifyResultObj = await axiosUtilObj.post("/api/base/verifyToken", {token: token})

            if (verifyResultObj.code !== '100') {
                console.error(verifyResultObj.message)
                router.push("/login")
            }

            // let startTime = timeUtilObj.getNowFormatDate()
            // let endTime = timeUtilObj.timestampToFormatDate(store.data.expireDate)
            // let resObj = timeUtilObj.formatDateSub(startTime, endTime)
        }

        if (to.meta.title) {
            document.title = to.meta.title
        }

        next()
    } catch (err) {
        console.log(err)
    }
})

export default router