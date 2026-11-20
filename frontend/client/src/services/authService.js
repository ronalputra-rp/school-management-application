import api from './api.js'

export const userRegister = async (body) => {
    const { data } = await api.post('/auth/register', body);
    return data;
}

export const userLogin = async (body) => {
    const { data } = await api.post('/auth/login', body);
    localStorage.setItem("token", data.token);
    return data;
}
