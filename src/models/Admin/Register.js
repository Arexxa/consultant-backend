// model/Admin/Register.js
class AdminRegister {
    constructor(userId, roleId, name, email, password, contact_no, address, school, certificate, insertDateTime) {
        this.userId = userId;
        this.roleId = roleId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.contact_no = contact_no;
        this.address = address;
        this.school = school;
        this.certificate = certificate;
        this.insertDateTime = insertDateTime;
    }
}

module.exports = AdminRegister;
