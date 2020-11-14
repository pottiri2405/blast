<template>
  <div id="stage">
    <img src="/static/bomb/fire.svg" style="display: none;">
    <img src="/static/bomb/explosion-bomb.svg" style="display: none;">
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
              <td class="stock stock-bomb" v-bind:class="{'up': (life.stock === 0)}">&nbsp;</td>
            </tr>
          </table>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col class="pl-0">
          <table id="map">
            <tr v-for="(chars, y) in data.map" :key="'row-' + y">
              <td border
              v-for="(char, x) in chars"
              :key="'box' + x + '-' + y"
              v-touch:start="setRedBomb(x, y)"
              class="box-base"
              v-bind:class="{
                'box-row-last': isLast(y, data.size),
                'box-col-last': isLast(x, data.size),
                'red-bomb-down': (isRedBomb(x, y) && countDown === 999),
                'red-bomb': (isRedBomb(x, y) && countDown > 0 && countDown < 999),
                'black-bomb': isBlackBomb(x, y),
                'unbreakable': isUnbreakable(x, y),
                'breakable1': isBreakable1(x, y),
                'enemy-stop': isEnemyStop(x, y),
                'enemy-vertical': isEnemyVertical(x, y),
                'enemy-down': isEnemyDown(x, y)
                }">
                <p v-show="isRedBomb(x, y) && countDown > 0 && countDown < 999" id="count-down">{{ countDown }}</p>
                <img v-if="isExplosionBomb(x, y)" src="/static/bomb/explosion-bomb.svg" class="explosion-bomb">
                <img v-for="(f, i) in blastArray(x, y)" v-bind:key="'blast-1-' + i" src="/static/bomb/fire.svg" class="blast" :style="blastStyle(f)">
                <p :ref="'box-' + x + '-' + y"></p>
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
              <b-button pill size="sm" variant="warning" v-touch="restart">
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
              <b-button pill size="sm" variant="warning" v-touch="restart">
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
  {axis: 'n', rx: 0, ry: 1, fx: 0, fy: -1},
  {axis: 'nw', rx: 1, ry: 1, fx: -1, fy: -1}
]
const ROTATE = {
  'w': {rotate: '90deg'},
  'sw': {rotate: '45deg'},
  's': {rotate: '0deg'},
  'se': {rotate: '-45deg'},
  'e': {rotate: '-90deg'},
  'ne': {rotate: '-135deg'},
  'n': {rotate: '180deg'},
  'nw': {rotate: '135deg'}
}
const ENEMIES = {
  'vertical': {'default': 's', 'reverse': 'n'}
}

export default {
  data () {
    return {
      init: true,
      language: null,
      timer: {time: '00:00:00.000', began: null, stopped: null, duration: 0, started: null, running: false},
      data: {map: {}},
      life: {stock: 0, max: 100},
      bomb: {},
      explosion: {},
      buruburu: {},
      countDown: 999,
      previousUrl: null,
      nextUrl: null,
      blasts: {},
      enemies: []
    }
  },
  methods: {
    clear () {
      this.bomb.length = 0
      this.life.stock = this.life.max
    },
    setRedBomb (x, y) {
      let $vm = this
      return async function (event) {
        // 空白以外なら爆弾設置不可
        if ($vm.data.map[y][x] !== 'none') return

        let key = $vm.getKey(x, y)
        if ($vm.bomb[key]) {
          delete $vm.bomb[key]
          $vm.life.stock++
          return
        }
        $vm.life.stock--
        await $vm.sleep(500)
        $vm.bomb[key] = {x: x, y: y}
        await $vm.sleep(500)
        if ($vm.life.stock === 0) {
          $vm.timerStop()
          $vm.countDown = 3
          await $vm.sleep(1000)
          $vm.countDown--
          await $vm.sleep(1000)
          $vm.countDown--
          await $vm.sleep(1000)
          $vm.countDown--
          for (let k of Object.keys($vm.bomb)) {
            await $vm.fire($vm.bomb[k].x, $vm.bomb[k].y)
            delete $vm.bomb[key]
          }
          await $vm.sleep(3000)
          let complete = true
          for (let [key, value] of Object.entries($vm.data.installations)) {
            $vm.logging(key + '=' + value)
            if (parseInt(value) > 0) {
              complete = false
              break
            }
          }
          if (complete) {
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
        let sx = parseInt(x)
        let sy = parseInt(y)
        let mx = sx
        let my = sy
        let tx = sx
        let ty = sy
        while (1) {
          mx += d.fx
          my += d.fy
          let mkey = this.getKey(mx, my)
          if (my < 1 || my > Object.keys(this.data.map).length) break
          if (mx < 1 || mx > Object.keys(this.data.map[my]).length) break
          if (this.isUnbreakable(mx, my)) break
          if (this.isBreakable1(mx, my)) {
            this.setExplosion(mx, my, false)
            tx = mx
            ty = my
            this.data.installations.breakable1--
            break
          }
          if (this.isEnemyStop(mx, my) || this.isEnemyVertical(mx, my)) {
            this.setExplosion(mx, my, false)
            this.data.installations[this.data.map[my][mx]]--
            this.data.map[my][mx] = 'enemy-down'
            tx = mx
            ty = my
          }
          if (this.isBlackBomb(mx, my)) {
            if (!blackBombs.includes(mkey)) blackBombs.push(mkey)
            this.setBuruBuru(mx, my)
            tx = mx
            ty = my
            this.data.installations['black-bomb']--
            continue
          }
          this.setExplosion(tx, ty, false)
          tx = mx
          ty = my
        }
        if (sx !== tx || sy !== ty) {
          this.blasting(d.axis, sx, sy, tx, ty)
        }
      }
      this.buruburu = {}
      for (let k of blackBombs) {
        let xy = k.split('-')
        await this.fire(xy[0], xy[1])
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
    isEnemyStop (x, y) {
      return (this.data.map[y][x] === 'enemy-stop')
    },
    isEnemyVertical (x, y) {
      return (this.data.map[y][x] === 'enemy-vertical')
    },
    isEnemyDown (x, y) {
      return (this.data.map[y][x] === 'enemy-down')
    },
    setExplosion (x, y, bomb) {
      const key = this.getKey(x, y)
      if (Object.keys(this.explosion).includes(key)) {
        this.explosion[key].count++
        if (bomb) {
          this.explosion[key].bomb = bomb
        }
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
      let $vm = this
      setInterval(function () {
        if ($vm.countDown <= 0) return
        for (let e of $vm.enemies) {
          if (e.type === 'stop') continue
          if (!$vm.moveEnemy(e)) {
            $vm.moveEnemy(e)
          }
        }
      }, 1000)
    },
    moveEnemy (enemy) {
      let x = enemy.x
      let y = enemy.y
      switch ((enemy.mode === 'default') ? enemy.default : enemy.reverse) {
        case 'e':
          break
        case 'ne':
          break
        case 'n':
          y--
          break
        case 'nw':
          break
        case 'w':
          break
        case 'sw':
          break
        case 's':
          y++
          break
        case 'se':
          break
        default:
          break
      }
      if ((y < 1 || y > Object.keys(this.data.map).length) ||
      (x < 1 || x > Object.keys(this.data.map[y]).length) ||
      this.isRedBomb(x, y) ||
      this.data.map[y][x] !== 'none'
      ) {
        enemy.mode = (enemy.mode === 'default') ? 'reverse' : 'default'
        return false
      }
      this.data.map[enemy.y][enemy.x] = 'none'
      this.data.map[y][x] = 'enemy-' + enemy.type
      enemy.x = x
      enemy.y = y
      return true
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
      window.parent.location.href = this.previousUrl
    },
    existNext () {
      return (this.nextUrl !== null)
    },
    next () {
      window.parent.location.href = this.nextUrl
    },
    restart () {
      if (this.language !== null) {
        this.$router.go({path: this.$router.currentRoute.path + '/' + this.language, force: true})
      } else {
        this.$router.go({path: this.$router.currentRoute.path, force: true})
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
          window.parent.location.href = process.env.MAIN_URL_EN + '/posts/level' + level + '-1'
        } else {
          window.parent.location.href = process.env.MAIN_URL_JA + '/posts/level' + level + '-1'
        }
      }
    },
    blasting (axis, sx, sy, tx, ty) {
      let start = this.$refs['box-' + this.getKey(sx, sy)][0].getBoundingClientRect()
      let end = this.$refs['box-' + this.getKey(tx, ty)][0].getBoundingClientRect()
      const skey = this.getKey(sx, sy)
      if (!this.blasts[skey]) {
        this.blasts[skey] = []
      }
      const diffX = end.left - start.left
      const diffY = end.top - start.top
      let $vm = this
      $vm.blasts[skey].push({
        '--animation-second': '0.5s',
        '--translate-x': diffX + 'px',
        '--translate-y': diffY + 'px',
        '--rotate': ROTATE[axis].rotate
      })
      $vm.blasts[skey].push({
        '--animation-second': '0.6s',
        '--translate-x': diffX + 'px',
        '--translate-y': diffY + 'px',
        '--rotate': ROTATE[axis].rotate
      })
      $vm.blasts[skey].push({
        '--animation-second': '0.7s',
        '--translate-x': diffX + 'px',
        '--translate-y': diffY + 'px',
        '--rotate': ROTATE[axis].rotate
      })
      $vm.blasts[skey].push({
        '--animation-second': '0.8s',
        '--translate-x': diffX + 'px',
        '--translate-y': diffY + 'px',
        '--rotate': ROTATE[axis].rotate
      })
      $vm.blasts[skey].push({
        '--animation-second': '0.9s',
        '--translate-x': diffX + 'px',
        '--translate-y': diffY + 'px',
        '--rotate': ROTATE[axis].rotate
      })
      $vm.blasts[skey].push({
        '--animation-second': '1.0s',
        '--translate-x': diffX + 'px',
        '--translate-y': diffY + 'px',
        '--rotate': ROTATE[axis].rotate
      })
    },
    blastArray (x, y) {
      const key = this.getKey(x, y)
      if (!this.blasts[key]) return []
      return this.blasts[key]
    },
    blastStyle (attributes) {
      let style = ''
      for (let [key, value] of Object.entries(attributes)) {
        style += key + ':' + value + ';'
      }
      return style
    }
  },
  mounted () {
    let $vm = this
    $vm.logging(process.env)
    $vm.logging($vm.$route.params)
    $vm.$i18n.locale = $vm.$route.params.language
    $vm.axios
      .get('/static/json/' + $vm.$route.params.id + '.json', { crossDomain: true })
      .then(response => {
        $vm.logging(response)
        $vm.data = response.data
        $vm.life.stock = $vm.data.limit
        $vm.life.max = $vm.data.limit
        for (let y in $vm.data.map) {
          for (let x in $vm.data.map[y]) {
            for (let [key, e] of Object.entries(ENEMIES)) {
              if ($vm.data.map[y][x] === 'enemy-' + key) {
                $vm.enemies.push({x: x, y: y, type: key, mode: 'default', default: e['default'], reverse: e['reverse']})
              }
            }
          }
        }
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
      previous = process.env.MAIN_URL_EN + '/posts/' + ids[0] + '-' + p
      next = process.env.MAIN_URL_EN + '/posts/' + ids[0] + '-' + n
    } else {
      previous = process.env.MAIN_URL_JA + '/posts/' + ids[0] + '-' + p
      next = process.env.MAIN_URL_JA + '/posts/' + ids[0] + '-' + n
    }
    $vm.axios
      .head(previous, { crossDomain: true })
      .then(response => {
        if (response.status === 200) {
          $vm.previousUrl = previous
        }
      })
      .catch(err => {
        $vm.logging('check previous error! err:' + err)
      })
    $vm.axios
      .head(next, { crossDomain: true })
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
#count-down {
  font-size: 4rem;
  z-index: 999;
  position: absolute;
  left: -0.5rem;
  top: -4rem;
}
@media screen and (max-width: 768px) {
  #map {
   position: absolute;
   left: 50%;
   -webkit-transform: translate(-50%, 0);
   transform: translate(-50%, 0);
  }
}
.stock {
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
  text-align: left !important;
  vertical-align: top !important;
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
.up {
  animation: up-animation 0.5s forwards;
}
@keyframes up-animation {
  0% {
    transform: translateY(0px);
    -webkit-transform: translateY(0px);
  }
  100% {
    transform: translateY(-100px);
    -webkit-transform: translateY(-100px);
  }
}
.red-bomb-down {
  background-image: url("/static/bomb/red-bomb.svg");
  background-size: cover;
  animation: down-animation 0.5s forwards;
}
@keyframes down-animation {
  0% {
    transform: translateY(-1000px);
    -webkit-transform: translateY(-500px);
  }
  100% {
    transform: translateY(0px);
    -webkit-transform: translateY(0px);
  }
}
.red-bomb {
  background-image: url("/static/bomb/red-bomb.svg");
  background-size: cover;
  animation: scale-animation 1.0s infinite;
}
.stock-bomb {
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
.enemy-stop {
  background-image: url("/static/bomb/enemy-stop.svg");
  background-size: cover;
  animation: scale-animation 1.0s infinite;
}
.enemy-vertical {
  background-image: url("/static/bomb/enemy-vertical.svg");
  background-size: cover;
  animation: scale-animation 1.0s infinite;
}
@keyframes scale-animation {
  0% {transform: scale(1.0, 1.0);}
  50% {transform: scale(0.75, 0.75);}
  100% {transform: scale(1.0, 1.0);}
}
.enemy-down {
  background-image: url("/static/bomb/enemy-down.svg");
  animation: enemy-down-explosion 1.5s forwards;
}
@keyframes enemy-down-explosion {
  0% {transform: scale(1.0, 1.0);}
  50% {transform: scale(1.0, 1.0);}
  100% {transform: scale(0, 0);}
}
.explosion-bomb {
  width: 1.75rem !important;
  height: 1.75rem !important;
  position: absolute;
  z-index: 100;
  animation: explosion-bomb-animation 0.5s forwards;
}
@keyframes explosion-bomb-animation {
  0% {transform: scale(0, 0);}
  90% {transform: scale(2.0, 2.0);}
  100% {transform: scale(0, 0);}
}
.blast {
  width: 1.75rem !important;
  height: 1.75rem !important;
  position: absolute;
  z-index: 100;
  animation-timing-function: linear;
  animation: blast-animation var(--animation-second) forwards;
}
@keyframes blast-animation {
  0% {
    transform: translateX(0px) translateY(0px) rotate(var(--rotate));
    -webkit-transform: translateX(0px) translateY(0px) rotate(var(--rotate));
  }
  90% {
    transform: translateX(var(--translate-x)) translateY(var(--translate-y)) rotate(var(--rotate));
    -webkit-transform: translateX(var(--translate-x)) translateY(var(--translate-y)) rotate(var(--rotate));
  }
  100% {
    transform: translateX(var(--translate-x)) translateY(var(--translate-y)) rotate(var(--rotate)) scale(0, 0);
    -webkit-transform: translateX(var(--translate-x)) translateY(var(--translate-y)) rotate(var(--rotate)) scale(0, 0);
  }
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
