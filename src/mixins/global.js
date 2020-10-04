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
    }
  }
}