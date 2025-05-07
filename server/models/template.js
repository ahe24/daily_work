module.exports = (sequelize, DataTypes) => {
  const Template = sequelize.define('Template', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    defaultStatus: {
      type: DataTypes.ENUM('계획', '진행중', '완료', '지연'),
      defaultValue: '계획'
    },
    defaultPriority: {
      type: DataTypes.ENUM('높음', '중간', '낮음'),
      defaultValue: '중간'
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,  // in minutes
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return Template;
};
