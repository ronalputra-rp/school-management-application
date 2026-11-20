import api from './api.js'

export const showTeachers = async (params = {}) => {
    const { data } = await api.get('/teachers', { params })
    return data;
}

export const showTeacherById = async (id) => {
    const { data } = await api.get(`/teachers/${id}`)
    return data;
}

export const creatingTeacher = async (body) => {
    const { data } = await api.post('/teachers', body);
    return data;
}

export const updatingTeacher = async (id, body) => {
    const { data } = await api.patch(`/teachers/${id}`, body);
    return data;
}

export const deletingTeacher = async (id) => {
    const { data } = await api.delete(`/teachers/${id}`);
    return data;
}
