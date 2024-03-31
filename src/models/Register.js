// model/Register.js
class Register {
    constructor(userId, roleId, name, email, password, insertDateTime) {
        this.userId = userId;
        this.roleId = roleId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.insertDateTime = insertDateTime;
    }
}

module.exports = Register;
