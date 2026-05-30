import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://monitoring.joclass.com/api/v1';
const API_URL = BASE_URL.replace(/\/$/, '');

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const getCallLogs = (token) => {
  return axios.get(`${API_URL}/users/me/call_logs/`, getAuthHeaders(token));
};

const getSmsMessages = (token) => {
  return axios.get(`${API_URL}/users/me/sms_messages/`, getAuthHeaders(token));
};

const getAppUsage = (token) => {
  return axios.get(`${API_URL}/users/me/app_usage/`, getAuthHeaders(token));
};

const getWebActivity = (token) => {
  return axios.get(`${API_URL}/users/me/web_activity/`, getAuthHeaders(token));
};

const getLocations = (token) => {
  return axios.get(`${API_URL}/users/me/locations/`, getAuthHeaders(token));
};

const getDevices = (token) => {
  return axios.get(`${API_URL}/devices/`, getAuthHeaders(token));
};

const getInstalledApps = (token) => {
  return axios.get(`${API_URL}/users/me/installed_apps/`, getAuthHeaders(token));
};

const getNotifications = (token) => {
  return axios.get(`${API_URL}/users/me/notifications/`, getAuthHeaders(token));
};

const getDeviceMedia = (token, deviceId, skip = 0, limit = 50, category = null) => {
  let url = `${API_URL}/devices/${deviceId}/media/?skip=${skip}&limit=${limit}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  return axios.get(url, getAuthHeaders(token));
};

const sendCommand = (token, deviceId, commandType, payload = null) => {
  return axios.post(`${API_URL}/devices/${deviceId}/commands/`, {
    command_type: commandType,
    payload: payload ? JSON.stringify(payload) : null
  }, getAuthHeaders(token));
};

const dataService = {
  getCallLogs,
  getSmsMessages,
  getAppUsage,
  getWebActivity,
  getLocations,
  getDevices,
  getInstalledApps,
  getNotifications,
  getDeviceMedia,
  sendCommand,
};

export default dataService;
