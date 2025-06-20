<template>
  <div style="height: 550px; padding-top: 55px">
    <el-card style="width: 49.5%; height: 40%">
      <template v-slot:header>
        <div>
          <span>输入问题：</span>
        </div>
      </template>
      <div>
        <el-form :inline="true" style="text-align: center">
          <div>
            <el-form-item>
              <el-input
                id="question"
                v-model="formData.question"
                placeholder="Enter text"
                style="width: 350px"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="submit" @click="onSubmit">查询</el-button>
            </el-form-item>
          </div>
          <el-form-item>
            <div>
              <p>
                热门搜索：
                <a href="#/question" @click="a0"> 萌芽展叶期有什么特点？</a>
                &nbsp;&nbsp;
                <a href="#/question" @click="a1"> 什么是鲜枣贮藏?</a>
                &nbsp;&nbsp;
                <a href="#/question" @click="a2"> 果实生长期有什么注意事项?</a>
                &nbsp;&nbsp;
              </p>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card style="width: 49.5%; height: 71%; margin-top: 0.5%">
      <div>
        <el-table
          :data="tableData"
          stripe
          style="width: 100%"
          max-height="350px"
        >
          <el-table-column type="index" width="50" />
          <el-table-column prop="answer" label="答案" />
        </el-table>
      </div>
    </el-card>
    <div
      ref="card"
      id="card"
      style="
        width: 50%;
        height: 100%;
        position: relative;
        left: 49.8%;
        top: -112.2%;
      "
    >
      <el-card style="height: 112.2%">
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
  </div>
</template>

<script setup>
import { BASE_URL } from "@/service/config"
import axios from "axios"
import * as echarts from "echarts"
import { reactive, ref } from "vue"
let formData = reactive({
  question: "",
})
var dialogFormVisible = ref(false)
var tableData = ref([])
var form = {}
const getImageUrl = (name) => {
  return new URL(`../assets/images/枣图片/${name}.jpg`, import.meta.url).href
}
function a0 () {
  formData.question = "萌芽展叶期有什么特点？"
  onSubmit()
}
function a1 () {
  formData.question = "什么是鲜枣贮藏？"
  onSubmit()
}
function a2 () {
  formData.question = "果实生长期有什么注意事项?"
  onSubmit()
}
function onSubmit () {
  let url = BASE_URL + "qa"
  let params = formData
  if (formData.question == "") {
    ElMessage({
      message: "请输入问题！",
      type: "warning",
    })
  } else {
    axios.request(url, { params }).then((res) => {
      tableData.value = []
      // echarts 数据
      let data = []
      let links = []
      console.log(res.data)
      if (res.data !== -1 && res.data[0] != '没有相关信息') {
        //用表格列出答案
        // 用表格列出所有的关系
        for (let n = 0; n < res.data[0].length; n++) {
          let answerData = {}
          answerData["answer"] = res.data[0][n]
          tableData.value.push(answerData)
        }

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

        let all = []
        for (let i = 0; i < res.data[1].length; i++) {
          all = all.concat(res.data[1][i])
        }

        let id = 0
        let maxDisPlayNode = 100

        for (let i = 0; id < maxDisPlayNode && i < all.length; i++) {
          // 获取node1
          let node1 = {}
          node1["name"] = all[i]["n1"]["name"]
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

            for (let index in all[i].n1) {
              node1[index] = all[i].n1[index]
            }

            id++
            data.push(node1)
          }

          // 获取node2
          let node2 = {}
          node2["name"] = all[i]["n2"]["name"]
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
            for (let index in all[i].n2) {
              node2[index] = all[i].n2[index]
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
              links[k]["value"] = links[k]["value"] + all[i]["rel"]["name"]
              flag = 0
              break
            }
          }
          if (flag === 1) {
            relation["value"] = all[i]["rel"]["name"]
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
      } else {
        axios
          .request("http://127.0.0.1:8080/get_response_data", { params })
          .then((res) => {
            tableData.value = [{ "answer": '您好，我是你的种植助理，这个问题本图谱中没有涉及，我们将为您展示openAI得到的相关图谱' }]
            for (let i = 0; i < res.data.nodes.length; i++) {
              let form = {}
              form.id = res.data.nodes[i].id
              form.name = res.data.nodes[i].label
              data.push(form)
            }
            for (let i = 0; i < res.data.edges.length; i++) {
              let form = {}
              form.source = res.data.edges[i].from_
              form.target = res.data.edges[i].to
              form.value = res.data.edges[i].relationship
              links.push(form)
            }

            // 设置graph大小
            let style =
              "height: " +
              (parseInt(
                window.getComputedStyle(document.querySelector("#card")).height +
                150
              ) -
                parseInt(
                  window.getComputedStyle(document.querySelector("#header"))
                    .height
                )) +
              "px; " +
              "width: " +
              parseInt(
                window.getComputedStyle(document.querySelector("#header")).width +
                150
              ) +
              "px;"
            document.getElementById("graph").setAttribute("style", style)
            var myChart = echarts.init(document.getElementById("graph"))

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
                  edgeSymbolSize: [10, 15],
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
      }
    })
  }
}
</script>

<style scoped>
p,
a {
  color: #2562b2;
}
.el-card {
  background-color: #8dbdd861;
}
</style>
