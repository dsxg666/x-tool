const timeUtilObj = {
    StrToFormatDate(str) {
        let date = new Date(str)
        return this.formatDate(date)
    },

    StrToFormatYMD(str) {
        let date = new Date(str)
        return this.formatYMD(date)
    },

    StrToFormatTime(str) {
        let date = new Date(str)
        return this.formatTime(date)
    },

    timestampToFormatDate(timestamp) {
        let date = new Date(timestamp * 1000);
        return this.formatDate(date)
    },

    getNowFormatDate() {
        let date = new Date()
        return this.formatDate(date)
    },

    getNowFormatYMD() {
        let date = new Date()
        return this.formatYMD(date)
    },

    formatDateSub(startTime, endTime) {
        let startDate = new Date(startTime)
        let endDate = new Date(endTime)

        let expire = false
        let expireText = 'until expiration'
        let duration = endDate - startDate
        if (duration < 0) {
            expire = true
            expireText = 'expired'
            duration = -duration
        }

        let day = Math.floor(duration / (24 * 60 * 60 * 1000))
        let hour = Math.floor((duration / (60 * 60 * 1000)) % 24)
        let minute = Math.floor((duration / (60 * 1000)) % 60)
        let second = Math.floor(duration / 1000) % 60

        let remark = 'undefined'
        if (expire) {
            remark = `${expireText} ${day} days ${hour} hours ${minute} minutes ${second} seconds`
        } else {
            remark = `${day} days ${hour} hours ${minute} minutes ${second} seconds ${expireText}`
        }

        return {
            expire,
            startDate,
            endDate,
            day,
            hour,
            minute,
            second,
            remark: remark,
        }
    },

    formatDate(date) {
        let yyyy = date.getFullYear()
        let MM = String(date.getMonth() + 1).padStart(2, '0')
        let dd = String(date.getDate()).padStart(2, '0')
        let HH = String(date.getHours()).padStart(2, '0')
        let mm = String(date.getMinutes()).padStart(2, '0')
        let ss = String(date.getSeconds()).padStart(2, '0')

        return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`
    },

    formatYMD(date) {
        let yyyy = date.getFullYear()
        let MM = String(date.getMonth() + 1).padStart(2, '0')
        let dd = String(date.getDate()).padStart(2, '0')

        return `${yyyy}-${MM}-${dd}`
    },

    formatTime(date) {
        let HH = String(date.getHours()).padStart(2, '0')
        let mm = String(date.getMinutes()).padStart(2, '0')
        let ss = String(date.getSeconds()).padStart(2, '0')

        return `${HH}:${mm}:${ss}`
    }
}

export default timeUtilObj