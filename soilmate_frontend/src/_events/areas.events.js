import EventEmitter from 'events';

class AreasEvents extends EventEmitter {
  toggleSidebar = isOpen => this.emit('toggleSidebar', { isOpen });

  onToggleSidebar = callback => {
    this.on('toggleSidebar', callback);
    return () => this.removeListener('toggleSidebar', callback);
  };
}

export const areasEvents = new AreasEvents();
