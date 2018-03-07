'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ConfiguredWrapper = undefined;

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getConfig(mod, cfg) {
	var ret = {
		'plain': !cfg.plain ? false : true,
		'width': null || cfg.width,
		'align': cfg.align || 'baseline',
		'lineHeight': cfg.lineHeight || '1.125em'
	};
	for (var k in mod) {
		if (k === 'plain') ret.plain = true;else if (k === 'baseline' || k === 'top' || k === 'bottom' || k === 'middle' || k === 'none') ret.align = k;else if (/\d+/.test(k)) ret.width = parseInt(k);
	}
	return ret;
}
function newLine(el, span, config) {
	var tmp = span.cloneNode();
	el.insertBefore(tmp, span.nextSibling);
	span.style.display = null;
	tmp.setAttribute('dy', config.lineHeight);
	tmp.setAttribute('x', '0');
	return tmp;
}

function set(el, text, config) {
	el[config.plain ? 'textContent' : 'innerHTML'] = text || '';
	if (!config.width) return;
	var plain = [];
	var physLn = el.getBBox().height;
	el.childNodes.forEach(function (n) {
		if (n instanceof Text) {
			var tmp = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
			tmp.textContent = n.textContent;
			el.replaceChild(tmp, n);
			n = tmp;
		}
		plain.push(n.textContent.split(' '));
		n.textContent = '';
	});
	if (el.childElementCount) el.childNodes[0].setAttribute('y', 0);

	var offset = 0,
	    w = config.width,
	    childCnt = el.childElementCount;
	for (var c = 0; c < childCnt; c++) {
		var words = plain[c];
		var wc = words.length,
		    span = el.childNodes[c + offset],
		    txt = '',
		    forceBreak = false;
		for (var i = 0; i < wc; i++) {
			span.textContent += i ? ' ' + words[i] : words[i];
			forceBreak = el.getBBox().width > w;
			while (forceBreak) {
				span.textContent = txt;
				span = newLine(el, span, config);
				txt = span.textContent = words[i];
				offset++;
				if (el.getBBox().width > w) {
					span.style.display = 'none';
					txt = words[++i];
					if (!txt) forceBreak = false;
				} else forceBreak = false;
			}
			txt = span.textContent;
		}
	}
	el.childNodes.forEach(function (n) {
		n.style.display = null;
	});
	if (config.align === 'middle') el.setAttribute('transform', 'translate(0, -' + (el.getBBox().height - physLn) / 2 + ')');else if (config.align === 'baseline') el.setAttribute('transform', 'translate(0, -' + (config.lineHeight - physLn) + ')');else if (config.align === 'bottom') el.setAttribute('transform', 'translate(0, -' + (el.getBBox().height - physLn) + ')');else if (config.align === 'top') el.setAttribute('transform', 'translate(0, ' + physLn + ')');
}

function directive(config) {
	if (!config) config = {};
	return {
		bind: function bind(el, binding) {
			if (!(el instanceof SVGTextElement)) throw new Error('Text-wrap directive must be bound to an SVG text element.');
			el.__WRAP_CONFIG = getConfig(binding.modifiers, config);
			set(el, binding.value, el.__WRAP_CONFIG);
		},
		update: function update(el, binding) {
			set(el, binding.value, el.__WRAP_CONFIG);
		},
		unbind: function unbind(el) {
			delete el.__WRAP_CONFIG;
		}
	};
}
var Wrapper = directive();
exports.default = Wrapper;
var ConfiguredWrapper = exports.ConfiguredWrapper = directive;

//# sourceMappingURL=index.js.map