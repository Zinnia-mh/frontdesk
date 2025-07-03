<template>
  <div class="search-container">
    <el-card class="card-container">
      <template v-slot:header>
        <div>
          <span>查询条件</span>
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

    <div id="card" ref="card" class="graph-container">
      <el-card style="height: 100%">
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

    <div class="list-container">
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

/* 默认桌面端布局 */
.card-container {
  width: 45%;
  height: 25%;
}

.search-container {
  height: calc(100vh - 50px);
}

.graph-container {
  width: 54%;
  position: relative;
  left: 45.5%;
  top: -25%;
  height: 100%;
}

.list-container {
  position: relative;
  left: 0;
  top: -99%;
  width: 45%;
  height: 80%;
}

/* 移动端布局 - 关系图放在最下面 */
@media only screen and (max-width: 768px) {
  span {
    color: #3f6630;
  }
  .search-container {
    display: flex;
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    background-color: #f2f9f0;
  }

  /* 搜索条件保持在顶部 */
  .card-container {
    width: 100%;
    height: auto;
    order: 1; /* 第一个元素 */
    background-color: #ecf3eb;
  }

  /* 关系列表放在中间 */
  .list-container {
    width: 100%;
    position: static;
    height: auto;
    order: 2; /* 第二个元素 */
    background-color: #ecf3eb;
    margin-top: 12px;
  }

  .el-card {
    background-color: #ecf3eb;
  }

  /* 关系图放在最下面 */
  .graph-container {
    width: 100%;
    position: static;
    height: 50vh;
    order: 3; /* 第三个元素 */
    background-color: #ecf3eb;
    margin-top: 12px;
  }

  /* 调整图表容器高度 */
  #graph {
    height: 100% !important;
    width: 100% !important;
  }

  /* 调整表单元素在移动端的宽度 */
  .el-form-item {
    width: 100% !important;
    margin-right: 0;
  }

  .el-select {
    width: 100% !important;
  }

  /* 调整选择框和输入框在移动端的布局 */
  .el-form--inline .el-form-item {
    display: block;
    margin-right: 0;
    margin-bottom: 10px;
  }

  /* 调整按钮位置 */
  .el-form-item:last-child {
    text-align: center;
  }

  /* ========== 查询按钮专项优化 ========== */
  /* 按钮容器（最后一个表单项） */
  .el-form-item:last-child {
    button {
      width: 100%;
      background: linear-gradient(135deg, #5a8f3d 0%, #3f6630 100%);
      color: #fff;
    }
    text-align: center;
    margin-top: 12px; /* 与上方表单项拉开距离 */
  }

  /*  primary 按钮核心样式 */
  .el-button--primary {
    /* 基础形态 */
    padding: 10px 28px; /* 更大点击区域，适配移动端触摸 */
    font-size: 14px; /* 字体清晰 */
    border-radius: 8px; /* 圆润质感 */
    border: none; /* 去掉默认边框，用背景渐变增强层次 */
    background: linear-gradient(
      135deg,
      #67c23a 0%,
      #409eff 100%
    ); /* 渐变背景，贴合系统绿色系+品牌色 */
    color: #fff; /* 白色文字更醒目 */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 丝滑过渡 */

    /* 触摸/hover 反馈 */
    &:hover,
    &:active {
      transform: scale(1.03); /* 轻微放大，模拟物理按钮按下 */
      background: linear-gradient(
        135deg,
        #5daf32 0%,
        #3a8ee6 100%
      ); /* 加深渐变，强化交互 */
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* 阴影增强层次感 */
    }

    /* 禁用态（如果有） */
    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      background: #ccc;
    }
  }
}
</style>