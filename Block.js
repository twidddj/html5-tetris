/**
 * @author twidddj
 */

oop.declareClass('tetris', 'Block', null, {
	setCenter : function(){
		this.center = [this.coords[0][this.centerIndex], this.coords[1][this.centerIndex]];
	},
	setCoords : function(coords){
		this.coords = coords;
	},
	setOriginCoords : function(){
		this.coords = this.tempCoords;
	},
	writeCoords : function(){
		debug.innerHTML = $m(this.coords).write();
	},
	moveCoords : function(dx, dy, type, coords){
		var m      = $m().create3X3FixedMatrix(),	
			coords = coords || this.coords;
			 
			m.array[0][2] = dx;
			m.array[1][2] = dy;		
		
		m.multiple(coords);
	
		if(type == 'set') this.setCoords(m.array);
		else if(type == 'get') return m.array;
	},	
	getMostCoords : function(coords){
		var v = coords || this.coords;
		var l = r = b = t =[v[0][0], v[1][0]];
		 
		for (var i=0,len=v[0].length; i<len; i++) {
			if(v[0][i] > r[0]) r = [v[0][i] , v[1][i]];
			if(v[0][i] < l[0]) l = [v[0][i] , v[1][i]];
			if(v[1][i] < t[1]) t = [v[0][i] , v[1][i]];
			if(v[1][i] > b[1]) b = [v[0][i] , v[1][i]];
		};
		
		return {top:t, bottom:b, left:l, right:r};
	},
	getSortedCoords : function(coords){
		var v = coords || this.coords,
		 	o = {};

		for (var i=0,len=v[0].length;i<len; i++) {
			var row =v[1][i], col = v[0][i];

			if (!o[col]) {
				o[col] = [];
				o[col].push(row);
			}
			else if (o[col]){
				o[col].push(row);
				o[col].sort(function(a, b){return b-a;});
			}
		}
		
		return o;
	},
	coordsOnMe : function(col, row){
		var v = this.coords;
		for (var i=0,len=v[0].length; i<len; i++) {
			if(v[0][i] == col && v[1][i] == row) return true;
		};
		return false;
	}
});

tetris.Block.rotationMatrix  = [[0, -1, 0], [1, 0 , 0], [0, 0, 1]];
tetris.Block.rotationMatrix2 = [[0, 1, 0], [-1, 0 , 0], [0, 0, 1]];

oop.declareClass('tetris', 'RealBlock', tetris.Block, {
	create : function(blockType){
		this.coords      = blockType.coords;
		this.centerIndex = blockType.center-1;
		this.type        = blockType.type;
		this.degree      = 0;
		this.dotState    = 1;
		this.limitDegree = blockType.limitDegree;
		this.saveState   = {};
		this.center      = null;
		this.tempCoords  = this.coords.concat();
		this.setCenter(this.centerIndex);			
	},
	getRotateCoords : function(){
		if(this.limitDegree == 0) return this.coords;
		
		var m1     = $m().create3X3FixedMatrix(),
			m2     = $m().create3X3FixedMatrix(),
			m3;
		
		var m1Array = m1.array,
			m2Array = m2.array;
		
		if (this.limitDegree != 360) {
			if (this.degree >= this.limitDegree) {
				m3 = tetris.Block.rotationMatrix2;
				this.saveState.degree = this.degree - 90;
			}
			else {
				m3 = tetris.Block.rotationMatrix;
				this.saveState.degree = this.degree + 90;
			}
		} else m3 = tetris.Block.rotationMatrix;
		
		this.setCenter();
		
		var center = this.center;
		
		m1Array[0][2] = -center[0];
		m1Array[1][2] = -center[1];
		
		m2Array[0][2] = center[0];
		m2Array[1][2] = center[1];			
		
		m2.multiple($m(m3)).multiple(m1).multiple($m(this.coords));
		
		return m2.array;
	},
	move : function(keyCode, type){
		var coords; 
		
		switch(keyCode) {
			case LEFT_KEY:
			    coords = this.moveCoords(-1, 0, type);
				break;
			case UP_KEY:
			     coords = this.moveCoords(0, -1, type);
				break;				
			case RIGHT_KEY:
			   	 coords = this.moveCoords(1, 0, type);
				break;				
			case DOWN_KEY:
			    coords = this.moveCoords(0, 1, type);
				break;			
			default: 
				break;	
		}
		
		if(type == 'set') this.setCoords(m.array);
		else if(type == 'get') return coords;		
	},
	applyState : function(){
		for (var i in this.saveState){
			this[i] = this.saveState[i];
		}
	}
});


oop.declareClass('tetris','DummyBlock', tetris.Block,{
	create : function(container, realBlock){
		this.opacity = 0.4;
		this.type    = realBlock.type;
		this.dotState= 2;
		this.coords  = null;
		this.board   = container.board;
		this.realBlock  = realBlock;
		this.setCoords();
		//this.setColor();		
	},
	setColor: function(){
		var rgb = this.realBlock.color.replace(/^rgb\(/, '').replace(/\)$/, '');
		this.color = 'rgba(' + rgb + " , " + this.opacity + ")";
	},

	//overwritten
	setCoords : function(obj){
		var coords = null;
		
		if(obj instanceof tetris.RealBlock) {
			this.realBlock = obj;
		} else if(obj instanceof Array) {
			coords = obj;
		}
		
		var a  = this.board,
			o  = (coords === null) ? this.realBlock.getSortedCoords() : this.getSortedCoords(coords),
			tv, col, row, tempRow, full;
			
		for (var k in o){
			col = parseInt(k);
			row = o[k][0];
			
			tempRow = (tempRow === undefined) ? row : (tempRow < row)? row : tempRow;
			
			for (var i=row + 1,len=a.length; i<len; i++) {
				if(a[i] === undefined) continue;
				if (a[i][col].state == 1) {
					if (!tv) {
						tv = [row, i - 1];
					}
					else 
						if (tv[1] - tv[0] > (i - 1) - row) {
							tv = [row, i - 1];
						}
					break;
				} 
			};
			
			if(full != a.length)
				full = i == a.length ? i : 0;
		}
		
		if (!tv) {
			this.coords = this.realBlock.moveCoords(0, (a.length-1) - tempRow , 'get');
		}
		else {
			if (full == a.length && tv[1] - tv[0] > (full - 1) - tempRow) tv = [tempRow, full - 1];
			this.coords = this.realBlock.moveCoords(0, tv[1]-tv[0], 'get');
		}	
		
	}
});
