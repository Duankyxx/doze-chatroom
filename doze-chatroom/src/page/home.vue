<template>
  <div id="background">
    <!--聊天框-->
    <div id="cont">
      <!--头部-->
      <div id="bar">
        <p>当前在线用户:{{ usersList.length }}</p>
      </div>

      <!--主要内容-->
      <div id="ma">
        <!--连接成功横幅-->
        <div id="hint" v-show="showHint">{{ HintMsg }}</div>

        <!--在线用户-->
        <div id="left">
          <!--在线用户列表-->
          <div v-for="(i, index) in usersList" :key="index" id="online">
            <img alt="头像加载失败!" :src="store.state.srcS[i.avatar]">
            <div>{{ i.uname }}</div>
          </div>
        </div>

        <!--内容-->
        <div id="right">
          <!--消息框-->
          <div id="m_top">
            <!--消息列表-->
            <div v-for="(i, index) in msgList" :key="index">
              <!--别人的消息-->
              <div id="msgList" v-show="!isMyMsg(i)">
                <img id="myMsgList_avatar" alt="" :src="store.state.srcS[i.avatar]">
                <div id="myMsgList_cont">
                  <div id="msgList_uname">{{ i.uname }}</div>
                  <div id="msgList_msg">{{ i.msg }}</div>
                </div>
              </div>
              <!--我的消息-->
              <div id="myMsgList" v-show="isMyMsg(i)">
                <img id="myMsgList_avatar" alt="" :src="store.state.srcS[i.avatar]">
                <div id="myMsgList_cont">
                  <div id="myMsgList_uname">{{ i.uname }}</div>
                  <div id="myMsgList_msg">{{ i.msg }}</div>
                </div>
              </div>
            </div>
          </div>
          <!--文本输入框-->
          <div id="m_button">
            <textarea id="text" v-model="text" maxlength="9999">

            </textarea>
            <!--按钮及字数-->
            <div id="wordCount">{{ wordCount }}/9999</div>
            <button type="button" id="text_button" @click="sendMessage">发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onBeforeUnmount, onUnmounted, ref, Ref, watch} from "vue";
import store from "../store";
import Connect from "../pojo/Connect";

export default defineComponent({
  name: "home",
  setup() {
    //聊天消息列表
    let msgList: Ref<Array<Connect>> = ref([]);
    //内容
    let text: Ref<string> = ref("");
    //字数
    let wordCount: Ref<number> = ref(0);
    //在线用户列表
    let usersList: Ref<Array<Connect>> = ref([]);
    //连接服务器
    let ws: WebSocket = new WebSocket("ws://localhost:5055");
    //打开连接并设置用户名
    ws.onopen = () => {
      let connect: Connect = {
        uname: store.state.uname,
        avatar: store.state.avatar,
        onlineUsers: 0,
        msg: "用户打开连接!",
        Code: 0,
      }
      ws.send(JSON.stringify(connect));
      hint("服务器连接成功!");
    }
    //接收数据
    ws.onmessage = (msg: MessageEvent<string>): void => {
      let data: Connect = JSON.parse(msg.data);
      //判断类型
      if (data.Code === 0) {  /*用户加入类型*/
        usersList.value.push(data);
      } else if (data.Code === 1) {
        msgList.value.push(data);
      } else if (data.Code === 2) {
        for (let i=0;i<usersList.value.length;i++) {
          if (usersList.value[i].uname === data.uname) {
            usersList.value.splice(i);
            break;
          }
        }
        hint(`${data.uname}  离开了聊天室!`,"yellow");
      }
    }
    //发送数据
    const sendMessage = (): void => {
      let data: Connect = {
        uname: store.state.uname,
        avatar: store.state.avatar,
        onlineUsers: 0,
        msg: text.value,
        Code: 1,
      }
      ws.send(JSON.stringify(data));
      text.value = "";
    }
    //判断信息是不是自己的
    const isMyMsg = (i: Connect): boolean => {
      if (store.state.uname === i.uname) {
        return true
      } else {
        return false;
      }
    }
    //横幅函数(提示消息,横幅颜色,展示时常[默认3s])
    let showHint: Ref<boolean> = ref(false);
    let HintMsg: Ref<string> = ref("");
    const hint = (msg: string,color: string="#a3ea4d",time: number=5000): void => {
      //设置横幅内容
      HintMsg.value = msg;
      //开启横幅
      showHint.value = true;
      //设置元素
      setTimeout(() => {
        let hi: HTMLElement = document.getElementById("hint")!;
        hi.style.background = color;
        hi.style.height = "30px";
        //开启横幅,并延时关闭
        setTimeout(() => {
          hi.style.height = "0";
        },time)
        setTimeout(() => {
          showHint.value = false;
        },time+500);
      },100);
    }
    //监听内容，改变字数
    watch(
        () => text.value,
        (value) => {
          wordCount.value = value.length;
        },
        {deep: true}
    )
    //处理网络错误
    ws.onclose = () => {
      hint("服务器断开连接!!!","red",900000);
    }
    //监听键盘回车时间
    document.onkeydown = (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    }
    return {
      ws,showHint,HintMsg,usersList,store,wordCount,text,msgList,
      hint,sendMessage,isMyMsg
    }
  }
});
</script>

<style scoped>
#background {
  width: 100%;
  height: 100vh;
  animation: BackGround 500ms ease-out forwards;
  display: flex;
  justify-content: center;
  align-items: center;
}
@keyframes BackGround {
  0% {
    background-color: #f1f1f1;
  }
  100% {
    background-color: #3f3f3f;
  }
}
#cont {
  width: 1000px;
  height: 700px;
  border-radius: 16px;
  overflow: hidden;
}
#bar {
  width: 100%;
  height: 50px;
  background-color: #1f1f1f;
}
#bar>p {
  color: #f1f1f1;
  text-align: center;
  line-height: 50px;
}
#ma {
  width: 100%;
  height: calc(100% - 50px);
}
#left {
  width: 250px;
  height: 100%;
  background-color: #b0b0b0;
  float: left;
  text-align: center;
  color: #f1f1f1;
  overflow: auto;
}
#left::-webkit-scrollbar{
  display: none;
}
#right {
  width: calc(100% - 250px);
  height: 100%;
  background-color: #f8f8f8;
  float: left;
}
#hint {
  position: fixed;
  width: 1000px;
  height: 0;
  line-height: 30px;
  text-align: center;
  transition: 500ms;
  overflow: hidden;
}
#online {
  width: calc(100% - 20px);
  height: 50px;
  padding: 10px;
  border-bottom: 1px dotted #4f4f4f;
}
#online>img {
  width: 50px;
  height: 50px;
  display: inline-block;
}
#online>div {
  display: inline-block;
  width: 160px;
  text-align: left;
  position: relative;
  top: -10px;
  padding-left: 10px;
  padding-right: 10px;
  overflow: hidden;
  font-size: 20px;
  color: #3f3f3f;
}
#m_top {
  width: calc(100% - 40px);
  height: 440px;
  padding: 10px 20px;
  background-color: #f8f8f8;
  overflow: auto;
}
#m_button {
  /*border-top: 1px solid #3f3f3f;*/
  position: relative;
  background-color: #eaeaea;
  width: calc(100% - 20px);
  height: calc(100% - 20px - 460px);
  padding: 10px;
}
#text_button {
  width: 50px;
  height: 30px;
  background-color: #67e677;
  border: 0;
  color: #f1f1f1;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  position: absolute;
  bottom: 20px;
  right: 20px;
}
#text {
  width: calc(100% - 100px);
  height: calc(100% - 20px);
  border: 0;
  background-color: #eaeaea;
  resize: none;
  outline: none;
  padding: 10px;
  font-size: 20px;
  font-weight: bold;
  color: #4f4f4f;
  font-family: 楷体;
}
#wordCount {
  width: 100px;
  position: absolute;
  bottom: 60px;
  right: 0;
  text-align: center;
}
#msgList {
  width: calc(100% - 20px);
  padding: 10px;
  position: relative;
  display: flex;
  flex-flow: row;
}
#msgList>img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}
#myMsgList>img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}
#myMsgList {
  width: calc(100% - 20px);
  padding: 10px;
  position: relative;
  display: flex;
  flex-flow: row-reverse;
}
#myMsgList_cont {
  display: flex;
  flex-flow: column;
}
#myMsgList_uname {
  padding-left: 10px;
  padding-right: 10px;
  font-size: 14px;
  font-weight: 100;
  color: #4f4f4f;
  text-align: right;
}
#msgList_uname {
  padding-left: 10px;
  padding-right: 10px;
  font-size: 14px;
  font-weight: 100;
  color: #4f4f4f;
  text-align: left;
}
#myMsgList_msg {
  background-color: #95EC69;
  margin-right: 10px;
  margin-left: 10px;
  padding: 10px;
  border-radius: 8px;
  word-wrap:break-word;
  word-break:break-all;
}
#msgList_msg {
  background-color: #e1e1e1;
  margin-right: 10px;
  margin-left: 10px;
  padding: 10px;
  border-radius: 8px;
  word-wrap:break-word;
  word-break:break-all;
}
</style>