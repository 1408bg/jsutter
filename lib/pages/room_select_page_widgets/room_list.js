import {
  Container,
  Column,
  Text,
  TextStyle,
  PromiseBuilder,
  Center,
  Navigator,
  Route,
  InkWell,
  BoxDecoration
} from '../../material.js';

import RoomCard from './room_card.js';
import ChatPage from '../chat_page.js';

class RoomList extends PromiseBuilder {
  constructor() {
    super({
      promise: fetch('/api/room').then(response => response.json()),
      builder: (context, snapshot) => {
        if (snapshot.hasError) {
          return new Container(
            { style: { padding: '24px', textAlign: 'center' } },
            [new Text(`Error: ${snapshot.error}`, { style: new TextStyle({ color: '#e74c3c', fontSize: '18px' }) })]
          );
        }

        if (!snapshot.hasData) {
          return new Container(
            { style: { width: '100%', height: '100%', boxSizing: 'border-box', padding: '24px', textAlign: 'center' } },
            [
              new Column(
                { mainAlignment: 'center', gap: '16px' },
                [
                  new Container(
                    { style: { padding: '12px', backgroundColor: '#f8fafc', borderRadius: '50%', width: '100%', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' } },
                    [
                      new Center(
                        new Text('🔄', { style: new TextStyle({ fontSize: '24px' }) })
                      )
                    ]
                  ),
                  new Text('Loading rooms...', { style: new TextStyle({ color: '#64748b', fontSize: '18px' }) })
                ]
              )
            ]
          );
        }

        const rooms = snapshot.data;
        return new Column(
          { 
            mainAlignment: 'flex-start',
            crossAlignment: 'stretch',
            gap: '16px',
            style: {
              padding: '24px',
              maxWidth: '800px',
              margin: '0 auto',
            }
          },
          rooms.length === 0
            ? [
                new Column(
                  { mainAlignment: 'center', gap: '16px', style: { padding: '48px 0', width: '100%', height: '100%' } },
                  [
                    new Center(new Text('🏠', { style: new TextStyle({ fontSize: '32px' }) })),
                    new Text('No rooms available', { style: new TextStyle({ fontSize: '20px', color: '#64748b', textAlign: 'center', fontWeight: '500' }) }),
                    new Text('Create a new room to get started', { style: new TextStyle({ fontSize: '16px', color: '#94a3b8', textAlign: 'center' }) })
                  ]
                )
              ]
            : rooms.map(room => 
                new InkWell(
                  new RoomCard(room),
                  {
                    style: new BoxDecoration({ backgroundColor: '#ffffff' }),
                    onActive: () => {
                      Navigator.push(context, new Route({
                        builder: () => new ChatPage(room)
                      }));
                    }
                  }
                )
              )
        );
      }
    });
  }

  loadRooms() { this.updatePromise(fetch('/api/room').then(response => response.json())); }
}

export default RoomList;