const Sequelize = require('sequelize');

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: true,
                unique: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            provider: {
                type: Sequelize.ENUM('local', 'kakao'),
                allowNull: false,
                defaultValue: 'local',
            },
            snsId: {
                type: Sequelize.STRING(30),
                allowNull: true,
            }
        }, {
            sequelize, // validation 에서 조건 생성
            timestamps: true, // createdAt, updatedAt
            underscored: false, 
            modelName: 'User', // javascript
            tableName: 'users', // db tablename
            paranoid: true, // deletedAt 유저 삭제일 // soft delete
            charset: 'utf8', // db 문자 저장 방식
            collate: 'utf8_general_ci',
    });
}

    static associate(db) {
        db.User.hasMany(db.Post);
        db.User.belongsToMany(db.User, { // 팔로워
            foreignKey: 'followingId',
            as: 'Followers',
            through: 'Follow', // 중간 테이블
        });
        db.User.belongsToMany(db.User, { //
            foreignKey: 'followerId',
            as: 'Followings',
            through: 'Follow',
        });
    }
};

module.exports = User;