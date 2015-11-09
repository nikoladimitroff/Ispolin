/// <reference path="../../common/models.ts" />

type IGrade = Models.IGrade;

export function testCppFile(homeworkName: string, solution: string): IGrade {
    return {
        source: homeworkName,
        grade: 5,
        max: 10,
        runningTime: 15
    };
}
