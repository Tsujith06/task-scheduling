import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Tasks
export const getTasks = (params) => api.get('/tasks', { params });
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Worklogs
export const getWorklogs = (params) => api.get('/worklogs', { params });
export const createWorklog = (data) => api.post('/worklogs', data);
export const updateWorklog = (id, data) => api.put(`/worklogs/${id}`, data);
export const deleteWorklog = (id) => api.delete(`/worklogs/${id}`);

// Reviews
export const getReviews = () => api.get('/reviews');

// Projects
export const getProjects = (params) => api.get('/projects', { params });
export const getProject = (id) => api.get(`/projects/${id}`);

// Users
export const getUsers = (params) => api.get('/users', { params });
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const bulkUsers = (users) => api.post('/users/bulk', { users });

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });

// Phases
export const getPhases = () => api.get('/phases');
export const createPhase = (data) => api.post('/phases', data);
export const updatePhase = (id, data) => api.put(`/phases/${id}`, data);
export const deletePhase = (id) => api.delete(`/phases/${id}`);

// Leaves
export const getLeaves = () => api.get('/leaves');
export const updateLeave = (id, data) => api.put(`/leaves/${id}`, data);

export const getAllProjects = () => api.get('/projects'); // Need a GET /projects in backend too
export const updateProjectMilestones = (id, milestones) => api.put(`/projects/${id}/milestones`, { milestones });
export const updateAttendance = (projectId, sid, status, name, memberId) => api.put(`/projects/${projectId}/attendance`, { sid, status, name, memberId });

// Invitations
export const createInvitation = (data) => api.post('/invitations', data);
export const getMyInvitations = (userId) => api.get(`/invitations/me/${userId}`);
export const getTeamInvitations = (teamId) => api.get(`/invitations/team/${teamId}`);
export const respondToInvitation = (id, status) => api.put(`/invitations/${id}/respond`, { status });

// Project Pool & Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);
export const getProjectPool = () => api.get('/project-pool');
export const addProjectPool = (data) => api.post('/project-pool', data);
export const updateProjectPool = (id, data) => api.put(`/project-pool/${id}`, data);
export const deleteProjectPool = (id) => api.delete(`/project-pool/${id}`);

// Team Flow
export const createTeam = (data) => api.post('/projects/formation', data);
export const selectMentor = (id, data) => api.put(`/projects/${id}/select-mentor`, data);
export const submitProposal = (id, data) => api.put(`/projects/${id}/submit-proposal`, data);
export const reviewProposal = (id, data) => api.put(`/projects/${id}/review`, data);

export default api;
