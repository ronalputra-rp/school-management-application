import { prisma } from '../db/src/prisma/client.js';

const isValidPhone = (phone) => /^\d{11,13}$/.test(phone);

export const getParents = async (req,res) => {
    try {
        const userId = req.user.id;
        if (typeof userId !== "number") {
            return res.status(400).send({
                message:"Invalid UserId data"
            })
        }
        const showParents = await prisma.parents.findMany({
            where:{userId}
        })
        return res.status(200).send({
            message:"Data telah berhasil dikirim",
            data:showParents
        })
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message:"Internal server error"
        })
    }
}

export const addParents = async (req,res) => {
    try {
        const userId = req.user.id;
        if (typeof userId !== "number") {
            return res.status(400).send({
                message:"Invalid UserId data"
            })
        }
        let data = {userId};
        const {name,age,phone,address,studentId} = req.body;
        if (name !== undefined) {
            if (typeof name !== "string") {
                return res.status(400).send({
                    message:"Nama harus merupakan tipe string"
                })
            }
            if (name.trim() === "") {
                return res.status(400).send({
                    message:"Nama tidak boleh kosong"
                })
            }
            data = {...data,name: name.trim()}
        } else {
            return res.status(400).send({
                message:"Data nama harus diisi dan tidak boleh dilewati"
            })
        }

        if (age !== undefined) {
            const convertAge = Number(age);
            if (!Number.isInteger(convertAge)) {
                return res.status(400).send({
                    message:"Umur tidak boleh merupakan angka desimal"
                })
            }
            data = {...data, age: convertAge};
        } else {
            return res.status(400).send({
                message:"Data umur harus diisi dan tidak boleh dilewati"
            })
        }

        if (phone !== undefined) {
            if (typeof phone !== "string") {
                return res.status(400).send({
                    message:"Nomor telepon harus merupakan string"
                })
            }
            const trimmedPhone = phone.trim();
            if (trimmedPhone !== "") {
                if (!isValidPhone(trimmedPhone)) {
                    return res.status(400).send({
                        message:"Nomor telepon harus 11-13 digit angka"
                    })
                }
                data = {...data, phone: trimmedPhone};
            }
        }

        if (address !== undefined) {
            if (typeof address !== "string") {
                return res.status(400).send({
                    message:"Alamat harus merupakan string"
                })
            }
            if (address.trim() === "") {
                return res.status(400).send({
                    message:"Alamat tidak boleh dikirim dengan input kosong"
                })
            }
            data = {...data, address: address.trim()}
        }

        if (studentId !== undefined) {
            const convertStudentId = Number(studentId);
            if (!Number.isInteger(convertStudentId)) {
                return res.status(400).send({
                    message:"ID murid harus merupakan angka"
                })
            } 
            data = {...data, studentId: convertStudentId};
        }

        const addingData = await prisma.parents.create({
            data:data
        })

        return res.status(201).send({
            message:"Data telah berhasil ditambahkan",
            data:addingData
        })
        
    } catch(err) {
        console.error(err);
        return res.status(500).send({
            message:"Internal server error"
        })
    }
}

export const updatingParents = async (req,res) => {
    const params = req.params.id;
    const convertingParams = Number(params);
    if (Number.isNaN(convertingParams)) {
        return res.status(400).send({
            message:"Terjadi kesalahan tipe data pada ID parameters"
        })
    }
    const userId = req.user.id;
    if (typeof userId !== "number" || Number.isNaN(userId)) {
        return res.status(400).send({
            message:"Terjadi kesalahan tipe data pada userID"
        })
    }
    let where = {userId,id:convertingParams};
    let data = {};
    const {name,age,phone,address,studentId} = req.body;
    if (name !== undefined) {
        if (typeof name !== "string") {
            return res.status(400).send({
                message:"Data nama harus merupakan string"
            })
        }
        if (name.trim() === "") {
            return res.status(400).send({
                message:"Data nama tidak boleh dikirim dengan input kosong"
            })
        }
        data = {name: name.trim()}
    }
    if (age !== undefined) {
        const convertAge = Number(age);
        if (!Number.isInteger(convertAge)) {
            return res.status(400).send({
                message:"Umur tidak boleh bilangan desimal"
            })
        }
        data = {...data,age: convertAge}
    }
    if (phone !== undefined) {
        if (typeof phone !== "string") {
            return res.status(400).send({
                message:"Nomor telepon harus merupakan string"
            })
        }
        const trimmedPhone = phone.trim();
        if (trimmedPhone !== "") {
            if (!isValidPhone(trimmedPhone)) {
                return res.status(400).send({
                    message:"Nomor telepon harus 11-13 digit angka"
                })
            }
            data = {...data,phone: trimmedPhone}
        }
    }
    if (address !== undefined) {
        if (typeof address !== "string") {
            return res.status(400).send({
                message:"Alamat harus merupakan string"
            })
        }
        if (address.trim() === "") {
            return res.status(400).send({
                message:"Alamat tidak boleh dikirim dengan inputan kosong"
            })
        }
        data = {...data,address: address.trim()}
    }
    if (studentId !== undefined) {
        const convertStudentId = Number(studentId);
        if (!Number.isInteger(convertStudentId)) {
            return res.status(400).send({
                message:"Terjadi kesalahan pada angka studentId"
            })
        }
        data = {...data,studentId: convertStudentId}
    }

    const checkingData = await prisma.parents.findFirst({
        where
    })
    if (checkingData === null) {
        return res.status(400).send({
            message:"Data tidak ada di database. Cek kembali ID yang dikirim"
        })
    }
    const updatingData = await prisma.parents.update({
        where:where,
        data
    })
    return res.status(200).send({
        message:"Data berhasil diperbarui",
        data:updatingData
    })

}

export const deletingParents = async (req,res) => {
    const params = req.params.id;
    const convertingParams = Number(params);
    if (Number.isNaN(convertingParams)) {
        return res.status(400).send({
            message:"Terjadi kesalahan pada tipe data params"
        })
    }
    const userId = req.user.id;
    if (Number.isNaN(userId)) {
        return res.status(400).send({
            message:"Terjadi kesalahan tipe data pada userId"
        })
    }
    const checkingData = await prisma.parents.findFirst({
        where:{userId:userId,id:convertingParams}
    })
    if (checkingData === null) {
        return res.status(400).send({
            message:"Data tidak ditemukan"
        })
    }
    const deletingData = await prisma.parents.deleteMany({
        where:{userId:userId,id:convertingParams}
    })
    return res.status(200).send({
        message:"Data berhasil dihapus",
        data:deletingData
    })
}