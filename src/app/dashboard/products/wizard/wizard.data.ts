export const EngineSNMPParams = {
  product_params:
    [
      {
        key: "PRODUCT_DEVICE_PORT",
        label: "Port",
        type: "integer",
        description: 'The network port where the agent will use to do SNMP connections',
        value: 161
      },
      {
        key: "PRODUCT_SYSTEMOID",
        label: "SystemOIDs",
        description: 'Set OID to get like MIB-2::System Info for non MIB-2 based devices',
        type: "array",
        value: null
      },
      {
        key: "PRODUCT_MAX_REPETITION",
        label: "MaxRepetitions",
        description: 'Set The MaxRepetitions parameter for BULKWALK SNMP queries',
        type: "integer",
        value: 50
      },
      {
        key: "PRODUCT_MEAS_GROUPS",
        label: "MeasurementGroups",
        description: 'An array of Measurement Group IDs',
        type: "array",
        value: null
      },
      {
        key: "PRODUCT_MEAS_FILTERS",
        label: "MeasurementFilters",
        description: 'An array of Measurement Filters IDs',
        type: "array",
        value: null
      },
      {
        key: "PRODUCT_DEVICE_TAGNAME",
        label: "DeviceTagName",
        description: 'Tag name the agent will send to the output db (default : "device"), could be any of the other more explicit tagname depending on the device type, context, by example (router,switch,firewall,dns..etc)',
        type: "string",
        value: "device"
      },
      {
        key: "PRODUCT_DEVICE_TAGVALUE",
        label: "DeviceTagValue",
        description: "Could be one of these: id: will send as device tag the configured ID for this measurement | host: will send as device tag data configured in the Host configuration (name or IP)",
        type: "string",
        value: "id"
      },
      {
        key: "PRODUCT_DISABLEBULK",
        label: "DisableBulk",
        description: "If true the bulk feature won't be used",
        type: "boolean",
        value: true
      },
      {
        key: "PRODUCT_CONCURRENTGATHER",
        label: "ConcurrentGather",
        description: 'Open a new SNMP Connection foreach measurement and send concurrent queries over the device',
        type: "boolean",
        value: true
      }
    ],
  platform_params:
    [
      {
        key: "PLATFORM_INFLUXSERVER",
        label: "OutDB",
        description: 'InfluxDB server ID to send data to',
        type: "string",
        value: "default"
      },
      {
        key: "PLATFORM_LOGLEVEL",
        label: "LogLevel",
        description: 'Enable use select verbosity of the device log',
        type: "string",
        value: "info"
      },
      {
        key: "PLATFORM_GATHER_FREQ",
        label: "Freq",
        description: 'Frequency of polling in seconds (default 30 sec if not set)',
        type: "string",
        value: 60
      },
      {
        key: "PLATFORM_TIMEOUT",
        label: "Timeout",
        description: "Timeout for each SNMP query",
        type: "integer",
        value: 20
      },
      {
        key: "PLATFORM_RETRIES",
        label: "Retries",
        description: 'Sets the number of retries to attempt within Timeout',
        type: "integer",
        value: 5
      },
      {
        key: "PLATFORM_UPDATE_FILTER_PREQ",
        label: "UpdateFltFreq",
        description: 'Number pof complete polls that agent will wait before perform snmp table index/filter updates. The final update time will be Freq*FilterUpdate (in seconds) Default 60 (1h elapsed time)',
        type: "integer",
        value: 60
      },
      {
        key: "PLATFORM_SNMPDEBUG",
        label: "SnmpDebug",
        description: 'If this option is set all snmp low level protocol queries with detailed info on this device will be written on a file with name "snmpdebug_XXXXXX.log"',
        type: "boolean",
        value: false
      }
    ],
  device_params:
    [
      {
        key: "DEVICE_ID",
        label: "ID",
        description: 'Text String that uniquely identify the device , should be unique in the config db, it can be hostname, serial number or any other text id',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_HOST",
        label: "Host",
        description: 'Text String that uniquely identify the device , should be unique in the config db, it can be hostname, serial number or any other text id',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_PORT",
        label: "Port",
        description: 'Overwrite default device port',
        type: "integer",
        value: null
      },
      {
        key: "DEVICE_ACTIVE",
        label: "Active",
        description: 'Let device begin gathering process on agent boot process',
        type: "boolean",
        value: true
      },
      {
        key: "DEVICE_SNMPVERSION",
        label: "SnmpVersion",
        description: 'SNMP version. Values accepted: [1,2c,3]',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_COMMUNITY",
        label: "Community",
        description: 'SNMP version 1/2c community',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3SECLEVEL",
        label: "V3SecLevel",
        description: 'Define the level of security needed for the connection valid values are (only for snmpv3)- NoAuthNoPriv, AuthNoPriv, AuthPriv',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3AUTHUSER",
        label: "V3AuthUser",
        description: 'The username that will establish the snmp query (snmpv3 only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3AUTHPASS",
        label: "V3AuthPass",
        description: 'The authentication password (snmpv3 only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3AUTHPROT",
        label: "V3AuthProt",
        description: 'The Authentication Protocol values should be any of (snmpv3 only) - MD5,SHA',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3PRIVPASS",
        label: "V3PrivPass",
        description: 'Privacy password (snmpv3 only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3PRIVPROT",
        label: "V3PrivProt",
        description: 'Privacy Protocol values should be any of [ "DES", "AES"] (snmpv3 only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3CONTEXTENGINE",
        label: "V3ContextEngineID",
        description: 'SNMPV3 ContextEngineID in ScopedPDU (equivalent to the net-snmp -E paramenter) (snmpv3 only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_V3CONTEXTNAME",
        label: "V3ContextName",
        description: 'SNMPV3 ContextEngineID in ScopedPDU (equivalent to the net-snmp -E paramenter) (snmpv3 only)',
        type: "string",
        value: null
      },
      {
        key: "DEVICE_EXTRATAG_VALUES",
        label: 'ExtraTags',
        description: 'Device ExtraTag Values',
        type: "array",
        value: null
      }
    ]
}
