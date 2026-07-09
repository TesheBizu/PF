import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socket from '../../services/socket';
import { skillAdded, skillUpdated, skillRemoved } from '../../redux/slices/skillsSlice';
import { projectAdded, projectUpdated, projectRemoved } from '../../redux/slices/projectsSlice';
import { experienceAdded, experienceUpdated, experienceRemoved } from '../../redux/slices/experiencesSlice';
import { messageReceived } from '../../redux/slices/messagesSlice';

function SocketListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.connect();

    socket.on('skill:created', (data) => dispatch(skillAdded(data)));
    socket.on('skill:updated', (data) => dispatch(skillUpdated(data)));
    socket.on('skill:deleted', (id) => dispatch(skillRemoved(id)));

    socket.on('project:created', (data) => dispatch(projectAdded(data)));
    socket.on('project:updated', (data) => dispatch(projectUpdated(data)));
    socket.on('project:deleted', (id) => dispatch(projectRemoved(id)));

    socket.on('experience:created', (data) => dispatch(experienceAdded(data)));
    socket.on('experience:updated', (data) => dispatch(experienceUpdated(data)));
    socket.on('experience:deleted', (id) => dispatch(experienceRemoved(id)));

    socket.on('message:created', (data) => dispatch(messageReceived(data)));

    socket.on('testimonial:created', () => {
      window.dispatchEvent(new CustomEvent('testimonialsChanged'));
    });
    socket.on('testimonial:updated', () => {
      window.dispatchEvent(new CustomEvent('testimonialsChanged'));
    });
    socket.on('testimonial:deleted', () => {
      window.dispatchEvent(new CustomEvent('testimonialsChanged'));
    });

    socket.on('profileImage:updated', (url) => {
      window.dispatchEvent(new CustomEvent('profileImageChanged', { detail: { url } }));
    });
    socket.on('profileImage:deleted', () => {
      window.dispatchEvent(new CustomEvent('profileImageChanged', { detail: { url: null } }));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return null;
}

export default SocketListener;
