<template>
  <div class="alls">
    <div
      class="add"
      style="display: flex; justify-content: space-around; margin-top: 10px"
    >
      <div class="ner">
        <el-card
          style="
            width: 300px;
            height: 220px;
            opacity: 0.9;
            display: inline-block;
          "
        >
          <el-button style="padding: 0; border: 0" type="text" @click="NER"
            >命名实体识别</el-button
          >
          <div style="height: 100px">
            <el-input
              type="textarea"
              placeholder="请输入内容"
              :rows="5"
              resize="none"
              v-model="textIn"
            >
            </el-input>
          </div>
        </el-card>
        <el-card
          style="
            width: 300px;
            height: 220px;
            opacity: 0.9;
            display: inline-block;
          "
        >
          <div>命名实体识别结果</div>
          <div style="height: 100px; margin-top: 30px">
            <el-input
              type="textarea"
              placeholder="序列标注后的结果"
              :rows="5"
              readonly="readonly"
              resize="none"
              v-model="textOut"
            >
            </el-input>
          </div>
        </el-card>
      </div>
      <div class="completion">
        <el-card style="height: 220px;width: 650px">
          <template v-slot:header>
            <div>
              <span>图谱补全----请输入实体一和关系：</span>
            </div>
          </template>
          <div>
            <el-form
              :inline="true"
              :model="formData"
              style="text-align: center"
            >
              <el-form-item style="width: 20%">
                <el-input
                  v-model="formData.entity1"
                  placeholder="实体一"
                ></el-input>
              </el-form-item>
              <el-form-item style="width: 20%">
                <el-input
                  v-model="formData.relation"
                  placeholder="关系"
                ></el-input>
              </el-form-item>
              <el-form-item style="width: 40%">
                <el-input
                  v-model="formData.entity2"
                  placeholder="实体二"
                  readonly="readonly"
                ></el-input>
              </el-form-item>
              <el-form-item style="width: 15%">
                <el-button @click="resetForm()">Reset</el-button>
              </el-form-item>
              <el-form-item style="width: 15%">
                <el-button type="primary" @click="onSubmit">提交补全</el-button>
              </el-form-item>
              <el-form-item style="width: 15%">
                <el-button type="success" @click="onAdd" 
                  >确认添加到图谱</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </div>
    </div>
    <div class="all">
      <div class="graph-create">
        <div class="tags">
          <h2>图谱列表</h2>
          <el-check-tag
            v-for="(tag, index) in tags"
            :key="tag"
            round
            :checked="index == id ? true : false"
            type="success"
            @close="handleClose(tag)"
            @change="changeLabel(index)"
            >{{ tag }}</el-check-tag
          >
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />

          <el-button v-else class="button-new-tag" @click="showInput">
            + 新建图谱
          </el-button>

          <el-popconfirm
            confirm-button-text="Yes"
            cancel-button-text="No"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="确定要删除该图谱所有的节点和关系?"
            @confirm="deleteGraph"
          >
            <template #reference>
              <el-button class="button-delete-tag"> - 删除图谱 </el-button>
            </template>
          </el-popconfirm>
        </div>
        <div
          id="graph"
          style="height: 800px; width: 1300px; text-align: center"
        ></div>
      </div>

      <el-tabs v-model="activeName" class="demo-tabs" type="border-card">
        <el-tab-pane label="创建节点和关系" name="first">
          <el-form
            ref="createFormRef"
            label-width="50px"
            label-position="top"
            :model="createForm"
            style="max-width: 300px"
          >
            <el-form-item
              label="节点1(可输入多个,用英文逗号分隔):"
              prop="node1"
            >
              <el-input v-model="createForm.node1" placeholder="node1 name" />
            </el-form-item>
            <el-form-item label="关系:" prop="relation">
              <el-input
                v-model="createForm.relation"
                placeholder="relation name"
              />
            </el-form-item>
            <el-form-item
              label="节点2(可输入多个,用英文逗号分隔):"
              prop="node2"
            >
              <el-input v-model="createForm.node2" placeholder="node2 name" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitCreateForm()"
                >创建</el-button
              >
              <el-button @click="resetCreateForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="删除节点" name="second">
          <el-form
            ref="deleteNodeFormRef"
            label-width="50px"
            label-position="top"
            :model="deleteNodeForm"
            style="max-width: 300px"
          >
            <el-form-item
              label="节点名称(可输入多个,用英文逗号分隔):"
              prop="node"
            >
              <el-input v-model="deleteNodeForm.node" placeholder="node name" />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="submitDeleteNodeForm()"
                >删除</el-button
              >
              <el-button @click="resetDeleteNodeForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="删除关系" name="third">
          <el-form
            ref="deleteRelFormRef"
            label-width="50px"
            label-position="top"
            :model="deleteRelForm"
            style="max-width: 300px"
          >
            <el-form-item
              label="节点1名称(可输入多个,用英文逗号分隔):"
              prop="node1"
            >
              <el-input
                v-model="deleteRelForm.node1"
                placeholder="node1 name"
              />
            </el-form-item>
            <el-form-item
              label="节点2名称(可输入多个,用英文逗号分隔):"
              prop="node2"
            >
              <el-input
                v-model="deleteRelForm.node2"
                placeholder="node2 name"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="submitDeleteRelForm()"
                >删除</el-button
              >
              <el-button @click="resetDeleteRelForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ElInput } from "element-plus";
import * as echarts from "echarts";
import axios from "axios";
import { ref, nextTick, reactive } from "vue";
import { BASE_URL } from "@/service/config";

let textIn = ref("");
let textOut = ref("");
function NER() {
  textOut.value = "";
  if (textIn.value == "") {
    ElMessage({
      message: "请输入文本！",
      type: "warning",
    });
  } else {
    axios
      .request("http://127.0.0.1:5000/" + "ner?text=" + textIn.value)
      .then((res) => {
        for (let i = 0; i < res.data[0].length; i++) {
          textOut.value += res.data[0][i] + ":   " + res.data[1][i] + "\n";
        }
      });
  }
}

let formData = reactive({
  entity1: "",
  relation: "",
  entity2: "",
});

const resetForm = () => {
  formData.entity1=""
  formData.relation=""
  formData.entity2=""
}
function onSubmit() {
  if (formData.entity1 == "" || formData.relation == "") {
    ElMessage({
      message: "请输入实体一和关系！",
      type: "warning",
    });
  } else {
    let url1 = BASE_URL + "completion";
    let params = formData;

    axios.request(url1, { params }).then((res) => {
      if (res.data !== "输入的实体或关系不存在于知识库中。") {
        formData.entity2 = res.data;
      } else {
        ElMessage({
          message: "输入的实体或关系不存在于知识库中!",
          type: "warning",
        });
      }
    });
  }
}

var id = ref(0);
var tags = ref([]);
const inputValue = ref("");
const inputVisible = ref(false);
const InputRef = ref();
const createFormRef = ref(null);
const deleteNodeFormRef = ref(null);
const deleteRelFormRef = ref(null);
var myChart;
//存储节点和关系数组
let data = [];
let links = [];
axios.request(BASE_URL + "getALabels").then((res) => {
  const except = [
    "枣树种植基础知识",
    "concept",
    "枣树管理",
    "枣树育苗",
    "品种选择",
    "枣树建园",
    "枣果加工",
    "枣果采收与贮藏",
  ];
  for (let i = 0; i < res.data.length; i++) {
    if (
      res.data[i]["labels(n)"][0] &&
      !except.includes(res.data[i]["labels(n)"][0])
    ) {
      tags.value.push(res.data[i]["labels(n)"][0]);
    }
  }
  if (tags.value.length) {
    id.value = 0;
    fresh();
  }
});
//删除图谱
const handleClose = (tag) => {
  tags.value.splice(tags.value.indexOf(tag), 1);
};
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value.focus();
  });
};
const handleInputConfirm = () => {
  if (inputValue.value == "") {
    ElMessage({
      message: "图谱名称不能为空",
      type: "warning",
    });
  } else if (tags.value.includes(inputValue.value)) {
    ElMessage({
      message: "名称已存在，请换一个名称",
      type: "warning",
    });
  } else {
    tags.value.push(inputValue.value);
    id.value = tags.value.length - 1;
    if (tags.value.length > 1) {
      fresh();
    }
    inputVisible.value = false;
    inputValue.value = "";
    ElMessage({
      message: "新建成功",
      type: "success",
    });
  }
};
function changeLabel(index) {
  id.value = index;
  fresh();
}
const activeName = ref("first");

const createForm = reactive({
  node1: "",
  relation: "",
  node2: "",
});
const deleteNodeForm = reactive({
  node: "",
});
const deleteRelForm = reactive({
  node1: "",
  node2: "",
});

const resetCreateForm = () => {
  createFormRef.value.resetFields();
};
const resetDeleteNodeForm = () => {
  deleteNodeFormRef.value.resetFields();
};
const resetDeleteRelForm = () => {
  deleteRelFormRef.value.resetFields();
};
function deleteGraph() {
  let params = {};
  params.label = tags.value[id.value];
  axios.request(BASE_URL + "deleteGraph", { params }).then((res) => {
    tags.value.splice(id.value, 1);
    if (id.value >= 1) {
      id.value -= 1;
      fresh();
    } else if (tags.value.length != 0) {
      id.value = 0;
      fresh();
    } else {
      myChart.clear();
    }
    ElMessage({
      message: "删除成功",
      type: "success",
    });
  });
}
function submitCreateForm() {
  if (
    createForm.node1 == "" &&
    createForm.node2 == "" &&
    createForm.relation == ""
  ) {
    ElMessage({
      message: "请输入节点和关系！",
      type: "warning",
    });
  } else if (
    (createForm.node1 != "" &&
      createForm.node2 == "" &&
      createForm.relation != "") ||
    (createForm.node1 == "" &&
      createForm.node2 != "" &&
      createForm.relation != "") ||
    (createForm.node1 == "" &&
      createForm.node2 == "" &&
      createForm.relation != "")
  ) {
    ElMessage({
      message: "创建关系必须输入两个节点",
      type: "warning",
    });
  } else {
    let params = createForm;
    params.label = tags.value[id.value];
    axios.request(BASE_URL + "create", { params }).then((res) => {
      fresh();
      ElMessage({
        message: "创建成功",
        type: "success",
      });
    });
  }
}

function onAdd() {
  let params={};
  params["node1"] = formData.entity1;
  params["relation"] = formData.relation;
  params["node2"] = formData.entity2;
  params.label = tags.value[id.value];
  axios.request(BASE_URL + "create", { params }).then((res) => {
    fresh();
    ElMessage({
      message: "添加成功",
      type: "success",
    });
  });
}

function submitDeleteNodeForm() {
  if (deleteNodeForm.node == "") {
    ElMessage({
      message: "请输入节点",
      type: "warning",
    });
  } else {
    let params = deleteNodeForm;
    params.label = tags.value[id.value];
    axios.request(BASE_URL + "deleteNode", { params }).then((res) => {
      fresh();
      ElMessage({
        message: "删除成功",
        type: "success",
      });
    });
  }
}
function submitDeleteRelForm() {
  if (deleteRelForm.node1 == "" || deleteRelForm.node2 == "") {
    ElMessage({
      message: "请输入两个节点",
      type: "warning",
    });
  } else {
    let params = deleteRelForm;
    params.label = tags.value[id.value];
    axios.request(BASE_URL + "deleteRel", { params }).then((res) => {
      fresh();
      ElMessage({
        message: "删除成功",
        type: "success",
      });
    });
  }
}
function fresh() {
  data = [];
  links = [];
  let params = { name: tags.value[id.value] };
  axios.request(BASE_URL + "getDataByLabel", { params }).then((res) => {
    myChart = echarts.init(document.getElementById("graph"));
    let id = 0;
    for (let i = 0; i < res.data.length; i++) {
      // 获取node1
      let node1 = {};
      node1["name"] = res.data[i]["n1"]["name"];
      let flag = 1;
      //node1的1id
      let relationTarget = id.toString();
      //看node1是否已加入data中，已经加入的话就不再加入
      for (let j = 0; j < data.length; j++) {
        if (data[j]["name"] === node1["name"]) {
          flag = 0;
          relationTarget = data[j]["id"];
          break;
        }
      }
      node1["id"] = relationTarget;
      if (flag === 1) {
        node1["draggable"] = true;
        for (let index in res.data[i].n1) {
          node1[index] = res.data[i].n1[index];
        }
        id++;
        data.push(node1);
      }

      // 获取node2
      let node2 = {};
      node2["name"] = res.data[i]["n2"]["name"];
      flag = 1;
      relationTarget = id.toString();
      for (let l = 0; l < data.length; l++) {
        if (data[l]["name"] === node2["name"]) {
          flag = 0;
          relationTarget = data[l]["id"];
          break;
        }
      }
      node2["id"] = relationTarget;
      if (flag === 1) {
        node2["draggable"] = true;
        for (let index in res.data[i].n2) {
          node2[index] = res.data[i].n2[index];
        }
        id++;
        data.push(node2);
      }
      // 获取relation
      let relation = {};
      relation["source"] = node1["id"];
      relation["target"] = node2["id"];
      relation["value"] = res.data[i]["rel"]["name"];
      relation["symbolSize"] = 10;
      links.push(relation);
    }
    axios.request(BASE_URL + "getOtherNodes", { params }).then((res) => {
      for (let i = 0; i < res.data.length; i++) {
        let node1 = {};
        node1["name"] = res.data[i]["n"]["name"];
        node1["id"] = data.length;
        node1["draggable"] = true;
        for (let index in res.data[i].n) {
          node1[index] = res.data[i].n[index];
        }
        data.push(node1);
      }

      let option = {
        tooltip: {},
        legend: {
          x: "center",
          show: false,
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
      };
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    });
  });
}
</script>

<style lang="less" scoped>
.alls {
  background-color: #9fcce65d;
  padding-top: 50px;
}
h2 {
  text-align: center;
  border-bottom: 2px solid #000;
  color: #0d1581;
}
.graph-create {
  display: flex;
  width: 100%;
  align-items: top;
  justify-content: space-between;
}
.tags {
  width: 200px;
  height: fit-content;
  padding-top: 20px;
  border: 2px solid #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #ffffff;
}
.el-check-tag,
.el-button,
.el-input {
  display: block;
  border-radius: 10px;
  margin: 10px;
  font-size: 16px;
}
.button-new-tag {
  background-color: #84d2b3;
  margin-top: 30px;
}
.button-delete-tag {
  background-color: #dfaaaa;
}

.demo-tabs {
  position: absolute;
  right: 0;
  top: 285px;
  width: 335px;
}
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
.el-form .el-input {
  font-size: 18px;
}
</style>
