import {
  Container,
  Row,
  Button,
  TextField,
  BoxDecoration
} from '../../material.js';

class AddRoomForm extends Container {
  constructor({ onRoomAdded }) {
    super({ style: { padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' } });
    this.onRoomAdded = onRoomAdded;
  }

  build(context) {
    this.element.innerHTML = '';
    const input = new TextField({
      placeholder: 'Enter room name',
      style: { flexGrow: 1 },
      onSubmit: async (value) => {
        if (value.trim()) {
          try {
            const response = await fetch('/api/room', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: value.trim(),
                id: Math.random().toString(36).substring(2, 9),
                occupants: 0
              })
            });
            
            if (response.ok) {
              input.value = '';
              this.onRoomAdded?.();
            }
          } catch (error) {
            console.error('Failed to add room:', error);
          }
        }
      }
    });

    const addButton = new Button('Add Room', {
      style: new BoxDecoration({
        padding: '12px 24px',
        whiteSpace: 'nowrap',
        color: '#ffffff',
        borderRadius: '12px',
        border: 'none',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: '#1241fb'
      }),
      onClick: () => input.onSubmit(input.value)
    });

    const formRow = new Row({
      gap: '16px',
      mainAlignment: 'center',
      style: { width: '100%' }
    }, [input, addButton]);

    this.appendChild(formRow);
    return this.element;
  }
}

export default AddRoomForm;