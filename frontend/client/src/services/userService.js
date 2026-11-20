import api from './api.js'

export const getUser = async () => {
    const { data } = await api.get('/users')
    return data;
}

export const getUserById = async (id) => {
    const { data } = await api.get(`/users/${id}`)
    return data;
}

export const creatingUser = async (body) => {
    const { data } = await api.post('/users', body);
    return data;
}

export const updateUser = async (id, body) => {
    const { data } = await api.patch(`/users/${id}`, body);
    return data;
}

export const deleteUser = async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
}
