import EventEmitter from 'events';

class AreasEvents extends EventEmitter {
  toggleSidebar = isOpen => this.emit('toggleSidebar', { isOpen });

  onToggleSidebar = callback => {
    this.on('toggleSidebar', callback);
    return () => this.removeListener('toggleSidebar', callback);
  };

  toggleModal = isOpen => this.emit('toggleModal', { isOpen });

  onToggleModal = callback => {
    this.on('toggleModal', callback);
    return () => this.removeListener('toggleModal', callback);
  };
}

export const areasEvents = new AreasEvents();
