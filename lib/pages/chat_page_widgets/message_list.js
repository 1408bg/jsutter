import {
  Container,
  Text,
  TextStyle,
  Column
} from '../../material.js';

class MessageBubble extends Container {
  constructor(message, isMe) {
    super({
      style: {
        alignSelf: isMe ? 'flex-end' : 'flex-start'
      }
    }, [
      new Text(message.name, {
        style: new TextStyle({
          fontSize: '14px',
          color: '#64748b',
          fontWeight: '600',
        })
      }),
      new Container({
        style: {
          padding: '8px 16px',
          backgroundColor: isMe ? '#e3f2fd' : '#f5f5f5',
          borderRadius: '12px',
          marginBottom: '8px',
          maxWidth: '80%'
        }
      }, [
        new Text(message.message, {
          style: new TextStyle({
            fontSize: '16px',
            color: '#1e293b'
          })
        })
      ])
    ]);
  }
}

class MessageList extends Column {
  constructor() {
    super({
      style: {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      },
      className: 'message-container'
    });
  }

  updateMessages(messages, currentUser) {
    this.children = messages.map(message =>
      new MessageBubble(message, message.name === currentUser)
    );
  }
}

export default MessageList;