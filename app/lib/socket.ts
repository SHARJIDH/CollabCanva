
import { Server } from 'socket.io';

let io: any;

export function initSocket(server: any) {
  if (!io) {
    io = new Server(server);

    io.on('connection', (socket: any) => {
      console.log('Client connected');

      socket.on('join-notebook', (notebookId: string) => {
        socket.join(notebookId);
        console.log(`User joined notebook: ${notebookId}`);
      });

      socket.on('update-note', (data: any) => {
        socket.to(data.notebookId).emit('note-updated', data);
      });

      socket.on('draw', (data: any) => {
        socket.to(data.notebookId).emit('draw', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  return io;
}
