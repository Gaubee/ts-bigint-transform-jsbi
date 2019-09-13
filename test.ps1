$files = Get-ChildItem dist/test/*.test.js
foreach ($file in $files) { 
    ava $file 
}
