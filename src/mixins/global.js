export default {
  methods: {
    logging (obj) {
      if (process.env.NODE_ENV === 'development') {
        console.log(obj)
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
      this.logging(keys[idx])
      let rtn = hash[keys[idx]]
      this.logging(rtn)
      return rtn
    }

  }
}
