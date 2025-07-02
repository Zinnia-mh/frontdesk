<template>
  <div style="height: 550px">
    <el-card style="width: 45%; height: 25%">
      <template v-slot:header>
        <div>
          <span>查询条件：</span>
        </div>
      </template>
      <div>
        <el-form :inline="true" :model="formData" style="text-align: center">
          <el-form-item style="width: 16%">
            <el-input v-model="formData.entity1" placeholder="实体1"></el-input>
          </el-form-item>
          <el-form-item style="width: 20%">
            <el-select v-model="formData.relation" clearable placeholder="关系">
              <el-option label="包括" value="包括"></el-option>
              <el-option label="主产省" value="主产省"></el-option>
              <el-option label="主栽品种" value="主栽品种"></el-option>
              <el-option label="基础知识" value="基础知识"></el-option>
              <el-option label="品种选择" value="品种选择"></el-option>
              <el-option label="相关文献" value="相关文献"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="width: 16%">
            <el-input v-model="formData.entity2" placeholder="实体2"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="submit" @click="onSubmit">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <div
      id="card"
      ref="card"
      style="
        width: 54%;
        position: relative;
        left: 45.5%;
        top: -25%;
        height: 100%;
      "
    >
      <el-card style="height: 112.4%">
        <template v-slot:header>
          <div id="header" ref="header">
            <span>关系图</span>
          </div>
        </template>
        <div id="graph" style="height: 0; width: 0"></div>
        <el-dialog v-model="dialogFormVisible" title="节点信息" width="500">
          <div class="box">
            <img
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
      </el-card>
    </div>

    <div
      style="position: relative; left: 0; top: -99%; width: 45%; height: 80%"
    >
      <el-card style="width: 100%; height: 108%">
        <template v-slot:header>
          <div>
            <span>关系列表</span>
          </div>
        </template>
        <div>
          <el-table
            :data="tableData"
            stripe
            style="width: 100%"
            max-height="350px"
          >
            <el-table-column type="index" width="50" />
            <el-table-column prop="entity1" label="实体一" width="180" />
            <el-table-column prop="relation" label="关系" width="180" />
            <el-table-column prop="entity2" label="实体二" />
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>
<script setup>
import axios from "axios"
import * as echarts from "echarts"
import { onMounted, reactive, ref } from "vue"
import { BASE_URL } from "@/service/config"
let category = {
  品种选择: 0,
  枣果加工: 1,
  枣果采收与贮藏: 2,
  枣树建园: 3,
  枣树种植基础知识: 4,
  枣树管理: 5,
  枣树育苗: 6,
}
let formData = reactive({
  entity1: "",
  relation: "",
  entity2: "",
})
const header = ref()
const card = ref()
var tableData = ref([])
var dialogFormVisible = ref(false)
var form = {}

const getImageUrl = (name) => {
  return new URL(`../assets/images/枣图片/${name}.jpg`, import.meta.url).href
}

function onSubmit () {
  let url = BASE_URL + "search_relation"
  let params = formData
  axios
    .request(url, { params })
    .then((res) => {
      // 设置graph大小
      let style =
        "height: " +
        (parseInt(
          window.getComputedStyle(document.querySelector("#card")).height + 150
        ) -
          parseInt(
            window.getComputedStyle(document.querySelector("#header")).height
          )) +
        "px; " +
        "width: " +
        parseInt(
          window.getComputedStyle(document.querySelector("#header")).width + 150
        ) +
        "px;"
      document.getElementById("graph").setAttribute("style", style)
      var myChart = echarts.init(document.getElementById("graph"))
      myChart.on("click", { dataType: "node" }, function (node) {
        dialogFormVisible.value = true
        form = node.data
        delete form.draggable
        delete form.category
        delete form.id
      })
      // echarts 数据
      let data = []
      let links = []

      let id = 0
      let maxDisPlayNode = 100

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
        flag = 1
        for (let k = 0; k < links.length; k++) {
          if (
            links[k]["source"] === relation["source"] &&
            links[k]["target"] === relation["target"]
          ) {
            links[k]["value"] = links[k]["value"] + res.data[i]["rel"]["name"]
            flag = 0
            break
          }
        }
        if (flag === 1) {
          relation["value"] = res.data[i]["rel"]["name"]
          relation["symbolSize"] = 10
          links.push(relation)
        }
      }
      // echarts 数据
      // 基于准备好的dom，初始化echarts实例
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
      tableData.value = []
      // 用表格列出所有的关系
      for (let n = 0; n < res.data.length; n++) {
        let relationData = {}
        relationData["entity1"] = res.data[n]["n1"]["name"]
        relationData["relation"] = res.data[n]["rel"]["name"]
        relationData["entity2"] = res.data[n]["n2"]["name"]
        tableData.value.push(relationData)
      }
    })
    .catch((error) => {
      alert(error)
    })
}

onMounted(() => {
  // 获取history中我们上个页面保存的数据
  if (history.state.back == "/home" && history.state.param) {
    formData.entity1 = history.state.param
    onSubmit()
  }
});
</script>

<style lang="less" scoped>
img {
  width: 160px;
  height: 160px;
  object-fit: cover;
  display: none;
}
.box {
  display: flex;
  justify-content: center;
  text-align: center;
}
.el-card {
  background-color: #9fcce65d;
}
</style>
