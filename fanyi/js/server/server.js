/*服务器地址*/
define(function(require, exports) {
	
	var baseUrl = "http://nc051x.corp.youdao.com:9000/ycat/";

    var index = {
        //向服务器提交一个翻译句对
        translated: {
            url: baseUrl + 'edit.do?method=translatedOneSentence',
            post: {
                orderID: "?",
                sid: "?",
                sourceText: "?",
                targetText: "?",
                editor: "?"
            }
        },

        //获得当前订单完成进度百分比
        getPercent: {
            url: baseUrl + 'edit.do?method=getPercent',
            post: {
                orderID: "?"
            }
        },

        //导出原文
        exportorigin: {
            url: baseUrl + 'edit.do?method=exportOriginText',
            post: {
                orderID: "?"
            }
        },

        //导出译文
        exportresult: {
            url: baseUrl + 'edit.do?method=exportResultText',
            post: {
                orderID: "?"
            }
        },

        //导出双语对照的原文和译文
        exportbi: {
            url: baseUrl + ' edit.do?method=exportBiResultText',
            post: {
                orderID: "?"
            }
        }
    };

    return  {
        baseUrl: baseUrl,
        index: index //主页
    }
});
