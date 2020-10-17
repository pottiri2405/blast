<template>
  <div>
    <b-container>
      <b-row>
        <b-col>
          <b-form-select v-model="image"
          :options="[
          {value: '/static/background/fruit.jpg', text: 'フルーツ'},
          {value: '/static/background/moon.jpg', text: '月'},
          {value: '/static/background/wisteria.jpg', text: '藤の花'},
          {value: '/static/background/monstar-ball.jpg', text: 'モンスターボール'},
          ]"
          size="sm"
          class="mt-3">
          </b-form-select>
          <b-form-input v-model="image"></b-form-input>
          <b-form-input v-model="color" size="sm" ></b-form-input>
          <b-form-input v-model="position" size="sm" ></b-form-input>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <p class="mt-3 mb-3"></p>
          <b-card
            id="preview"
            no-header
            no-body
            footer-bg-variant="light"
            footer-border-variant="dark"
          >
            <b-card-body class="text-center align-middle" :style="{ backgroundImage: 'url(' + image + ')', 'background-size': 'cover', 'background-position': position  }">
              <b-container :style="{ color: color }">
                <b-row>
                  <b-col class="text-center align-middle">
                    <h3><b>{{ data.title }}</b></h3>
                    <h5><b>{{ $t("message.title") }}</b></h5>
                  </b-col>
                </b-row>
              </b-container>
            </b-card-body>
            <template v-slot:footer>
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
            </template>
          </b-card>
          <p class="mt-3 mb-3"></p>
          <b-button size="md" variant="primary" class="mt-3 mb-3" @click="generate()">
            画像作成
          </b-button>
          <div id="result"></div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
<script>
export default {
  data () {
    return {
      data: {title: '', size: 0, words: {}, tags: {}},
      color: '#FFFFFF',
      image: '/static/background/fruit.jpg',
      position: 'center center'
    }
  },
  methods: {
    generate () {
      html2canvas(document.querySelector('#preview')).then(function (canvas) { // eslint-disable-line
        let result = document.querySelector('#result')
        result.innerHTML = ''
        result.appendChild(canvas)
      })
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
#preview {
  width: 506px;
  height: 253px;
}
#preview .card {
  height: 100%;
  border: 1px solid;
}
.bg-green {
  background-color: #009688 !important;
  color: #ffffff;
}
.tag {
  font-size: large !important;
}
</style>
