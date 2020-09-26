const { initContext, beginWin, endWin, form, endform, entry, button, get } = require('./')

initContext()
beginWin()
form()
entry('Message', '', 'message')
button('Go', () => {
	console.log(`Got ${get('message')}`);
})
endform()
endWin()