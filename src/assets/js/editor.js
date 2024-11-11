import {infoStore} from '@/store/store.js'

const store = infoStore()

const toolbarConfig = {
    toolbarKeys: [
        "clearStyle", // 清除格式
        // "codeBlock", // 代码块
        "emotion", // 表情
        "headerSelect", // 标题
        "blockquote", // 引用
        // "bold", // 粗体
        "underline", // 下划线
        "italic", // 斜体
        "through", // 删除线
        //"code", // 行内代码
        "sup", // 上标
        "sub", // 下标
        "color", // 文字颜色
        "bgColor", // 背景色
        "fontSize", // 字号
        "fontFamily", // 字体
        "lineHeight", // 行高
        "bulletedList", // 无序列表
        "numberedList", // 有序列表
        // "todo", // 待办
        "justifyLeft", // 左对齐
        "justifyRight", // 右对齐
        "justifyCenter", // 居中对齐
        //"justifyJustify", // 两端对齐
        // "indent", // 增加缩进
        //"delIndent", // 减少缩进
        // "insertLink", // 插入链接
        // "insertImage", // 网络图片
        "uploadImage", // 上传图片
        //"insertVideo", // 插入视频
        //"uploadVideo", // 上传视频
        "insertTable", // 插入表格
        "divider", // 分割线
        "undo", // 撤销
        "redo", // 重做
        //"fullScreen" // 全屏
    ]
}
const editorConfig = {
    placeholder: 'please enter description here...',
    autoFocus: false,
    scroll: false,
    MENU_CONF: {
        uploadImage: {
            server: `${import.meta.env.VITE_API_URL}/api/auth/todolist/uploadImg`,
            fieldName: 'file',
            maxFileSize: 10 * 1024 * 1024, //单个文件大小 10M
            maxNumberOfFiles: 10, //最多可上传10个文件
            allowedFileTypes: ['image/*'], //文件类型限制, 无限制则设置为 []
            timeout: 5 * 1000, //超时时间 5秒

            headers: {
                'JwtToken': store.data.token,
            },

            onSuccess(file, res) {
                console.log("onSuccess file:", file.name, "res:", res)
            },

            onError(file, err) {
                console.log("onError file:", file.name, "err:", err)
            },

            customInsert(res, insertFn) {
                insertFn(`${import.meta.env.VITE_API_URL}/api/base/getTodolistImg/${res.filename}?id=${store.data.userId}`)
            },
        }
    }
}

export default {toolbarConfig, editorConfig}