"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
function copyFile(fileOrDir, dest) {
    if (fs.existsSync(fileOrDir)) {
        if (fs.statSync(fileOrDir).isDirectory()) {
            if (fs.existsSync(dest)) {
                var absPath_1;
                fs.readdirSync(fileOrDir).forEach(function (fileName) {
                    absPath_1 = path.join(fileOrDir, fileName);
                    if (fs.statSync(absPath_1).isFile()) {
                        fs.copyFileSync(absPath_1, path.join(dest, fileName));
                    }
                    else if (fs.statSync(absPath_1).isDirectory()) {
                        if (!fs.existsSync(path.join(dest, fileName))) {
                            fs.mkdirSync(path.join(dest, fileName));
                        }
                        copyFile(absPath_1, path.join(dest, fileName));
                    }
                });
            }
            else {
                fs.mkdirSync(dest);
                copyFile(fileOrDir, dest);
            }
        }
        else {
            if (!fs.statSync(path.dirname(dest))) {
                fs.mkdirSync(path.dirname(dest));
            }
            fs.copyFileSync(fileOrDir, dest);
        }
    }
    else {
        console.warn('源文件/目录', fileOrDir, '不存在');
    }
}
exports.copyFile = copyFile;
function rmFile(fileOrDir) {
    if (fs.existsSync(fileOrDir)) {
        if (fs.statSync(fileOrDir).isFile()) {
            fs.unlinkSync(fileOrDir);
        }
        else {
            fs.readdirSync(fileOrDir).forEach(function (fileName) {
                rmFile(path.join(fileOrDir, fileName));
            });
            fs.rmdirSync(fileOrDir);
        }
    }
}
exports.rmFile = rmFile;
function createDir(dir) {
    var listPath = [];
    while (!fs.existsSync(dir)) {
        listPath.unshift(dir);
        dir = path.dirname(dir);
        if (dir === '') {
            listPath.length = 0;
            break;
        }
    }
    listPath.forEach(function (dir) {
        fs.mkdirSync(dir);
    });
}
exports.createDir = createDir;

var isChangeMain = false
var oldprefix = ""
var startPath = ""

function renamePrefix(filePath, prefix, isDeep = false) {
    if (!isDeep) {
        isChangeMain = false
        console.info("isChangeMain  " + isChangeMain)
        startPath = filePath
    }

    console.info(filePath + " " + prefix);
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err)
        } else {
            //遍历读取到的文件列表
            files.forEach(function (filename) {
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                // console.info(filedir)
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, function (eror, stats) {
                    if (eror) {
                        console.warn('获取文件stats失败 ' + filedir);
                    } else {
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if (isFile) {
                            // console.log(stats);// 读取文件内容
                            //找出带有前缀的ts文件
                            if ((filename.indexOf(".ts") > 0 || filename.indexOf(".js") > 0) && filename.indexOf(".meta") < 0) {
                                let nameArr = filename.split("_")

                                if (nameArr.length > 1) {
                                    let newName = filename.replace(nameArr[0], prefix)
                                    oldprefix = nameArr[0]
                                    var content = fs.readFileSync(filedir, 'utf-8');
                                    console.log(filename+ "   " + oldprefix + "   " +  newName + "   "+ prefix);
                                    content = content.replace(new RegExp(oldprefix + "_", 'g'), prefix + "_");
                                    fs.writeFileSync(path.join(filePath, newName), content, { encoding: 'utf-8' });
                                    rmFile(filedir)
                                    let metaFille = filedir.replace(".ts", ".ts.meta")
                                    rmFile(metaFille)
                                }
                            }

                        }
                        if (isDir) {
                            renamePrefix(filedir, prefix, true);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
            if(!isDeep){
                console.info("执行完成，请刷新一下creator")
            }
        }
        if (!isChangeMain && oldprefix && oldprefix != "") {
            let filedir = path.join(startPath, "script", "Main.ts")
            var content = fs.readFileSync(filedir, 'utf-8');
            // content = content.replace(new RegExp("subgame", 'g'), prefix + "_");
            content = content.replace(new RegExp(oldprefix + "_", 'g'), prefix + "_");
            fs.writeFileSync(filedir, content, { encoding: 'utf-8' });
            isChangeMain = true
        }
    });
}
exports.renamePrefix = renamePrefix;
