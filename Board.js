/**
 * @author twidddj
 */

function Dot(state, type){
	this.state = state;
	this.type  = type || null;
}
Dot.prototype.setState = function(state){
	this.state = state;
}

oop.declareClass('tetris', 'Board', null, {
	terminate : false,
	_init : function(options){
		this.blockSize = options.blockSize;
		this.colLength = options.colLength;
		this.rowLength = options.rowLength;
		this.board     = this.createBoardArray(); 
		
		this.setSize();
		this.startP    = [0, this.height];
		this.block     = null;
	},
	init : function(){
		this.board = this.createBoardArray(); 
		this.block = null;
		this.terminate = false;
		this.clear();
	},
	drawGameOver : function(){
		this.terminate = true;
		this.draw();
	},
	setSize : function(){
		this.width     = this.colLength * this.blockSize[0];
		this.height    = this.rowLength * this.blockSize[1];		
	},
	getSize : function(){
		return [this.width, this.height];
	},
	setCanvas : function(canvas){
		this.canvas = canvas;
		canvas.el.width  = this.width;
		canvas.el.height = this.height;		
	},
	setBlock : function(block){
		this.block = block;
	},
	getBlock : function(){
		return this.block;
	},
	createBoardArray : function(){
		var board = new Array(this.rowLength);
		for (var i = board.length - 1; i >= 0; i--) {
			board[i] = this.createBoardColArray();
		}	
		return board;
	},
	createBoardColArray : function(n, img, except){
		var n     = n || 0,
		    array = new Array(this.colLength);
		
		for (var i=0,len=array.length; i<len; i++) {
			if(except === undefined || except != i)array[i] = new Dot(n, img);
			else array[i] = new Dot(0);
			
		};	
		return array;
	},
	markBlockCoords : function(){
		var a = this.board,
			b = this.block,
			p = b.coords;
		
		for (var j = 0, len=p[0].length; j < len ; j++) {
			var row = p[1][j],
				col = p[0][j];
			
			if(row < 0) continue;
			a[row][col] = new Dot(b.dotState, b.type);
		}	
	},
	removeBlockCoords : function(){
		var a = this.board,
			p = this.block.coords;
		
		for (var j = 0, len=p[0].length; j < len ; j++) {
			var row = p[1][j],
				col = p[0][j];
			
			if(row < 0) continue;
			a[row][col].setState(0);
		}	
	},	
	clear : function(){
		this.canvas.ctx.clearRect(0, 0, this.width, this.height);
	},
	draw : function(){
		var ctx       = this.canvas.ctx, 
		    a         = this.board, 
		    fillImg   = (this.terminate === true) ? window[DEAD_BLOCK] : null, 
		    p;
			
		this.canvas.ctx.clearRect(0, 0, this.width, this.height);
		for (var i = a.length - 1; i >= 0; i--) {
			for (var j = 0,len=a[i].length; j < len; j++) {
				var bp = a[i][j];
				if (bp.state == 1 || bp.state == 2) {
					p = [j*this.blockSize[0], i* this.blockSize[1]];
					if(bp.state == 2) {
						if(!this.dumAble) continue;
						ctx.globalAlpha = 0.3;
					}
					else  ctx.globalAlpha = 1;
					ctx.drawImage(fillImg || window[bp.type], p[0], p[1], this.blockSize[0], this.blockSize[1]);
				}
			}
		}
		
		//debug	
		//var str='';for(i=0;i<a.length;i++){for(j=0;j<a[i].length;j++){str+=a[i][j].state+", ";}str+="<br />";}result2.innerHTML=str;
	},
	// user info
	setUsername : function(username){
		this.username = username;
	},
	setUsernum : function(usernum){
		this.usernum = usernum;
	},
	insertInfo : function(){
		
	},
	removeInfo : function(){
		this.username = null;
		this.usernum  = null;
		this.usernumElem.innerHTML  = "";
		this.usernameElem.innerHTML = ""; 		
	}
});

/*
 * GameBoard
 */
oop.declareClass('tetris', 'GameBoard', tetris.Board, {
	//constructor
	create : function(options){
		this.blockSize = options.blockSize;
		this.colLength = BOARD_COL_LEN;
		this.rowLength = BOARD_ROW_LEN;
		
		this.setSize();
		this.init();
		
		this.dumAble    = true;
		this.moving     = null;
		this.startP     = [0, this.height];
		this.eventKeyList    = [LEFT_KEY,UP_KEY,RIGHT_KEY,DOWN_KEY,DROP_KEY,HOLD_KEY];
	},
	
	//overwritten
	init : function(){
		this.board      = this.createBoardArray();
		this.terminate  = false;
		this.block      = {dum : null, real : null};
		this.nextBlocks = [];
		this.nextBlock  = null;
		this.holdBlock  = null;
		this.blockFactory = new BlockFactory(10);
	},	
	// overwritten
	markBlockCoords : function(){
		var a = this.board,
			block, p;
		
		for (var i in this.block){
			if(this.block[i] === null) continue;
			block = this.block[i];
			p     = block.coords;
			
			for (var j = 0,len=p[0].length; j<len ; j++) {
				var row = p[1][j],
					col = p[0][j];
				
				if(row < 0) continue;
				a[row][col] = new Dot(block.dotState, block.type);
			}			
		}				
	},
	
	// overwritten
	removeBlockCoords : function(){
		var a = this.board,
			block, p;		
		for (var i in this.block){
			if(this.block[i] === null) continue;
			block = this.block[i];
			p     = block.coords;
			
			for (var j = 0,len=p[0].length; j<len ; j++) {
				var row = p[1][j],
					col = p[0][j];
				
				if(row < 0) continue;	
				a[row][col].setState(0);
			}			
		}			
	},

	// overwritten
	setBlock : function(block){
		this.block.real = block;
		this.block.dum  = new tetris.DummyBlock(this, this.block.real);
	},
	setBlockCoords : function(coords){
		this.removeBlockCoords();
		this.block.real.setCoords(coords);
		this.block.dum.setCoords(this.block.real);
		this.block.real.applyState();		
	},
	insertBlock : function(block){
		this.setBlock(block);
		
		var m  = this.block.real.getMostCoords(),
			dx = (m.right[0] - m.left[0] + 1)/2;
			
		dx =  dx < 1 ? 1 : dx;
		this.block.real.moveCoords(Math.floor(this.colLength/2 - dx), -2, 'set');
	},
	chkGameOver : function(){
		var b = this.board,
			o = this.block.real.getMostCoords(),
			check;

		for (var i=o.left[0],max=o.right[0]; i<=max; i++) {
			if(b[0][i].state == 1) return true;
		};
		
		return false;
	},
	clearFullRow : function(){
		var b = this.board,
			o = this.block.real.getMostCoords(),
			bot = o.bottom[1],
			top = o.top[1],
			clearLineLength = 0;
		
		for (var i=bot; i>=top; i--) {
			if(b[i] === undefined) continue;
			var len = 0;
			for (var j=0,jlen=b[i].length; j<jlen; j++) len += b[i][j].state;
			if (len == this.colLength) {
				b.splice(i, 1);
				b.unshift(this.createBoardColArray());
				clearLineLength++;
				i++;				
			}
		};
		
		return clearLineLength;
	},
	next : function(){
		var clearLineLength = this.clearFullRow();
		if(this.chkGameOver()){
			this.stop();
			this.drawGameOver();
			this.assignController("terminate");
			return;
		}
		this.block.real = null;
		this.assignController("next", clearLineLength);
		this.play();		
	},
	hold : function(){
		this.removeBlockCoords();
		if(this.holdBlock == null){
			this.holdBlock = this.block.real;
			this.assignController("hold", "set");
			this.block.real = null;
			this.play();
		} else {
			var block = this.assignController("hold", "get");
			if(block){
				this.holdBlock = this.block.real;
				this.assignController("hold", "set");
				this.block.real = null;
				this.insertBlock(block);
				this.play();
			}
		}
		return false;		
	},
	drop : function(){
		this.setBlockCoords(this.block.dum.coords);
		this.markBlockCoords();
		this.draw();
		this.next();	
	},
	play : function(d){
		this.stop();
		if(this.terminate) return;
		this.draw();
		
		if (this.block.real == null) {
			var block = this.getBlock();  
			this.assignController("nextBlockUpdate");
			this.nextBlock = this.assignController("getNextBlock");
			this.insertBlock(block);
			this.play();
		}
		else {
			var self  = this;
			var speed = this.getGameMember("speed"); 
			this.doEvent(DOWN_KEY);
			this.moving = setTimeout(function(){
				self.play();
			}, speed);
		}
		
	},
	stop : function(){
		if(this.moving == null) return;
		clearTimeout(this.moving);
		this.moving = null;	
	},
	getNextBlocks : function(){
		return (this.nextBlock != null) ? [this.nextBlocks[this.nextBlocks.length-1]] : this.nextBlocks;
	},
	
	//overwritten
	getBlock : function(){
		var len   = this.assignController("nextBoardLength") - this.nextBlocks.length ,
			block;
		
		if(this.nextBlock == null){
			for(var i=0;i<len;i++){
				this.nextBlocks.push(this.blockFactory.getBlock());
			}
			block = this.nextBlocks.shift();
		} else {
			block = this.nextBlock;
			this.assignController("removeNextBlockBoard");
		}
		this.nextBlocks.push(this.blockFactory.getBlock());

		return block;
	},
	confirmJammed : function(type, coords){
		var	a  = this.board,
			co = this.block.real.getSortedCoords(coords),
			row, col;
		
		if (type == 'height') {
			for (var j in co) {
				col = parseInt(j);
				row = co[j][0];
				
				if (this.block.real.coordsOnMe(col, row) === true || row < 0) 
					continue;
				
				if (a[row][col].state == 1) {
					return true;
				}
			}
			
		}
		
		else if(type == 'width'){
			for (var j in co) {
				col = parseInt(j);

				if (co[j].length == 1) {
					row = co[j][0];
					
					if (this.block.real.coordsOnMe(col, row) === true || row < 0) 
						continue;
					else 
						if (a[row][col].state == 1) {
							return true;
						} 
				}
				else {
					if (co[j].length > 1) {
						for (var i = 0,len=co[j].length; i<len ; i++) {
							row = co[j][i];
							if (this.block.real.coordsOnMe(col, row) === true || row < 0) continue;
							else if(a[row][col].state == 1){
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	},
	chkCoordsError : function(keyCode, coords){
		var	a  = this.board,
			mo = this.block.real.getMostCoords(coords);
		
		if(keyCode == UP_KEY){
			var lcol = mo.left[0], 
				rcol = mo.right[0],
				newCoords = null;
			
			if (lcol < 0) 
				newCoords = this.block.real.moveCoords(-lcol, 0, 'get', coords);
			else if(rcol > this.colLength - 1) 
				newCoords = this.block.real.moveCoords((this.colLength - 1 - rcol), 0, 'get', coords);
			
			if (this.confirmJammed('width', newCoords || coords) === true) 
				return 'jammedWidth';
			else if(newCoords !== null) 
				return newCoords;
		}		
		else if(keyCode == DOWN_KEY){
			if(mo.bottom[1] > this.rowLength - 1) 
				return 'jammedHeight';
			
			var col = mo.bottom[0],
				row = mo.bottom[1];
			if(row < 0) return false;
			
			if (a[row][col].state == 1) 
				return 'jammedHeight';
			else if(this.confirmJammed('height', coords) === true) 
				return 'jammedHeight';
		}	
		else if(keyCode == LEFT_KEY || keyCode == RIGHT_KEY){
			if(mo.right[0]  > this.colLength - 1 || mo.left[0] < 0) 
				return 'jammedWidth';	
			if(this.confirmJammed('width', coords) === true)
				return 'jammedWidth';			
		}

		return false;
	},
	doEvent : function(keyCode){
		if (!this.block.real) return;
		
		var coords,
			chkResult,
			realBlock;

		realBlock = this.block.real;
		
		if (keyCode == UP_KEY) 
			coords = realBlock.getRotateCoords();
		else if (keyCode == DROP_KEY) {
			this.drop();
			return;			
		}
		else 
			coords = realBlock.move(keyCode, 'get');
			
		chkResult = this.chkCoordsError(keyCode, coords);
		
		if (chkResult === 'jammedHeight') {
			this.next();
			return;
		} 
		else if (chkResult === 'jammedWidth'){
			return;	
		} 
		else if(chkResult instanceof Array){
			coords = chkResult;
		}
		
		this.setBlockCoords(coords);
		this.markBlockCoords();
		this.draw();
	},
	chkKey : function(keyCode){
		for (var i =0, len = this.eventKeyList.length; i<len; i++){
			if(this.eventKeyList[i] == keyCode) return true;
		}
		return false;
	},

	unbindEvent : function(){
		Event.remove(document.documentElement, 'keydown', this.keyEvent);
	},
	bindEvent : function(){
		var self = this;
		
		this.keyEvent = function(e){
			var event = e || window.event;
			if(event.keyCode == F5_KEY) return false;
			if(self.chkKey(event.keyCode) === false) return false;
			else if(event.keyCode == HOLD_KEY){
				if(self.assignController("hold", "holdAble") === false) return false;
				self.hold();
				return false;
			}
			else {
				self.doEvent(event.keyCode);
				return false;
			}
			
			return false;						
		}
		Event.add(document.documentElement, 'keydown', this.keyEvent);
	},
	getSendBoard : function(){
		if(this.block.real === null || this.terminate === true) return this.board;
		
		var board = this.board.concat(),
			p     = this.block.real.coords;	

		for (var j = 0,len=p[0].length; j<len ; j++) {
			var row = p[1][j],
				col = p[0][j];
			
			if(row < 0) continue;	
			board[row][col].setState(0);
		}
	
		return board;
	},
	// overwritten
	insertInfo : function(){
		if(!this.usernum || !this.username) return;
		var wrapInfo = document.getElementById('myBoardInfo');
		
		this.usernumElem    = wrapInfo.getElementsByTagName('strong')[0];
		this.usernameElem   = wrapInfo.getElementsByTagName('span')[0];
	
		this.usernumElem.innerHTML  = this.usernum;
		this.usernameElem.innerHTML = this.username; 
	},
	isAttacked: function(line, attacker){
		var a = this.board,
			n = Math.round(Math.random()*(this.colLength-1)),
			c = this.createBoardColArray(1, DEAD_BLOCK, n),
			block = this.block;
			
		for(var i = 0; i<line; i++){
			a.push(c.concat());
		}
		
		a.splice(0, (a.length - this.rowLength));
		this.draw();
		
		var coords = block.real.moveCoords(0, -line, "get"),
			bottom = block.real.getMostCoords(coords).bottom[1];
		
		if(bottom < -1) {
			line = 1;
		}
		
		block.real.moveCoords(0, -line, "set")
		block.dum.setCoords(this.block.real);
		
		this.assignController("send");
	
	},
	getGameMember : function(meber){
		return Game[meber];
	},
	assignController : function(type, param){
		var game = Game;
		
		switch (type) {
			case "send":
				game.sendBoard(this.getSendBoard(), this.terminate);
				break;
			case "terminate" :
				game.sendBoard(this.getSendBoard(), this.terminate);
				game.terminate();
				break;
			case "next" :
				game.doClearLine(param);
				game.updateStateForNext();
				game.sendBoard(this.board, this.terminate);
				break;
			case "hold" :
				if(param == "set") game.setHoldBlock(this.holdBlock);
				else if(param == "get") return game.getHoldBlock();
				else if(param == "holdAble") return game.holdBlockBoard.holdAble;
				break;
			case "removeNextBlockBoard":
				game.nextBoardCommander.removeCurrentBoard();
				break;
			case "getNextBlock" :
				return game.nextBoardCommander.getBlock();
				break;
			case "nextBlockUpdate" :
				game.nextBlockUpdate(this.getNextBlocks());
				break;
			case "nextBoardLength" :
				return game.nextBoardCommander.boardLength;
				break;
			default:
				break;
		}
	},
	setDumAble : function(boolean){
		this.dumAble = !boolean;
	}
});

/*
 * NextBlockBoard
 */
oop.declareClass('tetris', 'NextBlockBoard', tetris.Board, {
	//constructor
	create : function(options){
		this._init(options);
	},
	markBlockCoords : function(){
		var a = this.board,
		b = this.block,
		p = b.coords;
	
		for (var j = 0, len=p[0].length; j < len ; j++) {
			var row = p[1][j],
				col = p[0][j];
			
			if(row < 0) continue;
			try {
				a[row][col] = new Dot(b.dotState, b.type);
				
			} catch(e){
				alert(1);
			}

		}			
	},
	//overwritten
	setBlock : function(block){
		if(this.block !== null) this.removeBlockCoords();
		block.setOriginCoords();
		if(block.type != LONG_BLOCK) block.moveCoords(0, 1, 'set');
		this.block = block;
		this.markBlockCoords();
		this.draw();		
	}
});
/*
 * holdBlockBoard
 */
oop.declareClass('tetris', 'HoldBlockBoard', tetris.Board, {
	//constructor
	create : function(options){
		this._init(options);
	},
	
	increaseCount : function(){
		this.countHold++;
	},
	
	initAble : function(viewElement){
		this.limitHold   = 5;
		this.countHold   = 0;	
		this.holdAble    = true;
		if(viewElement) this.setViewer(viewElement);
		else this.initViewer();
	},
	
	setViewer : function(viewElement){
		this.viewElement = viewElement;
	},
	
	initViewer : function(){
		this.viewElement.innerHTML = "";
	},
	
	updateHoldState : function(){
		if(this.countHold < this.limitHold) this.viewElement.innerHTML = this.countHold + ' / ' + this.limitHold;
		else this.viewElement.innerHTML = "<strong style='color:red'>" + this.countHold + ' / ' + this.limitHold + "</strong>"		
	},
	//overwritten
	setBlock : function(block){
		if(this.block !== null) this.removeBlockCoords();
		
		block.setOriginCoords();
		if(block.type != LONG_BLOCK) block.moveCoords(0, 1, 'set');
		
		this.block = block;
		this.markBlockCoords();
		this.draw();			
	}
});
/*
 * opponentBoard
 */
oop.declareClass('tetris', 'OpponentBoard', tetris.Board, {
	//constructor
	create : function(options){
		this._init(options);
	},
	setCanvas : function(canvas){
		this.setCanvas.inherited.call(this, canvas);
	},
	insertInfo : function(){
		if(!this.usernum || !this.username) return;
		var wrapInfo = this.canvas.el.parentNode.getElementsByTagName('div')[0];
		this.usernumElem    = wrapInfo.getElementsByTagName('strong')[0];
		this.usernameElem   = wrapInfo.getElementsByTagName('span')[0];
		
		this.usernumElem.innerHTML  = this.usernum;
		this.usernameElem.innerHTML = this.username; 
		
	},
	update : function(board, terminate){
		this.board     = board;
		this.terminate = terminate;
		this.draw();
	},
	//overwritten
	draw : function(){
		var ctx       = this.canvas.ctx, 
		    a         = this.board, 
		    fillImg   = (this.terminate === true) ? window[DEAD_BLOCK] : null, 
		    p;
			
		this.canvas.ctx.clearRect(0, 0, this.width, this.height);
		for (var i = a.length - 1; i >= 0; i--) {
			for (var j = 0,len=a[i].length; j < len; j++) {
				var bp = a[i][j];
				if(bp.state != 1) continue;
				p = [j*this.blockSize[0], i* this.blockSize[1]];
				ctx.drawImage(fillImg || window[bp.type], p[0], p[1], this.blockSize[0], this.blockSize[1]);
			}
		}
	}	

});