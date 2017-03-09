"use strict";

/* 对象结构设计：
    所有的 class 用 constructor 作为构造函数名字， 用 superClass 引用基类
*/

// 构造基础类型
function BaseClass(){}
BaseClass.prototype.constructor = function(){};
BaseClass.superClass = Object.prototype;

var dynaform = {
	defineClass: function(superClassOpt, body){
		if( typeof(superClassOpt) == "function" ){
			helper.assertNotEq(null, body, "require body");
		} else {
			helper.assertEq(null, body, "duplicated body");

			body = superClassOpt;
			superClassOpt = BaseClass;
		}

		var theClass = function(){
			if( arguments.length == 1 && arguments[0] === BaseClass ) return; // skip when internal new
			this.constructor.apply(this, arguments);
		};

		theClass.superClass = superClassOpt.prototype;
		theClass.prototype = new superClassOpt(BaseClass); // 将 BaseClass 作为空参数判断标志

		dynaform.extend(theClass.prototype, body);

		return theClass;
	},
	extend: function (base, ex) {
		for (var key in ex) {
			if (ex.hasOwnProperty(key)) {
				base[key] = ex[key];
			}
		}
	},

};

if (!this.window) {
	//dynaform.canvas = require('canvas');
	exports.dynaform = dynaform;
}

// 工具类
var helper = {
	requireArgs: function(){
		if( arguments.length == 0 ) throw "require arguments";
		for(var i = 0; i < arguments.length; ++i)
			if( arguments[i] == null )
				throw "require argument " + i;
	},
	assertTrue: function(istrue, message){
		if( !istrue )
			throw (message? message: "assertTrue fail: " + istrue);
	},
	assertFalse: function(isfalse, message){
		if( !isfalse )
			throw (message? message: "assertFalse fail: " + isfalse);
	},
	assertNull: function(theNull, message){
		if( !(theNull == null) )
			throw (message? message: "assertNull fail: " + theNull);
	},
	assertNotNull: function(theNotNull, message){
		if( !(theNotNull != null) )
			throw (message? message: "assertNotNull fail: " + theNotNull);
	},

	assertEq: function(expect, value, message){
		if( !(expect == value) )
			throw (message? message: "assert fail:" + expect + "!=" + value);
	},

	assertNotEq: function(expect, value, message){
		if( !(expect != value) )
			throw (message? message: "assert fail:" + expect + "==" + value);
	},

	isArray : function(obj){return toString.apply(obj) === '[object Array]';},

	isDefined : function(obj, propName){ return obj != null && obj.hasOwnProperty(propName); },

	hasProperty : function(obj, propName){ return obj != null && typeof(obj[propName]) != "undefined"; },

	getProperty : function(obj, propName){ return obj != null ? obj[propName] : null; },

	startWith : function(str, substr){
		if( str != null && substr != null && str.length >= substr.length ){
			return str.indexOf(substr) == 0;
		}
		return false;
	},

	endsWith : function(str, substr){
		if( str != null && substr != null && str.length >= substr.length ){
			var pos = str.indexOf(substr);
			return pos >= 0 && pos + substr.length == str.length;
		}
		return false;
	},

	substrBefore : function(str, substr){
		if( str != null && str.length > 0 && substr != null && substr.length > 0 ){
			var pos = str.indexOf(substr);
			return pos == -1 ? "" : str.substr(0, pos);
		}

		return str;
	},

	substrAfter : function(str, substr){
		if( str != null && str.length > 0 && substr != null && substr.length > 0 ){
			var pos = str.indexOf(substr);
			return pos == -1 ? "" : str.substr(pos + substr.length);
		}

		return str;
	},

	pushAll: function(arr, args){
		if( helper.isArray(arr) ){
			for(var i = 1; i < arguments.length; ++i)
				arr.push(arguments[i]);
		}
	},

	// 遍历数组的每一个元素 callback(item, index)
	eachArray : function(arr, callback){
		if( helper.isArray(arr) ){
			var len = arr.length;
			for(var i = 0; i < len; ++i)
				callback(arr[i], i);
		}
	},

	// 遍历对象的所有成员，包括继承来的、属性、方法。 callback(propName, propValue)
	eachMember : function(obj, callback){
		for(var prop in obj){
			callback(prop, obj[prop]);
		}
	},

	// 遍历对象的所有自身定义的成员，包括属性、方法。 callback(propName, propValue)
	eachDefinedMember : function(obj, callback){
		for(var prop in obj){
			if( obj.hasOwnProperty(prop) )
				callback(prop, obj[prop]);
		}
	},

	// 遍历对象的所有属性。 callback(propName, propValue)
	eachProperty : function(obj, callback){
		for(var prop in obj){
			if( typeof(obj[prop]) != "function" )
				callback(prop, obj[prop]);
		}
	},

	// 遍历对象的所有自身定义的成员，包括属性、方法。 callback(propName, propValue)
	eachDefinedProperty : function(obj, callback){
		for(var prop in obj){
			if( obj.hasOwnProperty(prop) && typeof(obj[prop]) != "function" )
				callback(prop, obj[prop]);
		}
	},

	// src: obj or []
	copy : function(dest, src, overwrite){
		if( dest != null || src != null ){
			var func = function(prop, value){
				if( overwrite == null || overwrite == true || !dest.hasOwnProperty(prop) )
					dest[prop] = value;
			};

			if( helper.isArray(src) ){
				helper.eachArray(src, function(item, index){ helper.eachDefinedProperty(item, func); });
			}else {
				helper.eachDefinedProperty(src, func);
			}
		}

		return dest;
	},

};

// 输出类
dynaform.Output = dynaform.defineClass({
	constructor: function(){
		this.uniqueNumber = 0;
	},
	getUniqueNumber: function(){ return this.uniqueNumber++; },
	write: function(text){},
	writeln: function(text){ this.write(text);  this.newline(); },
	newline: function(){},
	flush: function(){},
	close: function(){ this.flush(); },
});

// 控件类，控件负责控制布局，负责输出框架代码，并选择控件放入框架位置。
// 部分控件会需要解释 control-layout 的内容，以控制控件存放位置
dynaform.Control = dynaform.defineClass({
	// 总入口
	generate: function(output, field){
		helper.requireArgs(output, field);
	},

});

/* 设计：
按照层次下降，扫描每一个字段定义，将字段定义对象化成field和arrayfield，然后调用这些field进行处理。
类层次里，field是基础，负责基本的对象生成逻辑， complexfield是公共基类，负责派生 form 和 arrayfield。
对象结构上，所有的对象都组成相互相关关联的关系
*/

// 存储各种对象的默认值
dynaform.defaults = {
	"type" : {
		"type": undefined,
		"source": undefined,
		"maxLength": undefined,
		"minLength": undefined,
		"validation": undefined,
	},
	"field" : {
		"type": undefined,
		"label": undefined,
		"default" : undefined,
		"value" : undefined,
		"required" : false,
		"readonly" : false,
	},
	"style" : {
		"control" : undefined, // 指定控件类型
		"control-layout": undefined, // 由控件解释的布局位置
		"class": undefined, // 风格样式
		"control-prefix": undefined,
		"control-postfix": undefined,
		"control-template": undefined,
	},
};

// 简单字段，不再包含下级字段
dynaform.Field = dynaform.defineClass({
	constructor: function(form, parent, fieldName, fieldInfo){
		helper.requireArgs(fieldName, fieldInfo);

		this.form = form;
		this.parent = parent;
		this.fieldName = fieldName;
		this.fieldInfo = fieldInfo;
		this.fieldInfo.name = fieldName; // 名字优先覆盖
	},

	// 分析并组装结构的入口，返回 control 对象
	createControl: function(){
		var ctrlName = this.getStyleInfo("control");
		var ctrl = dynaform.controls[ctrlName];
		helper.assertNotNull(ctrl, "unknown control " + ctrlName)
		return new ctrl();
	},

	// 生成的总入口
	generate: function(output){
		this.beginGenerate(output);
		this.doGenerate(output);
		this.endGenerate(output);
	},

	beginGenerate: function(output){
		this.parent.onChildBegin(output, this);
	},

	doGenerate: function(output){
		var ctl = this.createControl();
		if( ctl ){
			ctl.generate(output, this);
		}
	},

	endGenerate: function(output){
		this.parent.onChildEnd(output, this);
	},

	getStyleInfo : function(styleName){ return this.fieldInfo[styleName] || this.form.getStyleInfo(this.fieldName, styleName); },
	getTypeInfo : function(typeName){ return this.form.getTypeInfo(typeName); },
});

// 复杂字段，包含子字段
dynaform.ComplexField = dynaform.defineClass(dynaform.Field, {
	constructor: function(form, parent, fieldName, fieldInfo){
		dynaform.ComplexField.superClass.constructor.apply(this, arguments);
	},

	createChildField: function(){
		var fields = [];
		var self = this;
		this._eachChildFieldInfo(function(name, fInfo){
			var field;
			if( self.isArrayField(fInfo) )
				field = self.createArrayField(name, fInfo);
			else
				field = self.createField(name, fInfo);

			fields.push(field);
		});
		return fields;
	},

	doGenerate: function(output){
		var self = this;
		var fields = this.createChildField();
		helper.eachArray(fields, function(field){
			field.generate(output);
		});
	},

	onChildBegin: function(output){},
	onChildEnd: function(output){},

	// callback(propName, propValue)
	_eachChildFieldInfo : function(callback){},

	isArrayField : function(fieldInfo){return helper.endsWith(fieldInfo.type, "[]");},
	extractArrayField : function(fieldInfo){return helper.substrBefore(fieldInfo.type, "[]");},

	createField : function(fieldName, fieldInfo){
		return new dynaform.Field(this.form, this, fieldName, fieldInfo);
	},
	createArrayField : function(fieldName, fieldInfo){
		return new dynaform.ArrayField(this.form, this, fieldName, fieldInfo, this.getTypeInfo(fieldName));
	},

});


// 表单，负责持有所有的数据，并分发给下方的组件
dynaform.Form = dynaform.defineClass(dynaform.ComplexField, {

	constructor: function(formInfo, styles, types, entities){
		// 调用基类 constructor(form, parent, fieldName, fieldInfo)
		dynaform.Form.superClass.constructor.apply(this, [null, null, formInfo.name, formInfo]);
		// 初始化自身属性
		this.formInfo = formInfo;
		this.styles = styles;
		this.types = types;
		this.entities = entities;
	},

	beginGenerate: function(output){},

	endGenerate: function(output){},

	// callback(propName, propValue)
	_eachChildFieldInfo : function(callback){
		helper.eachDefinedProperty(this.formInfo.fields, callback);
	},

	createField : function(fieldName, fieldInfo){
		return new dynaform.Field(this, this, fieldName, fieldInfo);
	},
	createArrayField : function(fieldName, fieldInfo){
		return new dynaform.ArrayField(this, this, fieldName, fieldInfo, this.getTypeInfo(fieldName));
	},

	// 直接返回存储的样式
	getStyleInfo : function(fieldNameOpt, styleName){
		if( arguments.length == 0 ) throw "require arguments";
		var styles = this.styles;
		if(arguments.length == 1){
			styleName = fieldNameOpt;
		} else {
			styles = this.styles[fieldNameOpt];
		}
		return (styles == null ? null: styles[styleName]) || this.styles["*"][styleName];
	},
	// 从存储的类型中获取类型信息
	getTypeInfo : function(typeName){ return this.types[typeName] || this.entities[typeName]; },
});



// 存储的是当前field和child的字段信息，其中child信息是把 fieldtype[] 尾部 [] 去掉查询得到
dynaform.ArrayField = dynaform.defineClass(dynaform.ComplexField, {
	constructor: function(form, parent, fieldName, fieldInfo, childInfo){
		// 调用基类 constructor(form, parent, fieldName, fieldInfo)
		dynaform.ArrayField.superClass.constructor.apply(this, arguments);
		// 初始化自身属性
		this.childInfo = childInfo;
	},

	// callback(propName, propValue)
	_eachChildFieldInfo : function(obj, callback){
		helper.eachDefinedProperty(this._getChildren(), callback);
	},

	_getChildren : function(){ return this.childInfo; },

});


// 控件生成器列表
dynaform.controls = {
	"input" : dynaform.defineClass(dynaform.Control, {
		_typeMap : {
			"int" : "number",
		},
		generate: function(output, field){
			var fInfo = field.fieldInfo;
			var out = [];
			var uid = output.getUniqueNumber();
			var idprefix = "id-input-";

			if( field.getStyleInfo("control-layout") == "label"){
				helper.pushAll(out, "<", "label for='", idprefix, uid , "' >", fInfo.label, "<", "/label>");
			}
			helper.pushAll(out, "<", "input id='", idprefix, uid ,"' name='", fInfo.name, "' ",
				" type='", (this._typeMap[fInfo.type] || "text"), "' ");
			if( fInfo.value != null || fInfo["default"] != null ){
				helper.pushAll(out, " value='",
					(fInfo.value != null? fInfo.value : fInfo["default"]),
					"' ");
			}
			if( fInfo.readonly ) out.push(" readonly ");
			if( fInfo["class"] ) helper.pushAll(out, " class='", fInfo["class"], "'");

			helper.pushAll(out, " /", ">");
			output.write(out.join(""));
		},
	}),

	"textArea" : dynaform.defineClass(dynaform.Control, {

		generate: function(output, field){
			var fInfo = field.fieldInfo;
			var out = [];
			var uid = output.getUniqueNumber();
			var idprefix = "id-txta-";

			if( field.getStyleInfo("control-layout") == "label"){
				helper.pushAll(out, "<", "label for='", idprefix, uid , "' >", fInfo.label, "<", "/label>");
			}
			helper.pushAll(out, "<", "textarea id='", idprefix, uid ,"' name='", fInfo.name, "' ");
			if( fInfo.readonly ) out.push(" readonly ");
			if( fInfo["class"] ) helper.pushAll(out, " class='", fInfo["class"], "'");
			out.push(">");
			if( fInfo.value != null || fInfo["default"] != null ){
				helper.pushAll(out, fInfo.value != null? fInfo.value : fInfo["default"]);
			}

			helper.pushAll(out, " <", "/textarea>");
			output.write(out.join(""));
		},
	}),
};

// 合法的输出器列表
dynaform.outputs = {
	HtmlOutput : dynaform.defineClass(dynaform.Output, {}),
	InnerHtmlOutput : dynaform.defineClass(dynaform.Output, {
		constructor: function(id){
			dynaform.outputs.InnerHtmlOutput.superClass.constructor.apply(this, arguments);
			this.id = id;
			this._content = [];
		},
		write: function(text){ this._content.push(text); },
		newline: function(){ this._content.push("<br />");},
		flush: function(){
			var elem = document.getElementById(this.id);
			var html = elem.innerHTML;
			elem.innerHTML = html + this._content.join("");
			this._content = [];
		},
	}),
};
