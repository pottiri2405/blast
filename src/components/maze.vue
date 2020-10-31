<template>
  <div id="stage">
    <b-spinner v-show="init===true" id="init-loading" label="Large Spinner"></b-spinner>
    <b-container v-show="init===false">
      <b-row class="mt-2">
        <b-col class="pl-0">
          <b-icon v-for="n in life.max - life.remaining" v-bind:key="'heart-' + n" icon="heart" variant="danger" v-bind:class="{'ml-1': (n > 1)}"></b-icon>
          <b-icon v-for="n in life.remaining" v-bind:key="'heart-fill-' + n" icon="heart-fill" variant="danger" v-bind:class="{'ml-1': (n > 1)}"></b-icon>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col class="pl-0">
          <!-- <b-button pill size="sm" variant="outline-primary" v-b-modal.modal-how-to-play>
            <b-icon icon="question-circle-fill" aria-label="How to play"></b-icon>
            {{ $t("message.how_to_play") }}
          </b-button> -->
          <b-button pill size="sm" variant="info" v-touch="clear">
            {{ $t("message.checked_clear") }}
          </b-button>
          <b-button pill size="sm" variant="warning" v-touch="restart">
            {{ $t("message.restart") }}
          </b-button>
        </b-col>
      </b-row>
      <b-row class="mt-2 pl-0">
        <b-col class="pl-0">
          <table>
            <tr v-for="(cols, y) in data.map" :key="'row-' + y">
              <td border
              v-for="(col, x) in cols"
              :key="'col-' + y + '-' + x"
              v-touch:start="clickBox(x, y)"
              class="box"
              v-bind:font-size="data.size < 10 ? 'large' : 'inherit'"
              v-bind:class="{
                'box-row-last': isLast(y, data.size),
                'box-col-last': isLast(x, data.size),
                'answerd-box': isAnsweredBox(x, y),
                'clicked-box': isClickedBox(x, y)
                }">
                <b-icon icon="star-fill" variant="warning" scale="1.25" animation="throb" v-if="isCurrentStar(x, y)"></b-icon>
                <span v-if="!isCurrentStar(x, y) && !isGoal(x, y)">{{ col }}</span>
                <b-icon icon="flag-fill" variant="danger" scale="1.25" v-if="!isCurrentStar(x, y) && isGoal(x, y)"></b-icon>
              </td>
            </tr>
          </table>
        </b-col>
      </b-row>
    </b-container>
    <b-modal ref="modal-start" size="xl" hide-header hide-footer no-close-on-esc no-close-on-backdrop class="middle">
      <b-button pill block variant="primary" v-touch="gameStart">{{ $t("message.start")}}</b-button>
      <p v-if="$route.params.language==='en'" class="mt-2 text-center align-middle">
        {{ 'Guide the ' }}<b-icon icon="star-fill" variant="warning"></b-icon>{{ ' to the' }}<b-icon icon="flag-fill" variant="danger"></b-icon>{{ '.' }}
      </p>
      <p v-if="$route.params.language==='ja'" class="mt-2 text-center align-middle">
        <b-icon icon="star-fill" variant="warning"></b-icon>{{ ' を ' }}<b-icon icon="flag-fill" variant="danger"></b-icon>{{ ' まで導いてください。' }}
      </p>
      <p class="text-center align-middle">
        <b-icon icon="heart-fill" variant="danger"></b-icon>{{ ' ✕ ' + life.max }}
      </p>
    </b-modal>
    <b-modal id="modal-how-to-play" size="xl" hide-footer v-bind:title="$t('message.how_to_play')">
    </b-modal>
    <b-modal ref="modal-correct" size="md" hide-header hide-footer no-close-on-esc no-close-on-backdrop clas="middle">
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <h3>{{ correct.word }}</h3>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <p class="text-center align-middle">
              <b-icon v-for="n in life.max - life.remaining" v-bind:key="'heart-' + n" icon="heart" variant="danger" animation="fade" v-bind:class="{'ml-1': (n > 1)}"></b-icon>
              <b-icon v-for="n in life.remaining" v-bind:key="'heart-fill-' + n" icon="heart-fill" variant="danger" v-bind:class="{'ml-1': (n > 1)}"></b-icon>
            </p>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <b-modal ref="modal-goal" size="md" hide-header hide-footer clas="middle">
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <h3>{{ $t("message.goal_message") }}</h3>
            <p>
              <b-icon icon="stopwatch" font-scale="2"></b-icon>
              <span id="timer" class="bg-dark text-light pl-2 pr-2">
                {{ timer.time }}
              </span>
            </p>
            <p>{{ $t("message.thank_you") }}</p>
            <b-button pill size="sm" variant="warning" v-touch="restart">
              {{ $t("message.restart") }}
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <b-modal ref="modal-failure" size="md" hide-header hide-footer clas="middle">
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <h3>
              {{ $t("message.failure_message") }}
              <b-icon icon="arrow90deg-right" rotate="90"></b-icon>
            </h3>
            <p>{{ $t("message.thank_you") }}</p>
            <b-button pill size="sm" variant="warning" v-touch="restart">
              {{ $t("message.restart") }}
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
      language: 'en',
      timer: {time: '00:00:00.000', began: null, stopped: null, duration: 0, started: null, running: false},
      data: {map: {}, words: {}},
      life: {remaining: 0, max: 100},
      clicked: {keys: [], axis: ''},
      answered: {keys: [], words: []},
      correct: {word: '', text: ''},
      hint: {x: 0, y: 0, axis: '', word: '', text: '', images: [], tags: []},
      star: {current: '0-0', pioneered: {}, passed: []}
    }
  },
  methods: {
    clear () {
      this.clicked.keys.length = 0
      this.clicked.axis = ''
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
        if ($vm.data.words[word] && $vm.answered.words.includes(word) === false) {
          // ほぼ同じ単語対策（例）リザードとリザードン）
          if ($vm.clicked.keys[0] !== $vm.getKey($vm.data.words[word].x, $vm.data.words[word].y)) return
          if ($vm.clicked.axis !== $vm.data.words[word].axis) return
          $vm.answered.words.push(word)
          $vm.answered.keys = $vm.answered.keys.concat($vm.clicked.keys)
          for (let k of $vm.clicked.keys) {
            if (Object.keys($vm.star.pioneered).includes(k)) continue
            $vm.star.pioneered[k] = {index: Object.keys($vm.star.pioneered).length + 1, word: word, keys: [...$vm.clicked.keys]}
          }
          $vm.life.remaining--
          $vm.correct.word = word
          delete $vm.data.words[word]
          if ($vm.life.remaining < $vm.life.max) {
            $vm.hint = $vm.getRandomFromHash($vm.data.words)
          }
          $vm.clear()
          let timeout = 1500
          $vm.$refs['modal-correct'].show()
          setTimeout(function () {
            $vm.$refs['modal-correct'].hide()
            $vm.moveStar()
          }, timeout)
          $vm.clicked.length = 0
        }
      }
    },
    async moveStar () {
      let next = null
      do {
        next = null
        let xy = this.star.current.split('-')
        let index = null
        for (let d of DIRECTIONS) {
          let mx = parseInt(xy[0]) + d.fx
          let my = parseInt(xy[1]) + d.fy
          let mkey = this.getKey(mx, my)
          if (this.isPioneered(mx, my) === true && this.isPassed(mx, my) === false) {
            if (index === null || this.star.pioneered[mkey].index < index) {
              index = this.star.pioneered[mkey].index
              next = mkey
            }
          }
        }
        if (next !== null) {
          if (this.star.pioneered[this.star.current] && this.star.pioneered[this.star.current].word !== this.star.pioneered[next].word) {
            this.star.passed = this.star.passed.concat(this.star.pioneered[this.star.current].keys)
          }
          this.star.passed.push(this.star.current)
          this.star.current = next
          await this.sleep(500)
        }
      } while (next !== null && !this.isGoal())
      if (this.isGoal()) {
        this.timerStop()
        this.$refs['modal-goal'].show()
      } else if (this.life.remaining <= 0) {
        this.timerStop()
        this.$refs['modal-failure'].show()
      }
    },
    isClickedBox (x, y) {
      return this.clicked.keys.includes(this.getKey(x, y))
    },
    isAnsweredBox (x, y) {
      return this.answered.keys.includes(this.getKey(x, y))
    },
    isPioneered (x, y) {
      return Object.keys(this.star.pioneered).includes(this.getKey(x, y))
    },
    isPassed (x, y) {
      return this.star.passed.includes(this.getKey(x, y))
    },
    isCurrentStar (x, y) {
      return (this.star.current === this.getKey(x, y))
    },
    isGoal (...args) {
      switch (args.length) {
        case 0:
          return (this.getKey(this.data.goal.x, this.data.goal.y) === this.star.current)
        case 2:
          return (this.data.goal.x === parseInt(args[0]) && this.data.goal.y === parseInt(args[1]))
        default:
          return false
      }
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
      this.hint = this.getRandomFromHash(this.data.words)
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
    $vm.language = process.env.language
    // $vm.$refs['loading-modal'].show()
    let url = 'https://script.google.com/macros/s/AKfycbwbQdFc9lSKC-Jrmda7m5vwcA-JX0LeyVVx-CzLdsy52mhgejI/exec?id=' + $vm.$route.params.id
    this.axios
      .get(url, { crossDomain: true })
      .then(response => {
        $vm.logging(response)
        $vm.data = response.data
        $vm.star.current = $vm.getKey($vm.data.start.x, $vm.data.start.y)
        $vm.star.pioneered[$vm.getKey($vm.data.goal.x, $vm.data.goal.y)] = {index: 999, word: '', keys: []}
        $vm.life.remaining = $vm.data.limit
        $vm.life.max = $vm.data.limit
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
  top: 50px;
  left:calc(50% - 50px/2);
}
.box {
  cursor: pointer;
  min-width: 2rem !important;
  min-height: 2rem !important;
  text-align: center !important;
  vertical-align: middle !important;
  border-top: 1px solid #000000;
  border-left: 1px solid #000000;
  padding-left: 0px !important;
  padding-right: 0px !important;
  background-color: #fffaf0;
  color: #000000;
  padding: 0px;
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
.hint-box {
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
#card-hint {
  max-width: 20rem;
  width: 20rem;
}
#card-hint .card-header {
  padding: 0.25rem 1.25rem !important;
  text-align: center;
}
#card-hint .card-body {
  padding: 0.25rem !important;
}
#card-hint .no-image {
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
#card-hint .exist-image {
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
#card-hint .image-info {
  font-size: x-small;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#card-hint .google-search-result {
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
