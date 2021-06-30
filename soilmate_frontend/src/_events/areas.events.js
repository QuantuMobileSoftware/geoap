import EventEmitter from 'events';

class AreasEvents extends EventEmitter {
  toggleSidebar = isOpen => this.emit('toggleSidebar', { isOpen });
  onToggleSidebar = callback => {
    this.on('toggleSidebar', callback);
    return () => this.removeListener('toggleSidebar', callback);
  };

  toggleModal = (isOpen, additionally) =>
    this.emit('toggleModal', { isOpen, additionally });
  onToggleModal = callback => {
    this.on('toggleModal', callback);
    return () => this.removeListener('toggleModal', callback);
  };

  createShape = shapeType => this.emit('createShape', { shapeType });
  onCreateShape = callback => {
    this.on('createShape', callback);
    return () => this.removeListener('createShape', callback);
  };
}

export const areasEvents = new AreasEvents();
