 powershell -command "(Get-ChildItem -Recurse -Include *.html, *.css, *.js | Get-Content | Measure-Object -Line).Lines"
