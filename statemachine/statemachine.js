var statemachine = (function(window, _) {
	function statemachine() {

	};
	_.extend(statemachine.prototype, _.event, {
		add: function(controller) {
			var me = this;
			if (!controller.activate || !controller.deactivate) {
				console.log("没有正确定义状态机： " + controller);
				return;
			}
			me.on("change", function(cur) {
				//每一个注册状态机的controller都会添加一个on事件
				if(controller == cur) {
					controller.activate();
				} else {
					controller.deactivate();
				}
			});
			controller.active = function(){
				me.trigger("change", controller);
			}
		}
	});
	return statemachine
})(window, _)

// todo： 
   // 先把其他所有元素deactive，再把当前元素active