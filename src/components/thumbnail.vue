<template>
  <div>
    <b-card
      id="preview"
      no-body
      header="header"
      header-bg-variant="green"
      header-border-variant="dark"
      footer="footer"
      footer-bg-variant="light"
      footer-border-variant="dark"
    >
      <template v-slot:header>
        <h6 class="mb-0 text-center align-middle">ワード・サーチ・パズル</h6>
      </template>
      <b-card-body class="text-center align-middle">
        <h3>{{ data.title }}</h3>
        <h5>{{ data.size }} ✕ {{ data.size }} マス</h5>
        <h5>{{ Object.keys(data.words).length }} ワード</h5>
      </b-card-body>
      <template v-slot:footer>
        <p class="text-center align-middle">
          <b-badge pill variant="primary" v-for="(tag, i) in data.tags" :key="'tag-' + i" class="text-light mr-1">
            {{ tag }}
          </b-badge>
        </p>
      </template>
    </b-card>
    <b-button size="md" variant="primary" class="mt-3 mb-3" @click="generate()">
      画像作成
    </b-button>
    <div id="result"></div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      data: null
    }
  },
  methods: {
    generate () {
      html2canvas(document.querySelector('#preview')).then(function (canvas) {
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
}
.bg-green {
  background-color: #009688 !important;
  color: #ffffff;
}
</style>
