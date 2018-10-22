export const HomeItems: ServiceSection[] =
  [
    {
      'name': 'IPAS Services',
      'description': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vulputate erat velit, vel sagittis mi dapibus at. Mauris tincidunt lorem est, at faucibus purus placerat sit amet.',
      'content': [
        {
          'title': "InfluxDB",
          'description': "InfluxDB server",
          'headerIcon': "data_usage",
          'status': {
            'mode': 'ping',
            'url': 'http://localhost:8086/ping',
            'content_type': 'json',
            'valid_mode': 'status',
            'valid_value': 204
          },
          'linearColor': "#0BB5FF",
          'footContent': "http://localhost:8086",
          'footerIcon': "public",
          'link': ''
        },
        {
          'title': "SNMPCollector",
          'description': "SNMPCollector instance",
          'headerIcon': "devices",
          'status': {
            'mode': 'ping',
            'url': 'http://localhost:4201/',
            'content_type': 'text',
            'valid_mode': 'response',
            'valid_value': null
          },
          'linearColor': "#236B8E",
          'footContent': "http://localhost:4201",
          'footerIcon': "public",
          'link': ''
        },
        {
          'title': "Grafana",
          'description': "Grafana instance",
          'headerIcon': "devices",
          'status': {
            'mode': 'ping',
            'url': 'http://localhost:3000/login',
            'content_type': 'text',
            'valid_mode': 'response',
            'valid_value': null

          },
          'linearColor': "#236B8E",
          'footContent': "http://localhost:8889",
          'footerIcon': "public",
          'link': ''
        },
        {
          'title': "Resistor",
          'description': "Resistor instance",
          'headerIcon': "devices",
          'status': {
            'mode': 'ping',
            'url': 'https://webhook.siteeee',
            'content_type': 'text',
            'valid_mode': 'response',
            'valid_value': null

          },
          'linearColor': "#236B8E",
          'footContent': "http://localhost:8889",
          'footerIcon': "public",
          'link': ''
        },
        {
          'title': "Chronograf",
          'description': "Chronograf instance",
          'headerIcon': "devices",
          'status': {
            'mode': 'ping',
            'url': 'https://webhook.siteeee',
            'content_type': 'text',
            'valid_mode': 'response',
            'valid_value': null
          },
          'linearColor': "#236B8E",
          'footContent': "http://localhost:8889",
          'footerIcon': "public",
          'link': ''
        }
      ]
    },
    {
      'name': 'IPAS Platform',
      'description': 'My platform section',
      'content': [
        {
          'title': "Docs",
          'description': "Docs server",
          'headerIcon': "file_copy",
          'status': {
            'mode': 'ping',
            'url': 'http://localhost:38135',
            'content_type': 'text',
            'valid_mode': 'response',
            'valid_value': null
          },
          'linearColor': "#0BB5FF",
          'footContent': "http://localhost:38135",
          'footerIcon': "public",
          'link': ''
        },
        {
          'title': "Jenkins",
          'description': "Jenkins instance",
          'headerIcon': "timeline",
          'status': {
            'mode': 'ping',
            'url': 'http://localhost:4201/api/rt/agent/info/version/',
            'content_type': 'json',
            'valid_mode': 'response',
            'valid_value': null
          },
          'linearColor': "#236B8E",
          'footContent': "http://localhost:4201",
          'footerIcon': "public",
          'link': ''
        }
      ]
    }
  ]