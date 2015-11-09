function checkMahCode(homeworkName) {
    return {
        source: homeworkName,
        grade: Math.random() / 2,
        max: Math.random() + 0.5,
        runningTime: Math.random() * 500
    };
}

module.exports = checkMahCode;