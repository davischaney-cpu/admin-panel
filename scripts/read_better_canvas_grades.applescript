tell application "Google Chrome"
	if not (exists front window) then error "Google Chrome has no open windows."
	set activeTab to active tab of front window
	set pageUrl to URL of activeTab
	if pageUrl does not start with "https://tvs.instructure.com" then error "Front tab is not on tvs.instructure.com"
	set js to "(() => { const out = []; const els = [...document.querySelectorAll('.bettercanvas-card-grade')]; for (const el of els) { const text = (el.textContent || '').trim(); let href = el.href || ''; if (!href) { const a = el.closest('a') || el.parentElement?.closest('a') || null; href = a?.href || ''; } let courseId = ''; const parts = href.split('/courses/'); if (parts.length > 1) { courseId = parts[1].split('/')[0]; } out.push(courseId + '|' + text); } return out.join('\n'); })()"
	set gradeText to execute activeTab javascript js
	return gradeText
end tell
