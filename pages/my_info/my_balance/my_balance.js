//my_balance.js 我的余额
const myInfo = require('../../../utils/services/myinfo.js')
const requestAna = require('../../../utils/service_utils').requestAna

Page({
    data: {
        mybalance: 0,
        searchList: []
    },
    onload: function (){
        console.log(" ------------------------------my_info.my_balance.onload------------------------------ ")
    },
    onShow: function() {
        requestAna('view_balance', 'n_individual_center')
        const that = this;
        myInfo.getBalance().then(function(res) {
            const resData = res.data;
            console.log("onShow.getBalance.res", resData)
            that.setData({
                mybalance: resData.money
            })
        });
        myInfo.getSearch().then(function(res) {
            const resData = res.data;
            console.log("onShow.getSearch.res", resData)
            that.setData({
                searchList: resData.results
            })
        });
    }
})
