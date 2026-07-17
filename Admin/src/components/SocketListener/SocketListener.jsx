import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socket from '../../services/socket';
import { connectAnalyticsSocket } from '../../services/analyticsSocket';
import {
  skillRealtimeAdded, skillRealtimeUpdated, skillRealtimeRemoved,
} from '../../redux/slices/skillsSlice';
import {
  projectRealtimeAdded, projectRealtimeUpdated, projectRealtimeRemoved,
} from '../../redux/slices/projectsSlice';
import {
  experienceRealtimeAdded, experienceRealtimeUpdated, experienceRealtimeRemoved,
} from '../../redux/slices/experiencesSlice';
import {
  messageRealtimeReceived, messageRealtimeRead, messageRealtimeDeleted,
} from '../../redux/slices/messagesSlice';
import { profileImageUpdated, profileImageDeleted } from '../../redux/slices/siteSettingsSlice';
import {
  testimonialRealtimeAdded, testimonialRealtimeUpdated, testimonialRealtimeRemoved,
} from '../../redux/slices/testimonialsSlice';
import { sectionRealtimeUpdated } from '../../redux/slices/sectionsSlice';
import {
  notificationRealtimeNew, notificationRealtimeRead, notificationRealtimeAllRead,
  notificationRealtimeDeleted, notificationUnreadCountChanged,
} from '../../redux/slices/notificationsSlice';
import {
  socialLinkRealtimeAdded, socialLinkRealtimeUpdated, socialLinkRealtimeRemoved,
  socialLinksRealtimeReordered,
} from '../../redux/slices/socialLinksSlice';
import { realtimeStatsReceived } from '../../redux/slices/analyticsSlice';
import { toast } from 'react-toastify';

function SocketListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.connect();

    socket.on('skill:created', (data) => dispatch(skillRealtimeAdded(data)));
    socket.on('skill:updated', (data) => dispatch(skillRealtimeUpdated(data)));
    socket.on('skill:deleted', (id) => dispatch(skillRealtimeRemoved(id)));

    socket.on('project:created', (data) => dispatch(projectRealtimeAdded(data)));
    socket.on('project:updated', (data) => dispatch(projectRealtimeUpdated(data)));
    socket.on('project:deleted', (id) => dispatch(projectRealtimeRemoved(id)));

    socket.on('experience:created', (data) => dispatch(experienceRealtimeAdded(data)));
    socket.on('experience:updated', (data) => dispatch(experienceRealtimeUpdated(data)));
    socket.on('experience:deleted', (id) => dispatch(experienceRealtimeRemoved(id)));

    socket.on('message:created', (data) => {
      dispatch(messageRealtimeReceived(data));
      toast.info(`New message from ${data.name}: ${data.subject}`);
    });
    socket.on('message:read', (data) => dispatch(messageRealtimeRead(data)));
    socket.on('message:deleted', (id) => dispatch(messageRealtimeDeleted(id)));

    socket.on('profileImage:updated', (url) => dispatch(profileImageUpdated(url)));
    socket.on('profileImage:deleted', () => dispatch(profileImageDeleted()));

    socket.on('testimonial:created', (data) => dispatch(testimonialRealtimeAdded(data)));
    socket.on('testimonial:updated', (data) => dispatch(testimonialRealtimeUpdated(data)));
    socket.on('testimonial:deleted', (id) => dispatch(testimonialRealtimeRemoved(id)));

    socket.on('sectionSetting:updated', ({ key, value }) => {
      dispatch(sectionRealtimeUpdated({ key, value }));
    });

    socket.on('notification:new', (data) => {
      dispatch(notificationRealtimeNew(data));
      toast.info(data.title);
    });
    socket.on('notification:read', (data) => dispatch(notificationRealtimeRead(data)));
    socket.on('notification:allRead', () => dispatch(notificationRealtimeAllRead()));
    socket.on('notification:deleted', (id) => dispatch(notificationRealtimeDeleted(id)));
    socket.on('notification:unreadCountChanged', (count) => dispatch(notificationUnreadCountChanged(count)));

    socket.on('socialLink:created', (data) => dispatch(socialLinkRealtimeAdded(data)));
    socket.on('socialLink:updated', (data) => dispatch(socialLinkRealtimeUpdated(data)));
    socket.on('socialLink:deleted', (id) => dispatch(socialLinkRealtimeRemoved(id)));
    socket.on('socialLinks:reordered', (data) => dispatch(socialLinksRealtimeReordered(data)));

    connectAnalyticsSocket((stats) => {
      dispatch(realtimeStatsReceived(stats));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return null;
}

export default SocketListener;
