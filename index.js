var udp           = require('../../udp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.init_presets();

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.init_presets();
	self.config = config;
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;
	self.init_presets();
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			label: 'Information',
			width: 12,
			value: 'Wake on LAN'
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	debug("destroy", self.id);;
};


instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {

		'WoL': {
			label: 'Wake on LAN',
			options: [
				{
					type: 'textinput',
					id: 'id_MAC',
					label: 'MAC Address (format: AABBCCDDEEFF):',
					width: 12,
					default: '',
					regex: '/^([0-9a-f]{2}){6}$/i'
				},
				{
					type: 'textinput',
					id: 'id_IP',
					label: 'IP or IP range:',
					default: '192.168.1.255',
					regex: self.REGEX_IP
				},
				{
					type: 'textinput',
					id: 'id_port',
					label: 'Port:',
					default: '9',
					regex: self.REGEX_PORT
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;

	switch(action.action) {

		case 'WoL':
			var mac = action.options.id_MAC;
			cmd = new Buffer('ff'.repeat(6) + mac.repeat(16), 'hex');
			break;

	}
	
	if (cmd !== undefined ) {
		var udp_target = new udp(action.options.id_IP, action.options.id_port);
		
		udp_target.send(cmd);
		
		udp_target.on('error', function (err) {
		});
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
