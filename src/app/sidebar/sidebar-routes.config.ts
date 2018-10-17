export const ROUTES = [
    { path: '/dashboard', title: 'Platform State', icon: 'dashboard', children: null },
    { path: 'products', id: 'products', title: 'Poduct Management', icon: 'content_paste', children: null},
    { path: 'engines', id: 'engines', title: 'Engine Management', icon: 'content_paste', children: null},
    { path: '#component', id: 'component', title: 'Management', icon: 'apps', children: [
        {path: 'components/price-table', title: 'Price Table', icon: 'PT'},
        {path: 'components/panels', title: 'Panels', icon: 'P'},
        {path: 'components/wizard', title: 'Wizard', icon: 'W'},
      ]},
    { path: 'notification', title: 'Notification', icon: 'notifications', children: null },
    { path: 'alert', title: 'Sweet Alert', icon: 'warning', children: null },
    { path: 'settings', title: 'Settings', icon: 'settings', children: null },
      /* { path: 'profile', title: 'User Profile', icon: 'person', children: null },*/
];
