//Necessary includes
//const Discord = require("discord.js");
const storage = require("node-persist");
//const bot = new Discord.Client();
const btoken = require("./eccSettings.json").eccToken;
const fs = require("fs");
const cfg = require("./eccSettings.json");

//Check to see if Discord.js is installed correctly
try {
	var Discord = require("discord.js");
} catch(e) {
	console.log(e.stack);
	console.log(process.version);
	console.log("Please ensure discord.js was installed correctly.");
	process.exit();
}
//console.log("Starting EccentricAi\nCurrent Node Version: " + process.version + "\nCurrent Discord.js Version: " + Discord.version);
console.log(
			`\n=============== EccentricAi v1.0.2 ===============\n` +
			`  | Copyright (c) 2017 Nightmeister & NettleBt\n` +
			`  | Version: 1.0.2\n` +
			`  | Node Version: ` + process.version + `v\n` +
			`  | Discord.js Version: ` + Discord.version + `v\n` +
			`  | Dev: YES\n` +
			`  | Beta Mode: YES\n` +
			`  | Advance Features: YES\n` +
			`=============== EccentricAi v1.0.2 ===============\n\n` +
			"Now Setting Up, Please wait...\n");

//initialize the bot client
var bot = new Discord.Client({autoReconnect: true, disableEvents: ["TYPING_START", "TYPING_STOP", "GUILD_MEMBER_SPEAKING", "GUILD_MEMBER_AVAILABLE", "PRESSENCE_UPDATE"]});

//unfixed vars
var prefix = require("./eccSettings.json").Prefix;
//embed colours for easier access
var embedPurple = 0x7d0099;
var embedWarn = 0xb8b500;
var embedError = 0xc20000;

//basic and totally necessary helper funcs
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseArgs(args, argumentcount) {
	var words = args.split(" ");
	var out = words.splice(0, argumentcount - 1);
	var last = words.join(" ");
	out.push(last);
	return out;
}

function isAdmin(messageauthor) {
	//var adminrole = messageauthor.roles.get(storage.getItemSync(messageauthor.guild.id + "_adminroleid"));
	var getAdmin = messageauthor.hasPermission("ADMINISTRATOR");
	if (getAdmin) {
		return true
	}
	else if (messageauthor.id == messageauthor.guild.ownerID) {
			return true;
	} else {
			return false;
	}
}

//start of command modules
var commands = {
	"ping": {
		"response": function(bot,msg) {
			const pingEm = new Discord.RichEmbed()
			.setColor(embedPurple)
			.setDescription("Pong! Time to formulate spell " + bot.ping + "ms");
			msg.channel.send({embed:pingEm});
		},
		"bio": "Returns the time taken to formulate spell",
		"syntax": "ping"
	},
	"help": {
		"response": function(bot,msg,args) {
			if(!args) {
				const helpEm1 = new Discord.RichEmbed()
				.setColor(embedPurple)
				.addField("Default EccentricAi Prefixes", "`" + prefix + "`", false);
				msg.author.send({embed:helpEm1});
				var helparray = getHelpDescription();
				for(var i = 0; i < helparray.length; i+=15) {
					var joined = helparray.slice(i, (i+15));
					const helpEm2 = new Discord.RichEmbed()
					.setColor(embedPurple)
					.setTitle("available EccentricAi commands")
					.setDescription(joined);
					msg.author.send({embed:helpEm2});
				}
				const helpEm3 = new Discord.RichEmbed()
				.setColor(embedPurple)
				.setDescription("A list of commands has been sent to you via DMs");
				msg.channel.send({embed:helpEm3});
			}
			else {
				var command = commands[args];
				if(command) {
					const cmdEm = new Discord.RichEmbed()
					.setColor(embedPurple)
					.addField(prefix + args + " - " + command.bio, "Usage: " + prefix + command.syntax, false);
					msg.channel.send({embed:cmdEm});
				}
				else {
					const cmdEm2 = new Discord.RichEmbed()
					.setColor(embedPurple)
					.setDescription("Please give a valid command!");
					msg.channel.send({embed:cmdEm2});
				}
			}
		},
		"bio": "Displays list of commands",
		"syntax": "help [command name]"
	},
	"rate": {
		"response": function(bot,msg,args) {
			if(args) {
				var text = args;
				if(text.length < 200) {
					const rateEm = new Discord.RichEmbed()
					.setColor(embedPurple)
					.setDescription(msg.author.username + ", I rate " + args + " a " + randomInt(0, 10) + "/10 - IGN");
					msg.channel.send({embed: rateEm});
				}
				else {
					const nopeEm = new Discord.RichEmbed()
					.setColor(embedWarn)
					.setDescription("I can't rate someting I can't even say!");
					msg.channel.send({embed: nopeEm});
				}
			}
			else {
				const notRatedEm = new Discord.RichEmbed()
				.setColor(embedError)
				.setDescription("Please give me something to rate!");
				msg.channel.send({embed: notRatedEm});
			}
		},
		"bio": "I'll rate something on a scale of 1 - 10",
		"syntax": "rate <thing to rate>"
	},
	"assignrole": {
		"response": function(bot,msg,args) {
			if(msg.guild.me.hasPermission("MANAGE_ROLES")) {
				if(isAdmin(msg.member) == true) {
					if(args) {
						arglist = parseArgs(args, 2);
						arg1 = arglist[0];
						arg2 = arglist[1];
						if(arg1 == "new") {
							var roleadd = msg.guild.roles.find(function(e1) {
								return e1.name == arg2;
							});
							if(roleadd) {
								var rolearray = storage.getItemSync(msg.guild.id + "_assignrole");
								if(!rolearray) {
									rolearray = [];
								}
								rolearray.push(roleadd.id);
								storage.setItemSync(msg.guild.id + "_assignrole", rolearray);
								const newRoleEm  = new Discord.RichEmbed()
								.setColor(embedPurple)
								.setDescription("The " + roleadd.name + " role will now be added automatically to new members");
								msg.channel.send({embed: newRoleEm});
							}
							else {
								msg.channel.send("Please give a valid role to assign");
							}
						}
						else if (arg1 == "remove") {
							var roleremove = msg.guild.roles.find(function(e1) {
								return e1.name == arg2;
							});
							if(roleremove) {
								var rolearray = storage.getItemSync(msg.guild.id + "_assignrole");
								if(rolearray) {
									var i = rolearray.indexOf(roleremove.id);
									if(i && i > -1) {
										rolearray.splice(i, 1);
										storage.setItemSync(msg.guild.id + "_assignrole", rolearray);
										msg.channel.send("Role removed from assignrole!");
									}
									else {
										msg.channel.send("This role is not yet set as auto assign role!");
									}
								}
								else {
									msg.channel.send("You don't have any assigned roles set yet!");
								}
							}
							else {
								msg.channel.send("Please give a valid role to remove!");
							}
						}
						else if(arg1 == "clear") {
							var rolearray = storage.getItemSync(msg.guild.id + "_assignrole");
							if(rolearray) {
								storage.removeItemSync(msg.guild.id + "_assignrole");
								const removedEm = new Discord.RichEmbed()
								.setColor(embedPurple)
								.setDescription("Assign roles Reset!");
								msg.channel.send({embed: removedEm});
							}
							else {
								msg.channel.send("You don't have any assigned roles yet!");
							}
						}
						else if (arg1 == "list") {
							var rolearray = storage.getItemSync(msg.guild.id + "_assignrole");
							var rolelist = "";
							if(rolearray) {
								console.log(rolearray);
								rolearray.forEach(function(e1) {
									var role = msg.guild.roles.find(function(ele) {
										return ele.id == e1
									});
									rolelist += role.name + " | ";
								});
								const listEm = new Discord.RichEmbed()
								.setColor(embedPurple)
								.setTitle("All Assigned Roles for " + msg.guild.name)
								.setDescription(rolelist);
								msg.channel.send({embed: listEm});
							}
							else {
								msg.channel.send("You don't have any assigned roles set yet!");
							}
						}
						else {
							msg.channel.send("Please specify if you want to create new, remove, clear or list assigned roles");
						}
					}
					else {
						msg.channel.send("Please a give valid argument");
					}
				}
				else {
					msg.channel.send("You don't have permission to do this!");
				}
			}
			else {
				msg.channel.send("I don't have the Manage roles permission!");
			}
		},
		"bio": "Automatically assign roles when a new user joins. NOTE: Role assigned must already exist",
		"syntax": "assignrole <new|remove|clear|list> [role name]"
	},
	"abolish": {
		"response": function(bot,msg,args) {
			if(msg.member.hasPermission('MANAGE_MESSAGES')) {
				if(args && (args > 1)) {
					if(!isNaN(args)) {
						msg.channel.fetchMessages({before: msg.id, limit: args}).then(messages => {
							msg.channel.bulkDelete(messages);
							const purgeEm = new Discord.RichEmbed()
							.setColor(embedPurple)
							.setDescription("Deleted " + args + " messages! :white_check_mark:");
							msg.channel.send({embed: purgeEm});
							msg.delete(2000);
						}).catch(console.log);
					}
					else {
						const pf1 = new Discord.RichEmbed()
						.setColor(embedWarn)
						.setDescription("Please give a valid number!");
						msg.channel.send({embed: pf1});
					}
				}
				else {
					const pf2 = new Discord.RichEmbed()
					.setColor(embedWarn)
					.setDescription("Please specify a no. of messages to delete! Or check that you are deleting more than 1 message");
					msg.channel.send({embed: pf2});
				}
			}
			else {
				const pf3 = new Discord.RichEmbed()
				.setColor(embedError)
				.setDescription("You don't have permission to do this!");
				msg.channel.send({embed: pf3});
			}
		},
		"bio": "Deletes a given amount of messages from the chat",
		"syntax": "<no. of messages 2 delete> (Max Delete: 100)"
	}
}

//other helper functions
function getHelpDescription() {
	var desc = "";
	var descarray = [];
	for(var c in commands) {
		if(commands.hasOwnProperty(c)) {
			desc += "***"+ prefix + c + "*** - " + commands[c].bio + "\n";
			descarray.push("***"+ prefix + c + "*** - " + commands[c].bio + "\n");
		}
	}
	return descarray;
}

bot.on("ready", () => {
	var users = bot.users.array();
	//Bot set game init
	eccgames = ["with " + users.length + " users", "the depths of benzogin", "with 2000+ lines of code!", "with Nettle Bot's corpse"];
	getRandGame = Math.floor(Math.random() * eccgames.length);
	bot.user.setGame(eccgames[getRandGame]);
	//init node-persist
	storage.init();
	//log :B:ig console information
	console.log(
		"*-EccentricAi Statistics-*\n" +
		"Current Prefix: " + cfg.Prefix + "*\n" +
		"Logging Enabled: " + cfg.log_chat + "*\n" +
		"Owner: Nightmeister\n" +
		"EccentricAi's ID: " + bot.user.id + "*\n\n" +
		"Bot has now started successfully!\n" +
		"Now Commencing Command chat logs..."
	);
	//console.log("EccentricAi has started successfully!\n\nCommencing Chat Command Logs...");
});

bot.on("message", msg => {
	//start of main command processing
	if(msg.content.startsWith(prefix)) {
		if(msg.guild && msg.guild.available) {
			//initialize command arg managers
			var commandWithArgs = msg.content.substring(prefix.length);
			var ind = commandWithArgs.indexOf(" ");
			var command = (ind >= 0) ? commandWithArgs.substring(0, ind) : commandWithArgs;
			var args = (ind >= 0) ? commandWithArgs.substring(ind + 1) : "";
			//log user input commands
			if (commands.hasOwnProperty(command)) {
				var commandreply = commands[command].response;
				console.log("[" + msg.createdAt + "] #" + msg.channel.name + " | " + msg.guild.name + " (" + msg.author.username + "#" + msg.author.discriminator + "): " + msg.content);
				console.log("#" + msg.channel.name + " | " + msg.guild.name + " (" + msg.author.username + "#" + msg.author.discriminator + "): " + msg.content);
				try {
					commandreply(bot, msg, args);
				}
				catch (e) {
					console.log(e);
				}
			}
		}
	}
});

bot.login(btoken);

process.on("unhandledRejection", err => {
	console.error("Uncaught Promise Error: \n" + err.stack);
});