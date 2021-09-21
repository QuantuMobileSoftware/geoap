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

  createShape = (shapeType, json, isShowPopup = true) =>
    this.emit('createShape', { shapeType, json, isShowPopup });
  onCreateShape = callback => {
    this.on('createShape', callback);
    return () => this.removeListener('createShape', callback);
  };

  updateShape = () => this.emit('updateShape');
  onUpdateShape = callback => {
    this.on('updateShape', callback);
    return () => this.removeAllListeners('updateShape', callback);
  };

  stopDrawing = () => this.emit('stopDrawing');
  onStopDrawing = callback => {
    this.on('stopDrawing', callback);
    return () => this.removeAllListeners('stopDrawing', callback);
  };

  closePopup = () => this.emit('closePopup');
  onClosePopup = callback => {
    this.on('closePopup', callback);
    return () => this.removeAllListeners('closePopup', callback);
  };

  toggleContactUs = isOpen => this.emit('toggleContactUs', { isOpen });
  onToggleContactUs = callback => {
    this.on('toggleContactUs', callback);
    return () => this.removeAllListeners('toggleContactUs', callback);
  };
}

export const areasEvents = new AreasEvents();
