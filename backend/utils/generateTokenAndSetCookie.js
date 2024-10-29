import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    const payload = {userId}
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2d"
    })
    res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2 * 24 * 60 * 60 * 1000
    })
    return token;
}