//explore.js
const app = getApp()
const explore = require('../../utils/services/explore.js')
const thirdApi = require('../../utils/services/third_api.js')
const utils = require('../../utils/util.js')
const {reconnect} = require('../../utils/templates/no_network/no_network.js')
const addressService = require('../../utils/services/address.js')
const categoryService = require('../../utils/services/categories.js')
const servicesUtils = require('../../utils/service_utils')

Page({
    data: {
        network: {
            reconnecting: false,
            noNetwork: false
        },
        wxappLogin: {},
        isLoad: false,
        shareData: {},
        myShareToken: '',
        exploreQuestionIndex: 0,
        defaultQuestionId: 123,
        exploreQuestionsList: []
    },
    reconnect,
    swipeQuestion: function (event) {
        utils.logi("swipeQuestion.event", event)
        this.setData({
            exploreQuestionIndex: event.detail.current
        })
    },
    unfoldTap: function (event) {
        utils.logi("unfoldTap.event", event)
        thirdApi.showToast('展开中', 'loading', 10000)
        const that = this
        let optionsIndex = event.currentTarget.dataset.optionsIndex
        let exploreQuestionsList = this.data.exploreQuestionsList
        let exploreQuestionIndex = this.data.exploreQuestionIndex
        let shareToken = exploreQuestionsList[exploreQuestionIndex].share_token != '' ? exploreQuestionsList[exploreQuestionIndex].share_token : this.data.myShareToken
        let questionId = exploreQuestionsList[exploreQuestionIndex].question_id
        let optionCode = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].option_code
        let count = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].count
        let pageSize = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].page_size
        let pageNo = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].page_no
        if(optionsIndex==exploreQuestionsList[exploreQuestionIndex].options_index && count==pageSize*pageNo){
            thirdApi.hideToast()
            exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].isLast=true
            this.setData({
                exploreQuestionsList: exploreQuestionsList
            })
        }else {
            let reqList = {
                share_token: shareToken,
                question_id: questionId,
                option_code: optionCode,
                page_size: pageSize,
                page_no: pageNo
            }
            utils.logi('unfoldTap.reqList', reqList)
            explore.getQuestionOptions(reqList).then(function (res) {
                utils.logi('unfoldTap.getQuestionOptions.res', res)
                const resData = res.data
                thirdApi.hideToast()
                if (res.statusCode != 200) {
                    that.setData({
                        'network.noNetwork': true
                    })
                } else {
                    if (resData.code != 0) {
                        that.wetoast.toast({title: resData.msg, duration: 1500})
                    } else {
                        let count = resData.count
                        if(exploreQuestionsList[exploreQuestionIndex].selectedAndNoCommit==true) {
                            count += 1
                        }
                        exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].page_size = resData.page_size
                        exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].page_no = resData.page_no
                        exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].page_count = resData.page_count
                        exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].count = count
                        exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].users = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].users.concat(resData.users)
                        that.setData({
                            exploreQuestionsList: exploreQuestionsList
                        })
                    }
                }
            }, function () {
                that.setData({
                    'network.noNetwork': true
                })
            }).catch(function (res) {
                utils.logi(res)
                that.setData({
                    'network.noNetwork': true
                })
            })
        }
    },
    packupTap: function (event) {
        utils.logi("packupTap.event", event)
        let optionsIndex = event.currentTarget.dataset.optionsIndex
        let exploreQuestionsList = this.data.exploreQuestionsList
        let exploreQuestionIndex = this.data.exploreQuestionIndex
        let pageSize = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].page_size
        let pageCount = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].page_count
        let count = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].count
        let pageNo = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].page_no
        exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].users.splice(pageSize, count-pageSize*(pageCount-pageNo));
        exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].page_no = 1
        if(optionsIndex==exploreQuestionsList[exploreQuestionIndex].options_index) {
            exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].isLast = false
        }
        utils.logi(exploreQuestionsList)
        this.setData({
            exploreQuestionsList: exploreQuestionsList
        })
    },
    selectAnswer: function (event) {
        utils.logi("selectAnswer.event", event)
        let optionsIndex = event.currentTarget.dataset.optionsIndex
        let exploreQuestionsList = this.data.exploreQuestionsList
        let exploreQuestionIndex = this.data.exploreQuestionIndex
        utils.logi("111", this.data.exploreQuestionsList[exploreQuestionIndex], this.data.exploreQuestionsList[exploreQuestionIndex].options_index)
        if(exploreQuestionsList[exploreQuestionIndex].selected==0 && (exploreQuestionsList[exploreQuestionIndex].options_index!=optionsIndex || exploreQuestionsList[exploreQuestionIndex].selectedAndNoCommit!=true)) {
            if(exploreQuestionsList[exploreQuestionIndex].selectedAndNoCommit!=true) {
                exploreQuestionsList[exploreQuestionIndex].total_count += 1
            }

            for(let i=0; i<exploreQuestionsList[exploreQuestionIndex].options.length; ++i){
                let questionsOptions = exploreQuestionsList[exploreQuestionIndex].options[i]
                if(i==optionsIndex) {
                    exploreQuestionsList[exploreQuestionIndex].options[i].count = questionsOptions.count + 1
                }else if(i==exploreQuestionsList[exploreQuestionIndex].options_index && questionsOptions.count!=0 && exploreQuestionsList[exploreQuestionIndex].selectedAndNoCommit==true){
                    exploreQuestionsList[exploreQuestionIndex].options[i].count = questionsOptions.count - 1
                }
                exploreQuestionsList[exploreQuestionIndex].options[i].percentage = (questionsOptions.count * 100 / exploreQuestionsList[exploreQuestionIndex].total_count).toFixed(0)

            }
            exploreQuestionsList[exploreQuestionIndex].selectedAndNoCommit = true
            exploreQuestionsList[exploreQuestionIndex].options_index = optionsIndex
            this.setData({
                exploreQuestionsList: exploreQuestionsList
            })
        }else{
            if (exploreQuestionsList[exploreQuestionIndex].selected_tip != undefined && exploreQuestionsList[exploreQuestionIndex].selected_tip != "") {
                this.wetoast.toast({title: exploreQuestionsList[exploreQuestionIndex].selected_tip, duration: 1500})
            }
        }
    },
    commitAnswer: function (event) {
        utils.logi("commitAnswer.event", event)
        const that = this
        let exploreQuestionsList = this.data.exploreQuestionsList
        let exploreQuestionIndex = this.data.exploreQuestionIndex
        if(exploreQuestionsList[exploreQuestionIndex].selected==0) {
            if(exploreQuestionsList[exploreQuestionIndex].selectedAndNoCommit == true) {
                thirdApi.showToast('提交中', 'loading', 10000)
                let optionsIndex = exploreQuestionsList[exploreQuestionIndex].options_index
                let shareToken = exploreQuestionsList[exploreQuestionIndex].share_token != '' ? exploreQuestionsList[exploreQuestionIndex].share_token : this.data.myShareToken
                utils.logi("commitAnswer.req", exploreQuestionsList, exploreQuestionIndex, optionsIndex)
                let questionId = exploreQuestionsList[exploreQuestionIndex].question_id
                let optionCode = exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].option_code
                let reqList = {
                    share_token: shareToken,
                    question_id: questionId,
                    option_code: optionCode
                }
                utils.logi('commitAnswer.reqList', reqList)
                explore.getQuestionAnswer(reqList).then(function (res) {
                    utils.logi('commitAnswer.getQuestionAnswer.res', res)
                    const resData = res.data
                    thirdApi.hideToast()
                    if (res.statusCode != 200) {
                        that.setData({
                            'network.noNetwork': true
                        })
                    } else {
                        if (resData.code != 0) {
                            that.wetoast.toast({title: resData.msg, duration: 1500})
                        } else {
                            exploreQuestionsList[exploreQuestionIndex] = resData
                            for (let i = 0; i < exploreQuestionsList[exploreQuestionIndex].options.length; ++i) {
                                let questionsOptions = exploreQuestionsList[exploreQuestionIndex].options[i]
                                exploreQuestionsList[exploreQuestionIndex].options[i].percentage = exploreQuestionsList[exploreQuestionIndex].total_count == 0 ? 0 : (questionsOptions.count * 100 / exploreQuestionsList[exploreQuestionIndex].total_count).toFixed(0)
                            }
                            if (optionsIndex == exploreQuestionsList[exploreQuestionIndex].options_index) {
                                exploreQuestionsList[exploreQuestionIndex].options[optionsIndex].isLast = false
                            }
                            if (resData.tip != undefined && resData.tip != "") {
                                that.wetoast.toast({title: resData.tip, duration: 1500})
                            }
                            that.setData({
                                exploreQuestionsList: exploreQuestionsList
                            })
                        }
                    }
                }, function () {
                    that.setData({
                        'network.noNetwork': true
                    })
                }).catch(function (res) {
                    utils.logi(res)
                    that.setData({
                        'network.noNetwork': true
                    })
                })
            }else{
                this.wetoast.toast({title: '请选择一个选项', duration: 1500})
            }
        }
    },
    getExploreQuestionsList: function () {
        const that = this
        let shareData=this.data.shareData
        let exploreQuestionsList = this.data.exploreQuestionsList
        let reqList = {}
        utils.logi("getExploreQuestionsList", shareData, exploreQuestionsList)
        let isEmptyShareData = utils.gIsEmptyObject(shareData)
        if(!isEmptyShareData){
            reqList.share_token = shareData.shareToken
            reqList.question_id = shareData.questionId
        }
        explore.getQuestionlist(reqList).then(function (res) {
            const resData = res.data
            if (res.statusCode!=200){
                that.setData({
                    'network.noNetwork': true
                })
            }else {
                if(resData.code!=0) {
                    that.wetoast.toast({title: resData.msg, duration: 1500})
                }else {
                    utils.logi("getExploreQuestionsList.getQuestionlist", resData.questions)
                    let exploreQuestionsList = resData.questions
                    let myShareToken = resData.my_share_token
                    let exploreQuestionIndex = 0
                    utils.logi("exploreQuestionsList.length", isEmptyShareData, exploreQuestionsList.length)

                    for (let i = 0; i < exploreQuestionsList.length; ++i) {
                        let exploreQuestions = exploreQuestionsList[i]
                        utils.logi("exploreQuestionsList", i, exploreQuestions.question_id == shareData.questionId, exploreQuestions.question_id == shareData.questionId)
                        if (!isEmptyShareData && exploreQuestions.question_id == shareData.questionId) {
                            exploreQuestionIndex = i
                        }
                        for(let j=0; j<exploreQuestions.options.length; ++j){
                            let questionsOptions = exploreQuestions.options[j]
                            exploreQuestionsList[i].options[j].percentage = exploreQuestions.total_count==0?0:(questionsOptions.count*100/exploreQuestions.total_count).toFixed(0)
                            exploreQuestionsList[i].options[j].isLast = false
                        }
                    }
                    utils.logi("exploreQuestionIndex", exploreQuestionIndex)
                    that.setData({
                        exploreQuestionsList: exploreQuestionsList,
                        myShareToken: myShareToken,
                        exploreQuestionIndex: exploreQuestionIndex,
                        isLoad: true
                    })
                }
            }
        }, function (){
            that.setData({
                'network.noNetwork': true
            })
        }).catch(function (res) {
            utils.logi(res)
            that.setData({
                'network.noNetwork': true
            })
        })
    },
    getStationCode: function() {
        return categoryService.getAllCategories()
    },
    getCurrentAddressAndShowAllCategories: function() {
        const that = this
        if (!utils.gIsEmptyObject(app.globalData.currentAddressInfo)) {
            that.setData({
                currentAddressInfo: app.globalData.currentAddressInfo
            })
            utils.logi('------------1111111111----------------=')
                //getfromCahe
            // this.getAllCategories()
            return
        }
        utils.logi('app.globalData', app.globalData)
        addressService.getCurrentAddress().then(function(res) {
            const resData = res.data;
            utils.logi("getCurrentAddressAndShowAllCategories.getCurrentAddress.res", resData)
            if (!utils.gIsEmptyObject(resData.address_info)) {
                let currentAddressType = 1
                app.setCurrentAddressInfo(currentAddressType, resData.address_info)
                that.setData({
                    currentAddressInfo: app.globalData.currentAddressInfo
                })
                app.setReceiveAddressInfo(resData.address_info)
                utils.logi('------------222222222222222222----------------=')
                that.getStationCode().then(function (res) {
                    const stationCode = res.data;
                    app.setStationCode(stationCode.station_code);
                })
                // that.getAllCategories()
            } else {
                let currentAddressType = 0
                // thirdApi.showToast('定位中', 'loading', 10000)
                thirdApi.getLocation().then(function(res) {
                    servicesUtils.getGeoLocation(res.latitude, res.longitude, 150).then(function(res) {
                        if (!utils.gIsEmptyObject(res.data) && res.data.status === 0) {
                            app.setCurrentAddressInfo(currentAddressType, res.data.data[0])
                            utils.logi('--------------location address=', res.data.data[0])
                            that.setData({
                                currentAddressInfo: app.globalData.currentAddressInfo
                            })
                            that.getStationCode().then(function(res) {
                                utils.logi(res.data)
                            })
                            // thirdApi.hideToast()
                        }
                    })
                })
            }
        }).catch(function(res) {
            utils.logi("getCurrentAddressAndShowAllCategories.getCurrentAddress.catch", res)
        })
    },
    onLoad: function (shareData) {
        utils.logi("---------------------------onLoad.res--------------------------", shareData)
        this.setData({
            shareData: shareData
        })
        new app.globalData.WeToast()
    },
    onShow: function () {
        const that = this
        // let wxappLogin = app.globalData
        // utils.logi(wxappLogin)
        app.getUserInfo(function (wxappLogin) {
            that.setData({
                wxappLogin: wxappLogin,
                'network.noNetwork': false
            })
            app.globalData.wxappLogin = wxappLogin
            utils.logi('network.noNetwork', wxappLogin)
            that.getExploreQuestionsList()
            that.getCurrentAddressAndShowAllCategories()
        }, function (){
            utils.logi('network.noNetwork', that.data)
            that.setData({
                'network.noNetwork': true,
                // 'network.reconnecting': true
            })
        })
        utils.logi("this.data", this.data)
    },
    onShareAppMessage: function () {
        let exploreQuestionsList = this.data.exploreQuestionsList
        let exploreQuestionIndex = this.data.exploreQuestionIndex
        let shareToken = this.data.myShareToken
        return {
            title: exploreQuestionsList[exploreQuestionIndex].share_title,
            desc: exploreQuestionsList[exploreQuestionIndex].share_content==''?' ':exploreQuestionsList[exploreQuestionIndex].share_content,
            path: '/pages/explore/explore?shareToken='+encodeURIComponent(shareToken)+'&questionId='+exploreQuestionsList[exploreQuestionIndex].question_id
        }
    }
})