import api from './api.js'

export const showParents = async (params = {}) => {
    const { data } = await api.get('/parents', { params })
    return data;
}

export const addingParents = async (body) => {
    const { data } = await api.post('/parents', body);
    return data;
}

export const updatingParents = async (id, body) => {
    const { data } = await api.patch(`/parents/${id}`, body);
    return data;
}

export const deletingParents = async(id) => {
    const {data} = await api.delete(`/parents/${id}`);
    return data;
} 
