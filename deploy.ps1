param (
    [string]$Message = ""
)

if ($Message -ne "") {
    npm run deploy -- "$Message"
} else {
    npm run deploy
}
