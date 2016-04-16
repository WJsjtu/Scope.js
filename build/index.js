/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Scope = __webpack_require__(1);

	var List = Scope.createClass({
	    data: [],
	    getRandom: function getRandom() {
	        this.data = [];
	        for (var i = 0; i < 20; i++) {
	            this.data.push(Math.random());
	        }
	    },
	    generate: function generate($handler, event) {
	        $handler.stopPropagation(event);
	        this.getRandom();
	        var $ul2DataElement = $handler.refs.ul2.update();
	    },
	    onActive: {
	        'li': function li($handler, event) {
	            $handler.stopPropagation(event);
	            console.log($handler);
	            $handler.ownerRef.$ele.find('li.active').removeClass('active');
	            $handler.$this.addClass('active');
	        }
	    },
	    getList: function getList() {
	        return this.data.map(function (ele) {
	            return Scope.createElement(
	                'li',
	                { onClick: function onClick() {
	                        console.log(ele);
	                    } },
	                ele
	            );
	        });
	    },
	    render: function render() {
	        var me = this;
	        console.log(me);
	        me.getRandom();
	        return Scope.createElement(
	            'div',
	            null,
	            Scope.createElement(
	                'a',
	                { onClick: me.generate },
	                me.props.label || 'try'
	            ),
	            Scope.createElement(
	                'div',
	                null,
	                Scope.createElement(
	                    'ul',
	                    { ref: 'ul1', style: 'display:inline-block;list-style:none;', onClick: me.onActive },
	                    me.getList()
	                ),
	                Scope.createElement(
	                    'ul',
	                    { ref: 'ul2', style: 'display:inline-block;list-style:none;', onClick: me.onActive },
	                    me.getList
	                )
	            )
	        );
	    }
	});

	var Wrapper = Scope.createClass({
	    tryout: function tryout($handler) {
	        console.log($handler);
	    },
	    render: function render() {
	        var me = this;
	        return Scope.createElement(
	            'div',
	            null,
	            Scope.createElement(
	                'a',
	                { onClick: me.tryout },
	                'tryout'
	            ),
	            Scope.createElement(List, { ref: 'List' })
	        );
	    }
	});

	$(function () {
	    window.List = List;
	    var a = Scope.render(Scope.createElement(
	        'div',
	        { 'class': 'hehe' },
	        Scope.createElement(Wrapper, { ref: 'fds' }),
	        Scope.createElement(List, { label: 'label' })
	    ), document.getElementById('test1'));
	    var b = Scope.render(Scope.createElement(Wrapper, { ref: 'fds' }), document.getElementById('test2'));
	    console.log(List, a, b);
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = Scope;

/***/ }
/******/ ]);