import {
  Color,
  BoxDecoration,
  TextStyle,
  Theme,
  ColorScheme,
  MaterialApp,
  runApp,
  Cookies,
  Memory
} from './material.js';

import RoomSelectPage from './pages/room_select_page.js';

if (Cookies.get('username')) {
  const memory = Memory.instance;
  if (fetch('/api/vaild', { method: 'GET' }).then(response => response.json()).then(data => data.valid)) {
    memory.set('username', Cookies.get('username'));
    memory.set('login', true);
  } else {
    Cookies.remove('username');
    memory.remove('username');
    memory.remove('login');
  }
}

const app = new MaterialApp({
  theme: new Theme({
    textStyle: new TextStyle({ fontSize: '16px', color: '#333' }),
    boxDecoration: new BoxDecoration({ backgroundColor: '#f8fafc' }),
    colorScheme: new ColorScheme({
      primary: Color.fromHex('#3b82f6'),
      onPrimary: Color.fromHex('#ffffff'),
      secondary: Color.fromHex('#f97316'),
      onSecondary: Color.fromHex('#ffffff'),
      surface: Color.fromHex('#ffffff'),
      onSurface: Color.fromHex('#333333')
    })
  }),
  home: new RoomSelectPage()
});

runApp(app);