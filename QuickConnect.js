var Mapper = require('./Mapper'),
	Stack = require('./Stack').Stack

function QuickConnect(config){
	this.init(config);
}

QuickConnect.prototype = {
	WAIT_FOR_DATA : "wAiT",
	STACK_EXIT : "ExIt_StAcK",
	debug : console.log,
	STACK_CONTINUE : true,
	mapper = new Mapper,
	init : function(config){
		var executionMap = {},
			fakeQC,
			immediateExists = true,
		if(config){
			this.WAIT_FOR_DATA = (config.wait) ? config.wait : this.WAIT_FOR_DATA;
			this.STACK_EXIT = (config.exit) ? config.exit : this.STACK_EXIT;
			this.debug = (config.debug) ? config.debug : this.debug;
			this.STACK_CONTINUE = true;
		}
		var immediateTest = function(){
			var immediateExists = true;
			try {
				setImmediate(function(){})
			} catch(e){
				immediateExists = false
			}
			this.nextTick = function(fn, prefereNextTick){
				if(prefereNextTick || !immediateExists){
					process.nextTick(fn);
				} else {
					setImmediate(fn);
				}
			}
		}
		immediateTest.call(this);
		fakeQC = (function(self){
			return {
				WAIT_FOR_DATA : QuickConnect.WAIT_FOR_DATA,
				STACK_EXIT : QuickConnect.STACK_EXIT,
				STACK_CONTINUE : QuickConnect.STACK_CONTINUE,
				handleRequest : function(){
					return handleRequest.apply(self, [].slice.call(arguments,0))
				},
				handleRequests : function(){
					return handleRequests.apply(self, [].slice.call(arguments,0))
				},
				checkForStack : function(){
					return checkForStack.apply(self, [].slice.call(arguments,0))
				},
				debug : QuickConnect.debug,
				nextTick.QuickConnect.nextTick
			}

		})(this)
	},
	checkForStack : function (stackName){
		return this.mapper.checkForStack(stackName)
	}, 
	command : function(command, callback){
		this.mapper.command(command, callback)
	},
	genrateUUID :  function(){
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
	    	return v.toString(16);
	  	});
	  return uuid;

	},
	handleRequest : function(aCmd, requestData, callback/*, runBackground*/){
		var stack, uuid, funcs
		uuid = genrateUUID()
		funcs = cloneConsumableStacks(aCmd, uuid)
		if (!funcs) {
			console.warn('WARNING: attempting to execute the command "'
			  + (aCmd || 'missing')+'" for which no control functions are mapped.')
			  return
		}
		stack = new Stack(uuid, funcs, requestData, fakeQC, callback, testing)
		this.nextTick(function () {
			stack.go()
		})
		return stack
	},
	cloneConsumableStacks : function(aCmd, uuid){
		var funcs = {
	  		"validationMapConsumables": {},
	  		"dataMapConsumables": {},
	  		"viewMapConsumables": {}
	  }
	  if (!this.mapper.validationMap[aCmd] && !this.mapper.dataMap[aCmd] 
	          && !mapper.viewMap[aCmd]) {
	    return
	  }
	
	  funcs.validationMapConsumables[uuid] = (this.mapper.validationMap[aCmd] || [] ).slice()
	  funcs.dataMapConsumables[uuid] = (this.mapper.dataMap[aCmd] || [] ).slice()
	  funcs.viewMapConsumables[uuid] = (this.mapper.viewMap[aCmd] || [] ).slice()
	  
	  return funcs
	}
}
exports.QuickConnect = QuickConnect
exports.sharedQC = new QuickConnect

