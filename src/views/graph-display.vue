<template>
  <div>
    <el-button class="toggle-btn" @click="toggleView">{{
      showGraph2 ? "图谱" : "统计图"
    }}</el-button>
    <div v-show="!showGraph2" key="graph1">
      <div class="slider-demo-block">
        <div class="head">显示结点数: {{ nodesNum }}</div>
        <div class="head">显示关系数: {{ relationNum }}</div>
        <div class="head">显示百分比：</div>
        <el-slider
          v-model="value"
          @change="changeValue"
          show-input
          size="small"
        />
      </div>
      <div class="view1" ref="card" style="width: 100%; text-align: center">
        <div id="graph" class="graph-container"></div>
        <el-dialog v-model="dialogFormVisible" title="节点信息">
          <div class="box">
            <img
              class="img"
              :src="getImageUrl(form.name)"
              onload="this.style.display='block'"
              onerror="this.style.display='none'"
            />
          </div>
          <el-form :model="form">
            <el-form-item
              v-for="(keyItem, index) in Object.keys(form)"
              :key="index"
              :labidel-width="formLabelWidth"
            >
              <span>{{ keyItem }}</span>
              <el-input
                v-model="form[keyItem]"
                readonly="true"
                autosize
                type="textarea"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="dialogFormVisible = false">取消</el-button>
              <el-button type="primary" @click="dialogFormVisible = false">
                确定
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </div>
    <!-- <img id="graphb" src="../assets/images/bg1.png" /> -->
    <div
      v-show="showGraph2"
      key="graph2"
      id="graph2"
      style="height: 650px; width: 100%"
    ></div>
  </div>
</template>
<script setup>
// import { onMounted, onUnmounted } from "@vue/runtime-core"
import { onMounted, onUnmounted, nextTick } from 'vue'
const showGraph2 = ref(false)
const value = ref(10)
let nodesNum = ref(0)
let relationNum = ref(0)
import { ref } from "vue"
import { BASE_URL } from "@/service/config"
var dialogFormVisible = ref(false)
const formLabelWidth = "140px"
var form = {}
import * as echarts from "echarts"
import axios from "axios"
let category = {
  品种选择: 0,
  枣果加工: 1,
  枣果采收与贮藏: 2,
  枣树建园: 3,
  枣树种植基础知识: 4,
  枣树管理: 5,
  枣树育苗: 6,
}
const url = BASE_URL + "getJsonData"
let params = { name: "" }
let data = []
let links = []
let data2 = []
import { useHomeStore } from "@/stores/main"
const homestore = useHomeStore()
var myChart
var myChart2
const url2 = BASE_URL + "getNodesNum"
const getImageUrl = (name) => {
  return new URL(`../assets/images/枣图片/${name}.jpg`, import.meta.url).href
}

onMounted(() => {
  // echarts 数据
  // 基于准备好的dom，初始化echarts实例
  myChart = echarts.init(document.getElementById("graph"))
  myChart.on("click", { dataType: "node" }, function (node) {
    form = node.data
    delete form.draggable
    delete form.category
    delete form.id
    dialogFormVisible.value = true
  })

  if (homestore.entireData.length === 0) {
    axios.request(url, { params }).then((res) => {
      let id = 0
      let maxDisPlayNode = (value.value / 100) * 4250
      homestore.entireData = res.data
      for (let i = 0; id < maxDisPlayNode && i < res.data.length; i++) {
        // 获取node1
        let node1 = {}
        node1["name"] = res.data[i]["n1"]["name"]
        let flag = 1
        //node1的1id
        let relationTarget = id.toString()
        //看node1是否已加入data中，已经加入的话就不再加入
        for (let j = 0; j < data.length; j++) {
          if (data[j]["name"] === node1["name"]) {
            flag = 0
            relationTarget = data[j]["id"]
            break
          }
        }
        node1["id"] = relationTarget
        if (flag === 1) {
          node1["draggable"] = true
          node1["category"] = category[res.data[i]["labels(n1)"]]

          for (let index in res.data[i].n1) {
            node1[index] = res.data[i].n1[index]
          }

          id++
          data.push(node1)
        }

        // 获取node2
        let node2 = {}
        node2["name"] = res.data[i]["n2"]["name"]
        flag = 1
        relationTarget = id.toString()
        for (let l = 0; l < data.length; l++) {
          if (data[l]["name"] === node2["name"]) {
            flag = 0
            relationTarget = data[l]["id"]
            break
          }
        }
        node2["id"] = relationTarget
        if (flag === 1) {
          node2["draggable"] = true
          node2["category"] = category[res.data[i]["labels(n2)"]]
          for (let index in res.data[i].n2) {
            node2[index] = res.data[i].n2[index]
          }
          id++
          data.push(node2)
        }
        // 获取relation
        let relation = {}
        relation["source"] = node1["id"]
        relation["target"] = node2["id"]
        relation["category"] = 0
        relation["value"] = res.data[i]["rel"]["name"]
        relation["symbolSize"] = 10
        links.push(relation)
        nodesNum.value = data.length
        relationNum.value = links.length
      }
      let option = {
        tooltip: {},
        legend: {
          x: "center",
          show: true,
        },
        series: [
          {
            type: "graph",
            layout: "force",
            symbolSize: 50,
            focusNodeAdjacency: true,
            roam: true,
            edgeSymbol: ["none", "arrow"],
            categories: [
              {
                name: "品种选择",
                itemStyle: {
                  normal: {
                    color: "#5470c6",
                  },
                },
              },
              {
                name: "枣果加工",
                itemStyle: {
                  normal: {
                    color: "#91cc75",
                  },
                },
              },
              {
                name: "枣果采收与贮藏",
                itemStyle: {
                  normal: {
                    color: "#fac858",
                  },
                },
              },
              {
                name: "枣树建园",
                itemStyle: {
                  normal: {
                    color: "#ee6666",
                  },
                },
              },
              {
                name: "枣树种植基础知识",
                itemStyle: {
                  normal: {
                    color: "#73c0de",
                  },
                },
              },
              {
                name: "枣树管理",
                itemStyle: {
                  normal: {
                    color: "#3ba272",
                  },
                },
              },
              {
                name: "枣树育苗",
                itemStyle: {
                  normal: {
                    color: "#fc8452",
                  },
                },
              },
            ],
            label: {
              normal: {
                show: true,
                textStyle: {
                  fontSize: 12,
                },
              },
            },
            force: {
              repulsion: 600,
            },
            edgeSymbolSize: [10, 50],
            edgeLabel: {
              normal: {
                show: false,
                textStyle: {
                  fontSize: 10,
                },
                formatter: "{c}",
              },
            },
            data: data,
            links: links,
            lineStyle: {
              normal: {
                opacity: 0.9,
                width: 1.3,
                curveness: 0.3,
                color: "source",
              },
            },
          },
        ],
      }
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option)
    })
  } else {
    nodesNum.value = homestore.nodeNum
    relationNum.value = homestore.relationNum
    let id = 0
    let maxDisPlayNode = (value.value / 100) * 4250
    for (
      let i = 0;
      id < maxDisPlayNode && i < homestore.entireData.length;
      i++
    ) {
      // 获取node1
      let node1 = {}
      node1["name"] = homestore.entireData[i]["n1"]["name"]
      let flag = 1
      //node1的1id
      let relationTarget = id.toString()
      //看node1是否已加入data中，已经加入的话就不再加入
      for (let j = 0; j < data.length; j++) {
        if (data[j]["name"] === node1["name"]) {
          flag = 0
          relationTarget = data[j]["id"]
          break
        }
      }
      node1["id"] = relationTarget
      if (flag === 1) {
        node1["draggable"] = true
        node1["category"] = category[homestore.entireData[i]["labels(n1)"]]

        for (let index in homestore.entireData[i].n1) {
          node1[index] = homestore.entireData[i].n1[index]
        }

        id++
        data.push(node1)
      }

      // 获取node2
      let node2 = {}
      node2["name"] = homestore.entireData[i]["n2"]["name"]
      flag = 1
      relationTarget = id.toString()
      for (let l = 0; l < data.length; l++) {
        if (data[l]["name"] === node2["name"]) {
          flag = 0
          relationTarget = data[l]["id"]
          break
        }
      }
      node2["id"] = relationTarget
      if (flag === 1) {
        node2["draggable"] = true
        node2["category"] = category[homestore.entireData[i]["labels(n2)"]]
        for (let index in homestore.entireData[i].n2) {
          node2[index] = homestore.entireData[i].n2[index]
        }
        id++
        data.push(node2)
      }
      // 获取relation
      let relation = {}
      relation["source"] = node1["id"]
      relation["target"] = node2["id"]
      relation["category"] = 0
      flag = 1
      for (let k = 0; k < links.length; k++) {
        if (
          links[k]["source"] === relation["source"] &&
          links[k]["target"] === relation["target"]
        ) {
          links[k]["value"] =
            links[k]["value"] + homestore.entireData[i]["rel"]["name"]
          flag = 0
          break
        }
      }
      if (flag === 1) {
        relation["value"] = homestore.entireData[i]["rel"]["name"]
        relation["symbolSize"] = 10
        links.push(relation)
      }
    }
    nodesNum.value = data.length
    relationNum.value = links.length
    let option = {
      tooltip: {},
      legend: {
        x: "center",
        show: true,
      },
      series: [
        {
          type: "graph",
          layout: "force",
          symbolSize: 50,
          focusNodeAdjacency: true,
          roam: true,
          edgeSymbol: ["none", "arrow"],
          categories: [
            {
              name: "品种选择",
              itemStyle: {
                normal: {
                  color: "#5470c6",
                },
              },
            },
            {
              name: "枣果加工",
              itemStyle: {
                normal: {
                  color: "#91cc75",
                },
              },
            },
            {
              name: "枣果采收与贮藏",
              itemStyle: {
                normal: {
                  color: "#fac858",
                },
              },
            },
            {
              name: "枣树建园",
              itemStyle: {
                normal: {
                  color: "#ee6666",
                },
              },
            },
            {
              name: "枣树种植基础知识",
              itemStyle: {
                normal: {
                  color: "#73c0de",
                },
              },
            },
            {
              name: "枣树管理",
              itemStyle: {
                normal: {
                  color: "#3ba272",
                },
              },
            },
            {
              name: "枣树育苗",
              itemStyle: {
                normal: {
                  color: "#fc8452",
                },
              },
            },
          ],
          label: {
            normal: {
              show: true,
              textStyle: {
                fontSize: 12,
              },
            },
          },
          force: {
            repulsion: 600,
          },
          edgeSymbolSize: [10, 50],
          edgeLabel: {
            normal: {
              show: false,
              textStyle: {
                fontSize: 10,
              },
              formatter: "{c}",
            },
          },
          data: data,
          links: links,
          lineStyle: {
            normal: {
              opacity: 0.9,
              width: 1.3,
              curveness: 0.3,
              color: "source",
            },
          },
        },
      ],
    }
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option)
  }

  var chartDom = document.getElementById("graph2")
  myChart2 = echarts.init(chartDom)
  var option2
  if (homestore.nodesNum.length === 0) {
    axios.request(url2).then((res) => {
      for (let i = 0; i < res.data.length; i++) {
        homestore.sumEntity += res.data[i]["count(n)"]
        if (res.data[i]["labels(n)"].length > 0) {
          let tmp = {
            name: res.data[i]["labels(n)"][0],
            value: res.data[i]["count(n)"],
          }
          data2.push(tmp)
        }
      }
      homestore.nodesNum = data2
      option2 = {
        title: {
          text: "不同标签的节点数统计",
          left: "center",
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          orient: 'horizontal',
          bottom: 100,
          left: 'center',
          itemGap: 10,
          itemWidth: 20,
          itemHeight: 12,
          textStyle: {
            fontSize: 12
          }
        },
        series: [
          {
            name: "Access From",
            type: "pie",
            radius: "50%",
            center: ['50%', '38%'],
            data: data2,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      }
      option2 && myChart2.setOption(option2)
    })
  } else {
    myChart2 = echarts.init(chartDom)
    let option2 = {
      title: {
        text: "不同标签的节点数统计",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: 'horizontal',
        bottom: 100,
        left: 'center',
        itemGap: 10,
        itemWidth: 20,
        itemHeight: 12,
        textStyle: {
          fontSize: 12
        }
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: "50%",
          center: ['50%', '38%'],
          data: homestore.nodesNum,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    }
    myChart2.setOption(option2)
  }
})

onUnmounted(() => {
  myChart.dispose()
  myChart2.dispose()
})

// 在 onMounted 中添加窗口resize监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 切换视图函数
const toggleView = async () => {
  showGraph2.value = !showGraph2.value
  await nextTick()
  // 切换后重新渲染图表
  if (showGraph2.value) {
    myChart2.resize()
  } else {
    myChart.resize()
  }
}
const handleResize = () => {
  if (myChart) myChart.resize()
  if (myChart2) myChart2.resize()
}
function changeValue () {
  let data = []
  let links = []
  // echarts 数据
  // 基于准备好的dom，初始化echarts实例
  let myChart = echarts.init(document.getElementById("graph"))
  let id = 0
  let maxDisPlayNode = (value.value / 100) * 4250
  for (let i = 0; id < maxDisPlayNode && i < homestore.entireData.length; i++) {
    // 获取node1
    let node1 = {}
    node1["name"] = homestore.entireData[i]["n1"]["name"]
    let flag = 1
    //node1的1id
    let relationTarget = id.toString()
    //看node1是否已加入data中，已经加入的话就不再加入
    for (let j = 0; j < data.length; j++) {
      if (data[j]["name"] === node1["name"]) {
        flag = 0
        relationTarget = data[j]["id"]
        break
      }
    }
    node1["id"] = relationTarget
    if (flag === 1) {
      node1["draggable"] = true
      node1["category"] = category[homestore.entireData[i]["labels(n1)"]]

      for (let index in homestore.entireData[i].n1) {
        node1[index] = homestore.entireData[i].n1[index]
      }

      id++
      data.push(node1)
    }

    // 获取node2
    let node2 = {}
    node2["name"] = homestore.entireData[i]["n2"]["name"]
    flag = 1
    relationTarget = id.toString()
    for (let l = 0; l < data.length; l++) {
      if (data[l]["name"] === node2["name"]) {
        flag = 0
        relationTarget = data[l]["id"]
        break
      }
    }
    node2["id"] = relationTarget
    if (flag === 1) {
      node2["draggable"] = true
      node2["category"] = category[homestore.entireData[i]["labels(n2)"]]
      for (let index in homestore.entireData[i].n2) {
        node2[index] = homestore.entireData[i].n2[index]
      }
      id++
      data.push(node2)
    }
    // 获取relation
    let relation = {}
    relation["source"] = node1["id"]
    relation["target"] = node2["id"]
    relation["category"] = 0
    flag = 1
    for (let k = 0; k < links.length; k++) {
      if (
        links[k]["source"] === relation["source"] &&
        links[k]["target"] === relation["target"]
      ) {
        links[k]["value"] =
          links[k]["value"] + homestore.entireData[i]["rel"]["name"]
        flag = 0
        break
      }
    }
    if (flag === 1) {
      relation["value"] = homestore.entireData[i]["rel"]["name"]
      relation["symbolSize"] = 10
      links.push(relation)
    }
  }
  nodesNum.value = data.length
  relationNum.value = links.length
  let option = {
    tooltip: {},
    legend: {
      x: "center",
      show: true
    },
    series: [
      {
        type: "graph",
        layout: "force",
        symbolSize: 50,
        focusNodeAdjacency: true,
        roam: true,
        edgeSymbol: ["none", "arrow"],
        categories: [
          {
            name: "品种选择",
            itemStyle: {
              normal: {
                color: "#5470c6",
              },
            },
          },
          {
            name: "枣果加工",
            itemStyle: {
              normal: {
                color: "#91cc75",
              },
            },
          },
          {
            name: "枣果采收与贮藏",
            itemStyle: {
              normal: {
                color: "#fac858",
              },
            },
          },
          {
            name: "枣树建园",
            itemStyle: {
              normal: {
                color: "#ee6666",
              },
            },
          },
          {
            name: "枣树种植基础知识",
            itemStyle: {
              normal: {
                color: "#73c0de",
              },
            },
          },
          {
            name: "枣树管理",
            itemStyle: {
              normal: {
                color: "#3ba272",
              },
            },
          },
          {
            name: "枣树育苗",
            itemStyle: {
              normal: {
                color: "#fc8452",
              },
            },
          },
        ],
        label: {
          normal: {
            show: true,
            textStyle: {
              fontSize: 12,
            },
          },
        },
        force: {
          repulsion: 600,
        },
        edgeSymbolSize: [10, 50],
        edgeLabel: {
          normal: {
            show: false,
            textStyle: {
              fontSize: 10,
            },
            formatter: "{c}",
          },
        },
        data: data,
        links: links,
        lineStyle: {
          normal: {
            opacity: 0.9,
            width: 1.3,
            curveness: 0.3,
            color: "source",
          },
        },
      },
    ],
  }
  myChart.setOption(option)
}
</script>

<style lang="less" scoped>
html,
body {
  width: 100%;
}
.view1 {
  width: 100%;
  background-color: #fff;
}
.head {
  color: rgb(208, 234, 235);
}

.toggle-btn {
  position: fixed;
  top: 80%;
  right: 16px;
  z-index: 1000;

  /* 形状和大小 */
  border-radius: 25px;
  padding: 10px 20px;
  min-width: 100px;

  /* 绿色系渐变 */
  color: #fff;
  background: linear-gradient(135deg, #5a8f3d 0%, #3f6630 100%);
  border: none;

  /* 文字样式 */
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);

  /* 阴影效果 */
  box-shadow: 0 4px 12px rgba(90, 143, 61, 0.3);

  /* 过渡动画 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;

  /* 鼠标悬停效果 */
  &:hover {
    background: linear-gradient(135deg, #6ba349 0%, #4a7d36 100%);
    box-shadow: 0 6px 16px rgba(90, 143, 61, 0.4);
    transform: translateY(-2px);
  }

  /* 点击效果 */
  &:active {
    background: linear-gradient(135deg, #4a7d36 0%, #305624 100%);
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(63, 102, 48, 0.4);
  }

  /* 聚焦效果 */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(90, 143, 61, 0.2);
  }

  /* 禁用状态 */
  &:disabled {
    background: #a5c99c;
    cursor: not-allowed;
    transform: none !important;
  }
}

.slider-demo-block {
  padding: 5px 5px 0 12px;
  margin-top: 50px;
  float: left;
  background-color: #144a65;
  width: 300px;
  z-index: 1000;
}
.slider-demo-block .el-slider {
  margin-top: 0;
}
.img {
  width: 160px;
  height: 160px;
  object-fit: cover;
  display: none;
}

.graph-container {
  text-align: center;
  width: 100%;
  height: calc(100vh - 50px);
}

.box {
  display: flex;
  justify-content: center;
  text-align: center;
}
#graph2 {
  padding: 30px;
  box-sizing: border-box;
  background-color: #ffffff4a;
  width: 100%;
  height: calc(100vh - 80px);
}
#graphb {
  height: 400px;
  float: right;
}

@media only screen and (max-width: 768px) {
  /* 移动端全局调整 */
  .slider-demo-block {
    position: fixed;
    bottom: 0;
    width: calc(100vw - 28px);
    padding: 15px;
    background: linear-gradient(
      to bottom,
      rgba(90, 143, 61, 0.8),
      rgba(63, 102, 48, 1)
    );
    z-index: 1000;
    margin-top: 0;
  }
  .toggle-btn {
    background-color: #5a8f3d;
  }
}
</style>
