"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var consoleUtils_1 = require("../utils/consoleUtils");
var FileUtils_1 = require("../utils/FileUtils");
var projectUtils_1 = require("../utils/projectUtils");
var pathParser_1 = require("./pathParser");
var generateTsManager;
(function (generateTsManager) {
    var _jsonFileNames = [];
    var _classNames = [];
    function generateCode() {
        arrangeJsonFileNames();
        delUselessTs();
        var code;
        if (_classNames.length > 0) {
            code = "/** auto generate by exlExport.js, do not modify! */\n" + generateImports() + "\nexport class " + (projectUtils_1._subGamePrefix + pathParser_1.CODE_FILE_PREFIX || 'Exl') + "Loader extends gea.common.GameMgrPool {\n    " + generateLoadAll() + "\n    " + generateLoadFew() + "\n    " + generateClearAll() + "\n    "  + generateLoader() + "\n}\n";
            if (!fs.existsSync(path.dirname(pathParser_1._exlLoaderOutputPath))) {
                fs.mkdirSync(path.dirname(pathParser_1._exlLoaderOutputPath));
            }
            fs.writeFileSync(pathParser_1._exlLoaderOutputPath, code, { encoding: 'utf8' });
        }
        else {
            if (fs.existsSync(pathParser_1._exlLoaderOutputPath)) {
                console.log(consoleUtils_1.formatConsole([pathParser_1._jsonOutputDir, '不存在json数据文件', pathParser_1._exlLoaderOutputPath + '将被删除！'], 'red'));
            }
            FileUtils_1.rmFile(pathParser_1._exlLoaderOutputPath);
        }
    }
    generateTsManager.generateCode = generateCode;
    function generateImports() {
        var imports = [];
        _classNames.forEach(function (className) {
            imports.push("import { " + className + " } from '" + path.relative(path.dirname(pathParser_1._exlLoaderOutputPath), pathParser_1._codeOutputDir).replace(/\\/g, '/') + "/" + className + "'");
        });
        return imports.join('\n');
    }
    function generateLoadAll() {
        var doc = "/**\n     * \u52A0\u8F7D\u6240\u6709excel\u5BFC\u51FA\u7684\u6570\u636E\u6587\u4EF6\n     * @param option \u7528\u4E8E\u6307\u5B9A\u52A0\u8F7D\u8FDB\u5EA6\u56DE\u8C03\u548C\u52A0\u8F7D\u5B8C\u6210\u56DE\u8C03\n     */";
        if (projectUtils_1._projectType === 'creator') {
            return doc + "\n    loadAll(bundle: string, option: { complete: (error: Error, resource: cc.JsonAsset[]) => void, completeScope?: any, progress?: (completeCount: number, totalCount: number, item: cc.AssetManager.RequestItem) => void, progressScope?: any }): void {\n        this.load(bundle, ['" + _jsonFileNames.join('\', \'') + "'], option)\n    }";
        }
    }
    function generateLoadFew() {
        var doc = "/**\n     * \u52A0\u8F7D\u81EA\u5B9A\u4E49\u7684excel\u5BFC\u51FA\u7684\u6570\u636E\u6587\u4EF6\n     * @param jsonFileNames \u8981\u52A0\u8F7D\u7684\u6570\u636E\u6587\u4EF6\u540D\u5217\u8868,\u6839\u636E\u4EE3\u7801\u63D0\u793A\u586B\u5199\u5373\u53EF\n     * @param option \u7528\u4E8E\u6307\u5B9A\u52A0\u8F7D\u8FDB\u5EA6\u56DE\u8C03\u548C\u52A0\u8F7D\u5B8C\u6210\u56DE\u8C03\n     */";
        if (projectUtils_1._projectType === 'creator') {
            return doc + "\n    loadFew(bundle: string, jsonFileNames: ('" + _jsonFileNames.join('\' | \'') + "')[], option: { complete: (error: Error, resource: cc.JsonAsset[]) => void, completeScope?: any, progress?: (completeCount: number, totalCount: number, item: cc.AssetManager.RequestItem) => void, progressScope?: any }): void {\n        this.load(bundle, jsonFileNames, option)\n    }";
        }
    }
    function generateLoader() {
        var doc = "/**\n     * \u52A0\u8F7D\u6307\u5B9Aexcel\u5BFC\u51FA\u7684\u6570\u636E\u6587\u4EF6\n     * @param jsonFileNames \u6307\u5B9A\u7684\u6570\u636E\u6587\u4EF6\u5217\u8868\n     * @param option \u7528\u4E8E\u6307\u5B9A\u52A0\u8F7D\u8FDB\u5EA6\u56DE\u8C03\u548C\u52A0\u8F7D\u5B8C\u6210\u56DE\u8C03\n     */";
        var switchs = [];
        _jsonFileNames.forEach(function (fileName) {
            if (projectUtils_1._projectType === 'creator') {
                switchs.push("case '" + fileName + "': res.json.root.forEach((value: any): void => { " + (projectUtils_1._subGamePrefix + pathParser_1.CODE_FILE_PREFIX + fileName) + ".append(value) }); break");
            }
        });
        var tab = ' '.repeat(4);
        var tab5 = tab.repeat(5);
        var tab6 = tab.repeat(6);
        var tab7 = tab.repeat(7);
        var tab8 = tab.repeat(8);

        if (projectUtils_1._projectType === 'creator') {
            return doc + "\n    private load(bundle: string, jsonFileNames: string[], option: { complete: (error: Error, resource: cc.JsonAsset[]) => void, completeScope?: any, progress?: (completeCount: number, totalCount: number, item: cc.AssetManager.RequestItem) => void, progressScope?: any }): void {\n        gea.assetMgr.getBundle(bundle).load(jsonFileNames.map((fileName: string): string => { return 'res/" + pathParser_1._sourceDir + "/' + fileName }), cc.JsonAsset,\n            (completeCount: number, totalCount: number, item: cc.AssetManager.RequestItem): void => {\n                if (option.progress) {\n                    option.progress.call(option.progressScope, completeCount, totalCount, item)\n                }\n            },\n            (error: Error, resource: cc.JsonAsset | cc.JsonAsset[]): void => {\n                let result: cc.JsonAsset[] = resource && (resource instanceof Array ? resource : [resource])\n                if (error) {\n                    console.error(error)\n                } else if (result) {\n                    result.forEach(res => {\n                        switch (res.name) {\n                            " + switchs.join('\n' + tab7) + "\n                        }\n                    })\n                }\n                if (option.complete) {\n                    option.complete.call(option.completeScope, error, result)\n                }\n            },\n        )\n    }";
        }
    }
    function generateClearAll(){
        var switchs = [];
        _jsonFileNames.forEach(function (fileName) {
            if (projectUtils_1._projectType === 'creator') {
                switchs.push((projectUtils_1._subGamePrefix + pathParser_1.CODE_FILE_PREFIX + fileName) + ".clearAll()");
            }
        });

        return "callbackAfterBorrow():void {\n    }\n    callbackBeforeRestore(): boolean {\n        " + switchs.join('\n        ') + "\n        return true\n    }"
    }
    function arrangeJsonFileNames() {
        _jsonFileNames.length = 0;
        if (fs.existsSync(pathParser_1._jsonOutputDir)) {
            fs.readdirSync(pathParser_1._jsonOutputDir, { encoding: 'utf8' }).forEach(function (value) {
                if (path.extname(value) === '.json') {
                    _jsonFileNames.push(value.replace('.json', ''));
                }
            });
        }
        if (_jsonFileNames.length === 0) {
            FileUtils_1.rmFile(pathParser_1._jsonOutputDir);
        }
    }
    function delUselessTs() {
        _classNames.length = 0;
        if (_jsonFileNames.length > 0) {
            if (fs.existsSync(pathParser_1._codeOutputDir)) {
                var useleessFile_1;
                fs.readdirSync(pathParser_1._codeOutputDir, { encoding: 'utf8' }).forEach(function (value) {
                    if (path.extname(value) === '.ts') {
                        if (_jsonFileNames.indexOf(value.replace(projectUtils_1._subGamePrefix+pathParser_1.CODE_FILE_PREFIX, '').replace(path.extname(value), '')) === -1) {
                            useleessFile_1 = path.join(pathParser_1._codeOutputDir, value);
                            FileUtils_1.rmFile(useleessFile_1);
                            console.log(consoleUtils_1.formatConsole([useleessFile_1], 'white', 'strikethrough') + consoleUtils_1.formatConsole(['清理成功!'], 'green'));
                        }
                        else {
                            _classNames.push(value.replace(path.extname(value), ''));
                        }
                    }
                });
            }
        }
        else {
            FileUtils_1.rmFile(pathParser_1._codeOutputDir);
        }
    }
})(generateTsManager = exports.generateTsManager || (exports.generateTsManager = {}));
if (process.argv[1] === __filename) {
    generateTsManager.generateCode();
}
