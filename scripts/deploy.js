import { execSync } from 'node:child_process'

function run(command) {
  try {
    return execSync(command, { stdio: 'inherit', encoding: 'utf-8' })
  } catch (error) {
    process.exit(error.status || 1)
  }
}

function runOutput(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim()
  } catch {
    return ''
  }
}

const customMessage = process.argv.slice(2).join(' ').trim()
const now = new Date()
const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
const commitMessage = customMessage || `chore: auto-deploy update ${timestamp}`

console.log('🔍 Checking git status...')
const status = runOutput('git status --porcelain')

if (!status) {
  console.log('✅ Tidak ada perubahan baru untuk di-commit.')
  console.log('🚀 Memastikan commit terbaru ter-push ke GitHub...')
  run('git push origin main')
  console.log('🎉 GitHub Actions otomatis menjalankan deployment!')
  process.exit(0)
}

console.log('📦 Menambahkan perubahan (git add)...')
run('git add -A')

console.log(`💬 Melakukan commit: "${commitMessage}"...`)
run(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`)

console.log('🚀 Pushing ke GitHub (origin main)...')
run('git push origin main')

console.log('\n✨ Berhasil push ke GitHub!')
console.log('📡 GitHub Actions sedang otomatis mem-build dan mendeploy ke GitHub Pages.')
console.log('🌐 Kunjungi: https://alkaf-dev.github.io/Psikologi-Connect-App/\n')
