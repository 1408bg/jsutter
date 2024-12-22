import {
  Container,
  Row,
  Button,
  TextField,
  BoxDecoration
} from '../../material.js';

class ChatInput extends Container {
  constructor(onSendMessage) {
    const nameInput = new TextField({
      placeholder: 'Your name',
      maxLength: 20,
      style: { flex: '0 0 150px' }
    });

    const messageInput = new TextField({
      placeholder: 'Type a message',
      maxLength: 50,
      style: { flex: 1 },
      onSubmit: (value) => {
        if (value.trim() && nameInput.value.trim()) {
          onSendMessage(nameInput.value.trim(), value.trim());
          messageInput.value = '';
        }
        messageInput.focus();
      }
    });

    super({
      style: {
        padding: '24px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        gap: '16px'
      }
    }, [
      new Row(
        { gap: '16px', mainAlignment: 'center', style: { width: '100%' } },
        [
          nameInput,
          messageInput,
          new Button('Send', {
            style: new BoxDecoration({
              padding: '12px 24px',
              whiteSpace: 'nowrap',
              color: '#ffffff',
              borderRadius: '12px',
              backgroundColor: '#1241fb'
            }),
            onClick: () => messageInput.onSubmit(messageInput.value)
          })
        ]
      )
    ]);
    this.nameInput = nameInput;
  }

  get username() { return this.nameInput.value; }
  set username(value) { this.nameInput.value = value; }
}

export default ChatInput;