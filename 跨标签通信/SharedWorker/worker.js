var data = "";
onconnect = function (e) {
  var port = e.ports[0];
  port.onmessage = function (e) {
    // 如果是 get 则返回数据给客户端
    if (e.data === "get") {
      port.postMessage(data);
      data = "";
    } else {
      // 否则把数据保存
      data = e.data;
    }
  };
};
