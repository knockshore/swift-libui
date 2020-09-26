var ctx = {};
var libui;


//#region debugger
module.exports.startDebugger = () => {
  if (!libui.isStarted) {
    libui.startLoop();
  }
  var win = new libui.UiWindow('Debugger', 500, 400, true);
  var vbox1 = new libui.UiVerticalBox();
  var entry = new libui.UiEntry();
  var out = new libui.UiEntry();
  var btn = new libui.UiButton();
  btn.text = "Eval";
  btn.onClicked(() => {
    try {
      out.text = eval(entry.text);
    } catch (e) {
      out.text = e;
    }
  });
  vbox1.append(entry, 1);
  vbox1.append(out, 1);
  vbox1.append(btn, 1);
  win.setChild(vbox1);
  win.onClosing(() => {
    win.close();
  });
  win.show();
  ctx.debugger = win;
}
//#endregion

//#region context related
// returns the context
module.exports.initContext = () => {
  try {
    ctx.libui = require('@w8coffee/libui-node')
  } catch (e) {
    console.log("Cannot find or load @w8coffee/libui-node, trying libui-node: ", e);
    ctx.libui = require('libui-node')
  }
  ctx.values = {};
  libui = ctx.libui;
  ctx.controls = {};
  ctx.stack = [];
  ctx.cq = [];
  ctx.cnames = [];
  ctx.ctypes = [];
  libui.isStarted = false;
  libui.startLoop();
  return ctx;
}

module.exports.resumeContext = (_ctx) => {
  ctx = _ctx;
}

module.exports.endContext = (_ctx) => {
  _ctx.win.close();
  //_ctx.libui.stopLoop();
}
//#endregion

//#region win
module.exports.beginWin = (title, w, h) => {
  var win = new libui.UiWindow(title || 'No Title', w || 500, h || 400, true);
  win.onClosing(() => {
    win.close();
  });
  ctx.win = win;
}

module.exports.endWin = () => {
  console.log("Win lastCntr", ctx.lastCntr);
  ctx.win.setChild(ctx.lastCntr);
  ctx.win.show();
}
//#endregion

//#region control utils

function add(name, ctrl, type, later) {
  if (type) {
    // ctx.ctype = type;
    ctx.ctypes.push(type);
    ctx.stack.push(ctrl);
  }
  console.log("add", ctx.ctype, name, ctrl, ctx.currCntr);
  if (!ctx.currCntr || later) return;
  switch (ctx.ctype) {
    case 'a':
      ctx.currCntr.append(ctrl, 1);
      break;
    case 'af':
      ctx.currCntr.append(name, ctrl, false);
      break;
    case 's':
      ctx.currCntr.setChild(ctrl);
      break;
  }
}

function addlater(name, ctrl, type) {
  if (!ctx.currCntr) return;
  switch (ctx.ctype) {
    case 'a':
      ctx.currCntr.append(ctrl, 1);
      break;
    case 'af':
      ctx.currCntr.append(name, ctrl, 0);
      break;
    case 's':
      ctx.currCntr.setChild(ctrl);
      break;
  }
}

function endContainer() {
  var ctrl = ctx.currCntr;
  ctx.lastCntr = ctx.stack.pop();
  ctx.ctype = ctx.ctypes.pop();
  ctx.currCntr = ctx.stack[ctx.stack.length - 1];
  ctx.ctype = ctx.ctypes[ctx.ctypes.length - 1];
  addlater(null, ctrl, null);
}
//#endregion

//#region vbox
module.exports.vb = () => {
  var ctrl = new libui.UiVerticalBox();
  add('no vbox name', ctrl, 'a', true);
  ctx.currCntr = ctrl;
  ctx.ctype = 'a';
}

module.exports.endvb = () => {
  endContainer();
}
//#endregion
//#region hbox
module.exports.hb = () => {
  var ctrl = new libui.UiHorizontalBox();
  add('no hbox name', ctrl, 'a', true);
  ctx.currCntr = ctrl;
  ctx.ctype = 'a';
}

module.exports.endhb = () => {
  endContainer();
}
//#endregion

//#region form
module.exports.form = () => {
  var ctrl = new libui.UiForm();
  add('no form name', ctrl, 'af', true);
  ctx.currCntr = ctrl;
  ctx.ctype = 'af';
}

module.exports.endform = () => {
  endContainer();
}
//#endregion

//#region grp
module.exports.grp = (name) => {
  var ctrl = new libui.UiGroup();
  ctrl.title = name;
  add(name, ctrl, 's');
  ctx.currCntr = ctrl;
  ctx.ctype = 's';
}

module.exports.endgrp = () => {
  endContainer();
}
//#endregion

//#region Controls
module.exports.button = (name, click) => {
  var ctrl = new libui.UiButton();
  ctrl.text = name;
  ctrl.onClicked(click);
  add(name, ctrl);
}

module.exports.entry = (name, value, model) => {
  var ctrl = new libui.UiEntry();
  ctrl.text = value || '';
  ctx.values[model] = {
    name: model,
    value: value,
    ctrl: ctrl,
  };
  ctrl.onChanged((arg) => {
    console.log("onchange", arg);
    ctx.values[model].value = ctx.values[model].ctrl.text;
  });
  add(name, ctrl);
  return ctrl;
}

module.exports.mentry = (name, value, model) => {
  var ctrl = new libui.UiMultilineEntry();
  ctrl.text = value || '';
  ctx.values[model] = {
    name: model,
    value: value,
    ctrl: ctrl,
  };
  ctrl.onChanged(() => {
    ctx.values[model].value = ctx.values[model].ctrl.text;
  });
  add(name, ctrl);
  return ctrl;
}

module.exports.ddentry = (name, value, model, dd) => {
  var ctrl = new libui.UiEditableCombobox();
  ctrl.text = value || '';
  dd = dd || [];
  dd.forEach((itm) => {
    ctrl.append(itm);
  });
  ctx.values[model] = {
    name: model,
    value: value,
    ctrl: ctrl,
  };
  ctrl.onChanged(() => {
    ctx.values[model].value = ctx.values[model].ctrl.text;
  });
  add(name, ctrl);
  return ctrl;
}

//#endregion

//#region Model related
module.exports.set = (model, val) => {
  ctx.values[model].ctrl.text = val;
  return ctx.values[model].value = val;
}

module.exports.get = (model) => {
  return ctx.values[model].value;
}

//#endregion

//#region misc.
function showMessageBox(...str) {
	var msg = window(
	{
		hasMenubar: true,
		title: 'Code Utils',
		width: 300,
		height: 300,
		onContentSizeChanged: null,
		onClosing: () => {
			msg.close();
		}
	},
	multilineEntry({
		stretchy: true,
		text: str.join(' ')
	})
	);
	msg.show();
}

function buildColor(color, alpha) {
	
	let component;

	component = (color >> 16) & 0xff;
	const R = component / 255;
	component = (color >> 8) & 0xff;
	const G = component / 255;
	component = color & 0xff;
	const B = component / 255;
	const A = alpha;

	return new libui.Color(R, G, B, A);
}

function buildSolidBrush(color, alpha) {
	
	let component;

	component = (color >> 16) & 0xff;
	const R = component / 255;
	component = (color >> 8) & 0xff;
	const G = component / 255;
	component = color & 0xff;
	const B = component / 255;
	const A = alpha;

	const brush = new libui.DrawBrush();
	brush.color = new libui.Color(R, G, B, A);
	brush.type = libui.brushType.solid;

	return brush;
}

function getAttrString(str, name, pt, width, color, options) {
	name = name || 'System';
	pt = pt || 10;
	str = str || '';
	width = width || 100;
	color = color || 0xFF0000;
	
	var as = new libui.AttributedString('');
	as.appendAttributed(
		str,
		libui.FontAttribute.newColor(buildColor(color, 1))
	);
	
	var font = new libui.FontDescriptor(
		name,
		pt,
		libui.textWeight.normal,
		libui.textItalic.normal,
		libui.textStretch.normal
	);
	var layout = new libui.DrawTextLayout(
		as,
		font,
		width,
		libui.textAlign.left
	);
	return layout;
}
//#endregion