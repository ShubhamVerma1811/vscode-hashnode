"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Dependency = exports.MyTree = void 0;
var path = require("path");
var vscode = require("vscode");
var MyTree = /** @class */ (function () {
    function MyTree(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }
    MyTree.prototype.getTreeItem = function (element) {
        return element;
    };
    MyTree.prototype.getChildren = function (element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage("No dependency in empty workspace");
            return Promise.resolve([]);
        }
    };
    return MyTree;
}());

exports.MyTree = MyTree;
var Dependency = /** @class */ (function (_super) {
    __extends(Dependency, _super);
    function Dependency(label, version, collapsibleState, command) {
        var _this = _super.call(this, label, collapsibleState) || this;
        _this.label = label;
        _this.version = version;
        _this.collapsibleState = collapsibleState;
        _this.command = command;
        _this.iconPath = {
            light: path.join(__filename, "..", "..", "resources", "light", "dependency.svg"),
            dark: path.join(__filename, "..", "..", "resources", "dark", "dependency.svg")
        };
        _this.contextValue = "dependency";
        _this.tooltip = _this.label + "-" + _this.version;
        _this.description = _this.version;
        return _this;
    }
    return Dependency;
}(vscode.TreeItem));

exports.Dependency = Dependency;
