import api from './api.js'

export const showClasses = async (params = {}) => {
    const { data } = await api.get('/classes', { params })
    return data;
}

export const showClassById = async (id) => {
    const { data } = await api.get(`/classes/${id}`)
    return data;
}

export const creatingClass = async (body) => {
    const { data } = await api.post('/classes', body);
    return data;
}

export const updatingClass = async (id, body) => {
    const { data } = await api.patch(`/classes/${id}`, body);
    return data;
}

export const deletingClass = async (id) => {
    const { data } = await api.delete(`/classes/${id}`);
    return data;
}
