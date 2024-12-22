import {
  BoxDecoration,
  Button,
  Container,
  Text,
  TextStyle,
  Row
} from '../../material.js';

class ChatHeader extends Container {
  constructor(room, onBack) {
    super({
      style: {
        padding: '24px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, [
      new Row(
        { crossAlignment: 'center', gap: '16px' },
        [
          new Button('←', {
            style: new BoxDecoration({
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              color: '#ffffff',
              borderRadius: '8px'
            }),
            onClick: onBack
          }),
          new Text(room.name, {
            style: new TextStyle({
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2c3e50'
            })
          })
        ]
      ),
      new Container(
        { style: { padding: '8px 16px', backgroundColor: '#f1f5f9', borderRadius: '24px' } },
        [new Text(`${room.occupants} people`, { style: new TextStyle({ fontSize: '14px', color: '#64748b' }) })]
      )
    ]);
  }
}

export default ChatHeader;