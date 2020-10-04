<template>
  <div id="stage">
    <b-progress :max="progressMax" height="2rem">
      <b-progress-bar :value="progress">
        <span>Progress: <strong>{{ progress.toFixed(2) }} / {{ progressMax }}</strong></span>
      </b-progress-bar>
    </b-progress>
    <!-- <b-alert
      :show="dismissCountDown"
      dismissible
      variant="success"
      @dismissed="dismissCountDown=0"
      @dismiss-count-down="countDownChanged"
      class="mt-3"
    >
      <p>Answer</p>
    </b-alert> -->
    <b-container class="mt-3">
      <b-row v-for="(cols, y) in rows" :key="'row-' + y">
        <b-link href="#foo" v-for="(col, x) in cols" :key="'col-' + y + '-' + x" @click="choice(x, y)">
          <b-col border class="box" v-bind:class="{'box-row-last': isLast(y, rows.length - 1), 'box-col-last': isLast(x, cols.length - 1)}" bg-variant="info">
            {{col}}
          </b-col>
        </b-link>
      </b-row>
    </b-container>
    <b-button size="md" variant="danger" v-b-toggle:stage-words class="mt-3">
      <span class="when-open">
          <small><b-icon icon="arrows-collapse" />Close Answer</small>
      </span>
      <span class="when-closed">
          <small><b-icon icon="arrows-expand" />Open Answer</small>
      </span>
    </b-button>
    <b-collapse id="stage-words" class="mt-3">
      <ul id="word-list">
        <li v-for="(word, i) in words" :key="'word-list' + i">
          {{ word.text }}
        </li>
      </ul>
    </b-collapse>
  </div>
</template>

<script>
export default {
  data () {
    return {
      progress: 15,
      progressMax: 25,
      dismissSecs: 3,
      dismissCountDown: 3,
      size: 10,
      rows: [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, '１']
      ],
      words: [
        {text: 123, comment: 12345},
        {text: 456, comment: 12345},
        {text: 789, comment: 12345},
        {text: 123, comment: 12345},
        {text: 456, comment: 12345},
        {text: 789, comment: 12345},
        {text: 123, comment: 12345},
        {text: 456, comment: 12345},
        {text: 789, comment: 12345},
        {text: 123, comment: 12345},
        {text: 456, comment: 12345},
        {text: 789, comment: 12345}                        
      ]
    }
  },
  methods: {
    isLast (idx, length) {
      return (idx >= length)
    },
    choice (x, y) {
      alert('test')
    },
    countDownChanged (dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    }
  }
}
</script>
<style>
.box {
  width: 2rem !important;
  height: 2rem !important;
  text-align: center !important;
  vertical-align: middle !important;
  border-top: 1px solid #000000 !important;
  border-left: 1px solid #000000 !important;
  padding-left: 0px !important;
  padding-right: 0px !important;
  background-color: #fffaf0;
  color: #000000;
}
.box-row-last {
  border-bottom: 1px solid #000000;
}

.box-col-last {
  border-right: 1px solid #000000;
}

.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}
</style>
