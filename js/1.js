var money = 1000;
var count = Math.floor(money / 5);
var Ping = count;
var Gai = count;

Whatcount();
console.log("还剩" + Ping + "个空瓶");
console.log("还剩" + Gai + "个瓶盖");
console.log(count);

function Whatcount() {
    if (Ping < 3 && Gai < 6) {
        //递归终结条件
        return;
    }
    if (Gai >= 6) {
        var AddGai = Math.floor(Gai / 6);
        count += AddGai;
        Gai = AddGai + Gai % 6;//增加的瓶数＋剩余于的瓶盖；
        Ping += AddGai;
    }
    if (Ping >= 3) {
        var AddPing = Math.floor(Ping / 3);
        count += AddPing
        Ping = AddPing + Ping % 3; //增加的瓶数＋剩余于空瓶；
        Gai += AddPing;
    }


    Whatcount();
}
