//var udp           = require('../../udp');
var instance_skel = require('../../instance_skel');
var wol           = require('wakeonlan');
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
			value: 'Wake-on-LAN instance does not require any configuration'
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

		'send_simple': {
			label: 'simple',
			options: [
				{
					type: 'textinput',
					id: 'id_broadcast_mac',
					label: 'MAC address:',
					default: '',
					regex: '/^([0-9a-f]{2}([:.-]{0,1}|$)){6}$/i'
				}
			]
		},
		'send_advanced': {
			label: 'advanced',
			options: [
				{
					type: 'textinput',
					id: 'id_advanced_mac',
					label: 'MAC address:',
					default: '',
					regex: '/^([0-9a-f]{2}([:.-]{0,1}|$)){6}$/i'
				},
				/*
				{
					type: 'textinput',
					id: 'id_ip',
					label: 'Destination IP or IP range:',
					default: '',
					regex: self.REGEX_IP
				},
				*/
				{
					type: 'textinput',
					id: 'id_port',
					label: 'UDP port:',
					default: '9',
					regex: self.REGEX_PORT
				},
				/*
				{
					type: 'dropdown',
					id: 'id_interface',
					label: 'Send from interface:',
					choices: ifaces_options
				},
				*/
				{
					type: 'textinput',
					id: 'id_count',
					label: 'Resend attempts:',
					default: '3',
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					id: 'id_interval',
					label: 'Interval between packet resend (ms):',
					default: '100',
					regex: self.REGEX_NUMBER
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var mac;
	var ip;
	var port;
	var simpre = false;
	var advanced = false;
	/*
	var options = {
		'from':     null, // Source address for socket. If not specified, packets will be sent out to the broadcast address of all IPv4 interfaces.
		'port':     null, // Port to send to. Default : 9
		'count':    null, // Number of packets to send. Default : 3
		'address':  null, // The destination address. Default : '255.255.255.255'
		'interval': null  // Interval between packets. Default : 100
	};
	*/
	
	var _regex_mac  = new RegExp(/^[0-9a-fA-F]{12}$/);

	switch(action.action) {

		case 'send_simple':
			mac = action.options.id_broadcast_mac;
			mac = mac.replace(/[:.-]/g, '');
			if(_regex_mac.test(mac)) {
				simple = true;
			}
			break;
		
		case 'send_advanced':
			mac  = action.options.id_advanced_mac;
			mac  = mac.replace(/[:.-]/g, '');
			if(_regex_mac.test(mac)) {
				advanced = true;
			}
			break;
			
	}
	
	if (advanced) {
		console.log("ADVANCED SEND");
		var options = {
			//'from':     action.options.from,
      'port':     action.options.id_port,
      'count':    action.options.id_count,
      //'address':  action.options.id_ip,
      'interval': action.options.id_interval
		};
		wol(mac, options);
	} else if (simple) {
		var options = {
      'port':  9,
      'count': 1
		};
		wol(mac, options);
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;