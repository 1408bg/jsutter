import {
  Scaffold,
  Column,
  TextStyle,
  Chip,
  AppBar,
  BoxDecoration,
  Route,
  Navigator,
  Cookies,
  Memory,
  ScaffoldMessenger,
  AlertDialog
} from '../material.js';

import { AddRoomForm, RoomList } from './room_select_page_widgets/index.js';

import ChatPage from './chat_page.js';

class RoomSelectPage extends Scaffold {
  constructor() {
    const memory = Memory.instance;
    const login = memory.get('login');
    const header = new AppBar({
      title: 'Chat Rooms',
      titleStyle: new TextStyle({ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-1px' }),
      trailing: new Chip({
        label: login ? `@${memory.get('username')}` : 'Login',
        labelStyle: new TextStyle({ color: '#64748b', fontSize: '14px', fontWeight: '600' }),
        style: new BoxDecoration({
          padding: '6px 18px',
          backgroundColor: '#f0f4f8',
          borderRadius: '18px'
        }),
        onClick: () => {
          if (login) return;
          fetch('/api/oauth')
          .then(response => response.json())
          .then(data => {
            window.location.href = data.url;
          }).catch(error => {
            ScaffoldMessenger.of(this.lateContext).showDialog({
              context: this.lateContext,
              dialog: new AlertDialog({
                title: 'Error',
                content: error.message,
                onClose: () => {}
              })
            })
          });
        }
      })
    });

    const roomList = new RoomList();
    const addRoomForm = new AddRoomForm({
      onRoomAdded: () => {
        roomList.loadRooms();
      }
    });

    const mainContainer = new Column(
      { 
        crossAlignment: 'stretch',
        gap: '24px',
        style: {
          height: '100%',
          backgroundColor: '#f8fafc',
          padding: '24px'
        }
      },
      [header, addRoomForm, roomList]
    );

    setInterval(()=>roomList.loadRooms(), 5000);
    
    super({
      appBar: header,
      body: mainContainer
    });

    this.lateContext = null;
  }

  build(context) {
    this.lateContext = context;
    const room = {
      name: Cookies.pop('roomName'),
      id: Cookies.pop('roomId'),
      occupants: 0
    };
    
    if (room.id) {
      requestIdleCallback(() => {
        Navigator.push(context, new Route({
          builder: () => new ChatPage(room)
        }));
      })
    }

    return super.build(context);
  }
}

export default RoomSelectPage;