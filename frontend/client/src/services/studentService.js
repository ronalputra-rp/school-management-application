import api from './api.js'

export const showStudents = async (params = {}) => {
    const { data } = await api.get('/students', { params })
    return data;
}

export const showStudentById = async (id) => {
    const { data } = await api.get(`/students/${id}`)
    return data;
}

export const creatingStudent = async (body) => {
    const { data } = await api.post('/students', body);
    return data;
}

export const updatingStudent = async (id, body) => {
    const { data } = await api.patch(`/students/${id}`, body);
    return data;
}

export const deletingStudent = async (id) => {
    const { data } = await api.delete(`/students/${id}`);
    return data;
}
