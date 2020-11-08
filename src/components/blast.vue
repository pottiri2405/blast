<template>
  <div id="stage">
    <b-spinner v-show="init===true" id="init-loading" label="Large Spinner"></b-spinner>
    <b-container v-show="init===false">
      <b-row class="mt-2">
        <b-col>
          <!-- <b-button pill size="sm" variant="info" v-touch="clear">
            {{ $t("message.checked_clear") }}
          </b-button> -->
          <b-button pill size="sm" variant="warning" v-touch="restart">
            {{ $t("message.restart") }}
          </b-button>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col>
          <table>
            <tr>
              <td v-for="n in life.remaining" v-bind:key="'life-remaining-' + n" class="remaining red-bomb">
                &nbsp;
              </td>
              <td class="remaining"></td>
            </tr>
          </table>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col class="pl-0">
          <table>
            <tr v-for="(chars, y) in data.map" :key="'row-' + y">
              <td border
              v-for="(char, x) in chars"
              :key="'col-' + y + '-' + x"
              v-touch:start="setRedBomb(x, y)"
              class="box-base"
              v-bind:class="{
                'box-row-last': isLast(y, data.size),
                'box-col-last': isLast(x, data.size),
                'explosion': (isExplosion(x, y) && !isExplosionBomb(x, y)),
                'explosion-bomb': isExplosionBomb(x, y),
                'buruburu': isBuruBuru(x, y),
                'red-bomb': (isRedBomb(x, y) && countDown > 0),
                'black-bomb': isBlackBomb(x, y),
                'unbreakable': isUnbreakable(x, y),
                'breakable1': isBreakable1(x, y)
                }">
                &nbsp;
              </td>
            </tr>
          </table>
        </b-col>
      </b-row>
    </b-container>
    <b-modal ref="modal-start" size="sm" hide-header hide-footer no-close-on-esc no-close-on-backdrop>
      <p v-html="$t('message.blast_start_text')"></p>
      <b-button pill block variant="primary" v-touch="gameStart">{{ $t("message.start")}}</b-button>
    </b-modal>
    <b-modal ref="modal-count-down" size="sm" hide-header hide-footer no-close-on-esc no-close-on-backdrop>
      <h2 class="text-center">{{ countDown }}</h2>
    </b-modal>
    <b-modal ref="modal-complete" size="md" hide-header hide-footer>
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <h3>
              <p v-html="$t('message.success_message')"></p>
            </h3>            
            <p>
              <b-icon icon="stopwatch" font-scale="2"></b-icon>
              <span id="timer" class="bg-dark text-light pl-2 pr-2">
                {{ timer.time }}
              </span>
            </p>
            <p>{{ $t("message.thank_you") }}</p>
            <p>
              <b-button pill size="sm" variant="warning" v-touch="retry">
                {{ $t("message.retry") }}
              </b-button>
              <b-button v-if="existPrevious()" pill size="sm" variant="info" v-touch="previous">
                {{ $t("message.to_previous_stage") }}
              </b-button>
              <b-button v-if="existNext()" pill size="sm" variant="info" v-touch="next">
                {{ $t("message.to_next_stage") }}
              </b-button>
            </p>
            <h6>
              {{ $t("message.to_another_level") }}
            </h6>
            <p>
              <b-button v-for="l in getAnotherLevelList()" :key="'to-level-' + l" pill size="sm" variant="info" v-touch="moveAnotherLevel(l)">
                {{ $t("message.to_level_" + l) }}
              </b-button>
            </p>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <b-modal ref="modal-failure" size="md" hide-header hide-footer>
      <b-container>
        <b-row>
          <b-col class="text-center align-middle">
            <h3>
              <p v-html="$t('message.failure_message')"></p>
            </h3>
            <p>{{ $t("message.thank_you") }}</p>
            <p>
              <b-button pill size="sm" variant="warning" v-touch="retry">
                {{ $t("message.retry") }}
              </b-button>
              <b-button v-if="existPrevious()" pill size="sm" variant="info" v-touch="previous">
                {{ $t("message.to_previous_stage") }}
              </b-button>
              <b-button v-if="existNext()" pill size="sm" variant="info" v-touch="next">
                {{ $t("message.to_next_stage") }}
              </b-button>
            </p>
            <h6>
              {{ $t("message.to_another_level") }}
            </h6>
            <p>
              <b-button v-for="l in getAnotherLevelList()" :key="'to-level-' + l" pill size="sm" variant="info" v-touch="moveAnotherLevel(l)">
                {{ $t("message.to_level_" + l) }}
              </b-button>
            </p>
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
const MAIN_URL_JA = 'https://blast.pottiri.tech'
const MAIN_URL_EN = 'https://blast-en.pottiri.tech'

export default {
  data () {
    return {
      init: true,
      timer: {time: '00:00:00.000', began: null, stopped: null, duration: 0, started: null, running: false},
      data: {map: {}},
      life: {remaining: 0, max: 100},
      bomb: {},
      explosion: {},
      buruburu: {},
      countDown: 3,
      previousUrl: null,
      nextUrl: null
    }
  },
  methods: {
    clear () {
      this.bomb.length = 0
      this.life.remaining = this.life.max
    },
    setRedBomb (x, y) {
      let $vm = this
      return async function (event) {
        // 空白以外なら爆弾設置不可
        if ($vm.data.map[y][x] !== 'none') return

        let key = $vm.getKey(x, y)
        if ($vm.bomb[key]) {
          delete $vm.bomb[key]
          $vm.life.remaining++
          return
        }
        $vm.bomb[key] = {x: x, y: y}
        $vm.life.remaining--
        if ($vm.life.remaining === 0) {
          $vm.timerStop()
          $vm.$refs['modal-count-down'].show()
          await $vm.sleep(1000)
          $vm.countDown--
          await $vm.sleep(1000)
          $vm.countDown--
          await $vm.sleep(1000)
          $vm.countDown--
          $vm.$refs['modal-count-down'].hide()
          await $vm.sleep(250)
          for (let k of Object.keys($vm.bomb)) {
            await $vm.fire($vm.bomb[k].x, $vm.bomb[k].y)
            delete $vm.bomb[key]
          }
          await $vm.sleep(3000)
          if ($vm.data.installations['black-bomb'] <= 0 && $vm.data.installations.breakable1 <= 0) {
            $vm.$refs['modal-complete'].show()
          } else {
            $vm.$refs['modal-failure'].show()
          }
        }
      }
    },
    async fire (x, y) {
      this.setExplosion(x, y, true)
      let blackBombs = []
      for (let d of DIRECTIONS) {
        let mx = parseInt(x)
        let my = parseInt(y)
        while (1) {
          mx += d.fx
          my += d.fy
          let mkey = this.getKey(mx, my)
          if (my < 1 || my > Object.keys(this.data.map).length) break
          if (mx < 1 || mx > Object.keys(this.data.map[my]).length) break
          if (this.isUnbreakable(mx, my)) break
          if (this.isBreakable1(mx, my)) {
            this.setExplosion(mx, my, false)
            this.data.installations.breakable1--
            break
          }
          if (this.isBlackBomb(mx, my)) {
            if (!blackBombs.includes(mkey)) blackBombs.push(mkey)
            this.setBuruBuru(mx, my)
            this.data.installations['black-bomb']--
            continue
          }
          this.setExplosion(mx, my, false)
        }
      }
      this.buruburu = {}
      for (let k of blackBombs) {
        let xy = k.split('-')
        if (this.isBlackBomb(xy[0], xy[1])) {
          await this.fire(xy[0], xy[1])
        }
      }
    },
    isRedBomb (x, y) {
      return Object.keys(this.bomb).includes(this.getKey(x, y))
    },
    isBlackBomb (x, y) {
      return (this.data.map[y][x] === 'black-bomb' && this.isExplosion(x, y) === false && this.isBuruBuru(x, y) === false)
    },
    isUnbreakable (x, y) {
      return (this.data.map[y][x] === 'unbreakable')
    },
    isBreakable1 (x, y) {
      return (this.data.map[y][x] === 'breakable1' && this.isExplosion(x, y) === false)
    },
    setExplosion (x, y, bomb) {
      const key = this.getKey(x, y)
      if (Object.keys(this.explosion).includes(key)) {
        this.explosion[key].count++
      } else {
        this.explosion[key] = {count: 1, bomb: bomb}
      }
    },
    setBuruBuru (x, y) {
      const key = this.getKey(x, y)
      this.buruburu[key] = key
    },
    isExplosion (x, y) {
      return Object.keys(this.explosion).includes(this.getKey(x, y))
    },
    isExplosionBomb (x, y) {
      return (this.isExplosion(x, y) && this.explosion[this.getKey(x, y)].bomb === true)
    },
    isBuruBuru (x, y) {
      return Object.keys(this.buruburu).includes(this.getKey(x, y))
    },
    explosionCount (x, y) {
      if (!Object.keys(this.explosion).includes(this.getKey(x, y)) || this.explosion[this.getKey(x, y)].count === 1) return '&nbsp;'
      return this.explosion[this.getKey(x, y)].count
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
    existPrevious () {
      return (this.previousUrl !== null)
    },
    previous () {
      window.parent.location.href = MAIN_URL_EN + '/posts/' + this.previousUrl
    },
    existNext () {
      return (this.nextUrl !== null)
    },
    next () {
      window.parent.location.href = this.nextUrl
    },
    restart () {
      if (this.$route.params['language']) {
        this.$router.go({path: this.$router.currentRoute.path, force: true})
      } else {
        this.$router.go({path: this.$router.currentRoute.path + '/' + this.$i18n.locale, force: true})
      }
    },
    getAnotherLevelList () {
      let r = []
      if (this.$route.params.id.startsWith('level0')) {
        r.push(1)
      } else if (this.$route.params.id.startsWith('level1')) {
        r.push(0)
      }
      return r
    },
    moveAnotherLevel (level) {
      let $vm = this
      return function (event) {
        if ($vm.$route.params.language === 'en') {
          window.parent.location.href = MAIN_URL_EN + '/posts/level' + level + '-1'
        } else {
          window.parent.location.href = MAIN_URL_JA + '/posts/level' + level + '-1'
        }
      }
    }
  },
  mounted () {
    let $vm = this
    $vm.logging(process.env)
    $vm.logging($vm.$route.params)
    if (document.referrer.indexOf(MAIN_URL_EN) !== -1) {
      $vm.$route.params.language = 'en'
    }
    if (document.referrer.indexOf(MAIN_URL_JA) !== -1) {
      $vm.$route.params.language = 'ja'
    }
    if ($vm.$route.params['language']) {
      $vm.$i18n.locale = $vm.$route.params.language
    }
    $vm.axios
      .get('/static/json/' + $vm.$route.params.id + '.json', { crossDomain: true })
      .then(response => {
        $vm.logging(response)
        $vm.data = response.data
        $vm.life.remaining = $vm.data.limit
        $vm.life.max = $vm.data.limit
        $vm.init = false
        $vm.$refs['modal-start'].show()
      })
      .catch(err => {
        alert('通信エラーが発生しました。')
        console.log('err:', err)
      })

    let ids = $vm.$route.params.id.split('-')
    let p = parseInt(ids[1]) - 1
    let n = parseInt(ids[1]) + 1
    let previous = ''
    let next = ''
    if ($vm.$route.params.language === 'en') {
      previous = MAIN_URL_EN + '/posts/' + ids[0] + '-' + p
      next = MAIN_URL_EN + '/posts/' + ids[0] + '-' + n
    } else {
      previous = MAIN_URL_JA + '/posts/' + ids[0] + '-' + p
      next = MAIN_URL_JA + '/posts/' + ids[0] + '-' + n
    }
    $vm.axios
      .get(previous, { crossDomain: true })
      .then(response => {
        if (response.status === 200) {
          $vm.previousUrl = previous
        }
      })
      .catch(err => {
        $vm.logging('check previous error! err:' + err)
      })
    $vm.axios
      .get(next, { crossDomain: true })
      .then(response => {
        if (response.status === 200) {
          $vm.nextUrl = next
        }
      })
      .catch(err => {
        $vm.logging('check next error! err:' + err)
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
.remaining {
  min-width: 1.75rem !important;
  min-height: 1.75rem !important;
  width: 1.75rem !important;
  height: 1.75rem !important;
  padding: 0px;
}
.box-base {
  cursor: pointer;
  min-width: 1.75rem !important;
  min-height: 1.75rem !important;
  width: 1.75rem !important;
  height: 1.75rem !important;
  text-align: center !important;
  vertical-align: middle !important;
  border-top: 1px solid #000000;
  border-left: 1px solid #000000;
  padding-left: 0px !important;
  padding-right: 0px !important;
  color: #000000;
  padding: 0px;
}
.box-large2 {
  font-size: x-large;
  min-width: 2.25rem !important;
  min-height: 2.25rem !important;
  max-width: 2.25rem !important;
  max-height: 2.25rem !important;
}
.box-row-last {
  border-bottom: 1px solid #000000;
}
.box-col-last {
  border-right: 1px solid #000000;
}
.red-bomb {
  background-image: url("/static/bomb/red-bomb.svg");
  background-size: cover;
}
.black-bomb {
  background-image: url("/static/bomb/black-bomb.svg");
  background-size: cover;
}
.unbreakable {
  background-image: url("/static/bomb/unbreakable.svg");
  background-size: cover;
}
.breakable1 {
  background-image: url("/static/bomb/breakable1.svg");
  background-size: cover;
}
.explosion {
  background-image: url("/static/bomb/explosion.svg");
  background-size: cover;
  animation: hurueru .1s  infinite;
}
.explosion-bomb {
  background-image: url("/static/bomb/explosion-start.svg");
  background-size: cover;
  animation: hurueru .1s  infinite;
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
  max-width: 11.75rem !important;
  width: 11.75rem !important;
  padding: 0px;
  padding-top: 0.25rem;
  /* border-radius: 50rem; */
}
.buruburu {
  animation: hurueru .1s  infinite;
}
@keyframes hurueru {
  0% {transform: translate(0px, 0px) rotateZ(0deg)}
  25% {transform: translate(2px, 2px) rotateZ(1deg)}
  50% {transform: translate(0px, 2px) rotateZ(0deg)}
  75% {transform: translate(2px, 0px) rotateZ(-1deg)}
  100% {transform: translate(0px, 0px) rotateZ(0deg)}
}
.img-small {
  height: 2rem;
  width: 2rem;
}
.modal-dialog {
  top: 10% !important;
}
</style>
