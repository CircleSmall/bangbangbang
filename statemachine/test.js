var workspace = new router({
    routes: {
        "first": "first", // #first
        "second": "second", // #second
        "third": "third" // #third
    },

    first: function() {
        view.first.active();//视图启动
    },

    second: function() {
        view.second.active();
    }, 

    third: function() {
        view.third.active();
    }
});

his.start({
    // pushState: true
});
// 改互斥bug时特别蛋疼
// 互斥的逻辑： 1、词典的各个tab的切换
//              2、其他互斥（菜单栏、快插等）