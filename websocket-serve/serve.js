const ws = require('nodejs-websocket');
const PORT = 5055;
//当前连接人数
let onlineUsers = 0;

let serve = ws.createServer(conn => {
    console.log("有用户连接");
    onlineUsers++;
    console.log(onlineUsers);

    conn.on('text', data => {
        //转换
        data = JSON.parse(data);
        //设置用户名
        if (data.Code === 0) {
            conn.uname = data.uname;
            conn.avatar = data.avatar;
            serve.connections.forEach(connection => {
                //向其他用户广播自己
                if (connection.uname !== data.uname) {
                    connection.send(JSON.stringify(data))
                }
                //获取自己之前的用户
                let list = {
                    uname: connection.uname,
                    avatar: connection.avatar,
                    onlineUsers: onlineUsers,
                    msg: "",
                    Code: 0,
                }
                conn.send(JSON.stringify(list));
            })
            return;
        } else if (data.Code === 1) {
            //广播
            connAll(JSON.stringify(data));
        }
    })

    conn.on('close', () => {
        console.log("用户关闭连接");
        onlineUsers--;
        console.log(onlineUsers);
        let data = {
            uname: conn.uname,
            avatar: conn.avatar,
            onlineUsers: onlineUsers,
            msg: "",
            Code: 2,
        }
        connAll(JSON.stringify(data));
    })

    conn.on('error', () => {
        console.log("用户连接异常");
        console.log(onlineUsers);
    })

    function connAll(data) {
        serve.connections.forEach(connection => {
            connection.send(data);
        })
    }
}).listen(PORT, () => {
    console.log(`服务开启成功,端口号:${PORT}`);
});