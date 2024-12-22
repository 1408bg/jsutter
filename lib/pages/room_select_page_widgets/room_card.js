import {
  Card,
  Container,
  Column,
  Row,
  Text,
  TextStyle,
  BoxDecoration,
  Chip,
  ScaffoldMessenger,
  SnackBar
} from '../../material.js';

class RoomCard extends Card {
  constructor(room) {
    super({
      style: new BoxDecoration({
        padding: '24px',
        margin: '12px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer'
      })
    });
    this.room = room;
    this.mouseEnterListener = () => this.element.style.transform = 'scale(1.02)';
    this.mouseLeaveListener = () => this.element.style.transform = 'scale(1)';
  }

  build(context) {
    this.element.innerHTML = '';
    
    this.element.removeEventListener('mouseenter', this.mouseEnterListener);
    this.element.removeEventListener('mouseleave', this.mouseLeaveListener);
    
    const nameRow = new Row(
      { mainAlignment: 'space-between', crossAlignment: 'center', gap: '12px' },
      [
        new Text(this.room.name, {
          style: new TextStyle({
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2c3e50',
            letterSpacing: '-0.5px'
          })
        }),
        new Chip({
          label: `#${this.room.id}`,
          labelStyle: new TextStyle({ color: '#64748b', fontSize: '14px', fontWeight: '600' }),
          style: new BoxDecoration({
            padding: '4px 12px',
            backgroundColor: '#f0f4f8',
            borderRadius: '12px'
          }),
          onClick: (event) => {
            navigator.clipboard.writeText(`${location.origin}/api/join/${this.room.id}`);
            event.stopPropagation();
            ScaffoldMessenger.of(context).showSnackBar(new SnackBar({
              text: 'Room url copied to clipboard'
            }), 1000);
          }
        })
      ]
    );

    const occupantsRow = new Row(
      { crossAlignment: 'center', gap: '8px' },
      [
        new Container(
          { style: { 
              padding: '6px',
              backgroundColor: '#e8f5e9',
              borderRadius: '8px'
            } 
          },
          [new Text('👪')]
        ),
        new Text(`${this.room.occupants} people`, { 
          style: new TextStyle({ 
            fontSize: '16px', 
            color: '#34495e',
            fontWeight: '500'
          }) 
        })
      ]
    );

    const contentColumn = new Column(
      { gap: '16px' },
      [nameRow, occupantsRow]
    );

    this.element.addEventListener('mouseenter', this.mouseEnterListener);
    this.element.addEventListener('mouseleave', this.mouseLeaveListener);

    this.appendChild(contentColumn);
    return this.element;
  }
}

export default RoomCard;
