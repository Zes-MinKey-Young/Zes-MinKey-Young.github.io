"use strict";
(function($) {
	class Widget {
		constructor(params) {
			if (params instanceof jQuery) {
				if (params.length === 1) {
					params = params[0];
				}
			}
			if (params instanceof HTMLElement) {
				if (params.Widget && (params.Widget) instanceof Widget) {
					return params.Widget;
				}else {
					throw new Error("不可传入节点");
				}
			}
			this.init(params);
		}
		init(params, tag) {
			this.$element = $("<" + tag + "/>");
			this.element = this.$element[0];
			this.$element.addClass("zui-widget");
			this.element.Widget = this;
			this.disabled = false;
		}
		setDisabled(bool) {
			if (bool != this.disabled) {
				this.disabled = bool;
				if (bool) {
					this.addClass("disabled");
				}else {
					this.removeClass("disabled");
				}
				return true;
			}
			return false;
		}
		addClass(name) {
			this.$element.addClass("zui-widget-" + name);
		}
		removeClass(name) {
			this.$element.removeClass("zui-widget-" + name);
		}
	}
	class Button extends Widget {
		constructor(params) {
			super(params);
		}
		init(params) {
			super.init(params, "a");
			this.addClass("button");
			this.$element.css({
				display: "inline-block",
				backgroundColor: "#66ccff",
				borderRadius: "7px",
				padding: params.padding || "0.6em",
				color: params.fontColor || "#114514",
				minWidth: "5em",
				fontWeight: "bold",
				textAlign: "center"
			});
			this.$element.text(params.text);
		}
		click(handler) {
			var btn = this;
			this.$element.on("click", function () {
				if (!btn.disabled) {
					handler.apply(this, arguments);
				}
			});
		}
	}
	class Checkbox extends Widget {
		constructor(params) {
			super(params);
		}
		init(params) {
			super.init(params, "div");
			this.$element.addClass("checkbox");
			this.$element.css({
				display: "inline-block",
				width: "1.5em",
				height: "1.5em",
				border: "2px solid silver",
				borderRadius: "7px"
			});
			if (params.default) {
				this.toggle();
			}
			this.$element.on("click", function () {
				var checkbox = new Checkbox(this);
				checkbox.toggle();
			});
		}
		toggle() {
			if (this.on) {
				this.removeClass("checkbox-on");
			}else {
				this.addClass("checkbox-on");
			}
			this.on = !this.on;
		}
		val() {
			return this.on;
		}
	}
	class Input extends Widget {
		constructor(params) {
			super(params);
		}
		init(params) {
			super.init(params, "input");
			this.$element.attr("type", "text");
			this.$element.css({
				width: params.width || "100%",
				padding: "6px",
				borderRadius: "7px"
			});
			if (params.default) {
				this.$element.val(params.default);
			}
		}
		setDisabled(bool) {
			this.$element.attr("disabled", bool);
			return super.setDisabled(bool);
		}
		val() {
			return $.fn.val.apply(this.$element, arguments);
		}
	}
	class Layout extends Widget {
		constructor(params) {
			super(params);
		}
		init(params) {
			if (!Array.isArray(params)) {
				throw new TypeError("Layout需要传入数组");
			}
			super.init(params, "table");
			var $tr = $("<tr/>");
			var $tbody = $("<tbody/>");
			$tbody.append($tr);
			this.$element.css("margin", "4px 0");
			this.addClass("layout");
			this.$element.append($tbody);
			var last = null;
			$.each(params, function (_, each) {
				/*if (! (each instanceof Widget)) {
					throw TypeError("必须传入Widget");
				}*/
				var $td = $("<td/>").appendTo($tr);
				$td.css({
					verticalAlign: "middle",
					textAlign: "center"
				});
				if (typeof each === "string") {
					$td.html(each);
				}else if (each instanceof Checkbox) {
					$td.html(each.$element);
					if (typeof last === "string") {
						$td.css("paddingLeft", "3em");
					}
				}else if (each instanceof Input) {
					$td.html(each.$element);
					each.$element.css({
						boxSizing: "border-box",
						height: "100%"
					});
					if (typeof last === "string") {
						$td.css("paddingLeft", "1em");
					}
				}else if (each instanceof Button) {
					$td.html(each.$element);
					if (last instanceof Button) {
						$td.css("paddingLeft", "1em");
					}
				}
				last = each;
			});
		}
	}
	class Span {
		constructor() {
			var $node1 = $("<div/>").addClass("zui-node");
			var $node2 = $("<div/>").addClass("zui-node");
			var between = $("<div/>").addClass("zui-between");
			this.between = between;
			
			this.node1 = {
				holder: null,
				$ele: $node1
			};
			this.node2 = {
				holder: null,
				$ele: $node2
			};
			this.places = [];
			this.dragged = null;
			this.placeAmount = 0;
			var that = this;
			
			$.each({1: this.node1,2: this.node2}, function (i, node) {
				node.$ele.on("click", function() {
					if (that.dragged === node) {
						return;
					}
					if (that.dragged) {
						that.dragged.$ele.removeClass("zui-node-dragged").css("box-shadow", "");
					}
					that.dragged = node;
					node.$ele.addClass("zui-node-dragged");
				});
				
			});
		}
		newPlace(id) {
			var that = this;
			var $place = $("<div/>").addClass("zui-place");
			
			var place = {
				$ele: $place,
				index: this.placeAmount++,
				hold: null,
				id: id || this.placeAmount
			};
			this.places.push(place);
			if (!this.node1.holder) {
				$place.append(this.node1.$ele);
				this.node1.holder = place;
			}else if (!this.node2.holder) {
				$place.append(this.node2.$ele);
				this.node2.holder = place;
			}
			$place.on("dragover", function(e) {
				if (place !== that.dragged.holder) {
					e.originalEvent.preventDefault();
					console.log("prevented");
				}else {
					console.log("拖拽无效");
				}
			});
			$place.on("click", function() {
				if (!that.dragged) {
					return;
				}
				if (place === that.dragged.holder) {
					return;
				}
				if (place.hold) {
					that.dragged.$ele.removeClass("zui-node-dragged");
					return;
				}
				var dragged = that.dragged;
				that.dragged = null;
				dragged.$ele.removeClass("zui-node-dragged");
				dragged.holder.hold = null;
				dragged.holder = place;
				place.$ele.append(dragged.$ele);
				place.hold = dragged;
				that.rebetween();
			});
			return $place;
		}
		/**
		 * @deprecated
		 * @aliasOf newPlace
		 */
		addPlace() {
			return Span.prototype.newPlace.apply(this, arguments);
		}
		rebetween() {
			var node1 = this.node1, node2 = this.node2;
			if (node1.holder.index < node2.holder.index) {
				// 索引越小越靠后
				var s = node1;
				node1 = node2;
				node2 = s;
			}
			node2.$ele.append(this.between);
			console.log("rebetween")
			this.between.css("height", node1.$ele.offset().top - node2.$ele.offset().top + "px")
		}
		val() {
			var place1 = this.node1.holder, place2 = this.node2.holder;
			if (place1.id > place2.id) {
				return [place2.id, place1.id];
			}else {
				return [place1.id, place2.id];
			}
		}
	}
	const P = {
		Widget,
		Button,
		Checkbox,
		Input,
		Layout,
		Span
	};
	window.zui = P;
})($);