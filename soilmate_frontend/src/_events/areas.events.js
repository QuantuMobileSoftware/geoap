import EventEmitter from 'events';

class AreasEvents extends EventEmitter {
  toggleSidebar = isOpen => this.emit('toggleSidebar', { isOpen });
  onToggleSidebar = callback => {
    this.on('toggleSidebar', callback);
    return () => this.removeListener('toggleSidebar', callback);
  };

  toggleModal = (isOpen, data) => this.emit('toggleModal', { isOpen, data });
  onToggleModal = callback => {
    this.on('toggleModal', callback);
    return () => this.removeListener('toggleModal', callback);
  };

  createShape = (shapeType, json) => this.emit('createShape', { shapeType, json });
  onCreateShape = callback => {
    this.on('createShape', callback);
    return () => this.removeListener('createShape', callback);
  };
}

export const areasEvents = new AreasEvents();
