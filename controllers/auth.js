const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/database")

//회원가입
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const sql = "INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())";
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Database error." });
            }
            res.status(201).json({ message: "User registered successfully." });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

//로그인
exports.login = (req, res) => {
    const { identifier, password } = req.body; // `identifier` can be either username or email
    if (!identifier || !password) {
        return res.status(400).json({ message: "Identifier and password are required." });
    }

    // Determine if identifier is an email
    const identifierField = identifier.includes("@") ? "email" : "username";

    const sql = `SELECT * FROM users WHERE ${identifierField} = ?`;
    db.query(sql, [identifier], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
        }

        // Generate Access Token (short-lived)
        const accessToken = jwt.sign({ id: user.id, username: user.username }, "access_secretkey", { expiresIn: "15m" });

        // Generate Refresh Token (long-lived)
        const refreshToken = jwt.sign({ id: user.id, username: user.username }, "refresh_secretkey", { expiresIn: "7d" });

        // Save Refresh Token in a secure httpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // Use true in production
            sameSite: "Strict",
        });

        res.status(200).json({ message: "Login successful.", accessToken });
    });
};

// acessToken 갱신 
exports.refreshToken = (req, res) => {
    const refreshToken = req.cookies?.refreshToken; // Get refresh token from cookie
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh Token not provided." });
    }

    // Verify Refresh Token
    jwt.verify(refreshToken, "refresh_secretkey", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid Refresh Token." });
        }

        // Generate new Access Token
        const accessToken = jwt.sign({ id: user.id, username: user.username }, "access_secretkey", { expiresIn: "15m" });

        res.status(200).json({ accessToken });
    });
};

//로그아웃
exports.logout = (req, res) => {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully." });
};

exports.authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access Denied." });
    }

    jwt.verify(token, "access_secretkey", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or Expired Token." });
        }
        req.user = user;
        next();
    });
};