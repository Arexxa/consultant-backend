// model/Register.js
class Register {
    constructor(userId, roleId, username, password, insertDateTime) {
        this.userId = userId;
        this.roleId = roleId;
        this.username = username;
        this.password = password;
        this.insertDateTime = insertDateTime;
    }
}

module.exports = Register;
