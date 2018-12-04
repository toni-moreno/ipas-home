export const EngineSNMPParams = {
  product_params:
    [
      {
        key: "PRODUCT_DEVICE_PORT",
        agent_key: "Port",
        type: "integer",
        description: 'The network port where the agent will use to do SNMP connections',
        value: 161
      },
      {
        key: "PRODUCT_SYSTEMOID",
        agent_key: "SystemOIDs",
        description: 'Set OID to get like MIB-2::System Info for non MIB-2 based devices',
        type: "array",
        value: null
      },
      {
        key: "PRODUCT_MAX_REPETITION",
        agent_key: "MaxRepetitions",
        description: 'Set The MaxRepetitions parameter for BULKWALK SNMP queries',
        type: "integer",
        value: 50
      },
      {
        key: "PRODUCT_MEAS_GROUPS",
        agent_key: "MeasurementGroups",
        description: 'An array of Measurement Group IDs',
        type: "array",
        value: ["Juniper_template"]
      },
      {
        key: "PRODUCT_MEAS_FILTERS",
        agent_key: "MeasurementFilters",
        description: 'An array of Measurement Filters IDs',
        type: "array",
        value: ["jnxOperating_Temp",
          "jnxOperating_RouterEngine_Juniper_CPU",
          "jnxOperating_Interface_Juniper"]
      },
      {
        key: "PRODUCT_DEVICE_TAGNAME",
        agent_key: "DeviceTagName",
        description: 'Tag name the agent will send to the output db (default : "device"), could be any of the other more explicit tagname depending on the device type, context, by example (router,switch,firewall,dns..etc)',
        type: "string",
        value: "device"
      },
      {
        key: "PRODUCT_DEVICE_TAGVALUE",
        agent_key: "DeviceTagValue",
        description: "Could be one of these: id: will send as device tag the configured ID for this measurement | host: will send as device tag data configured in the Host configuration (name or IP)",
        type: "string",
        value: "id"
      },
      {
        key: "PRODUCT_DISABLEBULK",
        agent_key: "DisableBulk",
        description: "If true the bulk feature won't be used",
        type: "boolean",
        value: true
      },
      {
        key: "PRODUCT_CONCURRENTGATHER",
        agent_key: "ConcurrentGather",
        description: 'Open a new SNMP Connection foreach measurement and send concurrent queries over the device',
        type: "boolean",
        value: true
      }
    ],
  platform_params:
    [
      {
        key: "PLATFORM_INFLUXSERVER",
        agent_key: "OutDB",
        description: 'InfluxDB server ID to send data to',
        type: "string",
        value: "default"
      },
      {
        key: "PLATFORM_LOGLEVEL",
        agent_key: "LogLevel",
        description: 'Enable use select verbosity of the device log',
        type: "string",
        value: "info"
      },
      {
        key: "PLATFORM_GATHER_FREQ",
        agent_key: "Freq",
        description: 'Frequency of polling in seconds (default 30 sec if not set)',
        type: "string",
        value: 60
      },
      {
        key: "PLATFORM_TIMEOUT",
        agent_key: "Timeout",
        description: "Timeout for each SNMP query",
        type: "integer",
        value: 20
      },
      {
        key: "PLATFORM_RETRIES",
        agent_key: "Retries",
        description: 'Sets the number of retries to attempt within Timeout',
        type: "integer",
        value: 5
      },
      {
        key: "PLATFORM_UPDATE_FILTER_PREQ",
        agent_key: "UpdateFltFreq",
        description: 'Number pof complete polls that agent will wait before perform snmp table index/filter updates. The final update time will be Freq*FilterUpdate (in seconds) Default 60 (1h elapsed time)',
        type: "integer",
        value: 60
      },
      {
        key: "PLATFORM_SNMPDEBUG",
        agent_key: "SnmpDebug",
        description: 'If this option is set all snmp low level protocol queries with detailed info on this device will be written on a file with name "snmpdebug_XXXXXX.log"',
        type: "boolean",
        value: false
      }
    ],
  device_params:
    [
      {
        key: "DEVICE_ID",
        agent_key: "ID",
        description: 'TextStringthatuniquelyidentifythedevice,shouldbeuniqueintheconfigdb,itcanbehostname,serialnumberoranyothertextid',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_HOST",
        agent_key: "Host",
        description: 'TextStringthatuniquelyidentifythedevice,shouldbeuniqueintheconfigdb,itcanbehostname,serialnumberoranyothertextid',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_PORT",
        agent_key: "Port",
        description: 'Overwritedefaultdeviceport',
        type: "integer",
        value: null
      },
      {
        key: "DEVICE_ACTIVE",
        agent_key: "Active",
        description: 'Letdevicebegingatheringprocessonagentbootprocess',
        type: "boolean",
        value: true
      },
      {
        key: "DEVICE_SNMPVERSION",
        agent_key: "SnmpVersion",
        description: 'SNMPversion.Valuesaccepted: [1,2c,3]',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_COMMUNITY",
        agent_key: "Community",
        description: 'SNMPversion1/2ccommunity',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3SECLEVEL",
        agent_key: "V3SecLevel",
        description: 'Definethelevelofsecurityneededfortheconnectionvalidvaluesare(onlyforsnmpv3)NoAuthNoPrivAuthNoPrivAuthPriv',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3AUTHUSER",
        agent_key: "V3AuthUser",
        description: 'Theusernamethatwillestablishthesnmpquery(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3AUTHPASS",
        agent_key: "V3AuthPass",
        description: 'Theauthenticationpassword(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3AUTHPROT",
        agent_key: "V3AuthProt",
        description: 'TheAuthenticationProtocolvaluesshouldbeanyof(snmpv3only)-MD5-SHA',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3PRIVPASS",
        agent_key: "V3PrivPass",
        description: 'Privacypassword(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3PRIVPROT",
        agent_key: "V3PrivProt",
        description: 'PrivacyProtocolvaluesshouldbeanyof["DES","AES"](snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3CONTEXTENGINE",
        agent_key: "V3ContextEngineID",
        description: 'SNMPV3ContextEngineIDinScopedPDU(equivalenttothenet-snmp-Eparamenter)(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3CONTEXTNAME",
        agent_key: "V3ContextName",
        description: 'SNMPV3ContextEngineIDinScopedPDU(equivalenttothenet-snmp-Eparamenter)(snmpv3only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_EXTRATAG_VALUES",
        agent_key: null,
        description: 'DeviceExtraTagValues',
        type: "string",
        value: null
      }
    ]
}
