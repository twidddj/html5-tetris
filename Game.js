var playcount = 0;

var Game = {
	myBoard : null,
	holdBlockBoard : null,
	nextBoardCommander : null,
	counter : null,
	counterAble : true,
	pageType : null,

    speed : GAME_SPEED,
	level : 1,
	score : 0,
	combo : -1,
	removedLine : 0,
	_removedLine : 0,
	
	MaxUserLength : 6,
	WSC : null,
	
	state : {
		single : false,
		online : false
	},
	
	pId : null,
	users : {},
	terminatedResult : [],

	// dom
	button : {},
	btnArea : null,
	resultLayer : null,
	lineViewer  : null,
	removedLineViewer : null,
	
	start : function(type){
		if(type == ONLINE_GAME && this.state.single){
			this.terminate();
		} 
		
		this.init(type);
		this.myBoard.bindEvent();
		this.myBoard.terminate = false;
		this.state[type] = true;
		this.resultLayerInit();
		this.updateGameState();
		
		if(type == ONLINE_GAME){
			var self = this;
			var wsc  = self.WSC;
			
			wsc.broadcastGamingEvent({
				event : "onGame",
				senderIncluded : true
			});
			
			(function(){
				if(!self.counter.isStartNow() && self.counterAble){
					self.unableButton();
					self.counter.show();
					setTimeout(arguments.callee, 650);
				}
				else {
					self.counter.rewind();
					if(self.getOnGameUserLength() > 1){
						self.myBoard.play();
						log.insert("게임이 시작되었습니다.");
					} else {
						self.init(type);
					}
				}
			})();
		}
		else this.myBoard.play();
	},
	terminate : function(){
		type = this.state.single ? SINGLE_GAME : ONLINE_GAME;

		this.myBoard.unbindEvent();
		this.myBoard.stop();
		this.myBoard.terminate = true;
		
		this.nextBoardCommander.drawGameOver();
		this.holdBlockBoard.drawGameOver();
		this.updateGameState(true);
		
		if(type == SINGLE_GAME){
			this.button[type].innerHTML = BTN_START;
			this.myBoard.clear();
			this.nextBoardCommander.clear();
			this.holdBlockBoard.clear();
			this.holdBlockBoard.initViewer();

		} else if(type == ONLINE_GAME){
			this.ableButton();
			this.counterAble = false;
		}
		
		this.state[type] = false;
	},
	init : function(type){
		if(type == ONLINE_GAME) this.terminatedResult = [];
		
		this.ableButton();                  // button 사용가능
		this.myBoard.init();    
		this.nextBoardCommander.init();
	   	this.holdBlockBoard.init();   
		this.holdBlockBoard.initAble();     // holdBlockBoard설정 초기화
		
		// Game 설정 초기화
		this.speed = GAME_SPEED;
		this.level = 1;
		this.score = 0;
		this.removedLine = 0;
		this._removedLine = 0;
		this.counterAble = true;
		
		// 상대방 정보 초기화
		if(type == ONLINE_GAME){
			var wsc = this.WSC;
			
			for(var i in this.users){
				var user   = this.users[i],
					board  = user.board;
					
				board.clear();
				user.onGame     = false;
				user.attackLine = 0;
			}
		}
	},

	unableButton : function(){
		this.btnArea.style.display = "none";
	},
	ableButton : function(){
		var onlineStartButton = this.button[ONLINE_GAME];
		this.btnArea.style.display = "";
		if(onlineStartButton === undefined) return;
		if(this.getOnGameUserLength() > 1){
			onlineStartButton.style.display = "none";
		} else {
			onlineStartButton.style.display = "";
		}
	},

	sendBoard : function(b, terminate){
		if(this.state.single || !this.state.online) return;
		
		var wsc = this.WSC;
		
		wsc.broadcastGamingEvent({
			event : "update",
			board : b,
			terminate : terminate
		});
		
		if(terminate){
			wsc.terminateGame(wsc.getId(), this.pId, wsc.getUsername());
			this.users[this.pId].onGame = false;
			this.nextBoardCommander.drawGameOver();
			this.holdBlockBoard.drawGameOver();
		}
	},
	
	sendBoardToTarget : function(targetId){
		var wsc     = this.WSC,
			myBoard = this.myBoard,
			lToken;
		
		var boardData = myBoard.getSendBoard();
		
		lToken = {
			ns: jws.SystemClientPlugIn.NS,
			type : "send",
			event : "boardUpdate",
			targetId : targetId,
			data : boardData,
			dataType : "board",
			terminate : myBoard.terminate
		};
		
		wsc.sendToken(lToken);
	
	},
	
	nextBlockUpdate : function(blocks){
		this.nextBoardCommander.setBlock(blocks);	
	},
	
	setHoldBlock : function(block){
		var holdBoard = this.holdBlockBoard;
		if(holdBoard.holdAble === false || holdBoard.countHold > holdBoard.limitHold) return;
		else {
			holdBoard.holdAble = false;
			holdBoard.setBlock(block);
			holdBoard.updateHoldState();
		}
	},
	getHoldBlock : function(){
		var holdBoard = this.holdBlockBoard, 
			limitHold = holdBoard.limitHold;

		if(holdBoard.holdAble === false) return false;
		else if(holdBoard.countHold <= limitHold){
			holdBoard.increaseCount();
		}
		if(holdBoard.countHold == limitHold){
			holdBoard.terminate = true;
			holdBoard.draw();
		}

		return holdBoard.getBlock();
	},

	updateStateForNext : function(){
		//블록이 드롭된 후 다음 블록으로 넘어갈 실행 되어야 할 메소드
		var holdBoard = this.holdBlockBoard;
		if(holdBoard.holdAble === false && holdBoard.countHold < holdBoard.limitHold) holdBoard.holdAble = true;
		
	},	
	doClearLine : function(len){
		var line, level;
		//라인 삭제 시 실행 될 메소드(콤보, 레벨업, 공격등)
		if(len == 0) {
			this.combo = -1;
			return;
		} else {
			this.removedLine  += len;
			this._removedLine += len;
			
			line = this.removedLine;
			
			this.combo++;
			if(this.combo > 0) {
				this.showCombo();
			}
			if(this.state.online) {
				if(this.combo > 0) this.attackLine(1); // 콤보마다 1라인 공격
				if(len >= 3) this.attackLine(len-1);
			}
		}
		
		if(this._removedLine >= 10){
			this.level++;
			
			this.setSpeed();
			this._removedLine = this.removedLine%10;
			
			level = this.level;
		}
		
		if(line || level)
			this.updateGameState();
	},
	attackLine : function(line){
		this.users[this.pId].attackLine += line;
		this.WSC.broadcastGamingEvent({
			event : "attack",
			line : line
		});		
	},

	showCombo : function(){
		//debug.innerHTML = this.combo;
	},
	setSpeed : function(){
		if(this.speed <= MIN_SPEED) return;
		this.speed -= 100;
	},
	getOnGameUserLength : function(){
		var cnt   = 0,
			users = this.users;
		
		for(var i in users)
			if(users[i].onGame === true) cnt++;
		
    	return cnt;
	},	
	createUserGame : function(initItem, username){
		// myBoard
		this.myBoard = new tetris.GameBoard(MY_BOARD);
		this.myBoard.setCanvas(initItem.canvas.gameBoardCanvas);	
		
		//nextBoardCommander
		this.nextBoardCommander = new NextBlockBoardCommander(initItem.nextBlockBoard);

		// holdBlockBoard
		this.holdBlockBoard = new tetris.HoldBlockBoard(HOLD_BOARD);
		this.holdBlockBoard.setCanvas(initItem.canvas.holdBlockBoardCanvas);
		this.holdBlockBoard.initAble(initItem.dom.holdStateViewer);
		
		// counter
		if(initItem.dom.countViewer){
			var countViewer = initItem.dom.countViewer;
			this.setElementToCenter(countViewer);
			this.counter = new GameCounter(countViewer);
			this.counter.setCount(START_COUNT);
			this.counter.hidden();
		}
		
		// level, line viewer
		this.levelViewer       = initItem.dom.levelViewer;
		this.removedLineViewer = initItem.dom.removedLineViewer;
		
		// resultLayer, opponentBoard wrapper
		this.resultLayer       = initItem.dom.resultLayer || null ;
		this.wrapOpponentBoard = initItem.dom.wrapOpponentBoard || null;
		
		// config
		this.pageType = initItem.config.pageType || null; 
		
		// websocket Object, btn wrapper
		this.btnArea = initItem.dom.btnArea;
		this.WSC     = initItem.WSC || null;
		
		// createButton
		this.createButton();
	},
	createButton : function(){
		var self = this;
	
		var singleGameButton = document.createElement('button');
		singleGameButton.innerHTML = BTN_START;
		this.btnArea.appendChild(singleGameButton);
		this.button.single     = singleGameButton;
		
		if(this.pageType != "mobile"){
			var disconnectButton = document.createElement('button');
			disconnectButton.innerHTML = DISCONNECT_BUTTON;
			this.btnArea.appendChild(disconnectButton);
			this.button.disconnect = disconnectButton;
		}
		
		this.button.single.onclick = function(){
			var val = this.innerHTML;
			if(val == BTN_START){
				self.start(SINGLE_GAME);
				this.innerHTML = BTN_STOP;
			}else if(val == BTN_STOP){
				self.terminate();
				this.innerHTML = BTN_START;
			}
			this.blur();
		}		
	},
	createOpponentGame : function(pId){
		/*
		<div class="wrap_opponent_board">
			<canvas id="opponentBoard1"></canvas>
			<div class="board_info">
				<strong></strong> :
				<span></span>
			</div>
		</div>
		*/
		
		var wrap_opponent_board = document.createElement("div"),
			canvas              = document.createElement("canvas"),
			board_info          = document.createElement("div");
		
		wrap_opponent_board.className = "wrap_opponent_board";
		wrap_opponent_board.id        = pId;
		
		board_info.innerHTML          = "<strong></strong> : <span></span>";
		
		wrap_opponent_board.appendChild(canvas);
		wrap_opponent_board.appendChild(board_info);
		this.wrapOpponentBoard.appendChild(wrap_opponent_board);
		
		var board = new tetris.OpponentBoard(OPPONENT_BOARD);
		board.setCanvas(new Canvas(canvas));
		return board;
	},
	myBoardisBoss : function(){
		var onlineGameButton = document.createElement('button'),
			self             = this;
			
		onlineGameButton.innerHTML = START_BUTTON;
		
		this.btnArea.insertBefore(onlineGameButton, this.button.single);
		this.button.online = onlineGameButton;
		this.button.online.onclick = function(){
			self.broadCastGameStart();
		}
	},
	broadCastGameStart : function(){
		var wsc        = this.WSC;
		if(wsc.userLength == 0){
			alert("게임할 상대가 없습니다.");
			return;
		}
		wsc.broadcastGamingEvent({
			event : "start"
		});
		this.start(ONLINE_GAME);
	},
	updateGameState : function(init){
		if(!init){
			this.levelViewer.innerHTML = "LEVEL : " + this.level;
			this.removedLineViewer.innerHTML = "LINE : " + this.removedLine;
		} else {
			this.levelViewer.innerHTML = '';
			this.removedLineViewer.innerHTML = '';
		}
	},
	showTerminatedResult : function(){
		for (var i in this.users){
			var user = this.users[i];
			if(user.onGame){
				this.terminatedResult.push({
					name : user.username,
					attackLine : user.attackLine
				});
				break;
			}
		}
		
		var str   = "",
			ra    = this.terminatedResult,
			layer = this.resultLayer,
			self  = this;
		
		for (var i =ra.length-1,j=1; i>=0; i--,j++){
			var result = ra[i],
				name   = result.name,
				attackLine = result.attackLine;
			
			str += j + "등 :" + name + ", 공격라인 : " + attackLine + "<br />";
		}
		
		layer.innerHTML     = str;
		layer.style.display = "block";
		layer.opened        = true;
		
		layer.onclick = function(){
			this.style.display = "none";
			this.opened = false;
			self.init(ONLINE_GAME);
		}
	},
	resultLayerInit : function(){
		if(!this.resultLayer || !this.resultLayer.opened) return;
		this.resultLayer.style.display = "none";
		this.resultLayer.opened = false;
	},
	
	setElementToCenter : function(elem){
		var size   = this.myBoard.getSize(),
			width  = size[0],
			height = size[1];
		
		elem.style.left = width/2  - elem.offsetWidth/2 + "px";
		elem.style.top  = height/2 - elem.offsetHeight/2 + "px";
	}
}


function BlockFactory(size){
	this.fullSize = size;
	this.array    = new Array();
	this.MAX      = 1;
	this.MIN      = 7;
	this.randomNumberGenerator = new RandomNumberGenerator();
	this.generate();
}

BlockFactory.prototype = {
	generate : function(){
		var a = this.array,
			l = this.fullSize - a.length,
			n;
		
		for (var i =0; i<l; i++){
			n = this.getRandomNumber();
			a.push(new tetris.RealBlock(window['blockType' + n]));
		}
	},
	getRandomNumber : function(){
		var next = this.randomNumberGenerator.next();
		return Math.round((this.MAX-this.MIN) * next + this.MIN); 
	},
	getBlock : function(){
		if(this.array.length < 5) this.generate();
		return this.array.shift();
	}
}

function NextBlockBoardCommander(initItem){
	this.items        = null;
	this.currentBoard = null;
	this.wrapper      = initItem.wrapper;
	this.boardLength  = initItem.length;
}

NextBlockBoardCommander.prototype = {
		init : function(){
			this.items = new ArrayList();
			this.currentBoard = null;
			this.removeAllCanvas();
		},
		removeAllCanvas : function(){
			var canvases = this.wrapper.getElementsByTagName('canvas');

			if(canvases.length > 0){
				var len = canvases.length;
				for (var i =0;i<len;i++){
					canvas = canvases[0];
					this.wrapper.removeChild(canvas);
				}
			}			
		},
		drawGameOver : function(){
			this.items.each(function(board){
				board.drawGameOver();
			});			
		},
		clear : function(){
			this.items.each(function(board){
				board.clear();
			});
		},
		initBoard : function(){
			this.items.each(function(board){
				board.init();
			});			
		},
		createBoard : function(){
		    var canvas = document.createElement("canvas"),
			    board  = new tetris.NextBlockBoard(NEXT_BOARD);

			this.wrapper.appendChild(canvas);
			board.setCanvas(new Canvas(canvas));	
			return board;
		},
		setBlock : function(blocks){
			if(blocks.length <= 0) return;
			
			var board;

			if(blocks.length == 1){
				board = this.createBoard();
				this.items.add(board);
				board.setBlock(blocks[0]);
			} else {
				for(var i=0, len = blocks.length; i<len ;i++){
					board = this.createBoard();
					this.items.add(board);
					board.setBlock(blocks[i]);
				}			
			}
		},
		getBlock : function(){
			var board = this.items.get(0);
			this.currentBoard = board;
			return board.getBlock();
		},
		removeCurrentBoard : function(){
			this.removeBoard(this.currentBoard);
			this.items.remove(0);
			this.currentBoard = null;
		},
		insertBoard : function(board){
			var el = board.canvas.el;
			this.wrapper.appendChild(el);
		},
		removeBoard : function(board){
			var el = board.canvas.el;
			this.wrapper.removeChild(el);
		}
}

function GameCounter(viewer){
	this.count  = null;
	this._count = null;
	this.viewer = viewer;

}
GameCounter.prototype.setCount = function(count){
	this.count  = count;
	this._count = count;
}
GameCounter.prototype.isStartNow = function(){
	if(this.count > -1) return false;
	else return true;
}
GameCounter.prototype.show = function(){
	if(this.viewer.style.display == 'none') this.viewer.style.display = 'block';
	if(this.count > 0){
		this.viewer.innerHTML = this.count;
	}else {
		this.viewer.innerHTML = "go!";
	}
	this.count--;
}
GameCounter.prototype.hidden = function(){
	this.viewer.style.display = 'none';
}
GameCounter.prototype.rewind = function(){
	this.hidden();
	this.count = this._count;
}
