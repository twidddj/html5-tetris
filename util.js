/*
 * oop architecture
 * in jwebsocket
 * 
 */
var oop = {};
oop.declareClass = function( aNamespace, aClassname, aAncestor, aFields ) {
	var lNS = self[ aNamespace ];
	if( !lNS ) { 
		lNS = self[ aNamespace ] = { };
	}
	var lConstructor = function() {
		if( this.create ) {
			this.create.apply( this, arguments );
		}
	};
	lNS[ aClassname ] = lConstructor;
	var lField;
	for( lField in aFields ) {
		lConstructor.prototype[ lField ] = aFields[ lField ];
	}
	if( aAncestor != null ) {
		if( !aAncestor.descendants ) {
			aAncestor.descendants = [];
		}
		aAncestor.descendants.push( lConstructor );
		for( lField in aAncestor.prototype ) {
			var lAncMthd = aAncestor.prototype[ lField ];
			if( typeof lAncMthd == "function" ) {
				if( lConstructor.prototype[ lField ] ) {
					lConstructor.prototype[ lField ].inherited = lAncMthd;
				} else {
					lConstructor.prototype[ lField ] = lAncMthd;
				}
				lConstructor.prototype[ lField ].superClass = aAncestor;
			}
		}
	}
};

oop.addPlugIn = function( aClass, aPlugIn ) {
	if( !aClass.fPlugIns ) {
		aClass.fPlugIns = [];
	}
	aClass.fPlugIns.push( aPlugIn );
	for( var lField in aPlugIn ) {

		if( !aClass.prototype[ lField ] ) {
			aClass.prototype[ lField ] = aPlugIn[ lField ];
		}
	}
	if( aClass.descendants ) {
		for( var lIdx = 0, lCnt = aClass.descendants.length; lIdx < lCnt; lIdx ++ ) {
			oop.addPlugIn( aClass.descendants[ lIdx ], aPlugIn );
		}
	}
};

var util = {};
util.$ = function(elementId){
	return document.getElementById(elementId);
}

/*
 * RandomNumberGenerator(from http://stackoverflow.com/)
 */
function RandomNumberGenerator(){   
	var d = new Date();   
	this.seed = 2345678901 + (d.getSeconds() * 0xFFFFFF) + (d.getMinutes() * 0xFFFF);   
	this.A = 48271;  
	this.M = 2147483647;   
	this.Q = this.M / this.A;   
	this.R = this.M % this.A;   
	this.oneOverM = 1.0 / this.M;   
	return this; 
} 
RandomNumberGenerator.prototype.next = function(){
	var hi = this.seed / this.Q;
	var lo = this.seed % this.Q;
	var test = this.A * lo - this.R * hi;
	if (test > 0) {
		this.seed = test;
	}
	else {
		this.seed = test + this.M;
	}
	
	return (this.seed * this.oneOverM);
}

/*
 * Matrix
 * twidddj
 * 
 */
var $m = function(matrix){
	if(matrix instanceof Matrix) return matrix;
	return new Matrix(arguments[0]);
}

function Matrix(a){
	if(a) this.array = a;
}

Matrix.prototype = {
	newMatrix : function(b){
		if(typeof b == 'function'){
			b = b.call(this);
		} 
		if(b instanceof Matrix) return b;
		else return new Matrix(b);
	},
	
	create3X3FixedMatrix : function(){
		this.array = [
			[1, 0 ,0],
			[0, 1 ,0],
			[0, 0 ,1]
		]
		
		return this;
	},
		
	create4X4FixedMatrix : function(){
		this.array = [
			[1, 0 ,0, 0],
			[0, 1 ,0, 0],
			[0, 0 ,1, 0],
			[0, 0 ,0, 1]
		]

		return this;
	},
	
	sum : function(b){
		var a = this.array,
			b = this.newMatrix(b).array,
			alen  = a.length,
			ailen = a[0].length;
		
		if(alen != b.length && ailen != b[0].length) return false;
		var array = [];
		for (var i=0;i<alen;i++)
		{
			array[i] = new Array();
			for (var j=0;j<ailen;j++)
			{
				array[i][j] = a[i][j] + b[i][j];
			}
		}
		this.array = array;
		return this;
	},

	difference : function(b){
		var a     = this.array, 
		    b     = this.newMatrix(b).array,
			array = [],
			alen  = a.length,
			ailen = a[0].length
			blen  = b.length;
			
		if(alen != blen && ailen != b[0].length) return false;

		for (var i=0;i<alen;i++)
		{
			array[i] = new Array();
			for (var j=0;j<ailen;j++)
			{
				array[i][j] = a[i][j] - b[i][j];
			}
		}
		this.array = array;
		return this;
	},
	
	multiple : function(b){
		var a     = this.array,
			b     = this.newMatrix(b).array,
			array = [],
			result,
			alen = a.length,
			blen = b.length;
			
		
		if(b instanceof Array){
			if(a[0].length != blen) return false;
			for (var i=0;i<blen;i++)
			{
				array[i] = new Array();
				for (var j=0, jlen=b[0].length;j<jlen;j++)
				{
					result = 0;
					for (var k=0;k<blen;k++)
					{
						result += a[i][k] * b[k][j];
					}
					array[i][j] = result;
				}
				
			}
		} else if(typeof b == 'number'){

			for (var i=0;i<alen;i++)
			{
				array[i] = new Array();
				for (var j=0, ilen=a[i].length;j<ilen;j++)
				{
					array[i][j] = a[i][j] * b;
				}
			}

		} else return false;

		this.array = array;
		return this;
	},

	transpose : function(){
		var a = this.array,
			array = [];
		for (var i=0,len=a[0].length;i<len;i++)
		{
			array[i] = new Array();
			for (var j=0,jlen=a.length;j<len;j++)
			{
				array[i][j] = a[j][i];
			}
		}
		this.array = array;
		return this;
	},

	getTrace : function(a){
		// 대각합
		var	a = a || this.array,
			trace = 0;

		if(!this.isSquareMatrix()) return false;

		for (var i=0,len=a[0].length;i<len;i++)
		{
			trace += a[i][i];
		}
		return trace;
	},

	getArray : function(type, index){
		// Array of row type or col type 

	},

	chkInvertible : function(){
		// 가역행렬 체크
	},

	inverse : function(){
		// 역행렬
	},

	getIdentityMatrix : function(){
		// 단위행렬
		var a = this.array;
		if(a.length != a[0].length) return false;
		var array = [];
		for (var i=0,len=a.length;i<len;i++)
		{
			array[i] = new Array();
			for (var j =0,jlen=a[0].length;j<jlen;j++)
			{
				array[i][j] = 0;				
			}
			array[i][i] = 1;
		}
		return array;
	},

	transformIdentityMatrix : function(){
		// 객체의 행렬을 단위행렬로 변환
		var a = this.array;
		if(a.length != a[0].length) return false;
		for (var i =0,len=a.length;i<len;i++)
			a[i][i] = 1;
		return this;
	},

	square : function(exponent/*지수*/){
		// 제곱
		var temp = this.array;
		for (var i=1;i<exponent;i++)
		{
			this.multiple(temp);
		}
		return this;
	},

	isSquareMatrix : function(a){
		var a = a || this.array;
		if(a.length == a[0].length) return true;
		else return false;
	},

	write : function(){
		var a = this.array,
			s = '';
			
		if(!a) {
			return false;
		}
		
		if(typeof a == 'number'){
			s += "( " + a + " )<br />";
		}
		else if(!(a[0] instanceof Array)){
			document.write('[ ');
			for (var i=0, len=a.length;i<len;i++)
			{
				s += a[i];
				if(i+1<len)
					s += ", ";
			}
			s += ' ]<br />';
		}
		else {
			for (var i=0, len=a.length;i<len;i++)
			{
				s += '[ ';
				for (var j=0,jlen=a[i].length;j<jlen;j++)
				{
					s += a[i][j];
					if(j+1<jlen)
						s += ", ";
				}
				s += ']<br />';
			}
		}
		
		return s;
	}
}


/*
 * ArrayList
 * JAVA ArrayList
 * twidddj
 * 
 */
function ArrayList(){
	this.array = new Array();
}
ArrayList.prototype = {
	add : function(elem){
		this.array.push(elem);
	},
	
	remove : function(index){
		this.array.splice(index,1);
	},
	
	get : function(index){
		return this.array[index];
	},
	
	indexOf : function(elem){
		var array = this.array;
		for (var i=0, len = array.length; i<len; i++) 
			if(array[i] === elem) 
				return i;
		return -1;
	},
	
	size : function(){
		return this.array.length;
	},
	
	contains: function(elem){
		for (var i = 0, len = this.array.length; i<len; i++) 
			if (array[i] === elem) 
				return true;
		return false;
	},
	
	isEmpty : function(){
		if(this.array.length === 0) return true;
		else return false;
	},
	
	each : function(callback){
		for (var i = 0, len = this.array.length; i<len; i++){
			callback(this.array[i]);
		} 
	}		
}


/*
 * Event
 *	http://ejohn.org/projects/flexible-javascript-events/
 */
var Event = {
	add : function(obj, type, fn){
		if ( obj.attachEvent ) {
			obj['e'+type+fn] = fn;
			obj[type+fn] = function(){
				obj['e'+type+fn]( window.event );
			}
			obj.attachEvent( 'on'+type, obj[type+fn] );
		} else
			obj.addEventListener( type, fn, false );		
	},
	remove : function(obj, type, fn){
		if ( obj.detachEvent ) {
			obj.detachEvent( 'on'+type, obj[type+fn] );
		    obj[type+fn] = null;
	    } else
	    	obj.removeEventListener( type, fn, false );		
	}
	
}

/*
 * chunk
 * Steve Souders
 *   
 */

function chunk(array, process, context){
	setTimeout(function(){
		var item = array.shift();
		process.call(context, item);
		if(array.length > 0){
			setTimeout(arguments.callee, 100);
		}
	}, 100);
}

/*
 * Log
 * twidddj
 * 
 */
function Log(console){
	this.console  = console;
	this.username = null; 
	this.WSC      = null;
}

Log.prototype = {
	clear : function(){
		this.console.innerHTML = "";
		this.console.scrollTop = 0;
	},
	insert : function(sentence, mine){
		var p  = document.createElement("p"),
			scroll;
		
		if(mine) p.className = "mine";
		p.innerHTML = sentence;
		this.console.appendChild(p);
		
		scroll = this.console.scrollHeight - this.console.offsetHeight;
		
		this.console.scrollTop = scroll;
	},
	setUsername : function(username){
		this.username = username;
	},
	setWebsocket : function(WSC){
		this.WSC = WSC;
	},
	sendChatMsg : function(aPool, aText, aOptions){
		this.WSC.sendChatMsg(aPool, aText, aOptions);
		this.insert(this.username + " : " + aText, true);
	}
}

