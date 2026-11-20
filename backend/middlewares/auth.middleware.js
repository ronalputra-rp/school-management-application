import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const authorization = req.headers["authorization"];
    if (!authorization) {
        return res.status(401).send({
            message: "Token tidak ditemukan, akses ditolak",
        });
    }
    if (!authorization.startsWith("Bearer ")) {
        return res.status(401).send({
            message: "Format token tidak valid",
        });
    }
    const token = authorization.split(" ")[1];
    if (!token) {
        return res.status(401).send({
            message: "Tidak memiliki token, akses ditolak",
        });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        return next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).send({
                message: "Token sudah kadaluarsa, silahkan login ulang",
            });
        }
        return res.status(401).send({
            message: "Token tidak valid",
        });
    }
};

export default authMiddleware;
