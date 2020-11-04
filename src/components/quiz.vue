<template>
  <div id="stage">
    <b-spinner v-show="init===true" id="init-loading" label="Large Spinner"></b-spinner>
    <b-container v-show="init===false">
      <b-row class="mt-2">
        <b-col>
          <b-progress v-if="progress.max > 0" :max="progress.max" height="1rem" id="progress-bar">
            <b-progress-bar :value="progress.progress">
              {{ progress.progress }} / {{ progress.max }}
            </b-progress-bar>
          </b-progress>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col>
          <b-button pill size="sm" variant="info" v-touch="clear">
            {{ $t("message.checked_clear") }}
          </b-button>
          <b-button pill size="sm" variant="warning" v-touch="restart">
            {{ $t("message.restart") }}
          </b-button>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col>
          <table>
            <tr v-for="(chars, y) in data.map" :key="'row-' + y">
              <td border
              v-for="(char, x) in chars"
              :key="'col-' + y + '-' + x"
              v-touch:start="clickBox(x, y)"
              class="box"
              v-bind:class="{
                'even-box' : isEvenBox(x, y),
                'box-large': (data.size < 10),
                'box-row-last': isLast(y, data.size),
                'box-col-last': isLast(x, data.size),
                'answerd-box': isAnsweredBox(x, y),
                'clicked-box': isClickedBox(x, y)
                }">
                {{ char }}
              </td>
            </tr>
          </table>
        </b-col>
      </b-row>
    </b-container>
    <b-modal ref="modal-start" hide-header hide-footer no-close-on-esc no-close-on-backdrop size="xl" class="middle">
      <p class="text-center align-middle">
        <b-badge variant="primary" class="tag mr-1">
          {{ $t('message.thumbnail_size', { size: data.size }) }}
        </b-badge>
        <b-badge variant="primary" class="tag">
          {{ $t('message.thumbnail_word_count', { count: Object.keys(data.words).length }) }}
        </b-badge>
      </p>
      <p class="text-center align-middle">
        <b-badge variant="info" v-for="(tag, i) in data.tags" :key="'tag-' + i" class="tag mr-1">
          {{ tag }}
        </b-badge>
      </p>
      <b-button block variant="info" class="mt-2" v-touch="gameStart">{{ $t("message.start")}}</b-button>
    </b-modal>
    <b-modal ref="modal-question" hide-footer size="xl" class="middle" header-bg-variant="primary" header-text-variant="light" v-bind:title="$t('message.question')" ok-only>
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <div v-html="question.question"></div>
          </b-col>
        </b-row>
      </b-container>
      <b-button block variant="info" class="mt-2" v-touch="questionOK">OK</b-button>
    </b-modal>
    <b-modal ref="modal-correct" hide-footer size="xl" clas="middle" header-bg-variant="success" header-text-variant="light" v-bind:title="$t('message.correct')" ok-only>
      <b-container>
        <b-row>
          <b-col>
            <b-progress v-if="progress.max > 0" :max="progress.max" height="1rem" id="progress-bar">
              <b-progress-bar :value="progress.progress">
                {{ progress.progress }} / {{ progress.max }}
              </b-progress-bar>
            </b-progress>
          </b-col>
        </b-row>
        <b-row class="mt-1">
          <b-col class="text-center align-middle">
            <h3>{{ correct.word }}</h3>
            <div v-html="correct.answer"></div>
          </b-col>
        </b-row>
      </b-container>
      <b-button block variant="info" class="mt-2" v-touch="correctOK">OK</b-button>
    </b-modal>
    <b-modal ref="modal-complete" hide-footer no-close-on-esc no-close-on-backdrop size="xl" clas="middle" header-bg-variant="success" header-text-variant="light" v-bind:title="$t('message.complete_message')">
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <p>
              <b-icon icon="stopwatch" font-scale="2"></b-icon>
              <span id="timer" class="bg-dark text-light pl-2 pr-2">
                {{ timer.time }}
              </span>
            </p>
            <p>{{ $t("message.thank_you") }}</p>
            <b-button pill size="sm" variant="warning" v-touch="restart">
              {{ $t("message.retry") }}
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
const DIRECTIONS = [
  {axis: 'w', rx: 1, ry: 0, fx: -1, fy: 0},
  {axis: 'sw', rx: 1, ry: -1, fx: -1, fy: 1},
  {axis: 's', rx: 0, ry: -1, fx: 0, fy: 1},
  {axis: 'se', rx: -1, ry: -1, fx: 1, fy: 1},
  {axis: 'e', rx: -1, ry: 0, fx: 1, fy: 0},
  {axis: 'ne', rx: -1, ry: 1, fx: 1, fy: -1},
  {axis: 'ne', rx: 0, ry: 1, fx: 0, fy: -1},
  {axis: 'nw', rx: 1, ry: 1, fx: -1, fy: -1}
]
export default {
  data () {
    return {
      init: true,
      timer: {time: '00:00:00.000', began: null, stopped: null, duration: 0, started: null, running: false},
      data: {map: {}, words: {}},
      progress: {progress: 0, max: 100},
      clicked: {keys: [], axis: ''},
      answered: {keys: [], words: []},
      correct: {word: '', question: '', answer: ''},
      question: {word: '', question: '', answer: ''}
    }
  },
  methods: {
    clear () {
      this.clicked.keys.length = 0
      this.clicked.axis = ''
    },
    isEvenBox (x, y) {
      if (this.data.size % 2 === 0) {
        if (y % 2 === 0) {
          return (((parseInt(y) - 1) * this.data.size + parseInt(x)) % 2 === 0)
        } else {
          return (((parseInt(y) - 1) * this.data.size + parseInt(x)) % 2 === 1)
        }
      } else {
        return (((parseInt(y) - 1) * this.data.size + parseInt(x)) % 2 === 0)
      }
    },
    clickBox (x, y) {
      let $vm = this
      return async function (event) {
        let key = $vm.getKey(x, y)
        if ($vm.clicked.keys.indexOf(key) !== -1) {
          if ($vm.clicked.keys.slice(-1)[0] === key) {
            $vm.clicked.keys.pop()
          }
          if ($vm.clicked.keys.length <= 1) {
            $vm.clicked.axis = ''
          }
          return
        }
        if ($vm.clicked.keys.length <= 0 || $vm.getNearClickedKeysBox(x, y, $vm.clicked.axis).length > 0) {
          if ($vm.clicked.keys.length === 1) {
            $vm.clicked.axis = $vm.getClickedAxis(x, y)
          }
          $vm.clicked.keys.push(key)
        }
        let word = $vm.combineClickedKeysChars()
        if (word === $vm.question.word) {
          $vm.answered.words.push(word)
          $vm.answered.keys = $vm.answered.keys.concat($vm.clicked.keys)
          $vm.progress.progress++
          $vm.correct = $vm.data.words[word]
          delete $vm.data.words[word]
          $vm.clear()
          $vm.$refs['modal-correct'].show()
        }
      }
    },
    isClickedBox (x, y) {
      return this.clicked.keys.includes(this.getKey(x, y))
    },
    isAnsweredBox (x, y) {
      return this.answered.keys.includes(this.getKey(x, y))
    },
    getNearClickedKeysBox (x, y, axis) {
      let rtn = []
      if (this.clicked.keys.length <= 0) {
        return rtn
      }
      let last = this.clicked.keys.slice(-1)[0]
      const ix = parseInt(x)
      const iy = parseInt(y)
      for (let d of DIRECTIONS) {
        if ((axis === '' || axis === d.axis) && this.getKey(ix + d.rx, iy + d.ry) === last) {
          rtn.push(last)
          break
        }
      }
      return rtn
    },
    getClickedAxis (x, y) {
      let last = this.clicked.keys.slice(-1)[0]
      const ix = parseInt(x)
      const iy = parseInt(y)
      for (let d of DIRECTIONS) {
        if (this.getKey(ix + d.rx, iy + d.ry) === last) {
          return d.axis
        }
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
      this.question = this.getRandomFromHash(this.data.words)
      this.$refs['modal-question'].show()
      this.timerStart()
    },
    questionOK () {
      this.$refs['modal-question'].hide()
    },
    correctOK () {
      this.$refs['modal-correct'].hide()
      if (this.progress.progress < this.progress.max) {
        this.question = this.getRandomFromHash(this.data.words)
        this.$refs['modal-correct'].show()
      } else {
        this.$refs['modal-complete'].show()
      }
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
    $vm.$i18n.locale = $vm.$route.params.language
    let url = 'https://script.google.com/macros/s/AKfycbxm037DRqkWJ5ZbmEI2UHqZM3Xl81wraES9Zh-J/exec?id=' + $vm.$route.params.id
    this.axios
      .get(url, { crossDomain: true })
      .then(response => {
        $vm.logging(response)
        $vm.data = response.data
        $vm.progress.max = Object.keys($vm.data.words).length
        $vm.init = false
        $vm.$refs['modal-start'].show()
      })
      .catch(err => {
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
  top: 50px;
  left:calc(50% - 50px/2);
}
.box {
  cursor: pointer;
  min-width: 2rem !important;
  text-align: center !important;
  vertical-align: middle !important;
  border-top: 1px solid #000000;
  border-left: 1px solid #000000;
  padding-left: 0px !important;
  padding-right: 0px !important;
  color: #000000;
  padding: 0px;
}
.even-box {
  background-color: #eeeeee;
}
.box-large {
  font-size: x-large;
  min-width: 2.5rem !important;
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
.question-box {
  /* border: 1px solid #f08080; */
  -webkit-animation: flash 1s ease infinite;
  animation: flash 1s ease infinite;
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
  font-size: x-large;
  max-width: 12rem !important;
  width: 12rem !important;
  padding: 0px;
  padding-top: 0.25rem;
  /* border-radius: 50rem; */
}
#card-question {
  max-width: 20rem;
  width: 20rem;
}
#card-question .card-header {
  padding: 0.25rem 1.25rem !important;
  text-align: center;
}
#card-question .card-body {
  padding: 0.25rem !important;
}
#card-question .no-image {
  font-size: small;
  max-width: 5rem !important;
  width: 5rem !important;
  height: 5rem !important;
  border: 1px solid #000000;
  text-align: center !important;
  padding: 0px;
  padding-top: 1.75rem !important;
  background-color: #e9ecef;
}
#card-question .exist-image {
  font-size: small;
  max-width: 5rem !important;
  min-width: 5rem !important;
  height: 5rem !important;
  border: 1px solid #000000;
  text-align: center !important;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
}
#card-question .image-info {
  font-size: x-small;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#card-question .google-search-result {
  font-size: x-small;
  color: grey;
}
.modal.middle {
  top: 25% !important;
}
.tag {
  font-size: small !important;
}
</style>
