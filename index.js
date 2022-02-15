mineflayer = require("mineflayer")
const repl = require('repl')

const navigatePlugin = require('mineflayer-navigate')(mineflayer);
const mineflayerViewer = require('prismarine-viewer').mineflayer


var AutoAuth = require('mineflayer-auto-auth')
const autoeat = require("mineflayer-auto-eat")
const { Vec3 } = require('vec3')
var onLoop = false;

var usuariosValidos = ['JuuzouYT', 'Bateman'];
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalXZ } = require('mineflayer-pathfinder').goals

//199.127.63.53
/*
plugins: [AutoAuth],
    AutoAuth: {
        logging: true,
        password: 'HolaMundo123',
        ignoreRepeat: true
    } 
*/
function createBot() {
    //rodolfo, HolaMundo123
    //docmic23, cheeky
    //Batecastroso bateman

    var bot = mineflayer.createBot({
        host: "Mc.samsaracraft.net",
        //host: "librecraft.com",
        //host: "localhost",
        username: "dexned",
        /*plugins: [AutoAuth, pathfinder],
        AutoAuth: {
            logging: true,
            password: 'tyler12',
            ignoreRepeat: true
        },*/
        //port: 53264
        
    })

    bot.loadPlugin(pathfinder)
    bot.loadPlugin(autoeat)
    navigatePlugin(bot);


    bot.on("autoeat_started", () => {
        console.log("Auto Eat started!")
    })

    bot.on("autoeat_stopped", () => {
        console.log("Auto Eat stopped!")
    })

    bot.navigate.on('cannotFind', function (closestPath) {
        console.log("unable to find path. getting as close as possible");
        bot.navigate.walk(closestPath);

        bot.canDig
    });
    
    bot.navigate.on('arrived', function () {
        console.log("I have arrived");
    });
    
    bot.navigate.on('interrupted', function() {
        console.log("stopping");
    });

    bot.on('blockUpdate:(-34810, 118, -57591)', (oldBlock, newBlock) => {
        console.log(newBlock);
        /*let target = bot.blockAt(newBlock.position);
        if (target && bot.canDigBlock(target)) {
                console.log('Mining', target.name);
                bot.dig(target);
        }*/
    });
    
    bot.on("health", () => {
        if (bot.food === 20) bot.autoEat.disable()
            // Disable the plugin if the bot is at 20 food points
        else bot.autoEat.enable() // Else enable the plugin again
    })

    function float2int(value) {
        return value | 0;
    }



    function craftItem(name, amount) {
        amount = parseInt(amount, 10)
        const mcData = require('minecraft-data')(bot.version)

        const item = mcData.findItemOrBlockByName(name)
        const craftingTableID = mcData.blocksByName.crafting_table.id

        const craftingTable = bot.findBlock({
            matching: craftingTableID
        })

        if (item) {
            const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]
            if (recipe) {
                bot.craft(recipe, amount, null, (error) => {
                    console.log(`Craftee ${name} ${amount} veces`);
                    if (error) {
                        console.log('No tengo materiales');
                        console.log(error)
                    } else {
                        console.log('Crafteo correto');
                        dropItem('oak_planks', 256);
                    }
                })
            } else {
                console.log(`No puedo hacer ${name}`);
            }
        } else {
            console.log(`¿Que es ${name}?`);
        }
    }

    function tossNext() {
        if (bot.inventory.items().length === 0) return
        const item = bot.inventory.items()[0]
        bot.tossStack(item, tossNext)
    }

    function craftPlanks() {
        const mcData = require('minecraft-data')(bot.version)

        const item = mcData.findItemOrBlockByName('oak_planks')
        const craftingTableID = mcData.blocksByName.crafting_table.id

        const craftingTable = bot.findBlock({
            matching: craftingTableID
        })

        if (item) {
            const plankRecipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]
            if (plankRecipe) {
                bot.craft(plankRecipe, 100, null, (error) => {
                    if (error) {
                        console.log(error)
                    } else {
                        tossNext()

                        /*bot.craft(stickRecipe, 1, null, (error) => {
                            // After bot.craft(stickRecipe, ...) is finished, this callback is called and we continue. ✔️
                            if (error) { // Check if an error happened.
                                console.log(error + "segundo")
                            } else {*/
                                console.log('Crafting Sticks finished')
                            //}
                            //})
                    }
                })
            }
        }
    }

    function dropItem(username, name, amount) {
        amount = parseInt(amount, 10)
        const item = itemByName(name)
        if (!item) {
            console.log(`No tengo ${name}`);
        } else if (amount) {
            bot.toss(item.type, null, amount, checkIfDroped)
        } else {
            bot.tossStack(item, checkIfDroped)
        }

        function checkIfDroped(err) {
            if (err) {
                console.log(`No puedo dropear: ${err.message}`);
            } else if (amount) {
                console.log(`Dropeados ${amount} x ${name}`);
            } else {
                console.log(`Dropeado ${name}`);
            }
        }
    }

    function itemByName(name) {
        const items = bot.inventory.items()
        if (require('minecraft-data')(bot.version).isNewerOrEqualTo('1.9') && bot.inventory.slots[45]) items.push(bot.inventory.slots[45])
        return items.filter(item => item.name === name)[0]
    }

    function sayItems(username, items = null) {
        if (!items) {
            items = bot.inventory.items()
            if (require('minecraft-data')(bot.version).isNewerOrEqualTo('1.9') && bot.inventory.slots[45]) items.push(bot.inventory.slots[45])
        }
        const output = items.map(itemToString).join(', ')
        if (output) {
            //return bot.whisper(username, output)
            console.log(output);
        } else {
            //return bot.whisper(username, 'empty')
            console.log('empty');
        }
    }

    function itemToString(item) {
        if (item) {
            return `${item.name} x ${item.count}`
        } else {
            return '(nothing)'
        }
    }

    async function equipItem(username, name, destination) {
        const item = itemByName(name)
        if (item) {
            try {
                await bot.equip(item, destination)
                    //bot.whisper(username, `equipado ${name}`)
                console.log(username, `equipado ${name}`);
            } catch (err) {
                //bot.whisper(username, `no puedo equipar ${name}: ${err.message}`)
                console.log(username, `no puedo equipar ${name}: ${err.message}`);
            }
        } else {
            //bot.whisper(username, `No tengo ${name}`)
            console.log(username, `No tengo ${name}`);
        }
    }

    function sayPosition(username) {
        bot.whisper(username, `Estoy en ${bot.entity.position}`)
            //bot.whisper(username, `Tu estas en ${bot.players[username].entity.position}`)
    }

    function moveToCords(username, coorsx, coorsz) {
        const mcData = require('minecraft-data')(bot.version)
        bot.pathfinder.setMovements(new Movements(bot, mcData))

        if (Math.abs(Math.floor(bot.entity.position.x) - Math.floor(coorsx)) < 100 &&
            Math.abs(Math.floor(bot.entity.position.z) - Math.floor(coorsz)) < 100) {
            bot.pathfinder.goto(new GoalXZ(coorsx, coorsz), (err, result) => {
                if (!err) {
                    bot.whisper(username, "Ya llegué");
                }
            })
        } else {
            bot.whisper(username, 'Estoy muy lejos');
        }
    }

    async function placeBlock() {
        bot.entity.position.y + 1;
        bot.placeBlock(bot.blockAt(bot.entity.position.offset(0, 0, 1)), new Vec3(0, 1, 0), (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Bloque colocado!!");
            }
        })

    }

    function moveOnLoop(username, option) {
        const mcData = require('minecraft-data')(bot.version)
        bot.pathfinder.setMovements(new Movements(bot, mcData))
        var coorsx = bot.entity.position.x;
        var coorsz = bot.entity.position.z;

        onLoop = option;
        bot.pathfinder.goto(new GoalXZ(coorsx, coorsz), (err, result) => {
            if (!err) {
                bot.pathfinder.setMovements(new Movements(bot, mcData))
                bot.pathfinder.goto(new GoalXZ(coorsx, coorsz - 2), (err, result) => {
                    if (!err) {
                        bot.look(Math.floor(Math.random() * (180 - 1)) + 1, Math.floor(Math.random() * (180 - 180)) - 180);
                        bot.pathfinder.setMovements(new Movements(bot, mcData))
                        bot.pathfinder.goto(new GoalXZ(coorsx - 2, coorsz - 2), (err, result) => {
                            if (!err) {
                                bot.look(Math.floor(Math.random() * (180 - 1)) + 1, Math.floor(Math.random() * (180 - 180)) - 180);
                                bot.pathfinder.setMovements(new Movements(bot, mcData))
                                bot.pathfinder.goto(new GoalXZ(coorsx - 2, coorsz), (err, result) => {
                                    if (!err) {
                                        bot.look(Math.floor(Math.random() * (180 - 1)) + 1, Math.floor(Math.random() * (180 - 180)) - 180);
                                        bot.pathfinder.setMovements(new Movements(bot, mcData))
                                        bot.pathfinder.goto(new GoalXZ(coorsx, coorsz), (err, result) => {
                                            if (!err) {
                                                if (onLoop) {
                                                    bot.look(Math.floor(Math.random() * (180 - 180)) - 180, Math.floor(Math.random() * (180 - 180)) - 180);
                                                    moveOnLoop(username, onLoop)
                                                } else {
                                                    moveOnLoop(username, false)
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        })
                    }
                })
            }

        })

    }

    function stopMove() {
        onLoop = false;
        bot.pathfinder.stop()
        bot.pathfinder.setGoal(null)
    }

    function lookAtNearestPlayer() {
        const playerFilter = (entity) => entity.type === 'player'
        const playerEntity = bot.nearestEntity(playerFilter)

        if (!playerEntity) return
            /*if (!usuariosValidos.includes(playerEntity.username) || !playerEntity.username === 'Thanos') {
                throw new Error('Jugador no reconocido: ' + playerEntity.username);
            }*/
        if (playerEntity.username === 'DomSathanas') {
            throw new Error('Jugador no reconocido: ' + playerEntity.username);
        }
    }

    function nearestEntity(type) {
        var id, entity, dist;
        var best = null;
        var bestDistance = null;
        for(id in bot.entities) {
          entity = bot.entities[id];
          if(type && entity.type !== type) continue;
          if(entity === bot.entity) continue;
          dist = bot.entity.position.distanceTo(entity.position);
          if(!best || dist < bestDistance) {
            best = entity;
            bestDistance = dist;
          }
        }
        return best;
      }
    
/*      
    bot.on('login', function() {
    
        sleep(2000).then(() => {
            var entity=nearestEntity();
            console.log(entity);
            bot.activateEntity(entity);
        })
        //console.log(casl);
    })
*/

    function lookAPlayer(username) {
        const playerEntity = bot.players[username].entity

        if (!playerEntity) return
        if (usuariosValidos.includes(playerEntity.username)) {
            const pos = playerEntity.position.offset(0, playerEntity.height, 0)
            bot.lookAt(pos)
        }
    }

    bot.on('serverAuth', function() {
        console.log("Logeado correctamente");
    });

    /*bot.on('chat', (username, message) => {
        if (username === bot.username) {
            return bot.chat(message)
        }
    })*/

    function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
    }
    const Item=require("prismarine-item")("1.8");
    const dirt = new Item(2,0)
    const delay = require('delay')
    
    bot.on("title", (text) =>{ 
        console.log(text);
    })

    /*bot.on('message', (msg) => {
        console.log(msg.translate)
        if (msg.translate === 'multiplayer.player.joined'){
            bot.chat("/register tyler12 tyler12")
        }
    })*/



    bot.on('spawn' , async()=> { 
        sleep(2000)       
    })
    
    
    bot.on('messagestr', async (msg) => {
        //if (!msg.includes(":")){
        console.warn(msg)    

        if (msg.includes('Bienvenido de vuelta a Samsara')){

            const r = repl.start('> ')
            r.context.bot = bot
          
            r.on('exit', () => {
              bot.end()
            })
        }

        /*
        const r = repl.start('> ')
        r.context.bot = bot
      
        r.on('exit', () => {
          bot.end()
        })*/

        //}
        
        //Return if msg don't have extra property
        /*
        if(!msg) return
        await sleep(1000)
        if(msg == "LIBRECRAFT » Registrate usando /register pass pass"){
            console.log("Register");
            bot.chat("/register tyler12 tyler12");
        }else if(msg == "LIBRECRAFT » Inicia sesión usando /login <Contraseña>"){
            console.log("Login");
            //mineflayerViewer(bot, { firstPerson: true, port: 3000 })
            bot.chat("/login tyler12");    
            await sleep(4000);        
           
        }
        */
    })

    
/*
    bot.on('windowOpen', (window) => {
        bot.equip(Item.toNotch(dirt),"hand")
    })
*/
/*
    bot.on("windowOpen", window => {
        console.log(window.slots)
        bot.clickWindow(14,0,0)
    })
*/
    bot.on("playerCollect", (collector, collected) => {
        //console.time('someFunction');
        const mcData = require('minecraft-data')(bot.version)
        if (collector.type === "player" && collected.type === "object") {
            const rawItem = collected.metadata[8];
            const id = rawItem.itemId;
            const itemName = mcData.findItemOrBlockById(id).displayName;
            const itemCount = rawItem.itemCount;
            if (collector.username === bot.username) {
                console.log(`Recogí ${itemCount} ${itemName}`);
                setTimeout(() => {
                    craftPlanks()
                }, 100)
            }
        }
        //console.timeEnd('someFunction');
    });


    bot.on('whisper', (username, message, rawMessage) => {
        console.log(`I received a message from ${username}: ${message}`)
        if (message.includes('ve a')) {
            message = message.replace('ve ', '');
        }
        var bool = new Boolean(false);
        if (message.includes("volteate 1")) {
            bool = true;
        } else {
            bool = false;
        }
        const command = message.split(' ')
        switch (true) {
            case message === 'ven':
                const target = bot.players[username].entity;
                console.log(target.position)
                bot.navigate.to(target.position);
                break;
            case message === 'pos':
                sayPosition(username)
                break
            case /^a [\w-]+ \w+$/.test(message):
                moveToCords(username, command[1], command[2], )
                break
            case /^volteate \w+$/.test(message):
                moveOnLoop(username, bool)
                break
            case message === 'mirame':
                lookAPlayer(username)
                break
            case message === 'detente':
                stopMove();
                break
            case message === 'tpa':
                return bot.chat(`/tpa ${username}`)
                break;
            case /^sethome [\w-]+/.test(message):
                return bot.chat(`/sethome ${command[1]}`)
                break;
            case /^home [\w-]+/.test(message):
                return bot.chat(`/home ${command[1]}`)
                break;
            case /^cmd1 [\w-]+/.test(message):
                return bot.chat(`/${command[1]}`)
                break;
            case /^slot \d+/.test(message):
                bot.setQuickBarSlot(command[1])
                console.log(`usando slot ${command[1]}`)
                delay(1000)
            case message === 'usalo':
                bot.activateItem()
            case /^cmd2 [\w-]+/.test(message):
                return bot.chat(`/${command[1]} ${command[2]}`)
                break;
            case /^list$/.test(message):
                sayItems(username)
                break;
            case /^equip [\w-]+ \w+$/.test(message):
                equipItem(username, command[2], command[1])
                break
            case /^craft \d+ \w+$/.test(message):
                craftItem(command[2], command[1])
                break;
            case message === 'craft':
                craftPlanks()
                break;
            case /^drop [1-9]\d? \w+$/.test(message):
                dropItem(command[2], command[1])
                break;
            case message === 'ponlo':
                placeBlock()
                break;
            case message === 'skyblock':
                bot.setQuickBarSlot(0)
                console.log('Entrando a skyblock')
                delay(1000)
                bot.activateItem()
            default:
                return bot.whisper(username, 'a')
        }
    })

    bot.on('physicTick', lookAtNearestPlayer)

    // Log errors and kick reasons:
    bot.on('kicked', console.log)
    bot.on('error', console.log)
    bot.on('end', createBot)

}
createBot()
