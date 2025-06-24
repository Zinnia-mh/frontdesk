<template>
  <div class="home">
    <div class="home1">
      <div class="home-title">
        <h1>红枣知识智能服务系统</h1>
      </div>
      <div class="search">
        <el-input
          v-model="input1"
          size="large"
          placeholder="枣树病害"
          class="input-with-select"
        >
          <template #append>
            <el-button :icon="Search" @click="search" />
          </template>
        </el-input>
      </div>
      <div class="bestsellers-container">
        <div class="hot-words">
          <h3>热词搜索：</h3>
        </div>
        <chart-word-cloud :options="state.chartOptions"></chart-word-cloud>
      </div>
      <div class="show">
        <div class="entity">
          <div ref="count1Ref">{{ homestore.sumEntity }}</div>
          <div>百科实体数</div>
        </div>
        <div class="relation">
          <div ref="count2Ref">{{ homestore.sumRelation }}</div>
          <div>百科关系数</div>
        </div>
      </div>
      <el-icon><ArrowDownBold /></el-icon>
    </div>
    <div class="home2">
      <h2>农业资讯</h2>
      <div class="content">
        <div class="item">
          <img src="../assets/images/news1.jpg" alt="" />
          <div class="right">
            <a
              href="https://www.thepaper.cn/newsDetail_forward_26002585"
              target="_blank"
              >陕西绥德：做足“枣”文章　群众“枣”致富
            </a>
            <p>
              绥德县枣林坪镇是全县红枣核心产区和优质产区，因枣树成林而得名。该镇土地肥沃、昼夜温差大、日照时间长，产出的红枣具有皮薄肉厚、汁多味甜、质脆丝长等特点。目前，全镇红枣种植面积达3.4万亩，年平均产量8000吨，是全镇的主导产业，也是当地百姓的“致富树”。
            </p>
          </div>
        </div>
        <div class="item">
          <img src="../assets/images/news2.jpg" alt="" />
          <div class="right">
            <a
              href="https://www.thepaper.cn/newsDetail_forward_25896253"
              target="_blank"
              >年产1.5亿斤冬枣，山东这个低调的县城早该趁“枣”出名
            </a>
            <p>
              “华夏枣都”无棣，位于山东省最北部的滨州市，濒临渤海，毗邻河北。无棣县境内生长着万余株百年以上成片或孤植的老枣树，大多生长旺盛。“唐枣”和“冬枣王”就是其中典型的代表。
            </p>
          </div>
        </div>
        <div class="item">
          <img src="../assets/images/news3.webp" alt="" />
          <div class="right">
            <a
              href="https://news.e23.cn/content/2024-01-11/2024011100319.html"
              target="_blank"
              >小红枣做成大产业（乡村行 看振兴）
            </a>
            <p>
              冬日，新疆维吾尔自治区若羌县吾塔木乡红枣示范园里，县红枣科技服务中心技术员正在给村民培训枣树修剪、冬季管护等技能，为红枣增产增收打好基础。
            </p>
          </div>
        </div>
        <div class="item">
          <img src="../assets/images/news4.jpg" alt="" />
          <div class="right">
            <a
              href="https://www.toutiao.com/article/7324994865778016809/?channel=&source=search_tab"
              target="_blank"
              >临泽：红枣加工迈进智能化时代
            </a>
            <p>
              红枣作为临泽县特色优势农产品，从种植到加工，每一道工序都决定了红枣的品质。近日，走进甘肃西域食品有限责任公司，占地1800平方米的数字化车间拔地而起，车间内设备已安装调试完毕，多条智能化生产线开足马力生产，整个生产车间忙而有序。
            </p>
          </div>
        </div>
      </div>
    </div>
    <footer>
      <div>此网站用于科创学习</div>
      <div>联系我们qq: 3211156672</div>
    </footer>
  </div>
</template>

<script setup>
import ChartWordCloud from "../components/wordcloud.vue"

import { onMounted, ref, reactive } from "vue"
import { useRouter } from "vue-router"

import axios from "axios"
import { useHomeStore } from "@/stores/main"
import { Search } from "@element-plus/icons-vue"
import { CountUp } from "countup.js"
import { BASE_URL } from "@/service/config"
//首先在setup中定义
const router = useRouter()
const homestore = useHomeStore()
const url = BASE_URL + "getNodesNum"
const url1 = BASE_URL + "getRelationNum"
var data = []
const input1 = ref("")
const count1Ref = ref()
const count2Ref = ref()

onMounted(() => {
  if (homestore.nodesNum.length === 0) {
    axios.request(url).then((res) => {
      for (let i = 0; i < res.data.length; i++) {
        homestore.sumEntity += res.data[i]["count(n)"]
        if (res.data[i]["labels(n)"].length > 0) {
          let tmp = {
            name: res.data[i]["labels(n)"][0],
            value: res.data[i]["count(n)"],
          }
          data.push(tmp)
        }
      }
      const countup1 = new CountUp(count1Ref.value, homestore.sumEntity, {})
      countup1.start()
      homestore.nodesNum = data
    })
  } else {
    const countup1 = new CountUp(count1Ref.value, homestore.sumEntity, {})
    countup1.start()
  }
  if (homestore.sumRelation == 0) {
    axios.request(url1).then((res) => {
      homestore.sumRelation = res.data[0]["count(rel)"]
      const countup2 = new CountUp(count2Ref.value, homestore.sumRelation, {})
      countup2.start()
    })
  } else {
    const countup2 = new CountUp(count2Ref.value, homestore.sumRelation, {})
    countup2.start()
  }
})

function search () {
  homestore.index = "/graphsearch"
  if (input1.value == "") {
    let param = "枣树病害"
    router.push({ name: "graphsearch", state: { param } })
  } else {
    let param = input1.value
    router.push({ name: "graphsearch", state: { param } })
  }
}

const state = reactive({
  chartOptions: {
    series: [
      {
        gridSize: 10,
        data: [
          { name: "制干品种", value: 20 },
          { name: "枣树主要栽培管理技术", value: 22 },
          { name: "盛果期管理", value: 23 },
          { name: "枣果加工", value: 24 },
          { name: "鲜枣采收", value: 25 },
          { name: "环境条件", value: 23 },
          { name: "枣树育苗", value: 20 },
          { name: "结果习性", value: 18 },
          { name: "枣树主要栽培管理技术", value: 15 },
          { name: "修剪与分级", value: 15 },
          { name: "盐碱地土壤改良", value: 15 },
          { name: "陕西省", value: 15 },
        ],
      },
    ],
  },
});
</script>


<style lang="less" scoped>
html,
body {
  width: 100%;
}
.home1 {
  width: 100%;
  height: calc(100vh - 50px);
  border-bottom: 2px solid hsl(0, 0%, 0%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url(../assets/images/home3.jpg);
  object-fit: scale-down;
}

.home-title {
  width: 100%;
  display: flex;
  justify-content: center;
}

.search {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 20px 20px 20px;
}
.el-input {
  width: 60%;
}
.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
.show {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 20px;
}
.entity,
.relation {
  width: 20%;
  height: 100px;
  background-color: #1166ee;
  color: #fff;
  font-size: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}
h1 {
  color: #1166ee;
  font-family: "等线";
  font-size: 60px;
  letter-spacing: 5px;
}
.home1 .el-icon {
  position: absolute;
  bottom: 35px;
  animation-name: updown;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
}
@keyframes updown {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}
.home2 {
  width: 100%;
  background-image: url(../assets/images/home2.jpg);
}
h2 {
  text-align: center;
  color: #78e17f;
  margin: 0 auto;
  padding: 10px 0;
}
.home2 .content {
  padding: 20px 40px;
}
.home2 .content img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  object-position: center top;
  margin-right: 25px;
}
.home2 .content .item {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}
.home2 .content .item a {
  font-size: large;
  color: #000;
}
.home2 .content .item a:hover {
  font-weight: 700;
  font-size: larger;
}
.home2 .content .item p {
  color: #191919;
}
footer {
  height: 100px;
  background-color: #1e1818d9;
  color: rgb(223, 218, 218);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
footer div {
  padding: 10px 0 0 30px;
}

.bestsellers-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  height: 20%;
  width: 60%;
  padding: 20px 10px;
  background: #e4e6db00;
  // border-radius:10%;
  #charts-content {
    /* 需要设置宽高后才会显示 */
    width: 100%;
    height: 100%;
  }
}

.hot-words {
  color: #73767a;
}

/* 在CSS中定义移动端样式 */
@media only screen and (max-width: 768px) {
  /* 移动端样式 */
}
</style>
