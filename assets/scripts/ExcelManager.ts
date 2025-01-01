import { _decorator, Component, EditBox, EventHandler } from 'cc';
const { ccclass, property } = _decorator;

@ccclass
export default class ExcelManager extends Component {

    inputBoxId = "_file_box_input_";
    containerId = "_file_box_container_";
    inputBoxElement: HTMLInputElement = null;

    /** file name */
    excelFileName: string = "file_name";
    /** sheet name */
    excelSheetName: string = "my_sheet";
    /** excel content */
    excelContent: any[] = null;

    onFilenameBoxClick(edit: EditBox) {
        this.excelFileName = edit.string;
    }

    onImportJsonClick() {
        this.initInputBox("json");
        this.inputBoxElement.click();
    }

    onImportExcelClick() {
        this.initInputBox("excel");
        this.inputBoxElement.click();
    }

    onExportExcelClick() {
        this.exportToExcel();
    }

    onExportJsonClick() {
        this.exportToJson();
    }

    handleFile() {
        return this.excelContent;
    }

    /** 获取数据类型 */
    getTypes() {
        let types = {};
        let content = this.excelContent[0];
        for (const key in content) {
            if (content.hasOwnProperty(key)) {
                const element = content[key];
                if (typeof element == "string") {
                    types[key] = "string";
                } else if (typeof element == "number") {
                    types[key] = "number";
                } else if (typeof element == "boolean") {
                    types[key] = "boolean";
                } else {
                    types[key] = "string";
                }
            }
        }
        return types;
    }

    importJsonFile(file: Blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.excelContent = JSON.parse(reader.result as string);
            this.excelContent.splice(0, 0, this.getTypes());    // 添加类型
        };
        reader.readAsText(file, "UTF-8");
    }

    /** 导入excel */
    importExcelFile(file: Blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(reader.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            this.excelContent = XLSX.utils.sheet_to_json(worksheet);
            this.excelContent.splice(0, 1);
        };
        reader.readAsArrayBuffer(file);
    }

    /** 导出excel */
    exportToExcel() {
        let fileName = this.excelFileName
        // 处理数据
        let fileData: any[] = this.handleFile();
        // 创建工作表
        const workbook = XLSX.utils.book_new();
        // 将JSON数据转换为工作表
        const worksheet = XLSX.utils.json_to_sheet(fileData);
        XLSX.utils.book_append_sheet(workbook, worksheet, this.excelSheetName);
        // 生成Excel文件（这里我们使用XLSX的write功能）
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
        // 为了确保兼容性，将字符串处理为八位无符号整数数组
        let s2ab = (s: any) => {
            const buffer = new ArrayBuffer(s.length);
            const view = new Uint8Array(buffer);
            for (let i = 0; i < s.length; i++) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buffer;
        }
        // 创建一个Blob对象，并设置文件类型
        const blob = new Blob([s2ab(excelBuffer)], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
        });
        // 创建一个临时的a标签用于下载文件
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName + ".xlsx";
        // 模拟点击a标签实现下载
        document.body.appendChild(link);
        link.click();
        // 清理并移除a标签
        document.body.removeChild(link);
    }

    exportToJson() {
        let fileName = this.excelFileName
        // 处理数据
        let fileData: any[] = this.handleFile();
        // 创建一个Blob对象，并设置文件类型
        const blob = new Blob([JSON.stringify(fileData)], {
            type: "application/json;charset=UTF-8"
        });
        // 创建一个临时的a标签用于下载文件
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName + ".json";
        // 模拟点击a标签实现下载
        document.body.appendChild(link);
        link.click();
        // 清理并移除a标签
        document.body.removeChild(link);
    }

    initInputBox(type: string) {
        let inputBox = this.getInputBox(this.inputBoxId, this.containerId);
        if (inputBox) {
            inputBox.onchange = (evt: any) => {
                let file = evt.target.files[0];
                if (!file) {
                    console.info("===> No file selected");
                    return;
                }
                if (type == "excel") {
                    this.importExcelFile(file);
                } else if (type == "json") {
                    this.importJsonFile(file);
                }
            };
        }
    }

    getInputBox(inputBoxId: string, containerId: string) {
        if (!this.inputBoxElement) {
            let inputBox = document.getElementById(inputBoxId) as HTMLInputElement;
            if (!inputBox) {
                let container = document.getElementById(containerId);
                if (!container) {
                    container = document.createElement('div');
                    document.body.appendChild(container);
                    container.id = containerId;
                }
                inputBox = document.createElement("input") as HTMLInputElement;
                inputBox.id = inputBoxId;
                inputBox.type = "file";
                container.appendChild(inputBox);
            }
            this.inputBoxElement = inputBox;
        }
        return this.inputBoxElement;
    }
}
