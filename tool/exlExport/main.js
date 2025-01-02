#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var xlsx = require("node-xlsx");
const XLSX = require('xlsx');
var path = require("path");
var consoleUtils_1 = require("../utils/consoleUtils");
var generateTs_1 = require("./generateTs");
var generateTsManager_1 = require("./generateTsManager");
var pathParser_1 = require("./pathParser");
var projectUtils_1 = require("../utils/projectUtils");
/**正式数据开始的行数,从4开始计数 */
var DATA_START_ROW = 4;
/**id所在的列,从0开始计数 */
var COL_OF_ID = 0;
/**字段名所在的行数,若不为空则需要导出,从0开始计数 */
var ROW_OF_FIELD_NAME = 0;
/**字段类型所在的行数,从2开始计数 */
var ROW_OF_FIELD_TYPE = 2;
/**标识该段是否需要导出  空和client则前端需要导出使用*/
var ROW_OF_FIELD_INPUT = 3;
/**要导出的列 */
var _listExportCols = [];
var _listFiledName = [];
/**要导出的列的描述 */
var _listDesc = [];
/**要导出的列的类型 */
var _listType = [];
/**存储每张表的解析结果 */
var _listResult = [];
var listExcelPath = process.argv.slice(2);
if (listExcelPath !== undefined && listExcelPath.length > 0) {
    listExcelPath.forEach(function (filePath) {
        if (process.platform === 'darwin') {
            filePath = '/' + filePath;
        }
        console.log(consoleUtils_1.formatConsole(['start parse excel:', filePath], 'cyan', 'bold'));
        var elsxContent = xlsx.parse(fs.readFileSync(filePath));
        var matchResult;
        elsxContent.forEach(function (sheetContent) {
            matchResult = sheetContent.name.match(/[a-z _ A-Z]/g);
            if (matchResult && matchResult.length === sheetContent.name.length) {
                // 读取文件并提取最后保存日期
                const wb = XLSX.readFile(filePath);
                parseSheet(filePath, sheetContent,wb.Props.ModifiedDate.getTime(), wb.Props.ModifiedDate.toString());
            }
            else {
                console.log('\tsheet->' + consoleUtils_1.formatConsole([sheetContent.name], 'red'), consoleUtils_1.formatConsole(['sheet 名字必须全部由a-z _ A-Z组成'], 'blue'));
            }
        });
    });
    _listResult.forEach(function (result) {
        if (!fs.existsSync(path.dirname(result.json.outputFile))) {
            fs.mkdirSync(path.dirname(result.json.outputFile));
        }
        fs.writeFileSync(result.json.outputFile, JSON.stringify(result.json.content), { encoding: 'utf8' });
        if (!fs.existsSync(path.dirname(result.code.outputFile))) {
            fs.mkdirSync(path.dirname(result.code.outputFile));
        }
        fs.writeFileSync(result.code.outputFile, result.code.content, { encoding: 'utf8' });
    });
    if (_listResult.length > 0) {
        generateTsManager_1.generateTsManager.generateCode();
    }
}
function parseSheet(filePath, content, modifiedtime, modifiedDate) {
    console.log('\tsheet->' + consoleUtils_1.formatConsole([content.name], 'green'));
    _listExportCols.length = 0;
    _listDesc.length = 0;
    _listType.length = 0;
    _listFiledName.length = 0;
    var type;
    // 判断id所在的列是否已经设置字段名
    // 第二行为标记是否需要为客户端导出

    if (content.data[ROW_OF_FIELD_NAME]) {
        content.data[ROW_OF_FIELD_NAME].forEach(function (fieldName, index) {
            // 第一列为CLIENT
            // if (index > 0 && fieldName !== undefined) {
            var state = content.data[ROW_OF_FIELD_INPUT][index]
            if (index >= 0 && (state == "" || state == undefined || state == "client" || state == "CLIENT")) {
                _listExportCols.push(index);
                _listDesc.push(content.data[0][index] || fieldName);
                _listFiledName.push(fieldName.replace(/^\s+|\s+$/g, '').replace(/^[^a-z A-Z _]/, '_').replace(/[^a-z A-Z _ 0-9]/g, '_').replace(/\s+/g, '_'));
                type = content.data[ROW_OF_FIELD_TYPE][index];
                if (type === undefined) {
                    console.log('\t\t' + consoleUtils_1.formatConsole(['字段\'' + fieldName + '\'未定义类型', '将被转为any类型'], 'grey'));
                    type = 'any';
                }
                _listType.push(converTypeToTypeScript(type.toLocaleLowerCase()));
            }
        });
    }
    if (_listExportCols.length > 1) {

        if (content.data[ROW_OF_FIELD_NAME] && content.data[ROW_OF_FIELD_NAME][COL_OF_ID] !== undefined) {
            var result = {
                excel: {
                    inputFile: filePath,
                    fileName: path.basename(filePath),
                    sheetName: content.name,
                    idField: content.data[ROW_OF_FIELD_NAME][COL_OF_ID],
                },
                json: {
                    outputFile: path.join(pathParser_1._jsonOutputDir, content.name + '.json'),
                    fileName: content.name + '.json',
                    content: { root: [], version:modifiedtime,data:modifiedDate },
                },
                code: {
                    outputFile: path.join(pathParser_1._codeOutputDir, projectUtils_1._subGamePrefix +pathParser_1.CODE_FILE_PREFIX + content.name + '.ts'),
                    fileName: projectUtils_1._subGamePrefix + pathParser_1.CODE_FILE_PREFIX + content.name + '.ts',
                    className: projectUtils_1._subGamePrefix + pathParser_1.CODE_FILE_PREFIX + content.name,
                    content: '',
                },
            };
            var totalRow = content.data.length;
            var listData = void 0;
            var jsonObject = void 0;
            var filedValue = void 0;
            var id = void 0;
            var fieldName = void 0;
            var col = void 0;
            var totalExportCol = _listExportCols.length;
            for (var row = DATA_START_ROW; row < totalRow; row++) {
                listData = content.data[row];

                // console.info("listData.length   "+listData.length + "   "+row + "   "+totalRow)
                if (listData.length > 0) {
                    id = listData[0];
                    if (id !== undefined && id !== "#end") {
                        for (var index = 0; index < totalExportCol; index++) {
                            col = _listExportCols[index];
                            fieldName = _listFiledName[index];
                            jsonObject = result.json.content.root[row - DATA_START_ROW] || {};
                            filedValue = formatValue(listData[col], _listType[index], id, fieldName, row);
                            jsonObject[fieldName] = filedValue;
                            result.json.content.root[row - DATA_START_ROW] = jsonObject;
                        }
                    }
                    else {
                        //尾部标识
                        if (id === "#end"){
                            totalRow = row + 1
                        }
                        // console.log('\t\t' + formatConsole(['excel表第' + (row + 1) + '行数据不会导出, 因为id字段没有值'], 'red', 'bold', 'whiteBG'))
                        // break
                        content.data.splice(row, 1);
                        totalRow--;
                        row--;
                    }
                }
                else {
                    content.data.splice(row, 1);
                    totalRow--;
                    row--;
                }
            }
            result.code.content = generateTs_1.generateTs.generateCode(result, _listFiledName, _listDesc, _listType);
            _listResult.push(result);
        }
        else {
            console.log('\t\t' + consoleUtils_1.formatConsole(['id所在的列没有设置字段名,该表不会导出'], 'red', 'bold', 'whiteBG'));
        }
    }
    else {
        console.log('\t\t' + consoleUtils_1.formatConsole(['no data need export'], 'grey'));
    }
}
function converTypeToTypeScript(type) {
    switch (type) {
        case 'int':
        case 'number':
        case 'float':
        case 'short':
        case 'byte':
            return 'number';
        case 'bool':
        case 'boolean':
            return 'boolean';
        case 'str':
        case 'json':
        case 'string':
            return 'string';
        case 'any':
            return 'any';
        default:
            console.log('\t\t' + consoleUtils_1.formatConsole(['未找到适合的类型\'' + type + '\'', '将转为any类型'], 'grey'));
            return 'any';
    }
}
function formatValue(value, type, id, filedName, row) {
    row++;
    if (value !== undefined) {
        switch (type) {
            case 'number':
                if (isNaN(Number(value))) {
                    console.log('\t\t' + consoleUtils_1.formatConsole(['excel表第' + row + '行', 'id:' + id, '字段:' + filedName, '不是一个数字，将被转为0'], 'red'));
                    return 0;
                }
                return Number(value);
            case 'boolean':
                return !!value;
            case 'string':
                return value.toString();
            default:
                break;
        }
    }
    else {
        switch (type) {
            case 'number':
                // console.log('\t\t' + formatConsole(['excel表第' + row + '行', 'id:' + id, '字段:' + filedName, '没有填值', '将被转为默认值0'], 'red'))
                return 0;
            case 'boolean':
                // console.log('\t\t' + formatConsole(['excel表第' + row + '行', 'id:' + id, '字段:' + filedName, '没有填值', '将被转为默认值false'], 'red'))
                return false;
        }
        return '';
    }
    return value;
}
