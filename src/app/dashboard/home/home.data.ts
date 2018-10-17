export const HomeItems: ServiceSection[] =
  [
    {
      'name': 'Services',
      'description': 'My service section',
      'content': [
        {
          'title': "InfluxDB",
          'description': "InfluxDB server",
          'headerIcon': "data_usage",
          'status': {
            'mode': 'ping',
            'url': 'http://localhost:8086/ping',
            'valid': null
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
            'url': 'http://localhost:4201/api/rt/agent/info/version/',
            'valid': null
          },
          'linearColor': "#236B8E",
          'footContent': "http://localhost:4201",
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
            'valid': null
          },
          'linearColor': "#236B8E",
          'footContent': "http://localhost:8889",
          'footerIcon': "public",
          'link': ''
        }
      ]
    },
    {
      'name': 'Platform',
      'description': 'My platform section',
      'content': [
        {
          'title': "Docs",
          'description': "Docs server",
          'headerIcon': "file_copy",
          'status': {
            'mode': 'ping',
            'url': 'http://localhost:38135',
            'valid': null
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
            'valid': null
          },
          'linearColor': "#236B8E",
          'footContent': "http://localhost:4201",
          'footerIcon': "public",
          'link': ''
        }
      ]
    }
  ]