<template>
  <div id="stage">
    <b-container>
      <b-row>
        <b-col class="text-center">
        </b-col>
      </b-row>
      <b-row v-for="(cols, y) in rows" :key="'row-' + y">
        <b-link href="#foo" v-for="(col, x) in cols" :key="'col-' + y + '-' + x" @click="choice(x, y)">
          <b-col border class="box" v-bind:class="{'box-row-last': isLast(y, rows.length - 1), 'box-col-last': isLast(x, cols.length - 1)}" bg-variant="info">
            {{col}}
          </b-col>
        </b-link>
      </b-row>
    </b-container>
    <b-progress :max="progressMax" height="2rem" class="mt-3 ml-3 w-75">
      <b-progress-bar :value="progress">
        <span>Progress: <strong>{{ progress.toFixed(2) }} / {{ progressMax }}</strong></span>
      </b-progress-bar>
    </b-progress>    
    <p class="text-left mt-3 ml-3">
      <b-button size="sm" variant="danger">
        <b-icon icon="question-square" class="mr-2" />Open hint
      </b-button>
      <b-button size="sm" v-b-modal.modal-nice variant="secondary">
        <b-icon icon="question-square" class="mr-2" />Modal
      </b-button>      
    </p>
    <b-card id="hint-area" class="mt-3 ml-3 w-75 bg-warning">
      <div>
        <b-badge pill variant="secondary" v-for="(hint, i) in hints" :key="'hint-list-' + i" class="mr-1">
          <b-icon icon="question" v-for="n of hint.text.length" :key="n">
          </b-icon>
        </b-badge>
      </div>
    </b-card>
    <b-modal id="modal-nice" title="Nice!" header-bg-variant="success" ok-only>
      <p><font size="+1">Hello from modal!</font></p>
      <p><font size="+0">Hello from modal!</font></p>
    </b-modal>    
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
      hints: [
        {text: '12３', comment: 12345},
        {text: '１２３', comment: 12345},
        {text: '789', comment: 12345},
        {text: '123', comment: 12345},
        {text: '456', comment: 12345},
        {text: '7891011', comment: 12345},
        {text: '123', comment: 12345},
        {text: '456', comment: 12345},
        {text: 'あいうえお', comment: 12345},
        {text: '123', comment: 12345},
        {text: '456', comment: 12345},
        {text: '12３', comment: 12345},
        {text: '１２３', comment: 12345},
        {text: '789', comment: 12345},
        {text: '123', comment: 12345},
        {text: '456', comment: 12345},
        {text: '7891011', comment: 12345},
        {text: '123', comment: 12345},
        {text: '456', comment: 12345},
        {text: 'あいうえお', comment: 12345},
        {text: '123', comment: 12345},
        {text: '456', comment: 12345},
        {text: '12３', comment: 12345},
        {text: '１２３', comment: 12345},
        {text: '789', comment: 12345},
        {text: '123', comment: 12345},
        {text: '456', comment: 12345},
        {text: '7891011', comment: 12345},
        {text: '123', comment: 12345},
        {text: '456', comment: 12345},
        {text: 'あいうえお', comment: 12345},
        {text: '123', comment: 12345},
        {text: '456', comment: 12345},                
        {text: '789', comment: 12345}                        
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
#hint-area.bg-warning {
  background-color: #ffffe0 !important;
}
</style>
