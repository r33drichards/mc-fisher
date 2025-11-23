const mineflayer = require('mineflayer')
const config = require('./config')

const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
  version: false,
  auth: config.auth
})

let mcData

bot.on('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
  console.log('Minecraft data loaded for version:', bot.version)
})

bot.once('spawn', () => {
  console.log('Bot connected and spawned!')
  console.log('Initial inventory:')
  printInventory()

  // Track inventory changes
  bot.on('windowUpdate', (slot, oldItem, newItem) => {
    console.log(`\n[INVENTORY CHANGE] Slot ${slot}:`)
    console.log('  Old:', oldItem ? `${oldItem.name} x${oldItem.count}` : 'empty')
    console.log('  New:', newItem ? `${newItem.name} x${newItem.count}` : 'empty')
  })

  // Track item collection
  bot.on('playerCollect', (collector, collected) => {
    console.log(`\n[ITEM COLLECTED]`)
    console.log('  Collector:', collector.username)
    console.log('  Item entity ID:', collected.id)
    console.log('Current inventory after collection:')
    printInventory()
  })

  // Track all sounds
  bot.on('soundEffectHeard', (soundName, position) => {
    if (soundName.includes('fishing') || soundName.includes('splash')) {
      console.log(`\n[SOUND] ${soundName} at position:`, position)
    }
  })

  // Start periodic weather command (every 60 seconds)
  if (process.env.SET_WEATHER==='true'){
    setInterval(() => {
      console.log('\n[COMMAND] Executing /weather rain')
      bot.chat('/weather rain')
    }, 60000)
  }

  // Start manual fishing test after 3 seconds
  setTimeout(async () => {
    console.log('\n=== STARTING FISHING TEST ===')
    await testFishing()
  }, 3000)
})

function printInventory() {
  const items = bot.inventory.items()
  console.log(`  Total items: ${items.length}`)
  items.forEach(item => {
    console.log(`    - ${item.name} x${item.count} (slot ${item.slot})`)
  })
}

async function testFishing() {
  try {
    console.log('\n=== USING bot.fish() METHOD ===')
    console.log('Inventory before fishing:')
    printInventory()

    console.log('\n--- Calling bot.fish() ---')
    const result = await bot.fish()
    console.log('bot.fish() returned:', result)

    console.log('\nInventory after fishing:')
    printInventory()

    console.log('\n=== TEST COMPLETE ===')

    // Rerun test
    setTimeout(() => testFishing(), 3000)

  } catch (err) {
    console.error('ERROR in testFishing:', err)
    setTimeout(() => testFishing(), 3000)
  }
}

bot.on('error', (err) => {
  console.error('Bot error:', err)
})

bot.on('kicked', (reason) => {
  console.log('Bot kicked:', reason)
})

console.log('Connecting to server...')
console.log(`Host: ${config.host}:${config.port}`)
console.log(`Username: ${config.username}`)
console.log(`Auth: ${config.auth}`)
