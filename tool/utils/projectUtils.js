/*
 * @Author: dx lzx0513@qq.com
 * @Date: 2022-12-15 10:24:42
 * @LastEditors: dx lzx0513@qq.com
 * @Email: lzx0513@qq.com
 * @LastEditTime: 2023-10-10 17:47:11
 * @Description: 项目信息
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var subgame = require("../../subgame");
var subgamePrefix = require("../../sub-game-prefix/SubGamePrefix.ts")
exports._seed_project_gits = {
    'creator': 'https://192.168.99.100/game/sub-game-project-creator.git',
};
// creator项目
if (fs.existsSync(path.join(__dirname, '../../creator.d.ts'))) {
    exports._projectType = 'creator';
}
else {
    throw new Error('未适配到 项目类型 -> ' + exports._projectType);
}
console.info(__dirname)
exports._projectRootPath = path.join(__dirname, '../..');
exports._subGameBundle = subgame._subGameBundle
if(subgame._gameId){
    exports._gameId = subgame._gameId
}

Object.keys(subgamePrefix.prefix).forEach((key, index) =>{
    if(subgamePrefix.prefix[key] == subgame._subGameBundle){
        exports._subGamePrefix = key + "_"
    }
})


// var FileUtils_1 = require("../utils/FileUtils");
// FileUtils_1.renamePrefix(path.join(__dirname, '../../assets/subgame'))
