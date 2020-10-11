<template>
  <div id="stage">
    <b-spinner v-show="init===true" id="init-loading" label="Large Spinner"></b-spinner>
    <b-container v-show="init===false">
      <b-row class="mt-3">
        <b-col class="pl-0">
          <b-progress v-if="progress.max > 0" :max="progress.max" height="2rem" class="w-100">
            <b-progress-bar :value="progress.count">
              {{ progress.count }} / {{ progress.max }}
            </b-progress-bar>
          </b-progress>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col id="timer" class="bg-dark text-light text-center align-middle">
          {{ timer.time }}
        </b-col>
        <b-col>
          <b-button pill size="sm" variant="warning" @click="restart()">
            {{ $t("message.restart") }}
          </b-button>
        </b-col>
      </b-row>
      <b-row id="hint-area" class="mt-2 mb-2">
        <b-col id="hint-check-area" class="pl-0">
          <p class="text-left">
            <b-form-checkbox v-model="hint" name="check-hint" switch>
              {{ $t("message.hint") }}
            </b-form-checkbox>
            <br>
            <b-button pill size="sm" variant="info" @click="clickedClear()">
              {{ $t("message.checked_clear") }}
            </b-button>
          </p>
        </b-col>
        <b-col id="hint-image-area">
          <b-container class="pl-0">
            <b-row>
              <b-col id="hint-google-search" class="pl-0">
                {{ $t("message.google_search") }}
              </b-col>
            </b-row>
            <b-row>
              <b-col id="hint-image1" class="pl-0"><span>No image</span></b-col>
              <b-col id="hint-image2" class="pl-0"><span>No image</span></b-col>
              <b-col id="hint-image3" class="pl-0"><span>No image</span></b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>
      <b-row v-for="(cols, y) in data.map" :key="'row-' + y">
        <b-link href="#" v-for="(col, x) in cols" :key="'col-' + y + '-' + x" @click="clickBox(x, y)">
          <b-col border class="box" v-bind:class="{
            'box-row-last': isLast(y, Object.keys(data.map).length),
            'box-col-last': isLast(x, Object.keys(cols).length),
            'answerd-box': isAnsweredBox(x, y),
            'clicked-box': isClickedBox(x, y)
            }">
            {{col}}
          </b-col>
        </b-link>
      </b-row>
    </b-container>
    <b-modal ref="modal-start" size="md" hide-header hide-footer no-close-on-esc no-close-on-backdrop>
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <b-button pill block variant="primary" @click="gameStart()">{{ $t("message.start")}}</b-button>
          </b-col>
        </b-row>
        <b-row class="mt-3">
          <b-col class="text-center align-middle">
            <h5>{{ $t("message.thumbnail_size") }}{{ data.size }} ✕ {{ data.size }}</h5>
          </b-col>
        </b-row>
        <b-row>
          <b-col class="text-center align-middle">
            <h5>{{ $t("message.thumbnail_word_count") }}{{ Object.keys(data.words).length }}</h5>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <b-modal ref="modal-correct" size="md" hide-header hide-footer no-close-on-esc no-close-on-backdrop>
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <h3>{{ correct.word }}</h3>
            <p>{{ correct.text }}</p>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <b-modal ref="modal-complete" size="md" hide-header hide-footer>
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <h3>{{ $t("message.complete_message") }}</h3>
            <p>
              {{ $t("message.time") }}
              <span id="timer" class="bg-dark text-light text-center align-middle p-2">
                {{ timer.time }}
              </span>
            </p>
            <b-button pill size="sm" variant="warning" @click="restart()">
              {{ $t("message.restart") }}
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
export default {
  data () {
    return {
      init: true,
      timer: {time: '00:00:00.000', began: null, stopped: null, duration: 0, started: null, running: false},
      hint: false,
      data: {map: {}, words: {}},
      progress: {count: 0, max: 100},
      clicked: {keys: [], axis: ''},
      answered: {keys: [], words: []},
      correct: {word: '', text: ''}
    }
  },
  methods: {
    isLast (idx, length) {
      return (idx >= length)
    },
    clickedClear () {
      this.clicked.keys.length = 0
    },
    async clickBox (x, y) {
      let key = this.getKey(x, y)
      if (this.clicked.keys.indexOf(key) !== -1) {
        if (this.clicked.keys.slice(-1)[0] === key) {
          this.clicked.keys.pop()
        }
        if (this.clicked.keys.length <= 1) {
          this.clicked.axis = ''
        }
        return
      }
      if (this.clicked.keys.length <= 0 || this.getNearClickedKeysBox(x, y, this.clicked.axis).length > 0) {
        if (this.clicked.keys.length === 1) {
          this.clicked.axis = this.getClickedAxis(x, y)
        }
        this.clicked.keys.push(key)
      }
      let word = this.combineClickedKeysChars()
      if (this.data.words[word] && this.answered.words.includes(word) === false) {
        this.answered.words.push(word)
        this.answered.keys = this.answered.keys.concat(this.clicked.keys)
        this.clicked.keys.length = 0
        this.progress.count++
        this.correct.word = word
        this.$refs['modal-correct'].show()
        await this.sleep(1000)
        this.$refs['modal-correct'].hide()
        this.timerStop()
        this.$refs['modal-complete'].show()
      }
    },
    isClickedBox (x, y) {
      return (this.clicked.keys.includes(this.getKey(x, y)))
    },
    isAnsweredBox (x, y) {
      return (this.answered.keys.includes(this.getKey(x, y)))
    },
    getNearClickedKeysBox (x, y, axis) {
      let rtn = []
      if (this.clicked.keys.length <= 0) {
        return rtn
      }
      let last = this.clicked.keys.slice(-1)[0]
      const ix = parseInt(x)
      const iy = parseInt(y)
      if ((axis === '' || axis === 'w') && this.getKey(ix + 1, iy) === last) {
        rtn.push(last)
      } else if ((axis === '' || axis === 'sw') && this.getKey(ix + 1, iy - 1) === last) {
        rtn.push(last)
      } else if ((axis === '' || axis === 's') && this.getKey(ix, iy - 1) === last) {
        rtn.push(last)
      } else if ((axis === '' || axis === 'se') && this.getKey(ix - 1, iy - 1) === last) {
        rtn.push(last)
      } else if ((axis === '' || axis === 'e') && this.getKey(ix - 1, iy) === last) {
        rtn.push(last)
      } else if ((axis === '' || axis === 'ne') && this.getKey(ix - 1, iy + 1) === last) {
        rtn.push(last)
      } else if ((axis === '' || axis === 'n') && this.getKey(ix, iy + 1) === last) {
        rtn.push(last)
      } else if ((axis === '' || axis === 'nw') && this.getKey(ix + 1, iy + 1) === last) {
        rtn.push(last)
      }
      return rtn
    },
    getClickedAxis (x, y) {
      let last = this.clicked.keys.slice(-1)[0]
      const ix = parseInt(x)
      const iy = parseInt(y)
      if (this.getKey(ix + 1, iy) === last) {
        return 'w'
      } else if (this.getKey(ix + 1, iy - 1) === last) {
        return 'sw'
      } else if (this.getKey(ix, iy - 1) === last) {
        return 's'
      } else if (this.getKey(ix - 1, iy - 1) === last) {
        return 'se'
      } else if (this.getKey(ix - 1, iy) === last) {
        return 'e'
      } else if (this.getKey(ix - 1, iy + 1) === last) {
        return 'ne'
      } else if (this.getKey(ix, iy + 1) === last) {
        return 'n'
      } else if (this.getKey(ix + 1, iy + 1) === last) {
        return 'nw'
      }
      return ''
    },
    combineClickedKeysChars () {
      let answer = ''
      this.clicked.keys.forEach((e, i) => {
        let xy = e.split('-')
        answer += this.data.map[xy[1]][xy[0]]
      })
      return answer
    },
    gameStart () {
      this.$refs['modal-start'].hide()
      this.timerStart()
    },
    timerStart () {
      if (this.timer.running !== false) return
      if (this.timer.began === null) {
        this.timerReset()
        this.timer.began = new Date()
      }
      if (this.timer.stopped !== null) {
        this.timer.duration += (new Date() - this.timer.stopped)
      }
      this.timer.started = setInterval(this.timerClockRunning, 10)
      this.timer.running = true
    },
    timerStop () {
      this.timer.running = false
      this.timer.stopped = new Date()
      clearInterval(this.timer.started)
    },
    timerReset () {
      this.timerStart = false
      clearInterval(this.timer.started)
      this.timer.duration = 0
      this.timer.began = null
      this.timer.stopped = null
      this.timer.time = '00:00:00.000'
    },
    timerClockRunning () {
      let currentTime = new Date()
      let timeElapsed = new Date(currentTime - this.timer.began - this.timer.duration)
      let hour = timeElapsed.getUTCHours()
      let min = timeElapsed.getUTCMinutes()
      let sec = timeElapsed.getUTCSeconds()
      let ms = timeElapsed.getUTCMilliseconds()
      this.timer.time =
        this.zeroPrefix(hour, 2) + ':' +
        this.zeroPrefix(min, 2) + ':' +
        this.zeroPrefix(sec, 2) + '.' +
        this.zeroPrefix(ms, 3)
    },
    restart () {
      this.$router.go({path: this.$router.currentRoute.path, force: true})
    }
  },
  mounted () {
    let $vm = this
    $vm.logging(process.env)
    // $vm.$refs['loading-modal'].show()
    let url = 'https://script.google.com/macros/s/AKfycbz2T8MneWGNgTobaIJxCD2qp4TvZDLYIViVxRfnI-nMSXUAZQ/exec?id=' + $vm.$route.params.id
    this.axios
      .get(url, { crossDomain: true })
      .then(response => {
        $vm.logging(response)
        $vm.data = response.data
        $vm.progress.max = Object.keys($vm.data.words).length
        //$vm.progress.max = 1
        $vm.init = false
        $vm.$refs['modal-start'].show()
      })
      .catch(err => {
        // $vm.$refs['loading-modal'].hide()
        alert('通信エラーが発生しました。')
        console.log('err:', err)
      })
  }
}
</script>
<style>
#init-loading {
  font-size: xx-large;
  position: fixed;
  height: 50px;
  width: 50px;
  top:calc(50% - 50px/2);
  left:calc(50% - 50px/2);
}
.box {
  width: 2rem !important;
  height: 2rem !important;
  text-align: center !important;
  border-top: 1px solid #000000;
  border-left: 1px solid #000000;
  padding-left: 0px !important;
  padding-right: 0px !important;
  background-color: #fffaf0;
  color: #000000;
  padding: 0px;
  padding-top: 0.25rem;
}
.box-row-last {
  border-bottom: 1px solid #000000;
}
.box-col-last {
  border-right: 1px solid #000000;
}
.answerd-box {
  background-color: #28a745;
  /* -webkit-animation: flash 1s ease infinite;
  animation: flash 1s ease infinite; */
}
.clicked-box {
  background-color: #f08080;
  /* -webkit-animation: flash 1s ease infinite;
  animation: flash 1s ease infinite; */
}
@-webkit-keyframes flash {
  0% {opacity: 0;}
  100% {opacity: 1;}
}
@keyframes flash {
  0% {opacity: 0;}
  100% {opacity: 1;}
}

#timer {
  font-family: 'Share Tech Mono', sans-serif;
  max-width: 8rem !important;
  width: 8rem !important;
  padding: 0px;
  padding-top: 0.25rem;
  border-radius: 50rem;
}
#hint-check-area {
  max-width: 8rem !important;
  width: 8rem !important;
}
#hint-image-area {
  max-width: 15rem !important;
  width: 15rem !important;
}
#hint-image1,
#hint-image2,
#hint-image3 {
  font-size: -1;
  max-width: 4rem !important;
  width: 4rem !important;
  height: 4rem !important;
  border-top: 1px solid #000000;
  border-bottom: 1px solid #000000;
  border-left: 1px solid #000000;
  background-color: #e9ecef;
  font-size: 0.8rem;
  text-align: center !important;
  padding: 0px;
  padding-top: 1.5rem;
}
#hint-image3 {
  border-right: 1px solid #000000;
}
#hint-image1 span,
#hint-image2 span,
#hint-image3 span {
  font-size: small;
}
#hint-google-search {
  text-align: center !important;
  font-size: 0.8rem;
}
</style>
