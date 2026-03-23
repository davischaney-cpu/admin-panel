on run argv
	set theUrl to item 1 of argv
	tell application "Google Chrome"
		if (count of windows) is 0 then make new window
		set URL of active tab of front window to theUrl
		delay 6
		set js to "(() => { const body = document.body ? document.body.innerText : ''; const parts = body.split('Total: '); let total = null; if (parts.length > 1) { total = parts[1].split('%')[0].trim(); } return JSON.stringify({url: location.href, title: document.title, total}); })()"
		return execute active tab of front window javascript js
	end tell
end run
