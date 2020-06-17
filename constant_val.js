/**
 * @author twidddj
 */
	var imgLength = 0,
		IMG_URL   = 'img/block';
	
	for (var i=1, len=8; i<=len; i++) {
		window['img'+i] = new Image();
		window['img'+i].src = IMG_URL + i + '.gif';
		window['img'+i].onload = function(){imgLength++;}
	};

	
	function BlockOption(initItem){
		for (var i in initItem){
			this[i] = initItem[i];
		}
		this.coords.push([1,1,1,1]);
	}

	var blockType1 = new BlockOption({
			coords : [
				[0, 1, 1, 2],
				[-1, -1, 0, 0]
			],
			center : 2,
			limitDegree : 90,
			type : 'img1'                                                                                                                                                      
		}),
		
		blockType2 = new BlockOption({
			coords : [
				[0, 1, 1, 2],
				[0, 0, -1, -1]
			],
			center : 3,
			limitDegree : 90,
			type : 'img2'
		}),
		
		blockType3 = new BlockOption({
			coords : [
				[1, 0, 1, 2],
				[-1, 0, 0, 0]
			],	
			center : 3,
			limitDegree : 360,
			type : 'img3'
		}),		
		
		blockType4 = new BlockOption({
			coords : [
				[0, 1, 0, 1],
				[0, 0, -1, -1]		
			],	
			center : 2,
			limitDegree : 0,
			type : 'img4'
		}),	
		
		blockType5 = new BlockOption({
			coords : [
				[0, 1, 2, 2],
				[0, 0, 0, -1]			
			],		
			center : 2,
			limitDegree : 360,
			type : 'img5'
		}),
		
		blockType6 = new BlockOption({
			coords :[
				[0, 0, 1, 2],
				[0, -1, 0, 0]	
			],	
			center : 3,
			limitDegree : 360,
			type : 'img6'
		}),				
		
		blockType7 = new BlockOption({
			coords : [
				[0, 1, 2, 3],
				[0, 0, 0, 0]			
			],
			center : 3,
			limitDegree : 90,
			type : 'img7'
		});
	
	var SINGLE_GAME = "single",
		ONLINE_GAME = "online",
		STOP_GAME   = "stop",
		DISCONNECT_BUTTON = "disconnect",
		START_BUTTON = "start";
		
	var BTN_START = "시작하기",
		BTN_STOP = "그만하기";
	
	var LONG_BLOCK = "img7",
		DEAD_BLOCK = "img8";
	
	var LEFT_KEY  = 37,
		UP_KEY    = 38,
		RIGHT_KEY = 39,
		DOWN_KEY  = 40,
		DROP_KEY  = 32,
		HOLD_KEY  = 16,
		F5_KEY    = 116,
		ENTER_KEY = 13;

	var GAME_SPEED = 1100,
		MIN_SPEED  = 100,
		START_COUNT= 3;
	
	var BOARD_COL_LEN = 10,
		BOARD_ROW_LEN = 20;

	var MY_BOARD = {
		blockSize : [20, 20] // px	
	};
	
	var OPPONENT_BOARD = {
		colLength : BOARD_COL_LEN,
		rowLength : BOARD_ROW_LEN,
		blockSize : [10, 10] 		
	};
	
	var NEXT_BOARD = {
		colLength : 4,
		rowLength : 2,
		blockSize : [10, 10]
	};
	
	var HOLD_BOARD = {
		colLength : 4,
		rowLength : 2,
		blockSize : [10, 10]
	};
		