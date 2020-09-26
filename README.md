swift-libui-node
=================

!!! Still in development

Use simple to use functions to write GUI in seconds.

# Example

```
const { initContext, beingWin, endWin, form, endform, entry, button, get } = require('swift-libui-node')

initContext()
beginWin()
form()
entry('Message', '', 'message')
button('Go', () => {
	console.log(`Got ${get}`);
}
endform()
endWin()

```

Thanks to parro-it for libui-node
[https://github.com/parro-it/libui-node]