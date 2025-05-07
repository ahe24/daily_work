module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('초안', '완료', '배포됨'),
      defaultValue: '초안'
    },
    weeklyPlan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    weeklyDo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    weeklyCheck: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nextWeekPlan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    completionRate: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    filePath: {
      type: DataTypes.STRING,
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

  return Report;
};
