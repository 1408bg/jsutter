import {
  Column,
  StatefulWidget,
  State,
  Navigator,
  Route,
  Positioned,
  Memory
} from './../material.js';

import { MessageList, ChatInput, ChatHeader } from './chat_page_widgets/index.js';

class ChatPage extends StatefulWidget {
  constructor(room) {
    super({ style: { width: '100%', height: '100%' } });
    this.room = room;
  }

  createState() { return new ChatPageState(); }
}

class ChatPageState extends State {
  initState() {
    this.memory = Memory.instance;
    this.messages = [];
    this.socket = io();
    this.messageList = new MessageList();
    this.chatInput = new ChatInput((name, message) => {
      this.socket.emit('message', {
        name,
        message,
        room: this.widget.room.id
      });
    });
    this.setupSocket();
    super.initState();
  }

  setupSocket() {
    this.socket.on('connect', () => {
      this.socket.emit('joinRoom', this.widget.room.id);
    });

    this.socket.on('message', (data) => {
      if (this.mounted) {
        this.setState(() => {
          this.messages.push(data);
          this.messageList.updateMessages(this.messages, this.chatInput.username);
          requestAnimationFrame(() => {
            const messageContainer = this.messageList.element;
            if (messageContainer) {
              messageContainer.scrollTop = messageContainer.scrollHeight;
            }
          });
        });
      }
    });

    this.socket.on('occupantCount', (data) => {
      if (this.mounted) {
        this.setState(() => {
          this.widget.room.occupants = data.count;
        });
      }
    });
  }

  build(context) {
    requestIdleCallback(() => {
      if (this.memory.has('username')) this.chatInput.username = this.memory.get('username');
    });
    return new Column({
      style: {
        height: '100%',
        backgroundColor: '#f8fafc'
      }
    }, [
      new ChatHeader(this.widget.room, () => {
        this.socket.emit('leaveRoom', this.widget.room.id);
        Navigator.pop(context);
      }),
      this.messageList,
      new Positioned({
        bottom: 0,
        left: 0,
        child: this.chatInput
      })
    ]);
  }
}

export default ChatPage;