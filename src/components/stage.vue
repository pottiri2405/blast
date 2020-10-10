<template>
  <div id="stage">
    <b-container>
      <b-row class="mt-3">
        <b-col class="pl-0">
          <b-progress v-if="progressMax > 0" :max="progressMax" height="2rem" class="w-100">
            <b-progress-bar :value="progress">
              {{ progress }} / {{ Object.keys(data.words).length }}
            </b-progress-bar>
          </b-progress>
        </b-col>
      </b-row>
      <b-row class="mt-3">
        <b-col id="timer" class="bg-dark text-light text-center align-middle">
          {{ timerTime }}
        </b-col>
        <b-col>
          <b-button pill size="sm" v-b-modal.modal-nice variant="primary">
            {{ $t("message.restart") }}
          </b-button>
        </b-col>
      </b-row>
      <b-row id="hint-area" class="mt-3">
        <b-col id="hint-check-area" class="pl-0">
          <p class="text-left">
            <b-form-checkbox v-model="hit" name="check-hint" switch>
              {{ $t("message.hint") }}
            </b-form-checkbox>
          </p>
        </b-col>
        <b-col id="hint-image-area">
          <b-container>
            <b-row>
              <b-col id="hint-image1" class="pl-0"><span>No image</span></b-col>
              <b-col id="hint-image2"><span>No image</span></b-col>
              <b-col id="hint-image3"><span>No image</span></b-col>
            </b-row>
            <b-row>
              <b-col id="hint-google-search">
                {{ $t("message.google_search") }}
              </b-col>
            </b-row>
          </b-container>
        </b-col>
      </b-row>
      <b-row v-for="(cols, y) in data.map" :key="'row-' + y">
        <b-link href="#" v-for="(col, x) in cols" :key="'col-' + y + '-' + x" @click="clickBox(x, y)">
          <b-col border class="box" v-bind:class="{
            'box-row-last': isLast(y, Object.keys(data.map).length),
            'box-col-last': isLast(x, Object.keys(cols).length),
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
  </div>
</template>

<script>
export default {
  data () {
    return {
      timerTime: '00:00:00.000',
      timerTimeBegan: null,
      timerTimeStopped: null,
      timerStoppedDuration: 0,
      timerStarted: null,
      timerRunning: false,
      progress: 0,
      progressMax: 100,
      dismissSecs: 3,
      dismissCountDown: 3,
      hit: false,
      data: {map: {}, words: {}},
      clicked: {}
    }
  },
  methods: {
    isLast (idx, length) {
      return (idx >= length)
    },
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    clickBox (x, y) {
      let key = this.getKey(x, y)
      if (this.clicked[key]) {
        delete this.clicked[key]
        return true
      }
      this.clicked[key] = 1
    },
    isClickedBox (x, y) {
      let key = this.getKey(x, y)
      return (this.clicked[key])
    },
    gameStart () {
      this.$refs['modal-start'].hide()
      this.timerStart()
    },
    timerStart () {
      if (this.timerRunning !== false) return
      if (this.timerTimeBegan === null) {
        this.timerReset()
        this.timerTimeBegan = new Date()
      }
      if (this.timerTimeStopped !== null) {
        this.timerStoppedDuration += (new Date() - this.timerTimeStopped)
      }
      this.timerStarted = setInterval(this.timerClockRunning, 10)
      this.timerRunning = true
    },
    timerStop () {
      this.timerRunning = false
      this.timerTimeStopped = new Date()
      clearInterval(this.timerStarted)
    },
    timerReset () {
      this.timerStart = false
      clearInterval(this.timerStarted)
      this.timerStoppedDuration = 0
      this.timerTimeBegan = null
      this.timerTimeStopped = null
      this.timerTime = '00:00:00.000'
    },
    timerClockRunning () {
      let currentTime = new Date()
      let timeElapsed = new Date(currentTime - this.timerTimeBegan - this.timerStoppedDuration)
      let hour = timeElapsed.getUTCHours()
      let min = timeElapsed.getUTCMinutes()
      let sec = timeElapsed.getUTCSeconds()
      let ms = timeElapsed.getUTCMilliseconds()
      this.timerTime =
        this.zeroPrefix(hour, 2) + ':' +
        this.zeroPrefix(min, 2) + ':' +
        this.zeroPrefix(sec, 2) + '.' +
        this.zeroPrefix(ms, 3)
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
.clicked-box {
  background-color: #f08080;
  -webkit-animation: flash 1s ease infinite;
  animation: flash 1s ease infinite;
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
#hint-google-search {
  text-align: center !important;
  font-size: 0.8rem;
}
</style>
