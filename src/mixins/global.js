export default {
  methods: {
    logging (obj) {
      if (process.env.NODE_ENV === 'development') {
        let currentTime = new Date()
        let hour = currentTime.getUTCHours()
        let min = currentTime.getUTCMinutes()
        let sec = currentTime.getUTCSeconds()
        let ms = currentTime.getUTCMilliseconds()
        let time =
          this.zeroPrefix(hour, 2) + ':' +
          this.zeroPrefix(min, 2) + ':' +
          this.zeroPrefix(sec, 2) + '.' +
          this.zeroPrefix(ms, 3)
        console.log(time + ' ' + obj)
      }
    },
    noUrl (text) {
      return text.replace(/(?:https?|ftp):\/\/[\S]+/g, '')
    },
    restart (keyword) {
      this.logging('restart keywrod : ' + keyword)
      this.$router.push({name: 'tracker', params: { keyword: keyword }})
      this.$router.go({path: this.$router.currentRoute.path, force: true})
    },
    isLast (idx, length) {
      return (idx >= length)
    },
    zeroPrefix (num, digit) {
      var zero = ''
      for (var i = 0; i < digit; i++) {
        zero += '0'
      }
      return (zero + num).slice(-digit)
    },
    sleep (ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms)
      })
    },
    getKey (x, y) {
      return x + '-' + y
    },
    getRandomInt (max) {
      return Math.floor(Math.random() * Math.floor(max))
    },
    getRandomFromHash (hash) {
      let keys = Object.keys(hash)
      let idx = this.getRandomInt(keys.length - 1)
      let rtn = hash[keys[idx]]
      return rtn
    },
    hashToStyle (attributes) {
      let style = ''
      for (let [key, value] of Object.entries(attributes)) {
        style += key + ':' + value + ';'
      }
      return style
    }
  }
}
